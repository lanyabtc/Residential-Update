const { google } = require("googleapis");

function buildRawMessage({ to, from, subject, html }) {
  const messageParts = [
    `From: ${from}`,
    `To: ${to}`,
    `Content-Type: text/html; charset=utf-8`,
    `MIME-Version: 1.0`,
    `Subject: ${subject}`,
    "",
    html,
  ];
  const message = messageParts.join("\n");
  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function sendViaGmail({ to, subject, html, accessToken, fromEmail }) {
  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const raw = buildRawMessage({ to, from: fromEmail, subject, html });

    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw },
    });

    return { success: true, providerMessageId: res.data.id, provider: "gmail" };
  } catch (err) {
    return { success: false, error: err.message, provider: "gmail" };
  }
}

module.exports = { sendViaGmail };
