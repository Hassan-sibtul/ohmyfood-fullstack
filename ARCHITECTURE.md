# OhMyFood Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (React SPA)                            │
│                            Port 3000 (Development)                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTP/REST API
                                      │ Authorization: Bearer <token>
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BACKEND (Node.js/Express)                          │
│                            Port 5000 (API Server)                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ Mongoose ODM
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATABASE (MongoDB)                                 │
│                         Collections: Users, Restaurants,                     │
│                              Orders, Reviews                                 │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          EXTERNAL SERVICES                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  • Stripe API (Payment Processing)                                          │
│  • Static Assets (Restaurant images, logos)                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
ohmyfood-fullstack/
├── client/                      # React Frontend Application
│   ├── public/
│   │   └── index.html          # HTML entry point
│   ├── src/
│   │   ├── api.js              # Axios instance with base URL
│   │   ├── App.js              # Main app with routing
│   │   ├── index.js            # ReactDOM render
│   │   ├── styles.css          # Global styles
│   │   ├── components/         # Reusable UI Components
│   │   │   ├── AdminRoute.js   # Protected route for admins
│   │   │   ├── DeliveryTracker.js
│   │   │   ├── Footer.js
│   │   │   ├── Navbar.js
│   │   │   ├── Recommendations.js
│   │   │   ├── ReviewModal.js
│   │   │   └── Toast.js
│   │   ├── context/           # React Context API
│   │   │   └── CartContext.js # Global cart state
│   │   └── pages/             # Page Components
│   │       ├── Account.js
│   │       ├── AdminOrders.js  # Admin dashboard (accordion view)
│   │       ├── Cart.js
│   │       ├── Checkout.js     # Address + Special Instructions
│   │       ├── ForgotPassword.js
│   │       ├── Home.js
│   │       ├── Login.js
│   │       ├── OrderConfirmation.js
│   │       ├── OrderReceipt.js
│   │       ├── Payment.js      # Stripe integration
│   │       ├── Profile.js
│   │       ├── Register.js
│   │       ├── ResetPassword.js
│   │       ├── Restaurant.js   # Menu + Reviews
│   │       └── TrackOrder.js
│   ├── package.json
│   └── build/                  # Production build artifacts
│
└── server/                     # Express Backend API
    ├── index.js                # Main server entry point
    ├── seed.js                 # Database seeding script
    ├── middleware/
    │   └── auth.js             # JWT authentication middleware
    ├── models/                 # Mongoose Schemas
    │   ├── Order.js            # totalAmount, items, address, specialInstructions, status
    │   ├── Restaurant.js       # name, description, menu[], reviews[]
    │   ├── Review.js           # rating, comment, user, restaurant, dish
    │   └── User.js             # name, email, password, isAdmin, loyaltyPoints
    ├── routes/                 # API Route Handlers
    │   ├── auth.js             # POST /register, /login, /forgot-password, /reset-password
    │   ├── orders.js           # POST /, GET /my-orders, GET / (admin), PUT /:id/status
    │   ├── payment.js          # POST /create-payment-intent (Stripe)
    │   ├── recommendations.js  # GET / (ML-based dish recommendations)
    │   ├── restaurants.js      # GET /, GET /:id
    │   ├── reviews.js          # POST /, GET /restaurant/:id
    │   └── users.js            # GET /profile, PUT /profile, GET /loyalty, PUT /redeem
    ├── public/                 # Static assets served by Express
    │   ├── logo/
    │   └── restaurants/
    └── package.json
```

---

## 🔄 Data Flow Diagrams

### 1. User Authentication Flow

```
┌─────────┐
│ User    │
└────┬────┘
     │
     │ 1. POST /api/auth/register or /login
     │    { email, password, name }
     ▼
┌─────────────────┐
│  Auth Routes    │
│  /server/routes │
│  /auth.js       │
└────┬────────────┘
     │
     │ 2. Hash password (bcrypt)
     │    Generate JWT token
     ▼
┌─────────────────┐
│  User Model     │
│  /server/models │
│  /User.js       │
└────┬────────────┘
     │
     │ 3. Save to MongoDB
     ▼
┌─────────────────┐
│   MongoDB       │
│   users         │
└────┬────────────┘
     │
     │ 4. Return JWT token
     ▼
┌─────────────────┐
│  Client         │
│  localStorage   │
│  token saved    │
└─────────────────┘
```

### 2. Order Placement Flow

```
┌─────────┐
│ Customer│
└────┬────┘
     │
     │ 1. Add items to cart (CartContext)
     ▼
