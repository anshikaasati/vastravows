# Rent & Sparkle – Rental + Recommerce Platform

Full-stack web app for renting or buying pre-loved clothes and jewellery. Users can list items, upload images to Cloudinary, check date availability, book rentals, cancel bookings, and leave reviews. Built with **React + Tailwind + React Router** on the frontend and **Node.js + Express + MongoDB + JWT + Cloudinary** on the backend.

---

## Folder Structure

```
backend/
  controllers/
  models/
  routes/
  middleware/
  utils/
  config.js
  .env.sample
  package.json
  server.js
frontend/
  src/
    api/
    components/
    context/
    pages/
    App.jsx
    main.jsx
    index.css
  .env.sample
  package.json
  vite.config.js
README.md
```

---

## Getting Started

### 1. Backend (Express API)

```bash
cd backend
npm install
cp .env.sample .env               # fill in actual secrets
npm run dev                      # http://localhost:5000
```

### 2. Frontend (React + Vite)

```bash
cd frontend
npm install
cp .env.sample .env               # ensure backend URL matches
npm run dev                      # http://localhost:5173
```

---

## Environment Variables

### Backend `.env`

```
PORT=5000
MONGO_URI=your_mongo_connection_string
JWT_SECRET=replace_me
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env`

```
VITE_BACKEND_URL=http://localhost:5000
```

---

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account (returns JWT + profile) |
| POST | `/api/auth/login` | Login (returns JWT + profile) |
| GET | `/api/auth/me` | Get current user details |
| POST | `/api/items` | Create item listing (multipart + Cloudinary) |
| GET | `/api/items` | List all items (filters: `category`, `ownerId`) |
| GET | `/api/items/:id` | Single item + reviews |
| PUT | `/api/items/:id` | Update owned item |
| DELETE | `/api/items/:id` | Delete owned item |
| POST | `/api/bookings/check` | Date overlap check (`A.start <= B.end && B.start <= A.end`) |
| POST | `/api/bookings` | Create booking if dates available |
| GET | `/api/bookings/user` | Bookings made by current user |
| GET | `/api/bookings/owner` | Bookings across owned items |
| PUT | `/api/bookings/:id/cancel` | Cancel booking (owner or renter) |
| POST | `/api/reviews` | Leave review for item |
| GET | `/api/reviews/:itemId` | Fetch reviews for item |

Use Thunder Client/Postman for testing (JSON or multipart forms). All protected routes expect `Authorization: Bearer <token>`.

---

## Booking + Availability Flow

1. Frontend sends `POST /api/bookings/check` with `{ itemId, startDate, endDate }`.
2. Backend loads active bookings (`status` pending/confirmed) and applies overlap rule `A.start <= B.end && B.start <= A.end`.
3. Response:
   - `{ available: true }`
   - `{ available: false, conflictingBookings: [...] }`
4. If available, frontend enables **Rent Now**, which navigates to the Booking page and calls `POST /api/bookings`.
5. Cancellation uses `PUT /api/bookings/:id/cancel`.

Total booking cost = `(number_of_days * rentPricePerDay) + depositAmount`.

---

## Image Uploads

Items can include up to five images. Backend uses Multer (memory storage) plus Cloudinary upload streams (`utils/cloudinary.js`). Frontend submits a multipart form (`formData.append('images', file)`), backend uploads each file, and stores Cloudinary URLs in MongoDB.

---

## Deployment Notes

- **Frontend**: Deploy to Vercel. Set `VITE_BACKEND_URL` to hosted API URL.
- **Backend**: Deploy to Render/Railway. Set environment variables from `.env`. Enable persistent MongoDB (Atlas/Render).
- **CORS**: Update `FRONTEND_URL` in backend `.env` for production origins.

---

## Testing Checklist

- ✅ Auth: register/login/me flows
- ✅ Item CRUD with Cloudinary uploads
- ✅ Booking availability + creation + cancellation
- ✅ Review creation + retrieval
- ✅ Route protection via JWT (localStorage + Axios interceptor)
- ✅ Frontend date picker (`react-date-range`) integration

Use Thunder Client/Postman collections to exercise each endpoint and verify responses before deployment.


