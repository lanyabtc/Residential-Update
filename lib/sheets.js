const { google } = require("googleapis");

function getAuth() {
  const privateKey = (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || "").replace(/\\n/g, "\n");
  return new google.auth.JWT(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    null,
    privateKey,
    ["https://www.googleapis.com/auth/spreadsheets"]
  );
}

function getSheetsClient() {
  return google.sheets({ version: "v4", auth: getAuth() });
}

async function readTab(spreadsheetId, tabName) {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${tabName}!A1:Z10000`,
  });
  const [headerRow, ...rows] = res.data.values || [[]];
  if (!headerRow) return [];
  return rows.map((row) => {
    const obj = {};
    headerRow.forEach((h, i) => (obj[h] = row[i] ?? ""));
    return obj;
  });
}

async function appendRows(spreadsheetId, tabName, rowsAsArrays) {
  const sheets = getSheetsClient();
  return sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${tabName}!A1`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: rowsAsArrays },
  });
}

async function updateRow(spreadsheetId, tabName, rowNumber, rowAsArray) {
  const sheets = getSheetsClient();
  return sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${tabName}!A${rowNumber}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [rowAsArray] },
  });
}

module.exports = { readTab, appendRows, updateRow, getSheetsClient };
