"use client";
import { useState } from "react";
import Papa from "papaparse";

export default function UploadPage() {
  const [result, setResult] = useState(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setLoading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (parsed) => {
        const headers = parsed.meta.fields;
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ headers, rows: parsed.data }),
        });
        const json = await res.json();
        setResult(json);
        setLoading(false);
      },
    });
  }

  return (
    <main style={{ maxWidth: 800, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Import Master Worker List</h1>
      <p>Expected columns: S/N, Employer Name, Employee Name, FIN Number, Personal Email</p>
      <input type="file" accept=".csv" onChange={handleFile} />
      {loading && <p>Validating {fileName}...</p>}

      {result && !result.error && (
        <div style={{ marginTop: 24 }}>
          <h2>Results</h2>
          <ul>
            <li>Total rows: {result.summary.totalRows}</li>
            <li>Valid: {result.summary.validCount}</li>
            <li>Errors: {result.summary.errorCount}</li>
            <li>Duplicate FINs: {result.duplicateCount}</li>
          </ul>
          {result.errors.length > 0 && (
            <>
              <h3>Rows needing attention</h3>
              <table border="1" cellPadding="6" style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                  <tr><th>Row</th><th>Name</th><th>Issues</th></tr>
                </thead>
                <tbody>
                  {result.errors.map((e) => (
                    <tr key={e.row}>
                      <td>{e.row}</td>
                      <td>{e.name}</td>
                      <td>{e.issues.join("; ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
          <p style={{ marginTop: 16, color: "#666" }}>
            Note: saving to the database requires DATABASE_SHEET_ID to be configured
            (see SETUP.md). Validation above runs regardless.
          </p>
        </div>
      )}

      {result && result.error && (
        <p style={{ color: "red" }}>{result.error}: {result.missing?.join(", ")}</p>
      )}
    </main>
  );
}
