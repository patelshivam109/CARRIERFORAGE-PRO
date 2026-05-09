# CareerForge Pro 🚀

**AI-Powered ATS Resume Builder** — Built with MERN Stack + Gemini 1.5 Flash

> Transform your resume into an ATS-optimised, keyword-rich document that gets past automated screeners and lands interviews.

---

## ✨ Features

| Feature                | Free    | Pro       |
| ---------------------- | ------- | --------- |
| Resume Builder         | ✅       | ✅         |
| AI Resume Rewriter     | Limited | Unlimited |
| ATS Score Analysis     | ✅       | ✅         |
| Skills Suggestions     | ✅       | ✅         |
| PDF Export             | ✅       | ✅         |
| Premium Templates      | ❌       | ✅         |
| Cover Letter Generator | ❌       | ✅         |
| Unlimited Resumes      | ❌       | ✅         |

---

## 🏗️ Tech Stack

### Backend
- **Node.js + Express** — REST API server
- **MongoDB + Mongoose** — Database & ORM
- **Gemini 1.5 Flash** — AI rewriting, ATS analysis, cover letters
- **Puppeteer** — Headless Chrome PDF generation
- **Stripe** — Subscription payments & webhooks
- **JWT + bcrypt** — Auth & security

### Frontend
- **React 18** — UI framework
- **React Router v6** — Client-side routing
- **Axios** — HTTP client with interceptors
- **React Hot Toast** — Notifications
- **Lucide React** — Icons

### Infrastructure
- **Docker + Docker Compose** — Containerisation
- **Nginx** — Frontend serving + API proxy

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- MongoDB Atlas account (free tier works)
- Google AI Studio API key (free)
- Stripe account (test mode)

---

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd careerforge-pro

# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install
```

---

### 2. Configure Environment Variables

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and fill in all required values:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/careerforge

# Auth
JWT_SECRET=<64-char random string>
JWT_EXPIRE=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Google Gemini AI
GEMINI_API_KEY=<your Google AI Studio key>

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

> **Tip:** Generate a strong `JWT_SECRET` with `openssl rand -hex 64`

---

### 3. Set Up Stripe

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Create a **Product** → "CareerForge Pro"
3. Add a **Price** → Recurring, $12/month
4. Copy the `price_...` ID → paste as `STRIPE_PRO_PRICE_ID`
5. For webhooks in development, install [Stripe CLI](https://stripe.com/docs/stripe-cli):

```bash
stripe listen --forward-to localhost:5000/api/payment/webhook
```

This gives you the `whsec_...` webhook secret → paste as `STRIPE_WEBHOOK_SECRET`.

---

### 4. Run in Development

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm start
```

- Backend: http://localhost:5000
- Frontend: http://localhost:3000

---

### 5. Run with Docker (Production)

```bash
# Copy env to root
cp backend/.env.example .env
# Fill in all values in .env

# Build & start all services
docker-compose up --build -d

# View logs
docker-compose logs -f
```

- App: http://localhost:3000
- API: http://localhost:5000/api/health

---

## 📁 Project Structure

```
careerforge-pro/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Register, login, profile
│   │   ├── resumeController.js    # Resume CRUD
│   │   ├── aiController.js        # All AI endpoints
│   │   └── paymentController.js   # Stripe checkout & webhooks
│   ├── middleware/
│   │   └── auth.js                # JWT protect + requirePro
│   ├── models/
│   │   ├── User.js                # User schema + plan management
│   │   └── Resume.js              # Full resume schema
│   ├── routes/
│   │   ├── auth.js
│   │   ├── resume.js
│   │   ├── ai.js
│   │   └── payment.js
│   ├── services/
│   │   ├── geminiService.js       # All Gemini AI calls
│   │   └── pdfService.js          # Puppeteer PDF generation
│   ├── Dockerfile
│   ├── server.js                  # Express entry point
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   │   └── Navbar.jsx
│   │   │   └── Resume/
│   │   │       ├── ResumeForm.jsx    # Left panel editor
│   │   │       ├── ResumePreview.jsx # Live right-side preview
│   │   │       ├── ATSPanel.jsx      # JD analysis & scoring
│   │   │       └── AIPanel.jsx       # AI magic features
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Global auth state
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx      # Resume management
│   │   │   ├── ResumeBuilder.jsx  # Main builder page
│   │   │   └── Pricing.jsx
│   │   ├── services/
│   │   │   └── api.js             # Axios API layer
│   │   ├── App.js                 # Routes
│   │   ├── index.js
│   │   └── index.css              # Global design system
│   ├── Dockerfile
│   └── nginx.conf
│
└── docker-compose.yml
```

