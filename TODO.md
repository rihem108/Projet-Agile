ce # Fix Teacher Can't Select Student in Grades Page

## Root Causes Identified

1. **AssignmentPage only used local state** - Assignments were never persisted to the backend.
2. **Missing `POST /api/assignments` endpoint** - Backend only had `GET` and `POST /bulk`.
3. **GradesPage `selectableExams` only checked assignments** - Teachers could only see exams they were assigned to.
4. **Inconsistent ID types** - `parseInt()` used for MongoDB string IDs.

## Fixes Applied

- [x] **Backend** - Added `POST /api/assignments`, `PUT /api/assignments/:id`, `DELETE /api/assignments/:id` endpoints
- [x] **Backend** - Populated assignment responses with exam/room/supervisor details
- [x] **AssignmentPage** - Now uses API (`addAssignment`, `updateAssignment`, `deleteAssignment`) instead of local state only
- [x] **AssignmentPage** - Removed `parseInt()` calls, using string IDs consistently
- [x] **GradesPage** - `selectableExams` now includes exams created by the teacher + exams from assignments
- [x] **GradesPage** - Added `String()` comparison for IDs to prevent type mismatches
- [x] **GradesPage** - Added user-friendly error messages when no exams/students are available
- [x] **GradesPage** - Added **Class selection dropdown** to filter exams by class

