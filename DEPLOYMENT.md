# 🚀 Deployment Guide – Intern Finder

This guide walks you through deploying the Intern Finder (full-stack) to production.

## Architecture

| Part | Tech | Recommended Host |
|------|------|------------------|
| Backend | Node.js + Express + MongoDB | Render / Railway / Fly.io |
| Frontend | React + Vite | Vercel / Netlify |
| Database | MongoDB | MongoDB Atlas (free tier) |
| Email | Nodemailer SMTP | Gmail / SendGrid / Mailgun |

---

## Phase 1 – Database (MongoDB Atlas)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. Create a new cluster (Shared, free tier).
3. Create a database user (username + password).
4. Add your IP address (or `0.0.0.0/0` to allow all IPs for production) to the Network Access list.
5. Click **Connect → Connect your application** → Node.js.
6. Copy the connection string. It looks like:

```
mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/internfinder?retryWrites=true&w=majority
```

Replace `<user>` and `<password>` with your DB user credentials.

---

## Phase 2 – Backend Deployment (Render example)

### 1. Prepare the backend

Create `backend/.env` from `backend/.env.example`:

```bash
cp backend/.env.example backend/.env
```

Fill in all values (see `backend/.env.example`). Critical ones:

- `MONGO_URI` – your Atlas connection string
- `JWT_SECRET` – random long string (e.g., `openssl rand -hex 32`)
- `JWT_REFRESH_SECRET` – random long string
- `CORS_ORIGINS` – your frontend URL (e.g., `https://your-app.vercel.app`)

### 2. Add a `start` script

In `backend/package.json`, ensure you have:

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

### 3. Deploy on Render

1. Create a [Render](https://render.com) account and connect your GitHub repo.
2. Create a **Web Service** → select your repo → choose the `backend` folder as root directory.
3. Runtime: `Node`, Build Command: `npm install`, Start Command: `npm start`.
4. Add environment variables from your `backend/.env`.
5. Add a **MongoDB** database on Render (or use external MongoDB Atlas).
6. Deploy. Note the backend URL (e.g., `https://intern-finder-api.onrender.com`).

---

## Phase 3 – Frontend Deployment (Vercel example)

### 1. Prepare the frontend

Create `frontend/.env.local` from `frontend/.env.example`:

```bash
cp frontend/.env.example frontend/.env.local
```

Set:

```
VITE_API_URL=https://your-backend-api.onrender.com
```

### 2. Deploy on Vercel

1. Push your code to GitHub.
2. Go to [Vercel](https://vercel.com), **Add New → Project**, import your repo.
3. Framework preset: `Vite`, Root Directory: `frontend`.
4. Add Environment Variable: `VITE_API_URL` = your backend URL.
5. Deploy.

---

## Phase 4 – Connect Frontend to Backend

After both are deployed:

1. Copy your backend URL (e.g., `https://intern-finder-api.onrender.com`).
2. Set `VITE_API_URL` in Vercel frontend env to that URL (no trailing slash).
3. Redeploy the frontend.
4. Add the same frontend URL to backend `CORS_ORIGINS` env var and redeploy backend.

---

## Environment Variables Summary

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default 5000) |
| `NODE_ENV` | No | Set to `production` |
| `MONGO_URI` | **Yes** | MongoDB Atlas connection string |
| `JWT_SECRET` | **Yes** | Secret for access tokens |
| `JWT_REFRESH_SECRET` | **Yes** | Secret for refresh tokens |
| `SMTP_HOST` | No | SMTP host (e.g., smtp.gmail.com) |
| `SMTP_PORT` | No | SMTP port (e.g., 587) |
| `SMTP_USER` | No | SMTP username |
| `SMTP_PASS` | No | SMTP password / app password |
| `GROQ_API_KEY` | **Yes** | Groq API key for AI features |
| `CORS_ORIGINS` | **Yes** | Comma-separated frontend URLs |
| `CLOUDINARY_*` | No | Only if using Cloudinary uploads |
| `GEMINI_API_KEY` | No | Only if using Gemini AI |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | **Yes** | Backend base URL (no trailing slash) |

---

## ✅ Checklist Before Going Live

- [ ] `backend/.env` created with real secrets (never commit `.env` to Git)
- [ ] `frontend/.env.local` created with `VITE_API_URL`
- [ ] `.env` files are in `.gitignore`
- [ ] MongoDB Atlas cluster is running and accessible
- [ ] Backend CORS includes your frontend domain
- [ ] JWT secrets are long and random
- [ ] Groq API key is valid (for AI assistant features)
- [ ] SMTP configured if you want email notifications

---

## 🔐 Security Notes

- Never commit `.env` files to Git. Both `backend/.env` and `frontend/.env.local` should be in `.gitignore`.
- Use strong, random `JWT_SECRET` and `JWT_REFRESH_SECRET` values.
- In production, set `NODE_ENV=production`.
- Restrict `CORS_ORIGINS` to your actual frontend domain, not `*`.

---

## Local Development

```bash
# Backend
cd backend
cp .env.example .env
# edit .env with local values
npm install
npm start

# Frontend (new terminal)
cd frontend
cp .env.example .env.local
# set VITE_API_URL=http://localhost:5000
npm install
npm run dev
```
