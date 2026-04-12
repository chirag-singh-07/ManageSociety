# 🏢 ManageSociety: The Ultimate Residential Ecosystem

[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

ManageSociety is a comprehensive, multi-tenant residential management platform designed to streamline operations for housing societies. From billing and automated provisioning to identity management and security, it provides a unified ecosystem for developers, admins, and residents.

---

## 🌟 Key Modules

### 🛠️ Developer Control Center (Superadmin)
*   **Dual-Option Billing**: Manage society onboarding with flexible Free Trials or Monthly Subscription models.
*   **Revenue Hub**: Real-time financial analytics and transaction ledgers for subscription tracking.
*   **Global Identity Registry**: Oversee all users across all society instances with role-based access management.
*   **Audit Vault**: Historical logging of every administrative action for total transparency.

### 🏢 Society Admin Dashboard (In-Progress)
*   **Member Management**: Efficiently handle owner and tenant onboarding.
*   **Subscription Enforcement**: Integrated lockout system for expired trials.
*   **Asset Oversight**: Manage society infrastructure and common areas digitally.

### 🔐 Security & Infrastructure
*   **Tenant Isolation**: Secure data segregation ensures each society's data remains private and isolated.
*   **Smart Guards**: Backend middleware that enforces subscription health and role permissions.
*   **Glassmorphic Design**: A state-of-the-art UI/UX aesthetic prioritizing speed and visual excellence.

---

## 🚀 Tech Stack

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS 4.0
- **UI Components**: Radix UI, Shadcn, Lucide Icons, Recharts (Analytics)
- **State Management**: TanStack Query (React Query)
- **Backend**: Node.js, Express, Mongoose (MongoDB)
- **Security**: JWT Identity Rotation, Argon2/Bcrypt Password Hashing

---

## 📂 Project Structure

```text
ManageSociety/
├── backend/            # Express API with Multi-Tenant Middleware
├── developer-panel/    # Superadmin Management Suite (Vite + React)
├── admin-panel/        # Society Admin Dashboard (Vite + React)
└── README.md           # Documentation
```

---

## 🛠️ Getting Started

### 1. Backend Setup
```bash
cd backend
npm install
# Create a .env file with MONGODB_URI and JWT_SECRET
npm run dev
```

### 2. Dashboard Setup
```bash
cd developer-panel # or admin-panel
npm install
npm run dev
```

---

## 🛡️ Identity & Access

ManageSociety uses a robust Role-Based Access Control (RBAC) system:
- **`superadmin`**: Controls global subscriptions, pricing, and system health.
- **`admin`**: Manages specific society residents, staff, and settings.
- **`user`**: Resident access for bill payment and community engagement.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <b>Built with ❤️ for Modern Living</b>
</p>
