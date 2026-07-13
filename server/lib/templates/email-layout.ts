export function wrapEmailLayout(content: string, preheader = "", title = "Ankshaastra Occult Experts LLP"): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title}</title></head>
<body style="margin:0;padding:0;background:#eef2f7;font-family:Arial,Helvetica,sans-serif">
<span style="display:none;max-height:0;overflow:hidden">${preheader}</span>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#eef2f7;padding:32px 16px">
<tr><td align="center">
<table width="640" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #d9dee7;border-radius:10px;overflow:hidden">
<tr><td style="padding:22px 32px 18px;background:#ffffff;border-bottom:3px solid #4b77be">
  <div style="font-size:13px;font-weight:700;color:#4b77be;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">Tax Invoice</div>
  <div style="font-size:22px;font-weight:800;color:#111827;line-height:1.3">Ankshaastra Occult Experts LLP</div>
</td></tr>
<tr><td style="padding:28px 32px;color:#1f2937;font-size:15px;line-height:1.7">${content}</td></tr>
<tr><td style="padding:18px 32px;border-top:1px solid #e5e7eb;text-align:center;font-size:11px;color:#6b7280;background:#f8fafc">
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
