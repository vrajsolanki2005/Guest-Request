# GuestRequest

A hotel operations tool that tracks every guest request from creation to resolution, with ownership, SLA deadlines, automatic escalation, and a full audit trail.

---

## The Problem

Hotel operations run on handoffs. A guest calls reception, reception radios housekeeping, housekeeping tells a staff member verbally. At every step there is no shared record, no deadline, and no way to confirm the request was ever resolved.

This is not a niche complaint. A 2023 integrative review of 263 hospitality and tourism service-failure and recovery articles published between 2001 and 2021 confirms that request resolution is one of the most studied operational problems in the industry. The consistent finding across that body of research is that response time is the single biggest driver of guest satisfaction and repurchase intent — not whether something went wrong, but how fast it was fixed.

Existing solutions like DineQube already validate the market: hotels will pay for request queues, routing, SLA tracking, and escalation. The problem is real, the demand is proven, and the gap is in execution quality.

---

## Who Uses This and How

A front desk manager's workflow before GuestRequest looks like this: a guest calls about a broken AC, the manager writes it on a sticky note or sends a WhatsApp message to maintenance, then mentally tracks whether it got done. If the shift changes, the context is lost. If the guest calls again, nobody knows the history.

There are three roles in GuestRequest:

- **Manager** — registers the hotel, creates staff accounts, sees all requests and analytics, can assign and escalate anything.
- **Front Desk** — logs incoming guest requests, assigns them to staff, advances status.
- **Staff** — sees requests assigned to them, marks them in progress and resolved.

After GuestRequest, the workflow is:

1. Front desk logs the request with category, priority, description, room, and guest — takes under 30 seconds.
2. A SLA deadline is automatically set based on priority: URGENT = 5 minutes, HIGH = 15 minutes, MEDIUM = 30 minutes, LOW = 60 minutes.
3. A background job is scheduled to fire at the deadline. If the request is still open, it is marked escalated automatically.
4. Staff see their queue and advance status through OPEN, ACKNOWLEDGED, IN_PROGRESS, RESOLVED, and CLOSED.
5. Every status change, assignment, and escalation is written to an immutable event log.
6. The manager sees a live dashboard showing open count, escalated count, average resolution time, and requests by category.

---

## Architecture

### Stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend | React + TypeScript + Vite | Strong typing catches bugs at build time; fast iteration cycle |
| Styling | Tailwind CSS | Consistent design tokens without context switching between files |
| Backend | Node.js + Express | Lightweight, straightforward to wire up REST endpoints |
| ORM | Prisma | Type-safe queries, migrations as code, readable schema |
| Database | PostgreSQL (Supabase) | Relational integrity is required — requests have rooms, guests, users, and events |
| Queue | BullMQ + Redis (Upstash) | Delayed jobs for SLA escalation; Redis is the correct primitive for this use case |
| Hosting | Render (API) + Vercel (client) | Zero-config deploys; free tier sufficient for assessment |

### Data Model

The schema is built around one central fact: a Request belongs to a Hotel, a Room, and a Guest, and is optionally assigned to a User. Every state change appends a RequestEvent row, which forms the audit trail.

Multi-tenancy is enforced at the data layer. Every model that matters — Room, Guest, Request, User — carries a hotelId. Every query in every controller filters by req.user.hotelId, which is extracted from the JWT. There is no shared data between hotels; one hotel cannot access another's records even when sharing the same database.

```
Hotel
  Users (MANAGER | FRONT_DESK | STAFF)
  Rooms
    Guests
      Requests
        RequestEvents (append-only audit log)
```

### Auth

JWT-based and stateless. On login or registration, the server signs a token containing userId, hotelId, and role. The authenticate middleware verifies the token on every protected route. The authorize middleware checks the role against an allowlist per route. No sessions or cookies are used, which avoids CSRF by design — the Bearer token is sent in the Authorization header, not stored in a cookie.

### SLA Escalation

When a request is created, scheduleSlaCheck adds a delayed BullMQ job with a delay equal to slaDeadline minus the current time. When the job fires, escalateRequest checks whether the request is still open and unescalated. If so, it sets escalatedAt and appends an ESCALATED event to the audit log. The frontend SLACountdown component ticks every second and shows the live countdown, turning orange at 15 minutes remaining and red at 5 minutes.

---

## What Was Deliberately Left Out

**Real-time push.** The dashboard polls on a 30-second interval rather than using WebSockets. For an MVP this is acceptable; staff can refresh manually or wait for the next poll cycle.

**Guest-facing interface.** Guests cannot submit requests themselves. All requests are logged by front desk staff. A guest portal — QR code per room linking to a mobile-optimised form — would be the most impactful next feature.

**Notifications.** There is no email or SMS when a request is assigned or escalated. BullMQ is already in place; adding a notification job is a straightforward extension.

**Password reset.** Staff accounts are created by managers with a temporary password. There is no self-service reset flow.

**Pagination.** Request lists load all records. This is acceptable for a small hotel but requires cursor-based pagination at scale.

**Tests.** No automated tests were written. The architecture — thin controllers, a service layer, pure utility functions — is structured to be testable, but the test suite was cut under time pressure.

---

## Trade-offs Made Under Time Constraint

**Polling over WebSockets.** A live operations tool ideally pushes updates to clients. Implementing Socket.io correctly with multi-tenant room isolation takes meaningful time. Polling every 30 seconds is an honest trade-off — it works, it is simple, and it is straightforward to replace later.

**Single-process queue worker.** The BullMQ worker runs in the same process as the Express server. In production these should be separate services so a queue backlog does not affect API latency. Splitting them requires a second Render service and a shared Redis connection, which was skipped to keep the deployment simple.

**No schema validation library.** Controllers check for required fields and return 400 responses, but there is no Zod or equivalent middleware. Adding per-route schema validation would tighten the API contract significantly and is a clear next step.

**Hardcoded demo credentials in Login.tsx.** The login page pre-fills a demo account for easy evaluation. These must be removed before any real deployment.

---

## What Comes Next

**Guest portal.** A QR code per room that opens a mobile-optimised request form requiring no login. This is the highest-impact feature not yet built.

**Push notifications.** Email to assigned staff on new assignment, SMS to manager on escalation. The BullMQ infrastructure is already in place.

**WebSocket live updates.** Replace the polling interval with Socket.io rooms scoped by hotelId.

**Reporting exports.** CSV or PDF export of resolved requests by date range for management review.

**SLA configuration per hotel.** SLA minutes are currently hardcoded constants. Managers should be able to configure their own thresholds per priority level.

**Test suite.** Unit tests for the service layer and controller logic, integration tests for the API routes.
