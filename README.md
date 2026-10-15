# 🛒 ShopKart

A full-stack e-commerce application built step by step through a series of engineering labs: authentication, product discovery, wishlist, shopping cart, and checkout with Razorpay payments.

## Features

- **Authentication**: register, login, logout, and a protected profile using JWT stored in an HttpOnly cookie
- **Product catalog**: browse products, search by name, filter by category, and view product details
- **Wishlist**: save products you like, with duplicate protection
- **Shopping cart**: add items, change quantities, stock validation, and a live cart count in the navbar
- **Checkout and payments**: Razorpay order creation, server-side signature verification, and order history
- **UI states**: loading, error, and empty states on every data-driven page

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, React Router DOM, Axios, CSS / Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Auth | bcrypt, jsonwebtoken, cookie-parser |
| Payments | Razorpay |

## Project Structure

```text
shopkart/
├── backend/
│   ├── controllers/      # Request handlers (customer, product, wishlist, cart, order)
│   ├── models/           # Mongoose schemas
│   ├── routes/           # Express routers
│   ├── middlewares/      # auth.middleware.js (JWT verification)
│   ├── utils/            # generateToken.js and helpers
│   ├── index.js
│   └── .env
│
└── frontend/
    └── src/
        ├── pages/        # Login, Register, Home, Products, ProductDetails, Wishlist, Cart, Checkout, Orders
        ├── components/   # Navbar, ProductCard, SearchBar
        ├── context/      # Global cart state
        ├── services/     # api.js (Axios instance, withCredentials: true)
        ├── App.jsx
        └── main.jsx
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- A Razorpay account (test mode keys)

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd shopkart
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/shopkart
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

Start the server:

```bash
npm run dev
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173` and the API at `http://localhost:5000`.

## API Overview

### Customers

| Method | Endpoint | Protected | Description |
|--------|----------|:---------:|-------------|
| POST | `/customers/register` | ❌ | Create an account |
| POST | `/customers/login` | ❌ | Log in and set the auth cookie |
| GET | `/customers/me` | ✅ | Get the logged-in customer |
| POST | `/customers/logout` | ✅ | Clear the auth cookie |
| PATCH | `/customers/change-password` | ✅ | Change password (bonus) |

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/products` | Create a product |
| GET | `/products` | List products |
| GET | `/products/:id` | Get a single product |

Query parameters on `GET /products`:

```text
/products?search=keyboard
/products?category=Electronics
/products?search=keyboard&category=Electronics
/products?sort=price_asc        # or price_desc (bonus)
```

### Wishlist, Cart, Orders

All of these routes are protected. The user is always identified from the JWT, never from the request body.

- **Wishlist**: get, add (409 on duplicate), and remove items
- **Cart**: get, add, update quantity, remove, with quantity capped at product stock
- **Checkout**: create a Razorpay order, verify the payment signature, then create the order and clear the cart
- **Orders**: list the logged-in user's orders and fetch a single order (ownership enforced)

> Adjust the exact route names above to match your implementation.

## Frontend Routes

| Route | Page | Protected |
|-------|------|:---------:|
| `/register` | Registration | ❌ |
| `/login` | Login | ❌ |
| `/home` | Home | ✅ |
| `/products` | Product listing | ✅ |
| `/products/:id` | Product details | ✅ |
| `/wishlist` | Wishlist | ✅ |
| `/cart` | Cart | ✅ |
| `/checkout` | Checkout | ✅ |
| `/orders` | Order history | ✅ |

## Security Notes

- Passwords are stored only as **bcrypt hashes** and are never returned in any response.
- The JWT lives in an **HttpOnly cookie**, so JavaScript cannot read it.
- The Razorpay **Key Secret stays on the server** only.
- Payments are confirmed by **HMAC signature verification** on the backend, never by a client flag.
- Order totals and item prices are **calculated on the server** from current product data.
- User identity always comes from the **JWT**, which prevents access to other users' data.

## Lab Roadmap

| Lab | Focus |
|-----|-------|
| 01 | Authentication backend |
| 02 | Login → Home frontend |
| 03 | Product catalog and discovery |
| 04 | Wishlist |
| 05 | Shopping cart |
| 06 | Checkout, Razorpay, and orders |

## Author

Your Name · your.email@example.com
