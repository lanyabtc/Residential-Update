const REQUIRED_COLUMNS = ["S/N", "Employer Name", "Employee Name", "FIN Number", "Personal Email"];

const FIN_FORMAT = /^[A-Za-z]\d{7}[A-Za-z]$/;

const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateHeaders(headers) {
  const missing = REQUIRED_COLUMNS.filter((c) => !headers.includes(c));
  return { valid: missing.length === 0, missing };
}

function validateRows(rows) {
  const errors = [];
  const seenFin = new Map();
  const duplicates = [];
  const validRows = [];

  rows.forEach((row, idx) => {
    const rowNum = idx + 2;
    const sn = (row["S/N"] || "").toString().trim();
    const employer = (row["Employer Name"] || "").trim();
    const name = (row["Employee Name"] || "").trim();
    const fin = (row["FIN Number"] || "").trim().toUpperCase();
    const email = (row["Personal Email"] || "").trim();

    let rowErrors = [];

    if (!employer) rowErrors.push("missing Employer Name");
    if (!name) rowErrors.push("missing Employee Name");
    if (!fin) {
      rowErrors.push("missing FIN Number");
    } else if (!FIN_FORMAT.test(fin)) {
      rowErrors.push(`invalid FIN format: "${fin}"`);
    }
    if (!email) {
      rowErrors.push("missing Personal Email");
    } else if (!EMAIL_FORMAT.test(email)) {
      rowErrors.push(`invalid email format: "${email}"`);
    }

    if (fin && FIN_FORMAT.test(fin)) {
      if (seenFin.has(fin)) {
        duplicates.push({ fin, rows: [seenFin.get(fin), rowNum] });
        rowErrors.push(`duplicate FIN (also row ${seenFin.get(fin)})`);
      } else {
        seenFin.set(fin, rowNum);
      }
    }

    if (rowErrors.length > 0) {
      errors.push({ row: rowNum, sn, name, fin, issues: rowErrors });
    } else {
      validRows.push({ sn, employer, name, fin, email });
    }
  });

  return {
    validRows,
    errors,
    duplicateCount: duplicates.length,
    duplicates,
    summary: {
      totalRows: rows.length,
      validCount: validRows.length,
      errorCount: errors.length,
    },
  };
}

module.exports = { validateHeaders, validateRows, REQUIRED_COLUMNS, FIN_FORMAT, EMAIL_FORMAT };
