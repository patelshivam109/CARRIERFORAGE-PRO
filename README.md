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

Edit `backend/.env`:


# Frontend URL
FRONTEND_URL=http://localhost:3000
```

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

This gives you the `whsec_...` webhook secret.

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

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |

### Resume
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/resume` | Get all resumes |
| POST | `/api/resume` | Create resume |
| GET | `/api/resume/:id` | Get single resume |
| PUT | `/api/resume/:id` | Update resume |
| DELETE | `/api/resume/:id` | Delete resume |
| POST | `/api/resume/:id/duplicate` | Duplicate resume |

### AI (all require Auth)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/ai/analyze-jd` | Analyse JD + score resume |
| POST | `/api/ai/rewrite-experience/:id` | AI rewrite bullets |
| POST | `/api/ai/rewrite-summary/:id` | AI rewrite summary |
| POST | `/api/ai/suggest-skills/:id` | Suggest missing skills |
| GET | `/api/ai/export/:id` | Export resume as PDF |
| POST | `/api/ai/cover-letter/:id` | Generate cover letter (Pro) |
| GET | `/api/ai/export-cover-letter/:id` | Export cover letter PDF (Pro) |

### Payment
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/payment/create-checkout` | Create Stripe checkout |
| POST | `/api/payment/portal` | Customer portal |
| POST | `/api/payment/webhook` | Stripe webhook handler |
| GET | `/api/payment/status` | Get subscription status |

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

### 🚢 Deployment

### Environment variables for production:
```env
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
MONGO_URI=mongodb+srv://...  # production cluster
JWT_SECRET=<64-char random string>
```

### Recommended hosting:
- **Backend** → Railway, Render, or AWS EC2
- **Frontend** → Vercel, Netlify, or serve via Nginx
- **Database** → MongoDB Atlas (M0 free or M10 for production)

---

## 📄 License

MIT — Built for educational purposes as part of the Zaalima Development AI Engineering curriculum.
