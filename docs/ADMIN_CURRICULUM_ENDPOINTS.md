# Admin Curriculum Endpoints — Backend Spec

The admin Modules & Lessons management UI is built and wired. **Reads work today**
(they reuse `GET /api/admin/courses/{id}`). The **write** operations below need new
backend endpoints under the existing `/api/admin` surface, guarded by the same
platform-admin authority as the rest of `/api/admin/courses`.

Frontend calls live in `src/services/api.js` → `platformCourseService`.
All responses are unwrapped via the standard `{ data: ... }` envelope (same as every
other admin endpoint).

---

## Modules

### Create module
`POST /api/admin/courses/{courseId}/modules`

Request body:
```json
{
  "title": "Getting Started",
  "description": "What this module covers",   // nullable
  "moduleType": "LESSON",                       // OVERVIEW | LESSON | ASSESSMENT
  "lockedAfterPrevious": true,
  "sortOrder": 0                                // 0-based; append at end
}
```
Response: the created module (with `id`, `sortOrder`, `items: []`).

### Update module
`PUT /api/admin/courses/{courseId}/modules/{moduleId}`

Body: same shape as create (minus `sortOrder`, which is managed by reorder).
Response: the updated module.

### Delete module
`DELETE /api/admin/courses/{courseId}/modules/{moduleId}`

Cascades to the module's lesson items. Response: `204` or the deleted id.

### Reorder modules
`PATCH /api/admin/courses/{courseId}/modules/reorder`

Body:
```json
{ "orderedIds": ["mod-id-3", "mod-id-1", "mod-id-2"] }
```
Assign `sortOrder` = array index. Response: the reordered module list.

---

## Lessons (module items)

### Create lesson
`POST /api/admin/courses/{courseId}/modules/{moduleId}/items`

Request body:
```json
{
  "title": "Introduction video",
  "itemType": "VIDEO",                 // VIDEO | READING | QUIZ | ASSIGNMENT | FILE | LINK
  "contentUrl": "https://…",          // nullable; for READING this holds the lesson body text
  "attachmentUrl": null,               // nullable
  "attachmentName": null,              // nullable
  "durationMinutes": 12,               // nullable
  "required": true,
  "sortOrder": 0                        // 0-based; append at end
}
```
Response: the created item (with `id`, `sortOrder`).

### Update lesson
`PUT /api/admin/courses/{courseId}/modules/{moduleId}/items/{itemId}`

Body: same shape as create (minus `sortOrder`). Response: the updated item.

### Delete lesson
`DELETE /api/admin/courses/{courseId}/modules/{moduleId}/items/{itemId}`

Response: `204` or the deleted id.

---

## Optional — dedicated aggregation (perf upgrade)

The global **Modules** (`/admin/modules`) and **Lessons** (`/admin/lessons`) pages
currently aggregate client-side: they call `GET /api/admin/courses` then fan out
`GET /api/admin/courses/{id}` per course and flatten. That works but is N+1.

If/when you want to remove the fan-out, add:
- `GET /api/admin/modules` → flat list of every module (include `courseId`,
  `courseTitle`, `courseCode`, `entityName`, `lessonCount`).
- `GET /api/admin/lessons` → flat list of every item (include `courseId`,
  `courseTitle`, `entityName`, `moduleId`, `moduleTitle`, `moduleType`).

Then swap the bodies of `platformCourseService.listAllModules` / `listAllLessons`
to call these directly (one line each).

---

## Field reference (shared with the course builder)

- **Module**: `id`, `title`, `description?`, `moduleType` (OVERVIEW|LESSON|ASSESSMENT),
  `lockedAfterPrevious` (bool), `sortOrder` (0-based int), `items[]`.
- **Lesson / item**: `id`, `title`, `itemType` (VIDEO|READING|QUIZ|ASSIGNMENT|FILE|LINK),
  `contentUrl?`, `attachmentUrl?`, `attachmentName?`, `durationMinutes?` (int),
  `required` (bool), `sortOrder` (0-based int).

These match the shapes the existing `PUT /api/entity/courses/{id}` already persists
for the whole-course wizard, so the DB model needs no new columns — only the granular
routes above.
