⭐ OhMyFood – Fullstack Application

A full-stack food ordering system built with React, Node.js, Express, and MongoDB.

This project includes:

Frontend: React (SPA)

Backend: Node.js + Express REST API

Database: MongoDB (Mongoose ODM)

🚀 Getting Started

Follow the steps below to run the project locally on your computer.

📁 Project Structure
ohmyfood-fullstack/
│
├── server/      → Node.js + Express backend
└── client/      → React frontend

🛠️ Requirements

Make sure you have installed:

Node.js (v16 or higher recommended)

npm (comes with Node.js)

MongoDB Atlas account or local MongoDB

⚙️ 1. Setup the Backend (Server)
📌 Step 1 — Go to the server folder
cd server

📌 Step 2 — Install backend dependencies
npm install

📌 Step 3 — Create your .env file

Copy the example file:

cp .env.example .env


Then open .env and fill in:

MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=your-stripe-secret

📌 Optional — Seed sample restaurants

This loads demo restaurants into the database.

npm run seed

📌 Step 4 — Start the backend
npm run dev


Your backend will run at:

👉 http://localhost:5000

🎨 2. Setup the Frontend (Client)
📌 Step 1 — Go to the client folder
cd ../client

📌 Step 2 — Install frontend dependencies
npm install

📌 Step 3 — Start the React development server
npm start


Your frontend will run at:
👉 http://localhost:3000

React is already configured to talk to the backend at:

http://localhost:5000/api

🧪 3. How to Use the Application
👤 Customer

Browse restaurants

View menus

Add items to cart

Checkout with special instructions

Pay using Stripe test card

Track order status

Leave reviews

Earn loyalty points

🛠️ Admin

Login as admin

View all orders

Update order status

View analytics (total sales, top customer, most ordered dish)

🧾 Stripe Test Card

To test the payment, use:

Card Number: 4242 4242 4242 4242
Expiry: any future date
CVC: any 3 digits
