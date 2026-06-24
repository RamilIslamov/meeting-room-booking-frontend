# Meeting Room Booking — Frontend

React + TypeScript single‑page app for the Meeting Room Booking backend.
Users sign in, browse priced rooms, view a room's bookings for a day and reserve a
slot paid from a credit balance; admins manage rooms and user balances.
Authentication is JWT‑based with role‑aware routing.

> **Backend:** the Spring Boot / PostgreSQL API lives in a separate repo —
> [meeting-room-booking](https://github.com/RamilIslamov/meeting-room-booking).

## Tech stack

- **Vite** + **React 19** + **TypeScript**
- **React Router** for routing and route guards
- **Axios** API client (JWT request interceptor, 401 → logout)
- **React Hook Form** for forms and validation

## Features

- Register / login; JWT and user stored in `localStorage`
- Role‑aware navigation and route guards (`ProtectedRoute`, `AdminRoute`)
- Credit **balance shown in the navbar**, refreshed after every money operation
- Rooms list and detail showing the **price per hour**; date picker + that day's
  bookings
- Booking form with a live **cost preview** (price × duration); the Book button is
  disabled when the balance is too low; backend errors (conflict, working hours,
  insufficient funds, …) are surfaced inline
- Non‑admins cannot pick past dates/times; admins are unrestricted (backdating)
- "My bookings" with a cost column, inline **edit** (title/date/time) and cancel
- Admin: create / edit / soft‑delete rooms (with price); a **Users** page to view
  balances and **top them up**
- Centralised error handling that reads the backend `ErrorResponse`

## Prerequisites

- **Node 20+** and npm
- The **backend running** at `http://localhost:8080` (see the backend repo —
  `docker compose up -d` + `./mvnw spring-boot:run`). Its CORS config already
  allows the Vite dev origin `http://localhost:5173`.

## Running locally

```bash
npm install
npm run dev          # http://localhost:5173
```

Then open http://localhost:5173. Use the seeded admin (`admin@booking.local` /
`admin12345`) to create rooms, or register a regular user to book.

## Configuration

The API base URL is read from `VITE_API_BASE_URL` (see `.env`), defaulting to
`http://localhost:8080/api`:

```
VITE_API_BASE_URL=http://localhost:8080/api
```

## Scripts

| Command           | Description                          |
|-------------------|--------------------------------------|
| `npm run dev`     | Start the Vite dev server (HMR)      |
| `npm run build`   | Type‑check (`tsc -b`) and build       |
| `npm run preview` | Preview the production build locally |
| `npm run lint`    | Run Oxlint                           |

## Project structure

```
src/
  api/         axios client + typed calls (auth, rooms, bookings)
  auth/        AuthContext (token + user, login/logout)
  routes/      ProtectedRoute, AdminRoute
  components/  Navbar
  pages/       Login, Register, Rooms, RoomDetail, MyBookings, AdminRooms
  lib/         date/time helpers
  types/       TypeScript types mirroring the backend DTOs
```

## Screenshots

_Add screenshots of the rooms list, room detail and My bookings here._