---

## 🔌 API Reference

> **Base URL:** `http://localhost:5000/api`
> 🔒 = Requires `Authorization: Bearer <token>` header
> ⭐ = Requires Pro plan

### Auth

| Method | Endpoint | Auth | Body | Description |
|---|---|---|---|---|
| POST | `/auth/register` | — | `{ name, email, password }` | Create account |
| POST | `/auth/login` | — | `{ email, password }` | Login, returns JWT |
| GET | `/auth/me` | 🔒 | — | Get current user |
| PUT | `/auth/profile` | 🔒 | `{ name, email, password? }` | Update profile |

### Resume

| Method | Endpoint | Auth | Body | Description |
|---|---|---|---|---|
| GET | `/resume` | 🔒 | — | Get all resumes |
| POST | `/resume` | 🔒 | `{ title?, template? }` | Create resume (Free: max 1) |
| GET | `/resume/:id` | 🔒 | — | Get single resume |
| PUT | `/resume/:id` | 🔒 | `{ ...resumeFields }` | Update resume |
| DELETE | `/resume/:id` | 🔒 | — | Delete resume |
| POST | `/resume/:id/duplicate` | 🔒 ⭐ | — | Duplicate resume |

### AI

| Method | Endpoint | Auth | Body | Description |
|---|---|---|---|---|
| POST | `/ai/analyze-jd` | 🔒 | `{ resumeId, jobDescription }` | Analyse JD + score resume |
| POST | `/ai/rewrite-experience/:id` | 🔒 | `{ experienceIndex }` | AI rewrite bullet points |
| POST | `/ai/rewrite-summary/:id` | 🔒 | — | AI rewrite summary |
| POST | `/ai/suggest-skills/:id` | 🔒 | — | Suggest missing skills |
| GET | `/ai/export/:id` | 🔒 | — | Export resume as PDF |
| POST | `/ai/cover-letter/:id` | 🔒 ⭐ | `{ jobDescription }` | Generate cover letter |
| GET | `/ai/export-cover-letter/:id` | 🔒 ⭐ | — | Export cover letter PDF |

### Payment

| Method | Endpoint | Auth | Body | Description |
|---|---|---|---|---|
| POST | `/payment/create-checkout` | 🔒 | — | Create Stripe checkout session |
| POST | `/payment/portal` | 🔒 | — | Open Stripe customer portal |
| POST | `/payment/webhook` | — | *(Stripe raw body)* | Stripe webhook handler |
| GET | `/payment/status` | 🔒 | — | Get current subscription status |

---

## 🎨 Resume Templates

| Template | Style | Plan |
|---|---|---|
| **Modern** | Dark navy gradient header, blue accents | Free + Pro |
| **Classic** | Times New Roman, double-rule borders | Pro |
| **Minimal** | Helvetica, ultra-clean, left-bordered | Pro |
| **Executive** | Bold sans-serif, premium layout | Pro |
| **Creative** | Distinctive design for creative roles | Pro |

---

## 🔒 Security Features

- Passwords hashed with **bcrypt** (12 rounds)
- **JWT** tokens with configurable expiry
- **Rate limiting** — 100 requests per 15 min per IP
- Stripe **webhook signature verification**
- All resume endpoints scoped to authenticated owner
- CORS restricted to `FRONTEND_URL`

---

## 🚢 Deployment

### Environment variables for production:
```env
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
MONGO_URI=mongodb+srv://...  # production cluster
JWT_SECRET=<64-char random string>
GEMINI_API_KEY=<your key>
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Recommended hosting:
- **Backend** → Railway, Render, or AWS EC2
- **Frontend** → Vercel, Netlify, or serve via Nginx
- **Database** → MongoDB Atlas (M0 free or M10 for production)

---

## 📄 License

MIT — Built for educational purposes as part of the Zaalima Development AI Engineering curriculum.