┌──────────────────┐
│  Cart Page       │
│  /pages/Cart.js  │
└────┬─────────────┘
     │
     │ 2. Navigate to Checkout
     ▼
┌───────────────────────┐
│  Checkout Page        │
│  /pages/Checkout.js   │
│  - Address form       │
│  - Special Instr.     │
└────┬──────────────────┘
     │
     │ 3. Navigate to OrderReceipt
     │    (review order)
     ▼
┌───────────────────────┐
│  OrderReceipt Page    │
│  /pages/OrderReceipt  │
└────┬──────────────────┘
     │
     │ 4. Navigate to Payment
     ▼
┌───────────────────────────────┐
│  Payment Page                 │
│  /pages/Payment.js            │
│  - Stripe CardElement         │
│  - Loyalty Points Redemption  │
└────┬──────────────────────────┘
     │
     │ 5. POST /api/payment/create-payment-intent
     ▼
┌──────────────────────┐
│  Payment Routes      │
│  /routes/payment.js  │
└────┬─────────────────┘
     │
     │ 6. Create Stripe PaymentIntent
     ▼
┌──────────────────┐
│  Stripe API      │
└────┬─────────────┘
     │
     │ 7. Confirm payment on client
     ▼
┌───────────────────────┐
│  Payment.js           │
│  confirmCardPayment() │
└────┬──────────────────┘
     │
     │ 8. POST /api/orders (for each restaurant)
     │    { restaurantId, items, totalAmount, address, specialInstructions }
     ▼
┌──────────────────────┐
│  Order Routes        │
│  /routes/orders.js   │
└────┬─────────────────┘
     │
     │ 9. Save order to DB
     │    Award loyalty points (£1 = 1 point)
     ▼
┌──────────────────┐
│  Order Model     │
│  /models/Order.js│
└────┬─────────────┘
     │
     │ 10. MongoDB save
     ▼
┌──────────────────┐
│  MongoDB orders  │
└────┬─────────────┘
     │
     │ 11. Return created orders
     ▼
┌────────────────────────┐
│  OrderConfirmation     │
│  /pages/OrderConf...   │
│  - Display order IDs   │
│  - Track order link    │
└────────────────────────┘
```

### 3. Admin Order Management Flow

```
┌─────────┐
│  Admin  │
└────┬────┘
     │
     │ 1. Navigate to /admin/orders
     ▼
┌────────────────────────┐
│  AdminOrders Page      │
│  /pages/AdminOrders.js │
└────┬───────────────────┘
     │
     │ 2. GET /api/orders (with admin token)
     ▼
┌──────────────────────┐
│  Order Routes        │
│  /routes/orders.js   │
│  - Check isAdmin     │
└────┬─────────────────┘
     │
     │ 3. Fetch all orders with user & restaurant populated
     ▼
┌──────────────────┐
│  MongoDB orders  │
└────┬─────────────┘
     │
     │ 4. Return orders[]
     ▼
┌────────────────────────┐
│  AdminOrders Page      │
│  - Analytics cards     │
│  - Accordion view      │
│  - Pending/Completed   │
└────┬───────────────────┘
     │
     │ 5. Admin updates status (Preparing/Out for Delivery/Delivered)
     ▼
┌──────────────────────┐
│  PUT /api/orders/    │
│  /:id/status         │
└────┬─────────────────┘
     │
     │ 6. Update order.status in DB
     ▼
┌──────────────────┐
│  MongoDB orders  │
└──────────────────┘
```

### 4. Review & Recommendation Flow

```
┌─────────┐
│ Customer│
└────┬────┘
     │
     │ 1. Navigate to Restaurant page
     ▼
┌────────────────────────┐
│  Restaurant Page       │
│  /pages/Restaurant.js  │
└────┬───────────────────┘
     │
     │ 2. GET /api/restaurants/:id
     ▼
┌──────────────────────────┐
│  Restaurant Routes       │
│  /routes/restaurants.js  │
└────┬─────────────────────┘
     │
     │ 3. Fetch restaurant with populated reviews
     ▼
┌──────────────────┐
│  MongoDB         │
│  restaurants     │
└────┬─────────────┘
     │
     │ 4. Return restaurant + menu + reviews
     ▼
