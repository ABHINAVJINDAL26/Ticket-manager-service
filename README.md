# Ticket System — Node.js Backend

A backend REST API service built with **Node.js, Express, SQLite, and JWT** for managing user tickets. It allows users to register, login, create tickets, list their own tickets, and update their statuses according to strict transition rules.

---

## 📌 Features

- **Authentication:** JWT-based secure registration & login (passwords hashed using `bcryptjs`).
- **Authorization:** Ownership-based authorization (users can only access, view, or update their own tickets).
- **Ticket Status Flow:**
  - Valid transitions: `open -> in_progress -> closed`.
  - Closed tickets cannot be reopened.
  - Invalid state transitions return `400 Bad Request`.
- **Database:** Persistent file-based **SQLite** storage.
- **Docker Ready:** Fully containerized setup.

---

## 🛠️ Tech Stack

- **Node.js** (Runtime)
- **Express.js** (Web framework)
- **SQLite** (Database)
- **bcryptjs** (Password hashing)
- **jsonwebtoken** (Authentication)
- **Docker** (Containerization)

---

## 📁 Project Structure

```text
ticket-system/
├── src/
│   ├── controllers/
│   │   ├── authController.js       # Register & Login controllers
│   │   └── ticketController.js     # Ticket controllers
│   ├── middleware/
│   │   └── authMiddleware.js       # JWT authorization middleware
│   ├── models/
│   │   ├── userModel.js            # User DB operations
│   │   └── ticketModel.js          # Ticket DB operations
│   ├── routes/
│   │   ├── authRoutes.js           # Auth routes
│   │   └── ticketRoutes.js         # Ticket routes
│   ├── db/
│   │   └── database.js             # Database setup & connection
│   └── app.js                      # Express app entry point
├── .env.example                    # Template for env variables
├── Dockerfile                      # Docker config
├── package.json                    # Dependency list & scripts
└── test_api.js                     # End-to-end integration tests
```

---

## ⚙️ Environment Variables

Create a `.env` file in the project root:

```env
PORT=8080
JWT_SECRET=your_super_secret_key_here
DATABASE_URL=./database.sqlite
```

You can copy from `.env.example`:

```bash
cp .env.example .env
```

---

## 🚀 Local Setup (Without Docker)

### Step 1 — Install Dependencies
```bash
npm install
```

### Step 2 — Create `.env` file
```bash
cp .env.example .env
```
*(Make sure to set your configuration values in `.env`)*

### Step 3 — Start the Server
```bash
npm start
```
The server will start running on `http://localhost:8080`.

---

## 🐳 Docker Setup

### Step 1 — Build Docker Image
```bash
docker build -t ticket-system .
```

### Step 2 — Run Container
```bash
docker run -p 8080:8080 ticket-system
```

---

## 🧪 Running Automated Tests

To run the end-to-end integration tests (which automatically test all endpoints, authentication, ownership rules, and state transitions):

```bash
node test_api.js
```

---

## 📡 API Endpoints

### Health Check
- **GET** `/health`
- **Response `200`:** `{"status": "ok"}`

### Authentication
- **POST** `/auth/register`
  - Body: `{"email": "user@example.com", "password": "yourpassword"}`
  - Response `201`: `{"message": "User registered successfully"}`
- **POST** `/auth/login`
  - Body: `{"email": "user@example.com", "password": "yourpassword"}`
  - Response `200`: `{"token": "JWT_TOKEN_STRING"}`

### Tickets (Protected: requires `Authorization: Bearer <token>` header)
- **POST** `/tickets` (Create Ticket)
  - Body: `{"title": "Fix login bug", "description": "Description here"}`
  - Response `201`: `{"id": 1, "title": "Fix login bug", "description": "...", "status": "open", "userId": 1, "createdAt": "..."}`
- **GET** `/tickets` (List My Tickets)
  - Response `200`: `[{"id": 1, "title": "Fix login bug", "status": "open", "createdAt": "..."}]`
- **GET** `/tickets/:id` (Get Ticket by ID)
  - Response `200`: `{"id": 1, "title": "...", "description": "...", "status": "...", "userId": 1, "createdAt": "..."}`
  - Response `403`: If accessed by non-owner.
- **PATCH** `/tickets/:id/status` (Update Ticket Status)
  - Body: `{"status": "in_progress"}` (Supports: `open`, `in_progress`, `closed`)
  - Response `200`: `{"id": 1, "status": "in_progress"}`
  - Response `400`: If transition is invalid (e.g. `closed -> open`).
