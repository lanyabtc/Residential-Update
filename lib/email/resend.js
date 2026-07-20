async function sendViaResend({ to, subject, html, fromEmail }) {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail || process.env.RESEND_FROM_ADDRESS,
        to: [to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, error: errText, provider: "resend" };
    }

    const data = await res.json();
    return { success: true, providerMessageId: data.id, provider: "resend" };
  } catch (err) {
    return { success: false, error: err.message, provider: "resend" };
  }
}

module.exports = { sendViaResend };
