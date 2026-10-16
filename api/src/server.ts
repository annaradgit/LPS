import Fastify from 'fastify'; import cors from '@fastify/cors'; import helmet from '@fastify/helmet'; import rateLimit from '@fastify/rate-limit'; import { z } from 'zod'; import { env, stripePrices } from './config.js'; import { q, pool } from './db/pool.js'; import { hashPassword, verifyPassword, signAccess, verifyAccess, issueRefresh, rotateRefresh, revokeRefresh, Claims } from './auth.js'; import { stripe, cents } from './stripe.js';
const app = Fastify({ logger: true, bodyLimit: 2000000 }); await app.register(cors, { origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN }); await app.register(helmet); await app.register(rateLimit, { max: 120, timeWindow: '1 minute' }); await app.register((await import('fastify-raw-body')).default, { global: false, encoding: false, routes: [] }); app.get('/health', async () => ({ ok: true })); app.get('/ready', async () => { await q('select 1'); return { ok: true } });
function auth(req: any): Claims { const h = req.headers.authorization; if (!h?.startsWith('Bearer ')) throw Object.assign(new Error('Unauthorized'), { statusCode: 401 }); try { return verifyAccess(h.slice(7)) } catch { throw Object.assign(new Error('Unauthorized'), { statusCode: 401 }) } } function staff(c: Claims) { if (!['ADMIN', 'STAFF'].includes(c.role)) throw Object.assign(new Error('Forbidden'), { statusCode: 403 }) }
const register = z.object({ name: z.string().min(2).max(120), email: z.string().email(), phone: z.string().min(7).max(30), password: z.string().min(10).max(128), packageId: z.enum(['BASIC', 'SILVER', 'GOLD', 'VIP']) });
app.post('/v1/auth/register', async (req, rep) => { const b = register.parse(req.body); if ((await q('select 1 from users where lower(email)=lower($1)', [b.email])).rowCount) return rep.code(409).send({ message: 'Email already registered' }); const r = await q('insert into users(name,email,phone,password_hash,package_id) values($1,$2,$3,$4,$5) returning id,name,email,phone,role,package_id as "packageId"', [b.name, b.email.toLowerCase(), b.phone, await hashPassword(b.password), b.packageId]); const u = r.rows[0]; return { accessToken: signAccess({ sub: u.id, role: u.role }), refreshToken: await issueRefresh(u.id), user: u } });
app.post('/v1/auth/login', async (req, rep) => { const b = z.object({ email: z.string().email(), password: z.string() }).parse(req.body); const r = await q('select * from users where lower(email)=lower($1)', [b.email]); if (!r.rowCount || !(await verifyPassword(r.rows[0].password_hash, b.password))) return rep.code(401).send({ message: 'Invalid email or password' }); const u = r.rows[0]; return { accessToken: signAccess({ sub: u.id, role: u.role }), refreshToken: await issueRefresh(u.id), user: { id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role, packageId: u.package_id } } });
app.post('/v1/auth/refresh', async (req, rep) => { const b = z.object({ refreshToken: z.string().min(20) }).parse(req.body); const r = await rotateRefresh(b.refreshToken); if (!r) return rep.code(401).send({ message: 'Refresh token expired' }); const u = await q('select id,role from users where id=$1', [r.userId]); return { accessToken: signAccess({ sub: u.rows[0].id, role: u.rows[0].role }), refreshToken: r.token } }); app.post('/v1/auth/logout', async req => { const b = z.object({ refreshToken: z.string().optional() }).parse(req.body); if (b.refreshToken) await revokeRefresh(b.refreshToken); return { ok: true } });
app.get('/v1/me', async req => { const c = auth(req); const r = await q('select id,name,email,phone,role,package_id as "packageId" from users where id=$1', [c.sub]); return r.rows[0] });
const prop = z.object({ name: z.string().min(1).max(100), addressLine1: z.string().min(3).max(200), addressLine2: z.string().max(200).optional().nullable(), city: z.string().min(2).max(100), postcode: z.string().min(3).max(12), propertyType: z.string().min(2).max(60), bedrooms: z.number().int().min(0).max(100).optional().nullable(), notes: z.string().max(2000).optional().nullable() });
app.get('/v1/properties', async req => { const c = auth(req); return (await q('select id,name,address_line1 as "addressLine1",address_line2 as "addressLine2",city,postcode,property_type as "propertyType",bedrooms,notes from properties where user_id=$1 order by created_at', [c.sub])).rows }); app.post('/v1/properties', async req => { const c = auth(req), b = prop.parse(req.body); return (await q('insert into properties(user_id,name,address_line1,address_line2,city,postcode,property_type,bedrooms,notes) values($1,$2,$3,$4,$5,$6,$7,$8,$9) returning id,name,address_line1 as "addressLine1",address_line2 as "addressLine2",city,postcode,property_type as "propertyType",bedrooms,notes', [c.sub, b.name, b.addressLine1, b.addressLine2, b.city, b.postcode, b.propertyType, b.bedrooms, b.notes])).rows[0] });
const tk = z.object({ title: z.string().min(3).max(160), description: z.string().min(5).max(5000), priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY']), propertyId: z.string().uuid().optional() });
const guestTicket = z.object({
  name: z.string().min(2).max(120),
  phone: z.string().min(7).max(30),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().min(3).max(200),
  city: z.string().min(2).max(100),
  postcode: z.string().min(3).max(12),
  title: z.string().min(3).max(160),
  description: z.string().min(5).max(5000),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY']),
});

app.post('/v1/tickets', async req => { const c = auth(req), b = tk.parse(req.body); let pid = b.propertyId; if (!pid) { const p = await q('select id from properties where user_id=$1 order by created_at limit 1', [c.sub]); if (!p.rowCount) throw Object.assign(new Error('Add your property first'), { statusCode: 400 }); pid = p.rows[0].id } if (!(await q('select 1 from properties where id=$1 and user_id=$2', [pid, c.sub])).rowCount) throw Object.assign(new Error('Property not found'), { statusCode: 404 }); const r = await q('insert into tickets(user_id,property_id,title,description,priority) values($1,$2,$3,$4,$5) returning *', [c.sub, pid, b.title, b.description, b.priority]); await q('insert into ticket_events(ticket_id,actor_user_id,event) values($1,$2,$3)', [r.rows[0].id, c.sub, 'TICKET_CREATED']); return r.rows[0] });
const ticketSelect = `select t.*,json_build_object('id',p.id,'name',p.name,'addressLine1',p.address_line1,'addressLine2',p.address_line2,'city',p.city,'postcode',p.postcode,'propertyType',p.property_type,'bedrooms',p.bedrooms,'notes',p.notes) property from tickets t join properties p on p.id=t.property_id`;
app.get('/v1/tickets', async req => { const c = auth(req); return (await q(ticketSelect + ' where t.user_id=$1 order by t.created_at desc', [c.sub])).rows }); app.get('/v1/tickets/:id', async (req, rep) => { const c = auth(req), id = z.string().uuid().parse((req.params as any).id); const r = await q(ticketSelect + ' where t.id=$1 and (t.user_id=$2 or $3)', [id, c.sub, ['ADMIN', 'STAFF'].includes(c.role)]); if (!r.rowCount) return rep.code(404).send({ message: 'Ticket not found' }); return r.rows[0] });
app.post('/v1/tickets/:id/payment-intent', async (req, rep) => { const c = auth(req), id = z.string().uuid().parse((req.params as any).id), r = await q('select * from tickets where id=$1 and user_id=$2', [id, c.sub]); if (!r.rowCount || r.rows[0].quote == null) return rep.code(404).send({ message: 'Invoice not found' }); if (r.rows[0].stripe_payment_intent_id) return { clientSecret: (await stripe.paymentIntents.retrieve(r.rows[0].stripe_payment_intent_id)).client_secret }; const pi = await stripe.paymentIntents.create({ amount: cents(Number(r.rows[0].quote)), currency: 'gbp', automatic_payment_methods: { enabled: true }, metadata: { ticketId: id, userId: c.sub } }); await q('update tickets set stripe_payment_intent_id=$1,status=$2,updated_at=now() where id=$3', [pi.id, 'AWAITING_PAYMENT', id]); return { clientSecret: pi.client_secret } });
app.post('/v1/tickets/:id/confirm', async (req, rep) => { const c = auth(req), id = z.string().uuid().parse((req.params as any).id), b = z.object({ rating: z.number().int().min(1).max(5), comment: z.string().max(1000).optional() }).parse(req.body); const conn = await pool.connect(); try { await conn.query('begin'); const r = await conn.query('select status from tickets where id=$1 and user_id=$2 for update', [id, c.sub]); if (!r.rowCount || r.rows[0].status !== 'COMPLETED') { await conn.query('rollback'); return rep.code(409).send({ message: 'Job must be completed by LPS first' }) } await conn.query('update tickets set status=\'CLOSED\',confirmed_at=now(),closed_at=now(),updated_at=now() where id=$1', [id]); await conn.query('insert into ratings(ticket_id,user_id,stars,comment) values($1,$2,$3,$4)', [id, c.sub, b.rating, b.comment]); await conn.query('commit') } catch (e) { await conn.query('rollback'); throw e } finally { conn.release() } return { ok: true } });

app.get('/v1/admin/tickets', async req => {
  const c = auth(req);
  staff(c);

  return (
    await q(
      `select
        t.*,

        u.name as customer_name,
        u.email as customer_email,

        t.guest_name,
        t.guest_phone,
        t.guest_email,
        t.guest_address,
        t.guest_city,
        t.guest_postcode,

        p.name as property_name,
        p.address_line1,
        p.city as property_city,
        p.postcode as property_postcode

       from tickets t

       left join users u
         on u.id = t.user_id

       left join properties p
         on p.id = t.property_id

       order by t.created_at desc`
    )
  ).rows;
});

app.post('/v1/admin/tickets/:id/quote', async (req, rep) => { const c = auth(req); staff(c); const id = z.string().uuid().parse((req.params as any).id), b = z.object({ quote: z.number().positive().max(100000), note: z.string().max(3000) }).parse(req.body); const r = await q('update tickets set quote=$1,invoice_note=$2,status=\'AWAITING_PAYMENT\',updated_at=now() where id=$3 returning *', [b.quote, b.note, id]); if (!r.rowCount) return rep.code(404).send({ message: 'Ticket not found' }); await q('insert into ticket_events(ticket_id,actor_user_id,event,metadata) values($1,$2,$3,$4)', [id, c.sub, 'QUOTE_SENT', JSON.stringify({ quote: b.quote })]); return r.rows[0] });
app.post('/v1/admin/tickets/:id/complete', async (req, rep) => { const c = auth(req); staff(c); const id = z.string().uuid().parse((req.params as any).id), r = await q('update tickets set status=\'COMPLETED\',completed_at=now(),updated_at=now() where id=$1 and status in(\'PAID\',\'IN_PROGRESS\') returning *', [id]); if (!r.rowCount) return rep.code(409).send({ message: 'Ticket must be paid or in progress' }); await q('insert into ticket_events(ticket_id,actor_user_id,event) values($1,$2,$3)', [id, c.sub, 'JOB_COMPLETED']); return r.rows[0] });
app.post('/v1/subscriptions/checkout', async (req, rep) => { const c = auth(req), b = z.object({ packageId: z.enum(['BASIC', 'SILVER', 'GOLD', 'VIP']) }).parse(req.body), u = await q('select * from users where id=$1', [c.sub]); let customer = u.rows[0].stripe_customer_id; if (!customer) { customer = (await stripe.customers.create({ name: u.rows[0].name, email: u.rows[0].email, metadata: { userId: c.sub } })).id; await q('update users set stripe_customer_id=$1 where id=$2', [customer, c.sub]) } const s = await stripe.checkout.sessions.create({ mode: 'subscription', customer, line_items: [{ price: stripePrices[b.packageId], quantity: 1 }], success_url: env.STRIPE_SUCCESS_URL, cancel_url: env.STRIPE_CANCEL_URL, metadata: { userId: c.sub, packageId: b.packageId }, subscription_data: { metadata: { userId: c.sub, packageId: b.packageId } } }); return { url: s.url } });
app.post('/v1/webhooks/stripe', { config: { rawBody: true } }, async (req, rep) => { const sig = req.headers['stripe-signature']; if (!sig) return rep.code(400).send({ message: 'Missing signature' }); let e: any; try { e = stripe.webhooks.constructEvent((req as any).rawBody, sig, env.STRIPE_WEBHOOK_SECRET) } catch { return rep.code(400).send({ message: 'Invalid signature' }) } if (e.type === 'payment_intent.succeeded') { const p = e.data.object; if (p.metadata.ticketId) await q('update tickets set status=\'PAID\',paid_at=now(),updated_at=now() where id=$1', [p.metadata.ticketId]) } if (e.type === 'checkout.session.completed') { const s = e.data.object; if (s.metadata?.userId) await q('update users set package_id=$1,updated_at=now() where id=$2', [s.metadata.packageId, s.metadata.userId]) } return { received: true } });
app.post('/v1/tickets/guest', async (req, rep) => {
  const b = guestTicket.parse(req.body);

  const r = await q(
    `insert into tickets
      (
        user_id,
        property_id,
        title,
        description,
        priority,
        guest_name,
        guest_phone,
        guest_email,
        guest_address,
        guest_city,
        guest_postcode
      )
     values
      (
        null,
        null,
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9
      )
     returning
       id,
       title,
       description,
       priority,
       status,
       created_at as "createdAt"`,
    [
      b.title,
      b.description,
      b.priority,
      b.name,
      b.phone,
      b.email || null,
      b.address,
      b.city,
      b.postcode,
    ],
  );

  const ticket = r.rows[0];

  await q(
    `insert into ticket_events
      (ticket_id, actor_user_id, event, metadata)
     values
      ($1, null, $2, $3)`,
    [
      ticket.id,
      'GUEST_TICKET_CREATED',
      JSON.stringify({
        guestName: b.name,
        guestPhone: b.phone,
      }),
    ],
  );

  return rep.code(201).send({
    ticketId: ticket.id,
    reference: `LPS-${ticket.id.slice(0, 8).toUpperCase()}`,
    status: ticket.status,
  });
});
app.setErrorHandler((e: any, _r, rep) => { app.log.error(e); rep.code(e.statusCode || 400).send({ message: e.name === 'ZodError' ? 'Invalid request' : (e.statusCode ? e.message : 'Internal server error') }) }); 
app.listen({ port: env.PORT, host: '0.0.0.0' }).catch(e => { app.log.error(e); process.exit(1) });
