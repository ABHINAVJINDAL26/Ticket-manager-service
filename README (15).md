# 🎫 Ticket System — Node.js Backend

Ek simple backend service jisme user register, login, ticket create, apne tickets dekh aur status update kar sakta hai.

---

## 📌 Project Overview

Yeh ek REST API backend hai jo following cheezein support karta hai:

- User registration aur login (JWT authentication)
- Ticket creation (sirf logged-in user ke liye)
- Apne tickets dekhna (doosre ke tickets nahi dikhenge)
- Ticket status update karna (`open → in_progress → closed`)
- Closed ticket kabhi reopen nahi hogi

---

## 🛠️ Tech Stack

| Technology | Use |
|------------|-----|
| **Node.js** | Runtime |
| **Express.js** | Web framework |
| **JWT** | Authentication |
| **bcrypt** | Password hashing |
| **SQLite / PostgreSQL** | Database (SQLite recommended for simplicity) |
| **Docker** | Containerization |

---

## 📁 Folder Structure

```
ticket-system/
├── src/
│   ├── controllers/
│   │   ├── authController.js       # Register & Login logic
│   │   └── ticketController.js     # Ticket CRUD logic
│   ├── middleware/
│   │   └── authMiddleware.js       # JWT verify middleware
│   ├── models/
│   │   ├── userModel.js            # User DB operations
│   │   └── ticketModel.js          # Ticket DB operations
│   ├── routes/
│   │   ├── authRoutes.js           # /auth/register, /auth/login
│   │   └── ticketRoutes.js         # /tickets routes
│   ├── db/
│   │   └── database.js             # DB connection & table setup
│   └── app.js                      # Express app setup
├── .env                            # Environment variables (do not commit)
├── .env.example                    # Template for env variables
├── Dockerfile                      # Docker config
├── package.json
└── README.md
```

---

## ⚙️ Environment Variables

`.env` file project root mein banao:

```env
PORT=8080
JWT_SECRET=your_super_secret_key_here
DATABASE_URL=./database.sqlite
```

`.env.example` file already repo mein hogi — copy karo:

```bash
cp .env.example .env
```

---

## 🚀 Local Setup (Without Docker)

### Step 1 — Dependencies install karo

```bash
npm install
```

### Step 2 — .env file banao

```bash
cp .env.example .env
# Ab .env mein apni values daalo
```

### Step 3 — Server start karo

```bash
node src/app.js
```

Server `http://localhost:8080` pe start ho jayega.

---

## 🐳 Docker Setup (Recommended)

### Step 1 — Docker image build karo

```bash
docker build -t ticket-system .
```

### Step 2 — Container run karo

```bash
docker run -p 8080:8080 ticket-system
```

### Step 3 — Health check karo

```bash
curl http://localhost:8080/health
```

**Expected response:**
```json
{ "status": "ok" }
```

---

## 📡 API Endpoints

### Health Check

```
GET /health
```

Response:
```json
{ "status": "ok" }
```

---

### Auth Routes

#### Register

```
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

Response `201`:
```json
{
  "message": "User registered successfully"
}
```

---

#### Login

```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

Response `200`:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

> ⚠️ Yeh token aage saare protected routes mein use hoga

---

### Ticket Routes

> 🔒 Saare ticket routes protected hain — `Authorization: Bearer <token>` header zaroori hai

#### Create Ticket

```
POST /tickets
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Fix login bug",
  "description": "Login page crash kar raha hai"
}
```

Response `201`:
```json
{
  "id": 1,
  "title": "Fix login bug",
  "description": "Login page crash kar raha hai",
  "status": "open",
  "userId": 1,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

#### List My Tickets

```
GET /tickets
Authorization: Bearer <token>
```

Response `200`:
```json
[
  {
    "id": 1,
    "title": "Fix login bug",
    "status": "open",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

#### Get Single Ticket

```
GET /tickets/:id
Authorization: Bearer <token>
```

Response `200`:
```json
{
  "id": 1,
  "title": "Fix login bug",
  "description": "Login page crash kar raha hai",
  "status": "open",
  "userId": 1,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

> ❌ Doosre user ka ticket access karne pe `403 Forbidden` milega

---

#### Update Ticket Status

```
PATCH /tickets/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "in_progress"
}
```

Response `200`:
```json
{
  "id": 1,
  "status": "in_progress"
}
```

---

## 🔄 Ticket Status Flow

```
open  →  in_progress  →  closed
                              ↑
                    (Yahan se wapas NAHI ja sakte)
```

| Transition | Allowed? |
|------------|----------|
| open → in_progress | ✅ Yes |
| in_progress → closed | ✅ Yes |
| open → closed | ✅ Yes |
| closed → open | ❌ No |
| closed → in_progress | ❌ No |
| in_progress → open | ❌ No |

---

## 🔐 Authentication Flow

1. User `/auth/register` se register karta hai
2. `/auth/login` se token milta hai
3. Har protected request mein header mein token bhejo:
   ```
   Authorization: Bearer <your_token_here>
   ```
4. Token invalid/missing hone pe `401 Unauthorized` milega

---

## ❗ HTTP Status Codes Used

| Code | Matlab |
|------|--------|
| `200` | OK |
| `201` | Created |
| `400` | Bad Request (invalid input) |
| `401` | Unauthorized (token missing/invalid) |
| `403` | Forbidden (doosre ka ticket access) |
| `404` | Not Found |
| `500` | Internal Server Error |

---

## 🌐 Deployment

App ko free platform pe deploy karna hai. Recommended options:

### Option 1: Railway (Sabse Easy)

1. [railway.app](https://railway.app) pe account banao
2. GitHub repo connect karo
3. Environment variables add karo (`.env` ki values)
4. Deploy ho jayega automatically

### Option 2: Render

1. [render.com](https://render.com) pe account banao
2. New Web Service banao
3. GitHub repo connect karo
4. Build Command: `npm install`
5. Start Command: `node src/app.js`
6. Environment variables add karo

### Option 3: Fly.io

```bash
# Fly CLI install karo
curl -L https://fly.io/install.sh | sh

# Login karo
fly auth login

# Deploy karo
fly launch
fly deploy
```

---

## 📋 Submission Checklist

- [ ] GitHub repository public hai
- [ ] Deployed URL kaam kar raha hai
- [ ] `GET /health` publicly accessible hai
- [ ] README mein local run command hai
- [ ] README mein Docker run command hai
- [ ] README mein deployed URL hai
- [ ] `.env.example` file repo mein hai
- [ ] Passwords hashed store ho rahe hain
- [ ] JWT authentication kaam kar raha hai
- [ ] Ownership check kaam kar raha hai (sirf apna ticket)
- [ ] Closed ticket reopen nahi ho rahi

---

## 💡 Assumptions

- SQLite use ki hai simplicity ke liye (PostgreSQL bhi supported hai)
- In-memory storage nahi hai — data persist hota hai
- No admin role implemented
- No comments module
- No ticket assignment

---

## 🧪 Quick Test Commands

```bash
# Health check
curl http://localhost:8080/health

# Register
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Login
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Create ticket (token replace karo)
curl -X POST http://localhost:8080/tickets \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Ticket","description":"Test description"}'

# List tickets
curl http://localhost:8080/tickets \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Update status
curl -X PATCH http://localhost:8080/tickets/1/status \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"status":"in_progress"}'
```

---

*Built with Node.js + Express | Assignment: Backend Intern Ticket System*
