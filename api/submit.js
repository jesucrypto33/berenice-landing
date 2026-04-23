import { Resend } from 'resend';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: { bodyParser: false },
};

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new IncomingForm({ multiples: true, maxFileSize: 50 * 1024 * 1024 });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parse error:', err);
      return res.status(500).json({ error: 'Error al procesar el formulario' });
    }

    const nombre      = fields.nombre?.[0] || '—';
    const institucion = fields.institucion?.[0] || '—';
    const email       = fields.email?.[0] || '—';
    const area        = fields.area?.[0] || '—';
    const descripcion = fields.descripcion?.[0] || '—';
    const urgencia    = fields.urgencia?.[0] || '—';

    // Build attachments from uploaded files
    const attachments = [];
    const uploadedFiles = files.archivos
      ? Array.isArray(files.archivos) ? files.archivos : [files.archivos]
      : [];

    for (const file of uploadedFiles) {
      try {
        const content = fs.readFileSync(file.filepath);
        attachments.push({
          filename: file.originalFilename || 'archivo',
          content,
        });
      } catch (e) {
        console.error('Error reading file:', e);
      }
    }

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a1f;color:#e8e8ff;padding:32px;border-radius:12px;">
        <h2 style="color:#00F5D4;font-size:20px;margin-bottom:24px;letter-spacing:2px;">
          NOVAFOLD — Nuevo caso recibido
        </h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:8px 0;color:#aaa;width:140px;">Nombre</td><td style="padding:8px 0;color:#fff;">${nombre}</td></tr>
          <tr><td style="padding:8px 0;color:#aaa;">Institución</td><td style="padding:8px 0;color:#fff;">${institucion}</td></tr>
          <tr><td style="padding:8px 0;color:#aaa;">Email</td><td style="padding:8px 0;color:#00F5D4;">${email}</td></tr>
          <tr><td style="padding:8px 0;color:#aaa;">Área</td><td style="padding:8px 0;color:#fff;">${area}</td></tr>
          <tr><td style="padding:8px 0;color:#aaa;">Urgencia</td><td style="padding:8px 0;color:#fff;">${urgencia}</td></tr>
        </table>
        <div style="margin-top:20px;padding:16px;background:rgba(255,255,255,0.05);border-radius:8px;border-left:3px solid #7B2FFF;">
          <p style="color:#aaa;font-size:12px;margin-bottom:8px;text-transform:uppercase;letter-spacing:1px;">Descripción del problema</p>
          <p style="color:#e8e8ff;font-size:14px;line-height:1.6;">${descripcion.replace(/\n/g, '<br>')}</p>
        </div>
        ${attachments.length > 0 ? `<p style="margin-top:16px;color:#aaa;font-size:12px;">${attachments.length} archivo(s) adjunto(s)</p>` : ''}
        <p style="margin-top:32px;color:#444;font-size:11px;text-align:center;">NOVAFOLD — Powered by Berenice AI</p>
      </div>
    `;

    try {
      await resend.emails.send({
        from:    'NOVAFOLD <noreply@berenice.ai>',   // ← cambiá por tu dominio verificado en Resend
        to:      'contactbereniceai@gmail.com',
        replyTo: email,
        subject: `[NOVAFOLD] Nuevo caso — ${nombre} · ${institucion}`,
        html,
        attachments,
      });

      return res.status(200).json({ ok: true });
    } catch (e) {
      console.error('Resend error:', e);
      return res.status(500).json({ error: 'Error al enviar el email' });
    }
  });
}
