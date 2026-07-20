const { sendViaGmail } = require("./gmail");
const { sendViaResend } = require("./resend");

async function sendEmail(params) {
  const provider = process.env.EMAIL_PROVIDER || "gmail";
  if (provider === "resend") return sendViaResend(params);
  return sendViaGmail(params);
}

module.exports = { sendEmail };
