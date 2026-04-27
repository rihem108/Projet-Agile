# Fix User Add/Delete Persistence

- [x] Analyze codebase and identify root causes
- [x] Fix `backend/models/User.js` — add missing fields (`status`, `phone`, `address`, `department`, `joinDate`)
- [x] Fix `backend/server.js` — add try/catch to user PUT/DELETE; hash password on update if provided
- [x] Fix `src/context/AppContext.jsx` — use functional `setUsers` updates to avoid stale closures
- [x] Fix `src/pages/UsersPage.jsx` — remove mock users, ensure `localUsers` always syncs with `users`
- [x] Verify edits compile and logic is consistent


