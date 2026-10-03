// Vercel serverless function: emails a nomination to the MCCIA Awards Desk via Resend.
// Environment variables (Vercel project settings):
//   RESEND_API_KEY   required
//   NOMINATION_TO    optional, default sudhanwak@mcciapune.com
//   NOMINATION_FROM  optional, default "MCCIA Awards <onboarding@resend.dev>"
import { awardsData } from '../src/data.js';
import { nominationFormFor } from '../src/nominationForms.js';

export const config = { api: { bodyParser: { sizeLimit: '4.4mb' } } };

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const FILE_TYPES = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];

const fieldValue = (field, values) => {
  if (field.type === 'table') return field.rows.map(row => `${row}: ₹ ${values[`${field.key}__${row}`] || '—'}`).join('\n');
  return String(values[field.key] ?? '').trim();
};

const isMissing = (field, values) => {
  if (!field.required) return false;
  if (field.type === 'table') return field.rows.some(row => !String(values[`${field.key}__${row}`] || '').trim());
  return !String(values[field.key] ?? '').trim();
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Submissions are not configured yet. Please contact the Awards Desk.' });

  const { awardId, values = {}, file, website } = req.body || {};
  if (website) return res.status(200).json({ ok: true }); // honeypot

  const award = awardsData.find(a => a.id === awardId);
  if (!award) return res.status(400).json({ error: 'Unknown award.' });

  const schema = nominationFormFor(award.id);
  const groups = [...schema.step2, ...schema.step3];
  const missing = groups.flatMap(g => g.fields).filter(f => isMissing(f, values)).map(f => f.label);
  if (missing.length) return res.status(400).json({ error: 'Some required fields are missing.', missing });

  const attachments = [];
  if (file?.name && file?.content) {
    const ext = String(file.name).split('.').pop().toLowerCase();
    if (!FILE_TYPES.includes(ext)) return res.status(400).json({ error: 'Unsupported file type.' });
    attachments.push({ filename: String(file.name).slice(0, 120), content: file.content });
  }

  const company = values.companyName || values.contactPerson || 'Applicant';
  const body = groups.map(group => `
    <h3 style="margin:24px 0 8px;color:#0a5a55;font-family:Arial,sans-serif">${esc(group.title)}</h3>
    <table style="border-collapse:collapse;width:100%;font-family:Arial,sans-serif;font-size:14px">
      ${group.fields.map(field => `<tr>
        <td style="padding:6px 10px;border:1px solid #dde7e5;background:#f5faf9;width:38%;vertical-align:top"><strong>${esc(field.label)}</strong></td>
        <td style="padding:6px 10px;border:1px solid #dde7e5;white-space:pre-wrap">${esc(fieldValue(field, values)) || '—'}</td>
      </tr>`).join('')}
    </table>`).join('');
  const html = `<div style="max-width:720px;margin:auto"><h2 style="font-family:Arial,sans-serif;color:#0a5a55">New nomination: ${esc(award.title)}</h2>
    <p style="font-family:Arial,sans-serif">Submitted through the MCCIA Awards website.</p>${body}</div>`;

  const from = process.env.NOMINATION_FROM || 'MCCIA Awards <onboarding@resend.dev>';
  const to = process.env.NOMINATION_TO || 'sudhanwak@mcciapune.com';
  const send = payload => fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  try {
    const response = await send({
      from,
      to: [to],
      reply_to: values.email || undefined,
      subject: `Nomination: ${award.title} - ${company}`,
      html,
      attachments,
    });
    if (!response.ok) {
      console.error('Resend error', response.status, await response.text());
      return res.status(502).json({ error: 'We could not send your nomination. Please try again or contact the Awards Desk.' });
    }
    if (values.email) {
      // Best-effort acknowledgement; ignored if the sender domain is not verified.
      send({
        from,
        to: [values.email],
        subject: `We received your nomination for the ${award.title}`,
        html: `<p style="font-family:Arial,sans-serif">Dear ${esc(values.contactPerson || company)},</p>
          <p style="font-family:Arial,sans-serif">Thank you. We have received the nomination of <strong>${esc(company)}</strong> for the <strong>${esc(award.title)}</strong>. The Awards Desk will contact you about the next steps.</p>
          <p style="font-family:Arial,sans-serif">MCCIA Awards Desk</p>`,
      }).catch(() => {});
    }
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Nomination send failed', error);
    return res.status(502).json({ error: 'We could not send your nomination. Please try again or contact the Awards Desk.' });
  }
}
