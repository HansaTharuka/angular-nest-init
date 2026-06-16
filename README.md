# CompaiInit

This project contains a split Angular frontend and NestJS backend in the same repository.

- Frontend code: `app/ui`
- Backend code: `app/api`

## Project Structure

```
compai-init/
├── app/
│   ├── ui/                 # Angular frontend
│   │   └── src/
│   │       ├── app/
│   │       │   ├── app.component.ts
│   │       │   ├── services/
│   │       │   │   └── export.service.ts
│   │       │   └── app.config.ts
│   │       └── main.ts
│   └── api/                # NestJS backend
│       └── src/
│           ├── auth/       # JWT authentication
│           ├── export/     # CSV export module
│           ├── logging/    # Logger & correlation ID middleware
│           └── main.ts
└── package.json
```

## Getting Started

### Run the frontend

```bash
npm run start:frontend
```

Starts Angular dev server at `http://localhost:4200/`.

### Run the backend

```bash
npm run start:backend
```

Starts NestJS backend at `http://localhost:3000/api`.

### Run both together

```bash
npm run start:dev
```

Starts frontend and backend concurrently.

## Build

```bash
npm run build:frontend  # Build Angular app
npm run build:backend   # Compile NestJS backend
npm run build           # Build both
```

## API Documentation

Swagger UI available at: `http://localhost:3000/api/docs`

### Authentication

**Login (public endpoint):**

```
POST /api/auth/login
Content-Type: application/json

{
  "userId": "user123",
  "username": "john"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Use token for protected endpoints:**

```
Authorization: Bearer <access_token>
```

### Health Check (public)

```
GET /api/v1/health

Response:
{
  "status": "ok",
  "timestamp": "2026-06-11T15:30:00.000Z"
}
```

### Excel Export (requires auth)

```
POST /api/export/xlsx
Authorization: Bearer <token>
Content-Type: application/json

{
  "tableName": "market_pricing"
}

Response: Excel `.xlsx` file as blob (file download)
```

## Logging Architecture

### Correlation ID Middleware

Every request gets a unique correlation ID for tracing:

- Auto-generated if not provided via `X-Correlation-ID` header
- Included in all log entries
- Returned in response headers

**Request:**

```http
POST /api/export/xlsx
X-Correlation-ID: 550e8400-e29b-41d4-a716-446655440000
```

**Response Headers:**

```http
X-Correlation-ID: 550e8400-e29b-41d4-a716-446655440000
```

### JSON Logging

All logs are JSON formatted with fields:

- `timestamp` — ISO timestamp
- `level` — info, warn, error, debug
- `message` — Log message
- `context` — NestJS context/module
- `correlationId` — Request tracking ID
- `service` — compai-api

**Log Output:**

```json
{
  "level": "info",
  "message": "Incoming Request",
  "timestamp": "2026-06-11 15:30:00",
  "context": "CorrelationIdMiddleware",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "method": "POST",
  "path": "/api/export/csv",
  "service": "compai-api"
}
```

Log files:

- `logs/application-YYYY-MM-DD.log` — All logs
- `logs/error-YYYY-MM-DD.log` — Error logs only
- Daily rotation with 14-day retention

## Excel Export & Blob Stream Design

### Frontend Flow

```
User clicks "Download Excel"
    ↓
AppComponent.downloadExcel()
    ↓
ExportService.exportTableToExcel(tableName: "market_pricing")
    ↓
HTTP POST /api/export/xlsx
    ↓
HttpClient receives response with responseType: 'blob'
    ↓
Response collected as Blob object (binary data)
    ↓
window.URL.createObjectURL(blob) → downloadable URL
    ↓
Create temporary <a> element with download attribute
    ↓
Trigger click() → Browser download dialog
    ↓
window.URL.revokeObjectURL(url) → Free memory
```

### Backend Flow

```
POST /api/export/xlsx received
    ↓
ExportController.exportXlsx(tableName)
    ↓
ExportService.generateExcel() generates templated Excel workbook
    ↓
Set HTTP Response Headers:
  - Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
  - Content-Disposition: attachment; filename="... .xlsx"
    ↓
Send XLSX workbook buffer in response body
    ↓
HTTP layer sends binary stream
    ↓
Frontend receives as Blob
```

### What is a Blob?

A **Blob** (Binary Large Object) is:

- Browser API for handling binary/file data
- Immutable and cannot be modified after creation
- Can represent any file type (CSV, PDF, images, videos, etc.)
- Stored in browser memory

**Current Design:**

- ✅ Simple and straightforward
- ✅ Good for small-medium files (up to ~50MB)
- ✅ No file stored on server (stateless)
- ✅ Browser handles download natively

**Stream vs Blob:**

- **Blob (current):** Entire response collected in memory
- **Stream (advanced):** Data flows continuously, memory efficient for large files (100MB+)

## Features

✅ **Multi-module architecture** — Angular frontend + NestJS backend in same repo
✅ **JWT Authentication** — Protected endpoints with Bearer tokens
✅ **Swagger Documentation** — Auto-generated API docs at `/api/docs`
✅ **JSON Logging** — Winston logger with correlation IDs
✅ **CSV Export** — Server-side generation, browser download via Blob
✅ **CORS Enabled** — Cross-origin requests from frontend to backend
✅ **Error Handling** — Proper HTTP error responses

## Environment Variables

Create `.env` file in project root:

```env
# Backend
PORT=3000
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development

# Frontend
ANGULAR_API_URL=http://localhost:3000/api
```

## Dependencies

**Backend:**

- `@nestjs/*` — NestJS framework
- `@nestjs/jwt` — JWT authentication
- `@nestjs/passport` — Passport strategies
- `@nestjs/swagger` — API documentation
- `winston` — JSON logging
- `passport-jwt` — JWT strategy

**Frontend:**

- `@angular/*` — Angular framework
- `@angular/router` — Routing
- `rxjs` — Reactive programming

## Further Help

- Angular CLI: `ng help`
- NestJS CLI: `npx nest --help`
- Swagger: `http://localhost:3000/api/docs`
