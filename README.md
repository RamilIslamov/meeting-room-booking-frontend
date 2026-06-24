# Meeting Room Booking — Frontend

React + TypeScript single‑page app for the [Meeting Room Booking backend](https://github.com/RamilIslamov/meeting-room-booking).
Users sign in, browse rooms, view a room's bookings for a day and reserve a slot;
admins manage rooms. Authentication is JWT‑based with role‑aware routing.

## Tech stack

- **Vite** + **React 19** + **TypeScript**
- **React Router** for routing and route guards
- **Axios** API client (JWT request interceptor, 401 → logout)
- **React Hook Form** for forms and validation

## Features

- Register / login; JWT and user stored in `localStorage`
- Role‑aware navigation and route guards (`ProtectedRoute`, `AdminRoute`)
- Rooms list and room detail with a date picker + that day's bookings
- Create a booking; backend validation errors (conflict, working hours, etc.)
  are surfaced inline
- "My bookings" with cancel
- Admin: create / edit / soft‑delete rooms
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
