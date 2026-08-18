# CampusVoice

Student course feedback site: students submit (optionally anonymously), admins review and manage entries.

## Setup

```bash
npm install
npm run seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Admin demo login

- Email: `admin@campusvoice.edu`
- Password: `admin123`

## Features

- Landing page and course feedback form (rating, category, comments)
- Anonymous or named submissions
- CampusBot chatbot (answers questions and can collect course feedback in chat)
- Admin login (JWT cookie session)
- Dashboard with filters, status updates, and delete

Feedback is stored in `data/db.json` (created by the seed script).
