const path = require('path');

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const dotenv = require('dotenv');
const { Resend } = require('resend');

dotenv.config();

const PORT = Number(process.env.PORT || 3000);
const RESEND_API_KEY = process.env.RESEND_API_KEY;

const MAIL_TO = process.env.MAIL_TO || 'eperformance.tuning@yahoo.com';
const MAIL_FROM = process.env.MAIL_FROM || 'E PERFORMANCE <onboarding@resend.dev>';

if (!RESEND_API_KEY) {
  console.warn('[WARN] RESEND_API_KEY is not set. API will return errors until configured.');
}

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const app = express();
app.disable('x-powered-by');
app.use(cors());

app.use(express.json({ limit: '1mb' }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024
  }
});

function requireResend(req, res) {
  if (!resend) {
    res.status(500).json({ ok: false, error: 'Server email is not configured (missing RESEND_API_KEY).' });
    return false;
  }
  return true;
}

function sanitizeText(value) {
  if (typeof value !== 'string') return '';
  return value.trim();
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.post('/api/contact', async (req, res) => {
  if (!requireResend(req, res)) return;

  const name = sanitizeText(req.body?.name);
  const email = sanitizeText(req.body?.email);
  const subject = sanitizeText(req.body?.subject);
  const message = sanitizeText(req.body?.message);

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ ok: false, error: 'Missing required fields.' });
  }

  try {
    const html = `
      <div style="font-family:Inter,Arial,sans-serif;line-height:1.5">
        <h2>New contact message</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
        <hr />
        <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
      </div>
    `;

    await resend.emails.send({
      from: MAIL_FROM,
      to: [MAIL_TO],
      replyTo: email,
      subject: `Contact: ${subject}`,
      html
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: 'Failed to send email.' });
  }
});

app.post('/api/order', upload.single('file'), async (req, res) => {
  if (!requireResend(req, res)) return;

  const name = sanitizeText(req.body?.name);
  const email = sanitizeText(req.body?.email);
  const make = sanitizeText(req.body?.make);
  const model = sanitizeText(req.body?.model);
  const engine = sanitizeText(req.body?.engine);
  const yearVehicle = sanitizeText(req.body?.yearVehicle);
  const serviceType = sanitizeText(req.body?.serviceType);
  const notes = sanitizeText(req.body?.notes);

  if (!name || !email || !make || !model || !engine || !yearVehicle || !serviceType) {
    return res.status(400).json({ ok: false, error: 'Missing required fields.' });
  }

  const file = req.file;

  try {
    const html = `
      <div style="font-family:Inter,Arial,sans-serif;line-height:1.5">
        <h2>New file order</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Vehicle:</strong> ${escapeHtml(make)} ${escapeHtml(model)} (${escapeHtml(yearVehicle)})</p>
        <p><strong>Engine:</strong> ${escapeHtml(engine)}</p>
        <p><strong>Requested service:</strong> ${escapeHtml(serviceType)}</p>
        <p><strong>File attached:</strong> ${file ? 'Yes' : 'No'}</p>
        ${notes ? `<hr /><p><strong>Notes</strong></p><p style="white-space:pre-wrap">${escapeHtml(notes)}</p>` : ''}
      </div>
    `;

    const attachments = [];
    if (file) {
      attachments.push({
        filename: file.originalname || 'original-file',
        content: file.buffer.toString('base64')
      });
    }

    await resend.emails.send({
      from: MAIL_FROM,
      to: [MAIL_TO],
      replyTo: email,
      subject: `Order: ${make} ${model} — ${serviceType}`,
      html,
      attachments
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: 'Failed to send email.' });
  }
});

// Serve the static site from the repo root
app.use(express.static(path.resolve(__dirname)));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

function escapeHtml(input) {
  return String(input)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
