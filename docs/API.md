# API

Public: `GET /health`, `GET /ready`, auth register/login/refresh/logout, Stripe webhook.

Homeowner: `/v1/me`, `/v1/properties`, `/v1/tickets`, ticket payment intent, ticket confirmation, subscription checkout.

Staff/Admin: `/v1/admin/tickets`, quote ticket, complete ticket.

All authenticated endpoints use `Authorization: Bearer <accessToken>`.
