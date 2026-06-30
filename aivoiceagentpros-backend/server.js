const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors({ origin: ['https://aivoiceagentpros.com', 'https://www.aivoiceagentpros.com', 'https://sage-jelly-69f871.netlify.app'] }));
app.use(express.json());

app.post('/submit-lead', async (req, res) => {
  const { name, business, phone, city, industry, plan, notes } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await resend.emails.send({
      from: 'AI Voice Agent Pros leads@dominionsoundmusic.com',
      to: 'aivoicesalesagents@gmail.com',
      subject: `New Lead: ${business || name} — ${plan || 'Plan not selected'}`,
      html: `<div style="font-family:sans-serif; max-width:600px; margin:0 auto; padding:24px;"> <div style="background:#0B1220; padding:20px 24px; border-radius:10px 10px 0 0;"> <h2 style="color:#F4B85A; margin:0; font-size:1.1rem;">New Lead — AI Voice Agent Pros</h2> </div> <div style="background:#f7f4ed; padding:24px; border-radius:0 0 10px 10px; border:1px solid #e0d9cc;"> <table style="width:100%; border-collapse:collapse; font-size:0.95rem;"> <tr><td style="padding:8px 0; color:#5B6478; width:140px;">Name</td><td style="padding:8px 0; font-weight:600;">${name}</td></tr> <tr><td style="padding:8px 0; color:#5B6478;">Business</td><td style="padding:8px 0; font-weight:600;">${business || '—'}</td></tr> <tr><td style="padding:8px 0; color:#5B6478;">Phone</td><td style="padding:8px 0; font-weight:600;">${phone}</td></tr> <tr><td style="padding:8px 0; color:#5B6478;">City</td><td style="padding:8px 0; font-weight:600;">${city || '—'}</td></tr> <tr><td style="padding:8px 0; color:#5B6478;">Industry</td><td style="padding:8px 0; font-weight:600;">${industry || '—'}</td></tr> <tr><td style="padding:8px 0; color:#5B6478;">Plan Interest</td><td style="padding:8px 0; font-weight:600; color:#E8A33D;">${plan || '—'}</td></tr> ${notes ? `<tr><td style="padding:8px 0; color:#5B6478; vertical-align:top;">Notes</td><td style="padding:8px 0;">${notes}</td></tr>` : ''} </table> <div style="margin-top:20px; padding-top:16px; border-top:1px solid #e0d9cc; font-size:0.82rem; color:#8A91A3;"> Submitted via aivoiceagentpros.com </div> </div> </div>`
    });

    res.json({ success: true });

  } catch (err) {
    console.error('Email error:', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`AI Voice Agent Pros backend running on port ${PORT}`));
