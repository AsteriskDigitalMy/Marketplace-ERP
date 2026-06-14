# NyxAPI Route Reference

Canonical API routes after the URL housekeeping cutover. All paths are relative to the API host (e.g. `https://api.example.com`).

**Last updated:** 2026-06-13  
**Source of truth:** `src/NyxAPI/app/Controllers/` and `Nyxhub.Core.Shared/Helper/ApiRoutes.cs`

---

## Conventions

### Base paths

| Scope | Pattern | Audience |
|-------|---------|----------|
| Core (internal) | `/api/core/v1/orgs/{organizationName}/...` | NyxHub Portal, backoffice |
| Developer (external) | `/api/developer/v1/orgs/{organizationName}/...` | External integrations (API key) |
| Core non-tenant | `/api/core/v1/...` (no `orgs` segment) | Registration, marketing, etc. |

All portal/backoffice endpoints live under **`/api/core/v1`**. Four integration controllers are registered on **both** `/api/core/v1` and `/api/developer/v1` (same handlers, different entry points for internal vs external consumers). See [Developer APIs](#developer-apis-external).

Path segments use **lowercase, hyphenated, plural nouns**. HTTP verbs carry the action — there are no RPC-style action segments (`GetUsers` → `GET .../users`).

### Authentication

Most tenant endpoints require authentication via middleware (Bearer JWT or API key). Unless noted, **Middleware** = Bearer JWT and/or `api-key` header.

| Mechanism | Header / query | Notes |
|-----------|----------------|-------|
| Bearer JWT | `Authorization: Bearer {token}` | ADB2C session token |
| API key | `api-key: {key}` or `?api-key=` | Developer / integration access |
| Quartz job | `quartz-key: {key}` | Scheduled job execution |

**Attribute gates** (in addition to middleware):

| Attribute | Meaning |
|-----------|---------|
| `BearerTokenAccess` | Bearer only (API key rejected) |
| `APITokenOrBearerTokenAccess` | API key or Bearer |
| `RequiresBackofficeSecurityAccess` | Backoffice security permission |
| `RequiresOrganizationOwnerAccess` | Organization owner |
| `RequiresSettingsReadAccess` | Settings read permission |

**Auth-exempt paths** (no access check): `/api/core/v1/hello-world`, `/api/core/v1/marketing/*`, `/api/core/v1/schedule-jobs/*`

### Pagination

List endpoints accept query parameters from `PaginationParameter`:

| Query param | Default | Max |
|-------------|---------|-----|
| `PageSize` | 10 | 100 |
| `PageNumber` | 1 | min 1 |

Paged responses use `PagedList<T>`:

```json
{
  "Records": [],
  "TotalCount": 0
}
```

### Standard response envelope

Many management/auth endpoints wrap payloads in `APIResponse`:

```json
{
  "StatusCode": "OK",
  "ErrorMessage": null,
  "DetailErrorMessage": null,
  "Data": {},
  "StackTrace": null
}
```

`StatusCode` is `"OK"` or `"ERROR"`. CRUD endpoints often return the DTO directly (`200 OK`) or `204 No Content` on delete.

### Common errors

| HTTP | When |
|------|------|
| `400` | Validation failure, bad request body |
| `401` | Missing or invalid auth |
| `403` | Authenticated but insufficient permission |
| `404` | Resource not found |

### OpenAPI (development)

Interactive API docs are served at **`/docs`** (Swagger UI). Two OpenAPI documents split the surface by audience:

| UI label | Spec URL | Includes |
|----------|----------|----------|
| Core API | `/swagger/core/swagger.json` | Routes under `/api/core/` |
| Developer API | `/swagger/developer/swagger.json` | Routes under `/api/developer/` |

Configure the IDE launch profile `launchUrl` to `docs` (see `src/NyxAPI/app/Properties/launchSettings.json`) to open `/docs` on run.

---

## Non-tenant endpoints

### Health

#### GET `/api/core/v1/hello-world`

Health check. No authentication required.

**Response:** `200 OK` (empty body)

---

### Organizations — `/api/core/v1/organizations`

Organization lifecycle and invitations. No tenant DB connection required.

#### GET `/api/core/v1/organizations/{organizationName}`

Look up a tenant organization by name.

**Auth:** Middleware (no tenant DB)  
**Response:** `200 OK` — `TenantOrganizationDto`

#### POST `/api/core/v1/organizations`

Register a new organization and owner user.

**Auth:** Middleware (no tenant DB)  
**Request body:** `UserRegistrationRequest`

```json
{
  "Email": "owner@example.com",
  "DisplayName": "Jane Owner",
  "Password": "********",
  "OrganizationName": "acme",
  "OrganizationPlanId": "00000000-0000-0000-0000-000000000000"
}
```

**Response:** `200 OK` — `APIResponse` with registration result in `Data`

#### POST `/api/core/v1/organizations/direct-engage`

Create a Direct Engage organization.

**Request body:** `UserRegistrationRequest` (same shape as above)  
**Response:** `200 OK` — `APIResponse`

#### POST `/api/core/v1/organizations/invitations/verify`

Verify an invitation encryption string.

**Request body:** `InvitationRequest`

```json
{ "EncryptionString": "..." }
```

**Response:** `200 OK` — verification result

#### POST `/api/core/v1/organizations/invitations/users`

Create an invited user after verifying invitation.

**Request body:** `UserRequest`

```json
{
  "Email": "user@example.com",
  "DisplayName": "New User",
  "Password": "********",
  "RoleIds": ["00000000-0000-0000-0000-000000000000"],
  "OrganizationName": "acme",
  "EncryptionString": "..."
}
```

**Response:** `200 OK` — `APIResponse` → `UserDto`

#### POST `/api/core/v1/organizations/invitations/users/by-link`

Create an invited user via invitation link flow.

**Request body:** `UserRequest`  
**Response:** `200 OK` — `APIResponse` → `MgmtInvitationUserDto`

---

### Access — `/api/core/v1/access`

#### GET `/api/core/v1/access/organization`

List organizations the current user can access.

**Auth:** Middleware (no tenant DB)  
**Response:** `200 OK` — organization access list

---

### Marketing — `/api/core/v1/marketing`

No authentication required.

#### POST `/api/core/v1/marketing/subscribe`

Subscribe an email to marketing list.

**Request body:** `MarketingSubscribeRequest`

```json
{ "Email": "subscriber@example.com" }
```

**Response:** `200 OK` — `APIResponse`

#### POST `/api/core/v1/marketing/demo-requests`

Submit a demo request.

**Request body:** `RequestForDemoRequest`

```json
{
  "Email": "prospect@example.com",
  "FirstName": "John",
  "LastName": "Doe",
  "ContactNumber": "+60123456789",
  "OrganizationName": "Acme Corp",
  "Enquiry": "Interested in CRM features"
}
```

**Response:** `200 OK` — `APIResponse`

---

### Schedule jobs — `/api/core/v1/schedule-jobs`

#### POST `/api/core/v1/schedule-jobs/login-activity/fetch`

Fetch and store user sign-in activity from ADB2C.

**Auth:** None  
**Query:** `durationInDays` (default `30`)  
**Response:** `200 OK` — sign-in activity list

---

## Tenant endpoints

Base (core): **`/api/core/v1/orgs/{organizationName}`**

---

## Objects

Base: `.../objects`

### GET `.../objects/all`

List all objects (unpaginated).

**Response:** `200 OK` — `ObjectDto[]`

### GET `.../objects`

List objects with pagination.

**Query:** `PageSize`, `PageNumber`  
**Response:** `200 OK` — `PagedList<ObjectDto>`

### GET `.../objects/{objectIdOrSlug}`

Get a single object by GUID or slug.

**Response:** `200 OK` — `ObjectDto` | `404`

```json
{
  "Id": "00000000-0000-0000-0000-000000000000",
  "Name": "Contact",
  "Slug": "contact",
  "Description": "",
  "Schema": [],
  "Layout": {},
  "LookupMetadata": [],
  "Versioning": false,
  "IsSystem": false
}
```

### POST `.../objects`

Create a new object.

**Request body:** `ObjectManagerRequest`

```json
{
  "Name": "Contact",
  "Slug": "contact",
  "Description": "Customer contacts",
  "Versioning": false
}
```

**Response:** `200 OK` — `ObjectDto`

### PUT `.../objects/{id:guid}`

Update an object.

**Request body:** `ObjectManagerRequest`  
**Response:** `200 OK` — `ObjectDto`

### DELETE `.../objects/{id:guid}`

Delete an object.

**Response:** `204 No Content`

---

## Records

Paths are on the org base (`.../orgs/{organizationName}`).

### GET `.../objects/{objectIdOrSlug}/records`

List records with pagination. Pass optional `search` query param for paginated keyword filter on the same route.

**Query:** `PageSize`, `PageNumber`, optional `search`  
**Response:** `200 OK` — `PagedList<RecordDto>`

Without `search`, returns all records for the object (paged). With `search`, returns matching records (paged).

### GET `.../objects/{objectIdOrSlug}/records/search/{search}`

Search records by keyword (non-paginated). Use the list route with `?search=` when pagination is needed.

**Response:** `200 OK` — `RecordDto[]`

### GET `.../objects/{childObjectIdOrSlug}/related/{childFieldAPIName}/{recordId:guid}`

Get related records for a lookup/rollup field.

**Response:** `200 OK` — related records

### GET `.../objects/{objectIdOrSlug}/records/{recordId:guid}`

Get a single record.

**Response:** `200 OK` — `RecordDto`

```json
{
  "Id": "00000000-0000-0000-0000-000000000000",
  "Name": "John Doe",
  "Lookupnames": {},
  "Data": { "email": "john@example.com" },
  "CreatedBy": "admin",
  "CreatedDatetime": "2026-06-12T00:00:00Z",
  "ModifiedBy": "admin",
  "ModifiedDatetime": null,
  "AiData": {}
}
```

### GET `.../objects/{objectIdOrSlug}/records/{recordId:guid}/versions`

List record versions (paginated).

**Query:** `PageSize`, `PageNumber`  
**Response:** `200 OK` — `PagedList<RecordDto>`

### GET `.../objects/{objectIdOrSlug}/records/{recordId:guid}/versions/latest`

Get the latest version of a record.

**Response:** `200 OK` — `RecordDto`

### GET `.../objects/{objectIdOrSlug}/records/{recordId:guid}/versions/{versionId:guid}`

Get a specific record version.

**Response:** `200 OK` — `RecordDto`

### POST `.../objects/{objectIdOrSlug}/records`

Create a record.

**Request body:** `RecordRequest`

```json
{
  "Id": "00000000-0000-0000-0000-000000000000",
  "Name": "John Doe",
  "Data": { "email": "john@example.com" },
  "AiData": {},
  "IsDeleteAttachment": false
}
```

**Response:** `200 OK` — `RecordDto`

### POST `.../objects/{objectIdOrSlug}/records/bulk`

Bulk create records.

**Request body:** `RecordRequest[]`  
**Response:** `200 OK` — bulk result

### PUT `.../objects/{objectIdOrSlug}/records/{id:guid}`

Update a record.

**Request body:** `RecordRequest`  
**Response:** `200 OK` — `RecordDto`

### PUT `.../objects/{objectIdOrSlug}/records/bulk`

Bulk update records.

**Request body:** `RecordRequest[]`  
**Response:** `200 OK` — bulk result

### POST `.../objects/{objectIdOrSlug}/records/normalize`

Normalize legacy string values in record `data` jsonb to native field types by re-running schema validation. Maintenance endpoint — does not fire automations or webhooks. Requires UPDATE permission on the object.

**Response:** `200 OK`

```json
{
  "totalRecords": 1234,
  "updatedRecords": 56
}
```

### POST `.../records/normalize`

Normalize record `data` jsonb for **all objects** in the organization. Loops every object entity and runs the same validation/coercion as the per-object normalize endpoint. Maintenance endpoint — does not fire automations or webhooks. Requires backoffice access.

**Response:** `200 OK`

```json
{
  "totalObjects": 12,
  "totalRecords": 45678,
  "updatedRecords": 890
}
```

### DELETE `.../objects/{objectIdOrSlug}/records/{id:guid}`

Delete a record.

**Response:** `204 No Content`

### POST `.../objects/{objectIdOrSlug}/records/{recordId:guid}/fields/{fieldApiName}/ai-summary`

Trigger AI summary generation for a field.

**Response:** `200 OK`

```json
{
  "success": true,
  "field": "summary",
  "aiSummary": "Generated summary text..."
}
```

---

## Fields

### GET `.../objects/{objectIdOrSlug}/fields/{fieldAPIName}`

Get field metadata.

**Response:** `200 OK` — `FieldDto`

### GET `.../field-options?type={type}`

Get field-type picker options.

**Query:** `type` = `user` | `role`  
**Response:** `200 OK` — field options list

### GET `.../objects/{objectIdOrSlug}/field-options?type=rollup`

Get rollup field options for an object.

**Response:** `200 OK` — rollup options

### POST `.../objects/{objectIdOrSlug}/fields`

Create a field.

**Request body:** `FieldRequest`

```json
{
  "FieldMetadata": {
    "Label": "Email",
    "FieldAPIName": "email",
    "FieldType": "Text",
    "IsRequired": true,
    "Formula": "",
    "Options": [],
    "IsIndexingEnabled": false
  }
}
```

**Response:** `200 OK` — `FieldDto`

### PUT `.../objects/{objectIdOrSlug}/fields`

Update a field.

**Request body:** `FieldRequest`  
**Response:** `200 OK` — `FieldDto`

### DELETE `.../objects/{objectIdOrSlug}/fields/{fieldAPIName}`

Delete a field.

**Response:** `204 No Content`

### POST `.../formulas/validate`

Validate a formula expression.

**Request body:** `ValidateFormulaRequest`

```json
{
  "ObjectId": "00000000-0000-0000-0000-000000000000",
  "RecordId": "00000000-0000-0000-0000-000000000000",
  "Formula": "1 + 1"
}
```

**Response:** `200 OK` — formula evaluation result

### PUT `.../objects/{objectIdOrSlug}/field-index/enable`

Enable search indexing on a field.

**Request body:** `FieldIndexRequest`

```json
{ "FieldAPIName": "email", "FieldType": "Text" }
```

**Response:** `200 OK` — field result

### PUT `.../objects/{objectIdOrSlug}/field-index/disable`

Disable search indexing on a field.

**Request body:** `FieldIndexRequest`  
**Response:** `200 OK` — field result

---

## Layout

Base: `.../objects/{objectIdOrSlug}/layout`

### GET `.../layout`

Get the object layout.

**Response:** `200 OK` — layout object | `404`

### PUT `.../layout`

Update the object layout.

**Request body:** `LayoutRequest`

```json
{ "Layout": { "sections": [] } }
```

**Response:** `200 OK` — layout object

### POST `.../layout/reset`

Reset layout to default.

**Response:** `200 OK` — layout object

---

## Record views

### GET `.../record-views`

List all record views in the organization.

**Response:** `200 OK` — `RecordViewDto[]`

### GET `.../record-views/{id:guid}`

Get a record view by ID.

**Response:** `200 OK` — `RecordViewDto`

### GET `.../objects/{objectIdOrSlug}/record-views`

List record views for an object.

**Response:** `200 OK` — `RecordViewDto[]`

### POST `.../objects/{objectIdOrSlug}/record-views`

Create a record view.

**Request body:** `RecordViewRequest`

```json
{ "Name": "All contacts", "Fields": ["name", "email"] }
```

**Response:** `200 OK` — `RecordViewDto`

### PUT `.../record-views/{id:guid}`

Update a record view.

**Request body:** `RecordViewRequest`  
**Response:** `200 OK` — `RecordViewDto`

### PUT `.../objects/{objectIdOrSlug}/record-views/{id:guid}/default`

Set a record view as the default for an object.

**Request body:** raw JSON boolean (`true` / `false`)  
**Response:** `200 OK` — `RecordViewDto`

### DELETE `.../record-views/{id:guid}`

Delete a record view.

**Response:** `204 No Content`

---

## Files (portal / session)

### POST `.../objects/{objectId:guid}/files`

Upload files to a record object.

**Content-Type:** `multipart/form-data`  
**Response:** `200 OK` — `BlobResponseDto`

### GET `.../objects/{objectId:guid}/files`

List files for an object.

**Response:** `200 OK` — `BlobSasDownload[]`

### GET `.../objects/{objectId:guid}/files/{filename}`

Get a SAS download URL for a file.

**Response:** `200 OK` — `BlobSasDownload`

### DELETE `.../objects/{objectId:guid}/files/{filename}`

Delete a file.

**Response:** `200 OK` — delete result

---

## Users & access control

### Users

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `.../users/me/is-owner` | Middleware | Whether current user is org owner → `bool` |
| GET | `.../users` | Middleware | List users (paginated) → `PagedList<UserDto>` |
| GET | `.../users/{id:guid}` | Middleware | User with roles |
| GET | `.../users/me` | Middleware | Current user with roles |
| GET | `.../users/by-provider/{providerId:guid}` | Middleware | User by ADB2C provider ID |
| POST | `.../users/invitations` | Backoffice | Invite user |
| POST | `.../users/password-reset` | Middleware | Reset user password |
| DELETE | `.../users/{id:guid}` | Backoffice | Delete user → `204` |
| GET | `.../users/sign-in-activity` | Middleware | Sign-in activity log |
| POST | `.../users/{newOwnerId:guid}/ownership-transfer` | Owner | Transfer org ownership |

**Invite user** — `POST .../users/invitations`

```json
{
  "Email": "newuser@example.com",
  "DisplayName": "New User",
  "RoleIds": ["00000000-0000-0000-0000-000000000000"]
}
```

**Password reset** — `POST .../users/password-reset`

```json
{
  "UserId": "",
  "Email": "user@example.com",
  "NewPassword": "********"
}
```

**Response:** `200 OK` — `{ "message": "Password reset successfully", "user": ... }`

### Roles — `.../roles`

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| GET | `/` | Middleware | — | `PagedList<RoleDto>` |
| GET | `/{id:guid}` | Middleware | — | `RoleDto` |
| POST | `/` | Backoffice | `RoleRequest` | `RoleDto` |
| PUT | `/{id:guid}` | Backoffice | `RoleRequest` | `RoleDto` |
| DELETE | `/{id:guid}` | Backoffice | — | `204` |

```json
{ "Name": "Sales Manager", "Policy": {} }
```

### User roles — `.../user-roles`

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| GET | `/` | Middleware | — | `UserRoleDto[]` |
| GET | `/{userId:guid}/{roleId:guid}` | Middleware | — | `UserRoleDto` |
| POST | `/` | Backoffice | `UserRoleRequest` | `UserRoleDto` |
| DELETE | `/{userId:guid}/{roleId:guid}` | Backoffice | — | `204` |

```json
{
  "UserId": "00000000-0000-0000-0000-000000000000",
  "RoleId": "00000000-0000-0000-0000-000000000000"
}
```

### API access keys — `.../api-access`

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| GET | `/` | Middleware | — | `PagedList<APIAccessDto>` |
| GET | `/{id:guid}` | Middleware | — | `APIAccessDto` |
| POST | `/` | Bearer | `APIAccessRequest` | `APIAccessDto` |
| PUT | `/{id:guid}` | Bearer | `APIAccessRequest` | `APIAccessDto` |
| PUT | `/{id:guid}/roles` | Bearer | `ApiAccessRoleRequest` | `APIAccessDto` |
| DELETE | `/{id:guid}` | Bearer | — | `204` |

```json
{
  "Name": "Integration key",
  "Description": "",
  "IsActive": true,
  "Environments": []
}

{ "RoleIds": [] }
```

### Profile — `.../profile`

#### GET `.../profile`

Get the current user's profile with roles.

**Response:** `200 OK` — `UserDto`

### Auth (tenant app) — `.../auth`

| Method | Path | Request | Response |
|--------|------|---------|----------|
| POST | `/register` | `RegisterRequest` | `APIResponse` → `RegisterResponse` |
| POST | `/login` | `LoginRequest` | `APIResponse` → `LoginResponse` |
| POST | `/verify-jwt` | `VerifyJwtRequest` | `APIResponse` → `VerifyResponse` |
| POST | `/password-reset` | `ProfileResetPasswordRequest` | `APIResponse` |
| POST | `/password-reset/request` | `RequestResetPasswordLinkRequest` | `APIResponse` |

```json
// LoginRequest
{ "Email": "user@example.com", "Password": "********" }

// LoginResponse (in Data)
{ "Token": "...", "ExpiresAt": "2026-06-12T00:00:00Z", "RequiresMFA": false }
```

---

## Reporting

### Reports — `.../reports`

| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/` | — | `PagedList<ReportingDto>` |
| GET | `/{id:guid}` | — | `ReportingDto` |
| POST | `/` | `ReportingRequest` | `ReportingDto` |
| PUT | `/{id:guid}` | `ReportingRequest` | `ReportingDto` |
| DELETE | `/{id:guid}` | — | `204` |
| DELETE | `/{id:guid}/cache` | — | cache clear result |

```json
{
  "Name": "Sales report",
  "Description": "",
  "UserQuery": "SELECT * FROM ...",
  "IsPostgreRawQuery": false
}
```

### Dashboards — `.../dashboards`

| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/` | — | `PagedList<DashboardDto>` |
| GET | `/{id:guid}` | — | `DashboardDto` |
| POST | `/` | `DashboardRequest` | `DashboardDto` |
| PUT | `/{id:guid}` | `DashboardRequest` | `DashboardDto` |
| DELETE | `/{id:guid}` | — | `204` |

```json
{ "Name": "Executive", "Description": "", "IsDefault": false }
```

### Widgets

| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `.../dashboards/{id:guid}/widgets` | — | `WidgetDto[]` |
| GET | `.../widgets/{id:guid}` | — | `WidgetDto` |
| POST | `.../widgets` | `WidgetRequest` | `WidgetDto` |
| PUT | `.../widgets/{id:guid}` | `WidgetRequest` | `WidgetDto` |
| DELETE | `.../widgets/{id:guid}` | — | `204` |

```json
{
  "Id": "00000000-0000-0000-0000-000000000000",
  "DashboardId": "00000000-0000-0000-0000-000000000000",
  "Name": "Revenue chart",
  "ReportId": "00000000-0000-0000-0000-000000000000",
  "ChartType": "bar",
  "ChartConfiguration": { "X": "month", "Y": "revenue" },
  "TableConfiguration": []
}
```

### SQL

| Method | Path | Description | Body | Response |
|--------|------|-------------|------|----------|
| POST | `.../sql/validate` | Validate SQL query | `SQLRequest` | `200` or `400 { error }` |
| POST | `.../sql/preview` | Preview query (max 10 rows) | `SQLRequest` | preview rows |
| GET | `.../reports/{reportId:guid}/query-data` | Execute saved report query | optional `PageSize`, `PageNumber` | `QueryResultDto` |

**GET `.../reports/{reportId:guid}/query-data`**

Single route for full and paginated execution. Pagination applies only when `PageNumber` and/or `PageSize` is present in the query string.

| Query | Behavior |
|-------|----------|
| _(none)_ | Full result set; `TotalCount` = row count |
| `PageNumber`, `PageSize` | `LIMIT` / `OFFSET` page; `TotalCount` from count query |

```json
{
  "UserQuery": "SELECT id, name FROM contact",
  "IsPreview": true,
  "IsPostgreRawQuery": false
}
```

### Scheduled reports — `.../scheduled-reports`

| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/` | — | `PagedList<ScheduledReportDto>` |
| GET | `/{id:guid}` | — | `ScheduledReportDto` |
| POST | `/` | `ScheduledReportUpsertRequest` | `ScheduledReportDto` |
| PUT | `/{id:guid}` | `ScheduledReportUpsertRequest` | `ScheduledReportDto` |
| PATCH | `/{id:guid}/enabled` | `SetScheduledReportEnabledRequest` | `204` |
| DELETE | `/{id:guid}` | — | `204` |
| POST | `/{id:guid}/runs` | — | run pipeline (`200` or `400`) |
| GET | `/{scheduledReportId:guid}/history` | — | `PagedList<ScheduledReportHistoryEntryDto>` |
| GET | `/{scheduledReportId:guid}/history/{historyId:guid}/download` | — | Excel file stream |

```json
{
  "ReportId": "00000000-0000-0000-0000-000000000000",
  "ReportNameSnapshot": "Monthly sales",
  "IsEnabled": true,
  "ScheduleRecipientEmail": "team@example.com",
  "ScheduleFrequency": "weekly",
  "ScheduledHour": 8,
  "ScheduleTimezone": "Asia/Kuala_Lumpur",
  "ScheduleDaysOfWeek": ["Monday"],
  "ScheduleDaysOfMonth": []
}

{ "IsEnabled": true }
```

---

## Automation & webhooks

### Automations

| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `.../automations/all` | — | `AutomationDto[]` |
| GET | `.../automations` | — | `PagedList<AutomationDto>` |
| GET | `.../automations/{id:guid}` | — | `AutomationDto` |
| GET | `.../automations/{id:guid}/content` | — | blob script content |
| POST | `.../automations` | `AutomationRequest` | `AutomationDto` |
| PUT | `.../automations/{id:guid}` | `AutomationRequest` | `AutomationDto` |
| DELETE | `.../automations/{id:guid}` | — | `204` |

```json
{
  "AutomationId": null,
  "ObjectId": "00000000-0000-0000-0000-000000000000",
  "Name": "On create notify",
  "Description": "",
  "EventType": "Create",
  "Code": "// script",
  "Enabled": true
}
```

### Webhooks — `.../webhooks`

| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/` | — | `PagedList<WebhookDto>` |
| GET | `/{id:guid}` | — | `WebhookDto` |
| GET | `/{id:guid}/logs` | — | `WebhookLogDto[]` |
| POST | `/` | `WebhookRequest` | `WebhookDto` |
| PUT | `/{id:guid}` | `WebhookRequest` | `WebhookDto` |
| DELETE | `/{id:guid}` | — | `204` |

```json
{
  "Name": "CRM sync",
  "Description": "",
  "Enabled": true,
  "ObjectId": "00000000-0000-0000-0000-000000000000",
  "OnCreate": true,
  "OnUpdate": true,
  "OnDelete": false,
  "Protocol": "HTTPS",
  "URL": "https://example.com/hook",
  "Headers": []
}
```

---

## Marketplace & apps

### Browse — `.../marketplace/apps`

| Method | Path | Response |
|--------|------|----------|
| GET | `/` | `PagedList` of published apps |
| GET | `/{id:guid}` | app detail |
| GET | `/{id:guid}/versions` | version list |

### Developer — `.../marketplace/developer/apps`

| Method | Path | Body / form | Response |
|--------|------|-------------|----------|
| GET | `/` | — | developer apps (paginated) |
| GET | `/{id:guid}` | — | app detail |
| GET | `/{id:guid}/versions` | — | versions |
| POST | `/` | `CreateMarketplaceRequest` | app |
| PUT | `/{id:guid}` | `CreateMarketplaceRequest` | app |
| POST | `/{id:guid}/versions/{version}` | — | create version |
| POST | `/{id:guid}/versions/{version}/publish` | — | `APIResponse` |
| POST | `/{id:guid}/versions/{version}/unpublish` | — | `APIResponse` |
| POST | `/{id:guid}/versions/{version}/package` | `multipart/form-data` | upload result |
| POST | `/{id:guid}/screenshots` | `multipart/form-data` | screenshot result |

```json
{
  "Name": "My App",
  "Description": "",
  "Requirement": "",
  "Migration": "",
  "Note": "",
  "Version": "1.0.0"
}
```

### Installed apps — `.../installed-apps`

| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/` | — | `PagedList<InstalledAppDto>` |
| POST | `/` | `InstallAppRequest` | `InstalledAppDto` |
| POST | `/{installedAppId:guid}/upgrade` | `UpgradeAppRequest` | `InstalledAppDto` |
| PATCH | `/{installedAppId:guid}/status` | `ToggleAppStatusRequest` | `InstalledAppDto` |

```json
{
  "MarketplaceAppId": "00000000-0000-0000-0000-000000000000",
  "Version": "1.0.0"
}

{ "NewVersion": "1.0.1" }

{ "Enable": true }
```

---

## Document library — `.../document-library`

| Method | Path | Body / query | Response |
|--------|------|--------------|----------|
| POST | `/public-folders` | `CreatePublicFolderRequest` | `200` |
| GET | `/public-folders` | — | `{ folders: [...] }` |
| POST | `/private-folders` | `CreatePrivateFolderRequest` | folder result |
| GET | `/private-folders` | — | `{ folders: [...] }` |
| POST | `/documents` | `folderPath` query + multipart files | `200` |
| DELETE | `/documents` | `filePath` query | `{ success: true }` |
| POST | `/private-folders/share` | `ShareFolderRequest` | `{ success: true }` |
| GET | `/shared-folders` | — | `{ folders: [...] }` |

```json
{ "FolderName": "Contracts" }

{
  "FolderPath": "/private/shared",
  "SharedWith": [{ "Email": "colleague@example.com", "Id": "", "Type": "user" }],
  "IsRemove": false
}
```

---

## Platform settings & configuration

### Settings — `.../settings`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/external-schema` | SettingsRead | External settings JSON schema |
| GET | `/secret?key={key}` | SettingsRead | Decrypt a secured setting value |
| PUT | `/` | Backoffice | Upsert settings |

**Upsert** — `PUT .../settings`

```json
{
  "Settings": [
    {
      "Category": "general",
      "Key": "company_name",
      "Value": "Acme Corp",
      "IsSecured": false,
      "HasValueChanged": true
    }
  ]
}
```

### Configuration — `.../configuration`

#### GET `.../configuration/field-types`

Returns available field type definitions.

**Response:** `200 OK` — `FieldTypes`

### Environment — `.../environment`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/sandboxes` | Bearer | List sandboxes |
| POST | `/sandboxes` | Middleware | Create sandbox |
| POST | `/sandboxes/{sandboxSlug}/refresh` | Middleware | Refresh sandbox |
| DELETE | `/sandboxes/{sandboxSlug}` | Middleware | Delete sandbox |
| POST | `/sync` | Middleware | Sync environments |
| GET | `/sync-history` | Bearer | Sync history (`limit`, default 50) |
| GET | `/component-diff` | Bearer | Diff components (`source`, `target`, `component`) |
| POST | `/records/preview` | Bearer | Preview record sync |
| POST | `/promote` | Middleware | Promote environment |
| GET | `/deployments` | Bearer | Deployment history (`limit`, default 50) |

### Taxonomy paths — `.../taxonomy-paths`

| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/` | — | `TaxonomyPathSettingDto[]` |
| GET | `/{id:guid}` | — | `TaxonomyPathSettingDto` |
| POST | `/` | taxonomy path request | `200` |
| PUT | `/{id:guid}` | taxonomy path request | `200` |
| DELETE | `/{id:guid}` | — | `200` |

```json
{
  "Name": "Product hierarchy",
  "Description": "",
  "Paths": [["category", "subcategory", "product"]],
  "Positions": []
}
```

### Logs — `.../logs`

#### GET `.../logs`

Operation audit logs (paginated).

**Query:** `PageSize`, `PageNumber`  
**Response:** `200 OK` — `PagedList<LogDto>`

### Overall summary — `.../overall-summary`

#### GET `.../overall-summary`

Organization usage metrics dashboard.

**Response:** `200 OK` — `MetricsDto`

```json
{
  "NumberOfObjects": 12,
  "NumberOfRecords": 4500,
  "NumberOfUsers": 8,
  "NumberOfRoles": 4,
  "NumberOfRecordView": 6,
  "NumberOfDashboards": 2,
  "NumberOfWidgets": 10,
  "NumberOfReportings": 5,
  "NumberOfWebhooks": 1,
  "NumberOfAutomations": 3,
  "NumberOfAPIAccess": 2,
  "NumberOfParameterizedQuery": 1,
  "Remarks": ""
}
```

---

## Developer APIs (external)

These controllers are mounted on **both** base paths (identical behavior):

- `/api/core/v1/orgs/{organizationName}/...` — internal
- `/api/developer/v1/orgs/{organizationName}/...` — external

Controllers: `QueryV1Controller`, `FileV1Controller`, `ParameterizedQueryV1Controller`, `DeveloperScriptV1Controller`.

### Query (OData-style) — `.../query`

**Auth:** `APITokenOrBearerTokenAccess`

| Method | Path | Body / query | Response |
|--------|------|--------------|----------|
| GET | `/{objectIdOrSlug}` | `$top`, `$skip`, `$filter`, `$orderby`, `$expand` | `PagedList<ODataQueryDto>` |
| GET | `/{objectIdOrSlug}/{recordId:guid}` | — | `QueryRecordDto` |
| PUT | `/{objectIdOrSlug}` | `RecordRequest` | `ODataQueryDto` (create) |
| PUT | `/{objectIdOrSlug}/bulk` | `RecordRequest[]` | `ODataQueryDto[]` |
| POST | `/{objectIdOrSlug}/{id:guid}` | `RecordRequest` | `ODataQueryDto` (update) |
| POST | `/{objectIdOrSlug}/bulk` | `RecordRequest[]` | `ODataQueryDto[]` |
| DELETE | `/{objectIdOrSlug}/{id:guid}` | — | `204` |

> **Note:** Developer query API uses `PUT` for create and `POST` for update (inverse of portal record endpoints).

### Developer files — `.../files`

**Auth:** `APITokenOrBearerTokenAccess`

| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/{objectIdOrSlug}` | multipart files | `BlobResponseDto` |
| POST | `/{objectIdOrSlug}/base64` | `Base64FileUploadRequest` | `BlobResponseDto` |
| GET | `/{objectIdOrSlug}` | — | `BlobSasDownload[]` |
| GET | `/{objectIdOrSlug}/{filename}` | — | `BlobSasDownload` |
| DELETE | `/{objectIdOrSlug}/{filename}` | — | delete result |

```json
{ "Content": "base64...", "FileName": "doc.pdf" }
```

### Parameterized queries (execute)

**Execute** — `POST .../parameterized-queries/{id:guid}/result` (core or developer base)  
**Auth:** `APITokenOrBearerTokenAccess`

```json
{
  "Parameters": { "status": "active" },
  "OrderingPlaceholders": {},
  "Pagination": { "PageSize": 10, "PageNumber": 1 }
}
```

**Management (core only)** — `/api/core/v1/orgs/{organizationName}/parameterized-queries`  
**Auth:** `BearerTokenAccess`

| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/` | — | `PagedList<ParameterizedQueryDto>` |
| GET | `/{id:guid}` | — | `ParameterizedQueryDto` |
| POST | `/` | `ParameterizedQueryRequest` | `ParameterizedQueryDto` |
| PUT | `/{id:guid}` | `ParameterizedQueryRequest` | `ParameterizedQueryDto` |
| DELETE | `/{id:guid}` | — | `204` |

### Developer scripts (runtime) — `.../developer-scripts/{*path}` (core or developer base)

**Auth:** `APITokenOrBearerTokenAccess`

| Method | Description |
|--------|-------------|
| GET | Invoke script (read) — query params as input |
| POST | Invoke script — query params + JSON body |
| PUT | Invoke script (update semantics) |
| DELETE | Invoke script (delete semantics) |

**Response:** JSON string in `Content` or HTTP status from script.

### Developer scheduled scripts — `POST .../developer-scheduled-scripts/{scheduleJobId:guid}`

**Auth:** `APITokenOrBearerTokenAccess`  
Execute a scheduled developer script job. Returns `JintResponseDto` data.

### Script management — `.../scripts`

**Auth:** `BearerTokenAccess`

| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/files` | — | script file tree |
| GET | `/files/api` | — | `.api.js` files |
| GET | `/files/job` | — | `.job.js` files |
| GET | `/files/{id:guid}` | — | script file |
| POST | `/files` | `ScriptCreateRequest` | script file |
| PUT | `/files` | `ScriptSaveRequest` | script file |
| PUT | `/files/rename` | `ScriptRenameRequest` | script file |
| DELETE | `/files/{id:guid}` | `atomicId` query | `204` |
| POST | `/folders` | `FolderCreateRequest` | folder |
| GET | `/folders/{id:guid}` | — | folder |
| PUT | `/folders/rename` | `ScriptRenameRequest` | folder |
| DELETE | `/folders/{id:guid}` | `atomicId` query | `204` |

### Script APIs — `.../script-apis`

**Auth:** `BearerTokenAccess` — same CRUD + logs pattern as script management.

```json
{
  "Name": "My API",
  "Description": "",
  "ClassName": "MyApiHandler",
  "DeveloperScriptId": "00000000-0000-0000-0000-000000000000",
  "IsActive": true
}
```

### Scheduled jobs — `.../scheduled-jobs`

**Auth:** `BearerTokenAccess` — CRUD + logs + `PATCH /{id:guid}/active`.

```json
{
  "Name": "Nightly sync",
  "Description": "",
  "ClassName": "NightlySyncJob",
  "DeveloperScriptId": "00000000-0000-0000-0000-000000000000",
  "CronExpression": "0 0 * * *",
  "IsActive": false,
  "ApiAccessId": null
}
```

---

## Generative BI (Copilot) — `.../copilot/generative`

### Topics

| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/topics` | — | `TopicSummaryResponse[]` |
| GET | `/topics/owned` | — | owned topics |
| GET | `/topics/shared` | — | shared topics |
| POST | `/topics` | `CreateTopicRequest` | `TopicResponse` |
| GET | `/topics/{topicKey}` | — | `TopicResponse` |
| PATCH | `/topics/{topicKey}` | `UpdateTopicRequest` | `TopicResponse` |
| DELETE | `/topics/{topicKey}` | — | `204` |
| GET | `/topics/{topicKey}/permissions` | — | permissions |
| PUT | `/topics/{topicKey}/permissions` | `SetTopicPermissionsRequest` | permissions |

### Catalog & datasets

| Method | Path | Description |
|--------|------|-------------|
| GET | `/topics/{topicKey}/datasets` | List datasets |
| POST | `/topics/{topicKey}/datasets` | Create dataset |
| GET | `/catalog/datasets/{id:guid}` | Get dataset |
| PATCH | `/catalog/datasets/{id:guid}` | Update dataset |
| DELETE | `/catalog/datasets/{id:guid}` | Delete dataset |
| GET/POST/PATCH/DELETE | `/catalog/datasets/{datasetId:guid}/fields[/{id:guid}]` | Field CRUD |

### Dashboards & widgets

| Method | Path | Description |
|--------|------|-------------|
| GET | `/topics/{topicKey}/dashboards/owned` | Owned dashboards |
| GET | `/topics/{topicKey}/dashboards/shared` | Shared dashboards |
| POST | `/topics/{topicKey}/dashboards/generate` | AI-generate dashboard |
| GET/PATCH/DELETE | `/topics/{topicKey}/dashboards/{dashboardId:guid}` | Dashboard CRUD |
| GET/PUT | `.../dashboards/{dashboardId:guid}/permissions` | Dashboard permissions |
| POST | `/topics/{topicKey}/filter` | Apply filters |
| GET/POST/PATCH/DELETE | `.../dashboards/{dashboardId:guid}/widgets[/{widgetId:guid}]` | Widget CRUD |
| GET | `.../widgets/{widgetId:guid}/data` | Widget data |

### Chat & telemetry

| Method | Path | Description |
|--------|------|-------------|
| POST | `/topics/{topicKey}/chat` | Chat (JSON response) |
| POST | `/topics/{topicKey}/chat/stream` | Chat (SSE stream, `text/event-stream`) |
| PATCH | `/topics/{topicKey}/chat/feedback/{telemetryId:guid}` | Submit feedback |
| GET/POST/PATCH/DELETE | `/topics/{topicKey}/chat/telemetry[/{telemetryId:guid}]` | Telemetry CRUD |

```json
// ChatRequest
{
  "Message": "Show top 10 customers by revenue",
  "History": [{ "Role": "user", "Content": "..." }]
}
```

### Optimization

#### POST `.../topics/{topicKey}/optimizations/diagnose`

Diagnose query/telemetry issues.

**Request body:** `DiagnoseRequest` — `{ "TelemetryId": "..." }`  
**Response:** `{ "diagnosis": ... }`

---

## Cache monitoring — `.../cache`

All endpoints require **Backoffice** access.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Cache overview |
| GET/DELETE | `/role-policies` | Role policy cache |
| GET/DELETE | `/access-policies` | Access policy cache |
| GET/DELETE | `/organization-permissions` | Org permission cache |
| GET/DELETE | `/user-invitation-permissions` | Invitation permission cache |
| GET/DELETE | `/settings` | Settings cache |
| GET | `/report-queries` | All report query caches |
| GET/DELETE | `/report-queries/{reportId:guid}` | Per-report cache |
| GET | `/generative-bi-widgets` | All GenBI widget caches |
| GET/DELETE | `/generative-bi-widgets/{topicId}/{dashboardId}/{widgetId}` | Per-widget cache |

---

## Billing

| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `.../plan/upgrade/{planId:guid}` | — | `200` (stub) |
| POST | `.../add-on-plans/{username}` | `MetricsDto` | add-on result |

---

## Disabled controllers (not in service)

The following controllers exist as `*.cs.disabled` and are **not** part of the active API surface:

- `EmailController`
- `BulkOperations/ImportController`, `ExportController`
- `AppDevelopmentController`
- `Biling/BillingController`, `PaymentController`

---

## Related documentation

- URL housekeeping plan: `.cursor/plans/api_url_housekeeping_3f7dc4cd.plan.md`
- Route constants: `src/NyxAPI/Nyxhub.Core.Shared/Helper/ApiRoutes.cs`
- DTO definitions: `src/NyxAPI/Nyxhub.Core.Model/Dto/`
