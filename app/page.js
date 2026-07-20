const REQUIRED_ENV = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_SERVICE_ACCOUNT_EMAIL",
  "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY",
  "DATABASE_SHEET_ID",
  "FORM_RESPONSE_SHEET_ID",
  "NEXTAUTH_SECRET",
  "ALLOWED_HR_EMAILS",
];

export default function Home() {
  const status = REQUIRED_ENV.map((key) => ({
    key,
    configured: Boolean(process.env[key]),
  }));
  const allSet = status.every((s) => s.configured);

  return (
    <main style={{ maxWidth: 800, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Foreign Worker Residential Update Portal</h1>
      <p>Quarterly campaign: <strong>July 2026</strong> (first in-system campaign)</p>

      <h2>Setup status</h2>
      <p>{allSet ? "✅ All environment variables configured." : "⚠️ Some setup steps remain — see SETUP.md"}</p>
      <ul>
        {status.map((s) => (
          <li key={s.key}>
            {s.configured ? "✅" : "⬜"} {s.key}
          </li>
        ))}
      </ul>

      <h2>Quick links</h2>
      <ul>
        <li><a href="/upload">Import master worker list (CSV)</a></li>
      </ul>
    </main>
  );
}
