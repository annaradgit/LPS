import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_URL} from '../config/api';
import {PackageId, Property, Ticket, User} from '../types';

const ACCESS_KEY = '@lps_access_token';
const REFRESH_KEY = '@lps_refresh_token';

type ApiUser = {id: string; name: string; email: string; phone: string; role: string; packageId?: string | null};
type ApiTicket = Record<string, any>;

export async function getAccessToken() { return AsyncStorage.getItem(ACCESS_KEY); }
export async function getRefreshToken() { return AsyncStorage.getItem(REFRESH_KEY); }

async function request<T>(path: string, options: RequestInit = {}, authenticated = true): Promise<T> {
  const token = authenticated ? await getAccessToken() : null;
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_URL}${path}`, {...options, headers});
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.message || `Request failed (${response.status})`);
  return body as T;
}

function packageFromApi(value?: string | null): PackageId | undefined {
  switch ((value || '').toUpperCase()) {
    case 'BASIC': return 'basic';
    case 'SILVER': return 'silver';
    case 'GOLD': return 'gold';
    case 'VIP': return 'vip';
    default: return undefined;
  }
}
function packageToApi(value?: PackageId): 'BASIC' | 'SILVER' | 'GOLD' | 'VIP' {
  switch (value) {
    case 'silver': return 'SILVER';
    case 'gold': return 'GOLD';
    case 'vip': return 'VIP';
    default: return 'BASIC';
  }
}
function mapProperty(p: any): Property {
  return {id: String(p.id), name: p.name || 'My Home', addressLine1: p.addressLine1 || '', city: p.city || '', postcode: p.postcode || '', bedrooms: p.bedrooms == null ? '' : String(p.bedrooms), propertyType: p.propertyType || 'House', notes: p.notes || ''};
}
function mapUser(u: ApiUser, properties: Property[] = []): User {
  return {id: String(u.id), name: u.name, email: u.email, phone: u.phone || '', role: String(u.role).toUpperCase() === 'ADMIN' || String(u.role).toUpperCase() === 'STAFF' ? 'admin' : 'homeowner', packageId: packageFromApi(u.packageId), properties};
}
function mapTicket(t: ApiTicket): Ticket {
  const status = String(t.status || 'OPEN').toLowerCase();
  const priority = String(t.priority || 'MEDIUM').toLowerCase();
  return {
    id: String(t.id), propertyId: String(t.property_id || t.propertyId || t.property?.id || ''),
    title: t.title || '', description: t.description || '',
    priority: (priority.charAt(0).toUpperCase() + priority.slice(1)) as Ticket['priority'],
    status: status as Ticket['status'],
    createdAt: t.created_at || t.createdAt || new Date().toISOString(),
    quote: t.quote == null ? undefined : Number(t.quote),
    invoiceNote: t.invoice_note || t.invoiceNote || undefined,
    paid: ['PAID', 'IN_PROGRESS', 'COMPLETED', 'CLOSED'].includes(String(t.status).toUpperCase()),
    ...(t.guest_name ? {guestName: t.guest_name, guestPhone: t.guest_phone, guestEmail: t.guest_email, guestAddress: t.guest_address, guestCity: t.guest_city, guestPostcode: t.guest_postcode} : {}),
    ...(t.customer_name ? {customerName: t.customer_name, customerEmail: t.customer_email} : {}),
    ...(t.property_name ? {propertyName: t.property_name} : {}),
  } as Ticket;
}

async function storeSession(result: any) {
  await AsyncStorage.setItem(ACCESS_KEY, result.accessToken);
  await AsyncStorage.setItem(REFRESH_KEY, result.refreshToken);
}

export async function loginApi(email: string, password: string): Promise<User> {
  const result = await request<any>('/v1/auth/login', {method: 'POST', body: JSON.stringify({email, password})}, false);
  await storeSession(result);
  const properties = await getProperties();
  return mapUser(result.user, properties);
}

export async function registerApi(input: {name: string; email: string; phone: string; password: string; packageId: PackageId}): Promise<User> {
  const result = await request<any>('/v1/auth/register', {method: 'POST', body: JSON.stringify({...input, packageId: packageToApi(input.packageId)})}, false);
  await storeSession(result);
  const properties = await getProperties();
  return mapUser(result.user, properties);
}

export async function getCurrentUser(): Promise<User | null> {
  const token = await getAccessToken();
  if (!token) return null;
  try {
    const user = await request<ApiUser>('/v1/me');
    const properties = await getProperties();
    return mapUser(user, properties);
  } catch (error) {
    await AsyncStorage.removeMany([ACCESS_KEY, REFRESH_KEY]);
    throw error;
  }
}

export async function logoutApi() {
  const refreshToken = await getRefreshToken();
  try { await request('/v1/auth/logout', {method: 'POST', body: JSON.stringify({refreshToken})}); }
  finally { await AsyncStorage.removeMany([ACCESS_KEY, REFRESH_KEY]); }
}

export async function getProperties(): Promise<Property[]> {
  const result = await request<any[]>('/v1/properties');
  return result.map(mapProperty);
}
export async function saveProperty(input: Omit<Property, 'id'> & {id?: string}) {
  const payload = {name: input.name, addressLine1: input.addressLine1, city: input.city, postcode: input.postcode, propertyType: input.propertyType || 'House', bedrooms: input.bedrooms ? Number(input.bedrooms) : null, notes: input.notes || null};
  const path = input.id ? `/v1/properties/${input.id}` : '/v1/properties';
  const result = await request<any>(path, {method: input.id ? 'PUT' : 'POST', body: JSON.stringify(payload)});
  return mapProperty(result);
}
export async function getMyTickets(): Promise<Ticket[]> {
  const result = await request<ApiTicket[]>('/v1/tickets');
  return result.map(mapTicket);
}
export async function getAdminTickets(): Promise<Ticket[]> {
  const result = await request<ApiTicket[]>('/v1/admin/tickets');
  return result.map(mapTicket);
}
export async function createTicket(input: {title: string; description: string; priority: Ticket['priority']; propertyId?: string}) {
  const result = await request<ApiTicket>('/v1/tickets', {method: 'POST', body: JSON.stringify({...input, priority: input.priority.toUpperCase()})});
  return mapTicket(result);
}
export async function createGuestTicket(input: {name: string; phone: string; email?: string; address: string; city: string; postcode: string; title: string; description: string; priority: Ticket['priority']}) {
  return request<{ticketId: string; reference: string; status: string}>('/v1/tickets/guest', {method: 'POST', body: JSON.stringify({...input, priority: input.priority.toUpperCase()})}, false);
}
export async function sendQuote(ticketId: string, quote: number, note: string) {
  return request(`/v1/admin/tickets/${ticketId}/quote`, {method: 'POST', body: JSON.stringify({quote, note})});
}
export async function completeTicket(ticketId: string) {
  return request(`/v1/admin/tickets/${ticketId}/complete`, {method: 'POST'});
}
export async function confirmTicket(ticketId: string, rating: number, comment?: string) {
  return request(`/v1/tickets/${ticketId}/confirm`, {method: 'POST', body: JSON.stringify({rating, comment})});
}
