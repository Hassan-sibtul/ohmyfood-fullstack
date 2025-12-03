# OhMyFood – Fullstack Application

A full-stack food ordering system built with React, Node.js, Express, and MongoDB.

This project includes:

- **Frontend:** React (SPA)
- **Backend:** Node.js + Express REST API
- **Database:** MongoDB (Mongoose ODM)

---

## Getting Started

Follow the steps below to run the project locally on your computer.

---

## Project Structure


ohmyfood-fullstack/

1. server/      → Node.js + Express backend
2. client/      → React frontend


---

## Requirements

Make sure you have installed:

- Node.js (v16 or higher recommended)
- npm (comes with Node.js)
- MongoDB Atlas account or local MongoDB

---

## 1. Setup the Backend (Server)

### Step 1 — Go to the server folder
```bash
cd server
```
### Step 2 — Install backend dependencies 
```bash
npm install
```
### Step 3 — Start the Backend
```bash
npm run dev
```
Your backend will run at:
http://localhost:5001

## 2. Setup the Frontend (Client)
### Step 1 — Go to the client folder
```bash
cd client
```
### Step 2 — Start the development server
```bash
npm start
```
Your frontend will run at:
http://localhost:3000

## 3. How to Use the Application

### Customer Features

- Browse restaurants
- View menus
- Add items to cart
- Checkout with special instructions
- Pay using Stripe test card
- Track order status
- Leave reviews
- Earn loyalty points

### Admin Features

- Login as admin (Email: admin@restaurant.com, Password: admin123)
- View all orders
- Update order status
- View analytics (total sales, top customer, most ordered dish)

## Deployed System (Live URL)
### Backend(Render)
https://ohmyfood-fullstack.onrender.com
### Frontend(Vercel)
https://ohmyfood-fullstack.vercel.app

The backend (Render) must be running before the frontend (Vercel) to ensure full system functionality.


