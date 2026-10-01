<<<<<<< HEAD
# XPONEXUS — Next.js + Tailwind + Express + PostgreSQL

## What is included
- Public `/` uses the supplied XPONEXUS HTML/CSS/JS as the visual source.
- No Admin link or admin indication is shown on the public website.
- Protected `/admin/login` and `/admin` portfolio administration.
- PostgreSQL projects + drawings.
- Project add/edit/delete, category, description, scope, thumbnail, publish and order.
- Drawing/PDF add/edit/delete, reference, thumbnail, publish and order.
- PDF/image uploads are stored under `server/uploads`; PostgreSQL stores URLs only.
- Published database PDF projects are loaded into the original portfolio grid through `/xpo-api/projects`.

## 1. PostgreSQL / pgAdmin
Create a database named `xponexus`. The seed command below applies `server/sql/schema.sql` automatically to create missing tables.

## 2. Server
```bash
cd server
cp .env.example .env
npm install
npm run seed
npm run dev
```
Set `DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` before seeding.
Seeding preserves existing tables and project data, and creates or updates the configured admin's password.

## 3. Client
```bash
cd client
cp .env.example .env.local
npm install
npm run dev
```
Open `http://localhost:3000`.
Admin login: `http://localhost:3000/admin/login`.

## Production
Set `CLIENT_URL`, `PUBLIC_API_ORIGIN`, `NEXT_PUBLIC_API_URL`, and `API_ORIGIN` to the deployed origins. Put persistent/object storage behind the upload route for multi-instance/cloud production.
=======
# Xponexus
>>>>>>> b384ba5df3ba8535804f8ef28f93d8865569e1b9
