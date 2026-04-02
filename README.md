# 🌾 e-GramSAARTHI — Backend API

Centralised Digital Platform for Rural Grievance Redressal

---

## 🚀 Setup & Run

```bash
# 1. Install dependencies
npm install

# 2. Create .env file (already provided)
# Make sure MongoDB is running locally

# 3. Start server
npm run dev        # development (nodemon)
npm start          # production
```

Server runs at: `http://localhost:5000`

---

## 📁 Folder Structure

```
e-gramsaarthi/
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── grievanceController.js
│   │   ├── schemeController.js
│   │   └── adminController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── grievanceRoutes.js
│   │   ├── schemeRoutes.js
│   │   └── adminRoutes.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Grievance.js
│   │   └── Scheme.js
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── config/
│   │   └── db.js
│   └── app.js
├── server.js
├── .env
├── .gitignore
└── package.json
```

---

## 🔐 User Roles

| Role      | Access                                      |
|-----------|---------------------------------------------|
| `citizen` | Register, Login, Submit & Track Grievances  |
| `officer` | View & Update Grievance Status              |
| `admin`   | Full Access — Users, Schemes, Dashboard     |

---

## 📡 API Endpoints

### Auth Routes — `/api/auth`

| Method | Endpoint                  | Access   | Description            |
|--------|---------------------------|----------|------------------------|
| POST   | `/api/auth/register`      | Public   | Register new citizen   |
| POST   | `/api/auth/login`         | Public   | Login                  |
| GET    | `/api/auth/me`            | Private  | Get own profile        |
| PUT    | `/api/auth/update-profile`| Private  | Update profile         |

---

### Grievance Routes — `/api/grievances`

| Method | Endpoint                        | Access           | Description                   |
|--------|---------------------------------|------------------|-------------------------------|
| POST   | `/api/grievances`               | Citizen          | Submit new grievance           |
| GET    | `/api/grievances/my`            | Citizen          | Get my grievances              |
| GET    | `/api/grievances/track/:ticketId| Public           | Track grievance by ticket ID   |
| GET    | `/api/grievances/all`           | Admin, Officer   | Get all grievances (filterable)|
| PUT    | `/api/grievances/:id/status`    | Admin, Officer   | Update grievance status        |
| GET    | `/api/grievances/stats`         | Admin            | Grievance statistics           |

#### Grievance Categories:
`water_supply` | `electricity` | `sanitation` | `road` | `welfare_scheme` | `healthcare` | `education` | `other`

#### Grievance Status Flow:
`pending` → `in_progress` → `resolved` / `rejected`

---

### Scheme Routes — `/api/schemes`

| Method | Endpoint                          | Access   | Description                  |
|--------|-----------------------------------|----------|------------------------------|
| GET    | `/api/schemes`                    | Public   | Get all schemes (filterable)  |
| GET    | `/api/schemes/:id`                | Public   | Get single scheme             |
| POST   | `/api/schemes/:id/check-eligibility| Citizen | Check eligibility for scheme  |
| POST   | `/api/schemes`                    | Admin    | Add new scheme                |
| PUT    | `/api/schemes/:id`                | Admin    | Update scheme                 |
| DELETE | `/api/schemes/:id`                | Admin    | Delete scheme                 |

---

### Admin Routes — `/api/admin`

| Method | Endpoint                      | Access | Description         |
|--------|-------------------------------|--------|---------------------|
| GET    | `/api/admin/dashboard`        | Admin  | Dashboard overview  |
| GET    | `/api/admin/users`            | Admin  | Get all citizens    |
| PUT    | `/api/admin/users/:id/role`   | Admin  | Change user role    |
| DELETE | `/api/admin/users/:id`        | Admin  | Delete user         |

---

## 📝 Sample Request Bodies

### Register
```json
{
  "name": "Ram Kumar",
  "email": "ram@example.com",
  "password": "pass1234",
  "phone": "9876543210",
  "age": 25,
  "village": "Rampur",
  "district": "Mathura",
  "state": "Uttar Pradesh"
}
```

### Submit Grievance
```json
{
  "title": "No water supply for 3 days",
  "description": "Our village has not received water supply for the last 3 days.",
  "category": "water_supply",
  "priority": "high"
}
```

### Update Grievance Status (Admin)
```json
{
  "status": "in_progress",
  "remark": "Assigned to water department officer.",
  "assignedOfficer": "<officer_user_id>"
}
```

### Add Government Scheme (Admin)
```json
{
  "name": "PM Awas Yojana",
  "description": "Housing scheme for rural poor",
  "category": "housing",
  "eligibility": {
    "minAge": 18,
    "maxAge": 60,
    "gender": "all",
    "description": "BPL families in rural areas"
  },
  "benefits": "Financial assistance up to ₹1.2 lakh for house construction",
  "applicationProcess": "Apply at Gram Panchayat office with Aadhaar and income certificate",
  "documentsRequired": ["Aadhaar Card", "Income Certificate", "Land Documents"]
}
```

---

## 🔑 Authentication

All private routes require JWT token in header:

```
Authorization: Bearer <your_token>
```

---

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Auth**: JWT + bcryptjs
- **Other**: cors, dotenv
