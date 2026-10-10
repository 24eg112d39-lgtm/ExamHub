# ExamHub 🎓
### Automated Exam Hall Seat Allocation & Examination Management System

ExamHub is a full-stack, enterprise-grade examination management solution built with **Spring Boot 3 (Java 21)**, **PostgreSQL**, and **React 19 (Vite + Tailwind CSS)**. It automates conflict-free hall seating, invigilator assignments, attendance tracking, and audit reporting.

---

## 🏗 Architecture & Tech Stack

| Layer | Technology | Key Features |
|---|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, Lucide Icons | Responsive SPA, role-based dashboards, JWT auth |
| **Backend** | Spring Boot 3.3.4, Java 21, Spring Security | RESTful APIs, JWT stateless auth, multi-strategy seat allocation |
| **Database** | PostgreSQL, Flyway Migrations | Automated schema migrations & realistic seed data |
| **Deployment** | Docker, Render Cloud | Multi-stage Docker containerization, Render Blueprint |

---

## 👥 Default Login Credentials (Pre-seeded)

The database is pre-configured with the following test credentials:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin** | `admin@examhub.com` | `Admin@123` | Full administrative control, allocation engine, reports |
| **Invigilator** | `ramesh@examhub.com` | `Password@123` | Assigned hall duties, real-time attendance marking |
| **Invigilator** | `anita@examhub.com` | `Password@123` | Assigned hall duties, real-time attendance marking |
| **Student** | `aarav.cs@examhub.com` | `Password@123` | View assigned seat, hall number, and exam schedules |
| **Student** | `diya.ec@examhub.com` | `Password@123` | View assigned seat, hall number, and exam schedules |

---

## 🚀 Cloud Deployment on Render

You can deploy the entire stack to **Render** using either **Option A (1-Click Blueprint)** or **Option B (Manual Dashboard Setup)**.

### Option A: 1-Click Render Blueprint (Recommended)
This repository includes a `render.yaml` blueprint that deploys the PostgreSQL database, Spring Boot API, and React frontend automatically.

1. Push this repository to your GitHub account:
   ```bash
   git push -u origin main
   ```
2. Log in to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** -> **Blueprint**.
4. Connect this GitHub repository (`ExamHub`).
5. Render will automatically parse `render.yaml` and configure:
   - **Database**: Managed PostgreSQL (`examhub-db`)
   - **Backend**: Spring Boot Docker Web Service (`examhub-backend`)
   - **Frontend**: Vite React Static Site (`examhub-frontend`)
6. Click **Apply**. Render will provision and launch all three services.

---

### Option B: Step-by-Step Manual Deployment on Render

#### Step 1: Create PostgreSQL Database
1. Go to [Render Dashboard](https://dashboard.render.com) -> **New +** -> **PostgreSQL**.
2. **Name**: `examhub-db`
3. **Database**: `examhub`
4. **User**: `examhub_user`
5. **Plan**: Free
6. Click **Create Database**.
7. Once created, copy the **Internal Database URL** (e.g., `postgres://examhub_user:...@dpg-...:5432/examhub`).

#### Step 2: Deploy Backend Web Service
1. In Render, click **New +** -> **Web Service**.
2. Connect your GitHub repository (`ExamHub`).
3. Set the following settings:
   - **Name**: `examhub-backend`
   - **Root Directory**: `server`
   - **Runtime**: `Docker`
   - **Plan**: `Free`
   - **Health Check Path**: `/api/health`
4. Add **Environment Variables**:
   - `SPRING_PROFILES_ACTIVE`: `prod`
   - `DATABASE_URL`: *(Paste the Internal Database URL from Step 1)*
   - `JWT_SECRET`: *(Enter a secure 64+ char key or leave default)*
   - `CORS_ALLOWED_ORIGINS`: `https://<your-frontend-app-name>.onrender.com,http://localhost:5173`
5. Click **Create Web Service**.

#### Step 3: Deploy Frontend Static Site
1. In Render, click **New +** -> **Static Site**.
2. Connect your GitHub repository (`ExamHub`).
3. Set the following settings:
   - **Name**: `examhub-frontend`
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add **Environment Variables**:
   - `VITE_API_URL`: `https://<your-backend-app-name>.onrender.com/api`
5. In the **Redirects / Rewrites** tab, add a single-page rewrite rule:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: `Rewrite`
6. Click **Create Static Site**.

---

## 💻 Local Development Setup

### Prerequisites
- Java 21 (JDK) & Maven 3.9+
- Node.js 18+ & npm
- PostgreSQL (or use embedded in-memory H2 database in dev mode)

### 1. Run Backend
```bash
cd server
mvn spring-boot:run
```
- API will start on: `http://localhost:8080`
- Swagger OpenAPI Docs: `http://localhost:8080/swagger-ui.html`
- Health probe: `http://localhost:8080/api/health`

### 2. Run Frontend
```bash
cd client
npm install
npm run dev
```
- Client runs on: `http://localhost:5173`
