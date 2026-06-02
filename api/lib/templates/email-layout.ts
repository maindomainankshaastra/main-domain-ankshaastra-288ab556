export function wrapEmailLayout(content: string, preheader = ""): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Ankshaastra Occult Experts LLP</title></head>
<body style="margin:0;padding:0;background:#f8f7fc;font-family:Arial,Helvetica,sans-serif">
<span style="display:none;max-height:0;overflow:hidden">${preheader}</span>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7fc;padding:32px 16px">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
<tr><td style="padding:28px 40px 20px;text-align:center;border-bottom:2px solid #8B5CF6;background:#faf9ff">
  <div style="font-size:22px;font-weight:700;color:#8B5CF6;letter-spacing:0.5px;line-height:1.3">Ankshaastra Occult Experts LLP</div>
</td></tr>
<tr><td style="padding:28px 40px;color:#333333;font-size:15px;line-height:1.7">${content}</td></tr>
<tr><td style="padding:18px 40px;border-top:1px solid #e5e7eb;text-align:center;font-size:11px;color:#6b7280;background:#fafafa">
  © ${new Date().getFullYear()} Ankshaastra Occult Experts LLP · ankshaastra.com<br/>
  This is a transactional message. Please do not reply to automated emails.
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

export function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(vars[key] ?? ""));
}