┌────────────────────────┐
│  Restaurant Page       │
│  - Display menu        │
│  - Show reviews        │
│  - Recommendations     │
└────┬───────────────────┘
     │
     │ 5. User submits review (via ReviewModal)
     ▼
┌──────────────────────┐
│  POST /api/reviews   │
│  /routes/reviews.js  │
└────┬─────────────────┘
     │
     │ 6. Save review to DB
     ▼
┌──────────────────┐
│  Review Model    │
│  /models/Review  │
└────┬─────────────┘
     │
     │ 7. MongoDB save
     ▼
┌──────────────────┐
│  MongoDB reviews │
└──────────────────┘
     │
     │ 8. GET /api/recommendations (collaborative filtering)
     ▼
┌──────────────────────────┐
│  Recommendation Routes   │
│  /routes/recommendations │
│  - Analyze user reviews  │
│  - Suggest similar dishes│
└──────────────────────────┘
```

---

## 🗄️ Database Schema

### Users Collection

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  isAdmin: Boolean,
  loyaltyPoints: Number,
  address: {
    street: String,
    postcode: String,
    county: String,
    country: String
  },
  billingDetails: {
    name: String,
    email: String,
    line1: String,
    city: String,
    postcode: String,
    country: String
  },
  resetToken: String,
  resetTokenExpiry: Date
}
```

### Restaurants Collection

```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  image: String,
  cuisine: String,
  menu: [
    {
      name: String,
      description: String,
      price: Number,
      category: String,
      image: String
    }
  ]
}
```

### Orders Collection

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  restaurant: ObjectId (ref: Restaurant),
  items: [
    {
      name: String,
      price: Number,
      qty: Number
    }
  ],
  totalAmount: Number,
  address: {
    street: String,
    postcode: String,
    county: String,
    country: String
  },
  specialInstructions: String,
  status: String (Paid | Preparing | Out for Delivery | Delivered),
  createdAt: Date
}
```

### Reviews Collection

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  restaurant: ObjectId (ref: Restaurant),
  dishName: String,
  rating: Number (1-5),
  comment: String,
  orderId: ObjectId (ref: Order),
  createdAt: Date
}
```

---

## 🔌 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint           | Description               | Auth |
| ------ | ------------------ | ------------------------- | ---- |
| POST   | `/register`        | Create new user account   | No   |
| POST   | `/login`           | Login and get JWT token   | No   |
| POST   | `/forgot-password` | Send password reset email | No   |
| POST   | `/reset-password`  | Reset password with token | No   |

### Users (`/api/users`)

| Method | Endpoint   | Description                    | Auth |
| ------ | ---------- | ------------------------------ | ---- |
| GET    | `/profile` | Get current user profile       | Yes  |
| PUT    | `/profile` | Update profile/address/billing | Yes  |
| GET    | `/loyalty` | Get loyalty points balance     | Yes  |
| PUT    | `/redeem`  | Redeem loyalty points          | Yes  |

### Restaurants (`/api/restaurants`)

| Method | Endpoint | Description                   | Auth |
| ------ | -------- | ----------------------------- | ---- |
| GET    | `/`      | Get all restaurants           | No   |
| GET    | `/:id`   | Get restaurant details + menu | No   |

### Orders (`/api/orders`)

| Method | Endpoint      | Description                    | Auth  |
| ------ | ------------- | ------------------------------ | ----- |
| POST   | `/`           | Create new order after payment | Yes   |
| GET    | `/my-orders`  | Get user's order history       | Yes   |
| GET    | `/`           | Get all orders (admin only)    | Admin |
| PUT    | `/:id/status` | Update order status (admin)    | Admin |

### Reviews (`/api/reviews`)

| Method | Endpoint          | Description                | Auth |
| ------ | ----------------- | -------------------------- | ---- |
| POST   | `/`               | Submit a dish review       | Yes  |
| GET    | `/restaurant/:id` | Get reviews for restaurant | No   |

### Payment (`/api/payment`)

| Method | Endpoint                 | Description                  | Auth |
| ------ | ------------------------ | ---------------------------- | ---- |
| POST   | `/create-payment-intent` | Create Stripe payment intent | Yes  |

### Recommendations (`/api/recommendations`)

| Method | Endpoint | Description                       | Auth |
| ------ | -------- | --------------------------------- | ---- |
| GET    | `/`      | Get personalized dish suggestions | Yes  |

---

## 🔐 Security & Middleware

### JWT Authentication Flow

