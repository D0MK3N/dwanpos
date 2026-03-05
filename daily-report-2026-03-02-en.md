# Daily Report - March 2, 2026

## Backend
- Investigated and fixed login/register endpoint returning 404 errors.
- Found that Gin backend routes for login/register are `/auth/login` and `/auth/register` (no `/api` prefix).
- Updated documentation and frontend to use the correct endpoints.
- Changed user info endpoint to `/auth/me` for consistency with backend.

## Frontend
- Audited and updated all login/register API calls in the frontend to match backend (`/auth/login`, `/auth/register`).
- Updated API documentation page.
- Ensured no requests are made to `/api/login` or `/api/register`.

## Testing
- Successfully tested login/register using POST to `/auth/login` and `/auth/register` (no more 404 errors).
- User info endpoint (`/auth/me`) is now correct and accessible.

## Next Steps
- Continue verifying mobile/integrator integration for login/register and transactions.
- Ensure all main endpoints (products, categories, transactions, auth) are accessible according to mode (JWT/API key).

---
Today's progress: Fixed login/register 404, updated frontend/backend, documentation, and validated auth endpoints.
