# 💰 ExpenseEase

> Full-stack expense management app built with React, Node.js, and Express.

![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-16+-339933?style=flat-square&logo=node.js)
![Express](https://img.shields.io/badge/Express-4.18-000000?style=flat-square&logo=express)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📸 Receipt Upload | Attach bill photos to any expense |
| ✍️ Manual Entry | Add date, amount, category, payment source & notes |
| 💳 Source Tracking | Bank Account, Cash, UPI, Credit Card, Debit Card, Digital Wallet |
| 📊 Analytics Dashboard | Pie & bar charts by category and payment source |
| 📥 CSV Export | Download all expense data in one click |
| ✏️ Edit / Delete | Update or remove any expense anytime |
| 📱 Fully Responsive | Works perfectly on phone, tablet, and desktop |

---

## 🛠 Tech Stack

### Frontend
- **React 18** — UI components and state management
- **Recharts** — interactive pie and bar charts
- **Axios** — HTTP requests to backend
- **Pure CSS** — mobile-first responsive design

### Backend
- **Node.js + Express** — REST API server
- **Multer** — receipt image file uploads
- **dotenv** — environment variable management

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/expenseease.git
cd expenseease
```

### 2. Start the backend
```bash
cd backend
npm install
npm start
# Running on http://localhost:5000
```

### 3. Start the frontend (new terminal)
```bash
cd frontend
npm install
npm start
# Running on http://localhost:3000
```

---

## 📂 Project Structure

```
expenseease/
├── backend/
│   ├── server.js          # Express server + all API routes
│   ├── package.json
│   └── uploads/           # Uploaded receipt images
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js             # Main app + tab navigation
│       ├── index.js           # React entry point
│       ├── components/
│       │   ├── ManualEntry.js # Expense entry form
│       │   └── Dashboard.js   # Charts and analytics
│       └── styles/
│           └── App.css        # All styles (responsive)
│
├── .gitignore
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/expenses` | Get all expenses (supports `?category=` and `?source=` filters) |
| `POST` | `/api/expenses` | Create a new manual expense |
| `POST` | `/api/expenses/upload` | Upload a receipt image |
| `PUT` | `/api/expenses/:id` | Update an existing expense |
| `DELETE` | `/api/expenses/:id` | Delete an expense |
| `GET` | `/api/expenses/stats/summary` | Get analytics summary |
| `GET` | `/api/categories` | Get all expense categories |
| `GET` | `/api/sources` | Get all payment sources |

---

## 🌐 Deployment

### Backend → [Render](https://render.com) (Free)
1. Push code to GitHub
2. New Web Service → connect repo
3. Root directory: `backend`
4. Build command: `npm install`
5. Start command: `npm start`

### Frontend → [Vercel](https://vercel.com) (Free)
1. New Project → import from GitHub
2. Root directory: `frontend`
3. Build command: `npm run build`
4. Output directory: `build`
5. Add environment variable:
   ```
   REACT_APP_API_URL=https://your-backend.onrender.com/api
   ```

---

## 📋 Manual Entry Fields

- **Merchant / Description** — who you paid or what it was for
- **Amount** — how much you spent
- **Date** — when the expense occurred
- **Category** — Food & Dining, Transportation, Shopping, Entertainment, Healthcare, Office Supplies, Travel, Lifestyle, Education, Other
- **Payment Source** — Bank Account, Cash, UPI, Credit Card, Debit Card, Digital Wallet
- **Note** — optional extra details (e.g. "team lunch", "monthly EMI")

---

## 📸 Receipt Upload Flow

1. Go to the **Upload** tab
2. Choose a receipt photo (JPG, PNG, WebP — max 10 MB)
3. Click **Next: Enter Details**
4. Fill in the form with the correct amount from the bill
5. Click **Add Expense** — done!

---

## 🎯 What I Learned Building This

- Building and consuming a RESTful API end-to-end
- React state management across multiple components
- Handling file uploads on both client and server
- Designing responsive UIs that work on all screen sizes
- Deploying a full-stack app with Vercel and Render

---

## 👤 Author

**Your Name**
- GitHub: https://github.com/Untrainedcure
- LinkedIn: https://www.linkedin.com/in/soumyadip-paul1003/

---