```
1. User logs in → Server generates JWT with user.id + isAdmin
2. Client stores token in localStorage
3. Each API request includes: Authorization: Bearer <token>
4. auth.js middleware verifies token
5. Attaches req.user = { id, isAdmin } to request
6. Routes check req.user.isAdmin for admin-only endpoints
```

### Protected Routes (Frontend)

- `<AdminRoute>` component wraps admin pages
- Checks localStorage token + decodes to verify isAdmin
- Redirects to /login if unauthorized

---

## 🎨 Frontend Architecture

### Component Hierarchy

```
App.js (Router)
├── Navbar
│   ├── Logo
│   ├── Navigation Links
│   ├── Cart Badge (from CartContext)
│   └── Logout Button
├── Pages (Routes)
│   ├── Home
│   │   ├── Hero
│   │   ├── Search Bar
│   │   └── Restaurant Grid
│   ├── Restaurant
│   │   ├── Restaurant Header
│   │   ├── Menu Grid
│   │   ├── Reviews Section
│   │   └── Recommendations
│   ├── Cart (CartContext consumer)
│   ├── Checkout (Address + Special Instructions)
│   ├── OrderReceipt (Order Summary)
│   ├── Payment (Stripe Elements)
│   ├── OrderConfirmation
│   ├── Profile (My Orders)
│   ├── AdminOrders (Accordion View)
│   │   ├── Analytics Cards
│   │   ├── Pending Orders Accordion
│   │   └── Completed Orders Accordion
│   └── Auth Pages (Login/Register/Forgot/Reset)
└── Footer
```

### State Management

- **CartContext**: Global cart state (items, add, remove, update qty, clear)
- **Component State**: Local UI state (loading, errors, expanded accordions)
- **localStorage**: JWT token, cart persistence

---

## 🚀 Deployment Architecture

### Development

```
Frontend: localhost:3000 (React dev server)
Backend:  localhost:5000 (Node/Express)
Database: MongoDB Atlas or local MongoDB
```

### Production

```
Frontend: Static build served from /client/build
Backend:  Express serves API + static files
Database: MongoDB Atlas (cloud)
Stripe:   Live API keys
```

---

## 🔄 Key Features & Data Flows

### 1. Cart Management

- Stored in React Context + localStorage
- Synced across page reloads
- Grouped by restaurant for multi-order support

### 2. Loyalty Points System

- Earn: 1 point per £1 spent (calculated on order creation)
- Redeem: 100 points = £1 discount (applied at payment)
- Deduction: PUT /api/users/redeem after successful payment

### 3. Order Status Tracking

- Customer: View status in Profile → My Orders
- Admin: Update via AdminOrders accordion dropdown
- States: Paid → Preparing → Out for Delivery → Delivered

### 4. Special Instructions

- Input: Checkout page textarea
- Flow: Checkout → OrderReceipt → Payment → Order creation
- Display: AdminOrders accordion (Instructions block)

### 5. Reviews & Recommendations

- Users review dishes from past orders
- Collaborative filtering suggests similar dishes
- Displayed on Restaurant page

---

## 📊 Analytics Dashboard (Admin)

### Metrics Calculated

1. **Total Sales**: Sum of all order.totalAmount
2. **Most Ordered Dish**: Aggregate items.name across all orders
3. **Top Customer**: User with highest loyaltyPoints

---

## 🔧 Technology Stack

### Frontend

- **Framework**: React 18
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Payments**: Stripe React SDK (@stripe/react-stripe-js)
- **State**: Context API + Hooks
- **Styling**: CSS (global styles.css)

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose ODM
- **Authentication**: JWT (jsonwebtoken) + bcrypt
- **Payments**: Stripe Node SDK
- **Email**: Nodemailer (password reset)
- **CORS**: cors middleware

### DevOps

- **Package Manager**: npm
- **Environment**: dotenv
- **Build**: Create React App

---

## 📝 Environment Variables

### Server (.env)

```
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_test_...
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=app-specific-password
```

### Client

```
REACT_APP_API_URL=http://localhost:5000
```

---

## 🎯 Future Enhancements

- Real-time order tracking (WebSockets)
- Push notifications for order status
- Multi-language support
- Restaurant dashboard for order management
- Advanced analytics (sales charts, trends)
- Mobile app (React Native)
- Image upload for reviews
- Scheduled orders
- Delivery driver app

---

**Last Updated**: November 2025
**Version**: 1.0.0
**Maintainer**: Sibtul Hassan
