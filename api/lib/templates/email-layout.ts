export function wrapEmailLayout(content: string, preheader = ""): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Ankshaastra</title></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Georgia,'Times New Roman',serif">
<span style="display:none;max-height:0;overflow:hidden">${preheader}</span>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 16px">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:linear-gradient(160deg,#111,#1a1a1a);border:1px solid #d4af37;border-radius:2px">
<tr><td style="padding:32px 40px 16px;text-align:center">
  <div style="font-size:26px;font-weight:700;color:#d4af37;letter-spacing:3px">ANKSHAASTRA</div>
  <div style="font-size:11px;color:#9ca3af;margin-top:6px;letter-spacing:1px">SPIRITUAL ENTERPRISE OPERATIONS</div>
</td></tr>
<tr><td style="padding:8px 40px 32px;color:#e5e5e5;font-size:15px;line-height:1.7">${content}</td></tr>
<tr><td style="padding:20px 40px;border-top:1px solid #2a2a2a;text-align:center;font-size:11px;color:#6b7280">
  © ${new Date().getFullYear()} Ankshaastra · ankshaastra.com<br/>
  This is a transactional message. Please do not reply to automated emails.
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

export function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(vars[key] ?? ""));
}
