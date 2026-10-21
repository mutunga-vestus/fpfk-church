# FPFK Church Kitengela Website

A church website with an admin dashboard. Visitors can read about the church, browse ministries, watch sermons, register for events, send a message, and find out how to give. Admins can update almost everything on the site from a dashboard, with no coding.

## Features

**Public website**
- Home page: hero, poster cards (max 2), Bible verse cards, ministries, an expiring announcement, and "Support the Church" cards
- About Us, Ministries (with photo and video gallery), Sermons (YouTube player), Events (with registration form), Connect (contact form), Plan Your Visit
- Give page with M-Pesa (Paybill, or Till for a specific item) and bank details, with copy buttons
- Works on phones and computers

**Admin dashboard** (`/admin/login`)
- Edit page text, photos, ministries, leaders, events, and sermons
- Post an announcement that hides itself after the date you choose
- Post support needs (max 4), each with its own account or Till number
- Read and manage contact messages and event registrations
- Email verification, password reset, and automatic lock after 5 minutes idle

## Built with

| Part | Technology |
| --- | --- |
| Website | React 19, Vite, Tailwind CSS |
| Server (API) | Node.js 20, Express 5 |
| Database | PostgreSQL 16 |
| Running it | Docker Compose |

## Folder layout

```
fpfk/
├── docker-compose.yml      Starts the database, backend, and frontend
├── backend/
│   ├── server.js           All API routes
│   ├── migrate.js          Creates tables and loads starting content
│   ├── mailer.js           Sends emails
│   ├── db.js               Database connection
│   ├── middleware/auth.js  Checks admin login
│   ├── data/content.json   Starting website content
│   └── uploads/            Uploaded photos and videos
└── frontend/
    └── src/
        ├── pages/          Public pages
        ├── pages/admin/    Admin dashboard and editors
        ├── components/     Navbar, Footer
        ├── context/        Loads and saves site content
        └── config/adminSchema.js   What admins are allowed to edit
```

## Getting started

### Option A: Docker (recommended)

You need [Docker Desktop](https://www.docker.com/products/docker-desktop/).

1. **Check `backend/.env`** exists and is filled in (see [Settings](#settings)).
2. **Start everything** from the project folder:
   ```bash
   docker compose up --build
   ```
3. **Create the database tables** (first time only). In a second terminal:
   ```bash
   docker compose exec backend node migrate.js
   ```
4. **Open the site:** http://localhost:5173
5. **Create your admin account:** go to http://localhost:5173/admin/register, click the link in the verification email, then log in at http://localhost:5173/admin/login.

To stop, press `Ctrl + C` or run `docker compose down`.

### Option B: Without Docker

You need Node.js 20+ and a running PostgreSQL database.

```bash
# Terminal 1: backend
cd backend
npm install
node migrate.js     # first time only
node server.js

# Terminal 2: frontend
cd frontend
npm install
npm run dev
```

In `backend/.env`, set `DATABASE_URL` to your local database (host `localhost`).

## Settings

The backend reads its settings from `backend/.env`.

| Name | What it is |
| --- | --- |
| `PORT` | Backend port (`4000`) |
| `DATABASE_URL` | Database address (Docker replaces this automatically) |
| `JWT_SECRET` | Long random text used to sign admin logins |
| `FRONTEND_URL` | Public address of the website, used in email links (for example `http://localhost:5173`) |
| `BACKEND_URL` | Address of the backend |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Email account for verification and reset emails (`SMTP_SECURE=true` only for port 465) |

The `.env` file also contains `REGISTRATION_CODE` and `MPESA_*` entries. The current code does not use them.

Optional Docker setting: `DB_PASSWORD` sets the database password. Change it from the default for anything beyond local testing.

**Never share or upload `.env`.** It contains your passwords and keys.

## Using the admin dashboard

1. Log in at `/admin/login`.
2. Pick the page to edit (Home, About, Ministries, Sermons, Events, Connect, Give).
3. Make changes, then press **Save**. Changes go live straight away.
4. Use the Messages and Event Registrations sections to read and clear submissions.

Tips:
- **Poster cards:** upload up to 2 on the Home page. Each card fits its image.
- **Announcement:** type a message and choose when it expires. It disappears by itself afterwards.
- **Support Needs:** add what the church needs, a photo, and either an account number (paybill) or a Till number. Clicking a card takes visitors to the Give page with those exact payment details.
- **Giving details:** the church paybill, account number, and bank details are set under the Give page.

## Show the site on a phone (temporary link)

To let someone on another network see your local site, use [ngrok](https://ngrok.com):

1. Start the project, then run:
   ```bash
   ngrok http 5173
   ```
2. Open the `https://....ngrok-free.dev` link it prints.
3. Set `FRONTEND_URL` in `backend/.env` to that link and restart the backend, so email links work.

The free link changes every time ngrok restarts. If you see "Blocked request", add the new domain to `allowedHosts` in `frontend/vite.config.ts`.

## Useful commands

| Command | What it does |
| --- | --- |
| `docker compose up --build` | Start everything |
| `docker compose down` | Stop everything |
| `docker compose exec backend node migrate.js` | Create tables / add missing columns (safe to repeat) |
| `docker compose logs backend` | See backend messages |
| `npm run build` (in `frontend/`) | Build the site for production |
| `npm run lint` (in `frontend/`) | Check the code for problems |

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `ENOTFOUND backend` in the Vite terminal | Vite is running outside Docker. Set `VITE_PROXY_TARGET=http://localhost:4000`, or run everything with Docker |
| Site is empty or the API fails | Backend or database isn't running, or tables are missing. Run `migrate.js` |
| `relation "content" does not exist` | Run `docker compose exec backend node migrate.js` |
| "Blocked request. This host is not allowed" | Add your ngrok domain to `allowedHosts` in `frontend/vite.config.ts` |
| Emails don't arrive, or links open `localhost` | Check the `SMTP_*` settings and set `FRONTEND_URL` to your public address |
| Can't log in after registering | Verify your email first. The link lasts 1 hour |
| Upload fails | Only JPG, PNG, WEBP, GIF, MP4, WEBM, OGG, MOV files up to 50 MB are allowed |
| `node_modules` errors after copying the project | Delete `node_modules` and run `npm install` again |

## Good to know

- **Tables aren't created automatically.** Run `migrate.js` once on a new database.
- **The admin Giving records screen won't work yet.** It calls `/api/giving`, but the backend has no such routes. The public Give page is not affected.
- **Admin registration is open.** Anyone who knows `/admin/register` can sign up, so protect it before going live.
- **Starting content** has the M-Pesa account text under `mpesaAccountNote`, but the site reads `mpesaAccountNumber`. Set the account number in the admin Give page.
- **Cleanup:** the empty `Readme.md` and the stray `package-lock.json` in the project's top folder can be deleted.

## Before going live

- Use a strong `JWT_SECRET` and a new database password.
- Restrict who can register as an admin.
- Use HTTPS, and set `FRONTEND_URL` and `BACKEND_URL` to your real domain.
- Don't use `docker-compose.yml` as is in production. It is built for development.
- Back up the database and the `uploads` folder regularly.