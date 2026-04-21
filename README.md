# E PERFORMANCE site

Static website plus a lightweight email API for the Contact + File Upload forms.

## Setup

1. Install deps:

```bash
npm install
```

2. Create a `.env` file (do not commit it). You can copy from `.env.example`.

- `RESEND_API_KEY`: your Resend key
- `MAIL_TO`: defaults to `eperformance.tuning@yahoo.com`
- `MAIL_FROM`: defaults to `E PERFORMANCE <onboarding@resend.dev>`

3. Run locally:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Endpoints

- `POST /api/contact` (JSON): sends a contact email
- `POST /api/order` (multipart/form-data): sends an order email and attaches the uploaded file
