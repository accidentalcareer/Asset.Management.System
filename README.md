# Asset Management System (AMS)

A full-stack financial portfolio management web app.

**Stack:** Spring Boot 3.2 (Java 17) · Oracle DB · React 18 · Tailwind CSS · Recharts

---

## Project Structure

```
AMS/
├── backend/          Spring Boot REST API
├── frontend/         React + Vite SPA
└── database/         Oracle schema SQL
```

---

## Prerequisites

| Tool         | Version    |
|--------------|------------|
| Java         | 17+        |
| Maven        | 3.8+       |
| Node.js      | 18+        |
| Oracle DB    | XE 21c+ or 19c+ |

---

## Database Setup

1. Create a schema/user in Oracle:
```sql
CREATE USER AMS_USER IDENTIFIED BY yourpassword;
GRANT CONNECT, RESOURCE, DBA TO AMS_USER;
```

2. Run the schema file:
```bash
sqlplus AMS_USER/yourpassword@localhost:1521/XEPDB1 @database/schema.sql
```

---

## Backend Setup

1. Edit `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:oracle:thin:@localhost:1521/XEPDB1
spring.datasource.username=AMS_USER
spring.datasource.password=yourpassword
```

2. Build and run:
```bash
cd backend
mvn clean install -DskipTests
mvn spring-boot:run
```

The API starts on **http://localhost:8080**

> **OTP Note:** This project uses mock OTP. When Forgot Password is triggered, the 6-digit OTP is printed to the server console. Copy it from there.

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app opens at **http://localhost:5173**

---

## API Endpoints Summary

### Auth (`/api/auth`)
| Method | Path                  | Description            |
|--------|-----------------------|------------------------|
| POST   | `/register`           | Create account         |
| POST   | `/login`              | Login, returns JWT     |
| POST   | `/forgot-password`    | Trigger OTP            |
| POST   | `/reset-password`     | Verify OTP + new pass  |

### Assets (`/api/assets`) — JWT required
| Method | Path          | Description              |
|--------|---------------|--------------------------|
| GET    | `/`           | List assets (filter by `?type=`) |
| GET    | `/{id}`       | Get one asset            |
| POST   | `/`           | Create asset             |
| PUT    | `/{id}`       | Update asset             |
| DELETE | `/{id}`       | Soft-delete asset        |

### SIPs (`/api/sips`) — JWT required
| Method | Path    | Description  |
|--------|---------|--------------|
| GET    | `/`     | List SIPs    |
| POST   | `/`     | Create SIP   |
| PUT    | `/{id}` | Update SIP   |
| DELETE | `/{id}` | Delete SIP   |

### Transactions (`/api/transactions`) — JWT required
| Method | Path                  | Description           |
|--------|-----------------------|-----------------------|
| GET    | `/`                   | List (with filters)   |
| POST   | `/`                   | Add transaction       |
| PUT    | `/{id}`               | Update (within 7 days)|
| DELETE | `/{id}`               | Delete                |
| GET    | `/export/csv`         | Download CSV          |
| GET    | `/export/pdf`         | Download PDF          |

### Dashboard (`/api/dashboard`) — JWT required
| Method | Path | Description            |
|--------|------|------------------------|
| GET    | `/`  | All metrics + chart data|

### Projections (`/api/projections`) — JWT required
| Method | Path              | Description               |
|--------|-------------------|---------------------------|
| POST   | `/calculate`      | Calculate + save           |
| GET    | `/`               | List saved projections     |
| DELETE | `/{id}`           | Delete saved projection    |
| GET    | `/retirement`     | Retirement SIP calculator  |

---

## SIP Future Value Formula

```
FV = P × ((1 + r)^n − 1) / r × (1 + r)

P = monthly amount
r = annual rate / 12 / 100
n = total months
```

---

## Asset Types
`MUTUAL_FUND` · `SIP` · `FIXED_DEPOSIT` · `SAVINGS` · `OTHER`

## Transaction Categories
- **Credits:** Salary, Investment Returns, FD Interest, Rental Income, Gift, Other Income
- **Debits:** Rent, Utilities, Groceries, SIP, Fixed Deposit, Withdrawal, Shopping, Other Expense

---

## DBMS Coverage
- Oracle sequences, triggers, FK constraints, check constraints
- 5 normalized tables: USERS, ASSETS, SIPS, TRANSACTIONS, PROJECTIONS
- Native queries for aggregation and chart data
- Indexed on `user_id` and `txn_date`

## OOPJ Coverage
- Entities, DTOs, Services, Repositories — full OOP structure
- Interfaces via Spring abstractions
- Inheritance via `BaseController`
- Encapsulation throughout service layer
- `FinanceUtil` demonstrates static utility methods

## WP Coverage
- React component architecture
- Custom hooks pattern (`useAuth`, `useForm`)
- Context API for global state
- RESTful API integration with Axios
- Responsive Tailwind CSS layout
- Recharts data visualizations
