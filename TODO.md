# TODO - Fix Elimination Feature

## Plan

### 1. EliminationContext.jsx ✅
- [x] Add `published` field to elimination objects (default: false)
- [x] Rename semantic `grade` → `presenceRate` in UI-facing properties
- [x] Add `publishElimination(id)` function to toggle published to true
- [x] Update mock data to use presenceRate and published
- [x] Update status messages/reasons to reference "présence" instead of "note"
- [x] Update `addElimination` to accept a `published` flag

### 2. EliminationPage.jsx ✅
- [x] Replace className-based teacher filter with examId-based filter (using assignments)
- [x] Student view: only show published eliminations
- [x] Auto-calculate presence rate when admin selects exam + student
- [x] Modal: Add "Publier" button next to "Ajouter"
- [x] Table: Show Published/Draft badge for admin
- [x] Add Safe Zone 🟢 stat card (66.67%-100%)
- [x] Update getGradeColor for safe zone (green)
- [x] Replace window.confirm delete with inline confirmation + improved CSS

### 3. EliminationPage.css ✅
- [x] Add delete action button enhanced styling (red hover, scale animation, glow)
- [x] Add delete confirmation buttons (confirm-yes / confirm-no)
- [x] Add Published/Draft badge styles
- [x] Add Safe Zone stat icon style
- [x] Modal footer layout for three buttons (Annuler, Ajouter, Publier)
- [x] Add publish action button styling
- [x] Responsive styles for modal footer on mobile

### Percentage Rules (Presence-Based)
| Range | Status | Zone |
|---|---|---|
| 0 – 33.33% | disqualified | 🔴 Éliminé |
| 33.34 – 66.66% | at_risk | 🟡 À risque |
| 66.67 – 100% | safe | 🟢 Sécurisé |

## Summary of Changes

1. **Only Admin can add eliminations** — The "Nouvelle élimination" button and modal actions are already restricted to `isAdmin`.

2. **Teachers see eliminations for their assigned modules** — Replaced the imprecise `className`-based filter with an `examId`-based filter using the `assignments` data. Teachers now only see eliminations for exams they are explicitly assigned to supervise.

3. **Students only see published eliminations** — Student view now filters with `e.published === true`, so drafts are hidden from students.

4. **Presence rate auto-calculation** — When an admin selects a module and a student in the modal, the system automatically calculates the presence rate by looking at all exams with the same `subject` + `className` and checking the student's attendance records.

5. **"Ajouter" + "Publier" buttons** — The modal now has two primary action buttons:
   - **Ajouter** (blue): Saves as a draft (`published: false`)
   - **Publier** (green): Saves and immediately publishes (`published: true`)

6. **Percentage zones fixed** —
   - 0–33.33% → 🔴 Éliminé
   - 33.34–66.66% → 🟡 À risque
   - 66.67–100% → 🟢 Sécurisé

7. **Delete action CSS improved** — Replaced the browser `window.confirm` with an inline two-button confirmation (✓ / ✕) with smooth animations, hover scale effects, and color-coded feedback.

