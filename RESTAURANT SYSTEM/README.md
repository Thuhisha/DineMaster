# DineMaster – Restaurant Reservation System

Premium React frontend for restaurant reservations, menu ordering, and role-based dashboards.

## Tech Stack

- React 18 + Vite
- React Router DOM
- Context API (state + localStorage)
- Framer Motion
- React Icons + React Hot Toast

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Login (Role-Based)

Open **http://localhost:5173/login** and choose a role card:

- **Customer** → `/dashboard`
- **Chef** → `/chef`
- **Admin** → `/admin`

Demo credentials auto-fill per role:

| Role     | Email              | Password   |
|----------|--------------------|------------|
| Customer | customer@demo.com  | customer123 |
| Chef     | chef@demo.com      | chef123     |
| Admin    | admin@demo.com     | admin123    |

## Features

- Landing page with hero, dishes, testimonials
- Table reservation flow with birthday offers
- Digital menu with cart
- Table availability view
- Customer / Chef / Admin dashboards
- Protected role-based routing

## Scripts

- `npm run dev` – development server
- `npm run build` – production build
- `npm run preview` – preview production build
