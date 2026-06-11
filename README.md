# CompaiInit

This project contains a split Angular frontend and NestJS backend in the same repository.

- Frontend code: `app/ui`
- Backend code: `app/api`

## Run the frontend

From the project root:

```bash
npm run start:frontend
```

This starts the Angular dev server, usually on `http://localhost:4200/`.

## Run the backend

From the project root:

```bash
npm run start:backend
```

This starts the NestJS backend, usually on `http://localhost:3000/api`.

## Run both together

From the project root:

```bash
npm run start:dev
```

This starts both frontend and backend concurrently.

## Build

- Frontend build:

```bash
npm run build:frontend
```

- Backend build:

```bash
npm run build:backend
```

## Frontend structure

- `app/ui/src/` — Angular application source
- `app/ui/server.ts` — Angular SSR server entry
- `app/ui/tsconfig.app.json` — Angular app TypeScript config

## Backend structure

- `app/api/src/` — NestJS application source
- `app/api/tsconfig.json` — NestJS TypeScript config

## Further help

For Angular CLI help, run `ng help`.
For NestJS help, run `npx nest --help`.
