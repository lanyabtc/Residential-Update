const { FIN_FORMAT } = require("./csv-validate");

const FORM_COLUMNS = {
  timestamp: "Timestamp",
  fullName: "Full Name As Per Work Pass (工作通行证上的全名):",
  fin: "FIN Number (Fin 的号码):",
  workPermitNumber: "Work Permit Number (Work Permit 的号码):",
  typeOfWorkPass: "Type Of Work Pass (准证):",
  employerName: "Employer Name  (公司名称):",
  mobileNumber: "Mobile Number (手机号码)",
  personalEmail: "Personal Email (个人电邮)",
  addressChanged: "Any Change In Residential Address? (目前居住地址有变化吗？)",
  newAddress: "New Address (新地址)",
  currentAddress: "Current Address (Current的家庭住址",
};

function parseFormTimestamp(raw) {
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

function deriveEffectiveAddress(row) {
  const changed = (row[FORM_COLUMNS.addressChanged] || "").trim().toLowerCase();
  const newAddr = (row[FORM_COLUMNS.newAddress] || "").trim();
  const currentAddr = (row[FORM_COLUMNS.currentAddress] || "").trim();
  if (changed === "yes" && newAddr) return newAddr;
  return currentAddr || newAddr || "";
}

function syncSubmissions(formRows, workers, campaignId) {
  const workerFinSet = new Set(workers.map((w) => w.fin.toUpperCase()));
  const submissions = [];
  const unmatched = [];

  formRows.forEach((row, idx) => {
    const rawFin = (row[FORM_COLUMNS.fin] || "").trim().toUpperCase();
    const timestamp = parseFormTimestamp(row[FORM_COLUMNS.timestamp]);
    const isValidFinFormat = FIN_FORMAT.test(rawFin);
    const isKnownWorker = isValidFinFormat && workerFinSet.has(rawFin);

    const record = {
      submissionId: `${campaignId}-${idx}`,
      campaignId,
      timestamp,
      fullNameOnForm: row[FORM_COLUMNS.fullName] || "",
      fin: rawFin,
      workPermitNumber: row[FORM_COLUMNS.workPermitNumber] || "",
      typeOfWorkPass: row[FORM_COLUMNS.typeOfWorkPass] || "",
      employerNameOnForm: row[FORM_COLUMNS.employerName] || "",
      mobileNumber: row[FORM_COLUMNS.mobileNumber] || "",
      personalEmailOnForm: row[FORM_COLUMNS.personalEmail] || "",
      addressChanged: row[FORM_COLUMNS.addressChanged] || "",
      newAddress: row[FORM_COLUMNS.newAddress] || "",
      currentAddress: row[FORM_COLUMNS.currentAddress] || "",
      effectiveAddress: deriveEffectiveAddress(row),
      matchStatus: isKnownWorker ? "Matched" : "Unmatched",
      isLatest: false,
    };

    submissions.push(record);
    if (!isKnownWorker) unmatched.push(record);
  });

  const latestByFin = new Map();
  submissions
    .filter((s) => s.matchStatus === "Matched")
    .forEach((s) => {
      const existing = latestByFin.get(s.fin);
      if (!existing || (s.timestamp && (!existing.timestamp || s.timestamp > existing.timestamp))) {
        latestByFin.set(s.fin, s);
      }
    });
  latestByFin.forEach((s) => (s.isLatest = true));

  return {
    submissions,
    latestByFin,
    unmatched,
    summary: {
      totalRows: formRows.length,
      matched: submissions.filter((s) => s.matchStatus === "Matched").length,
      unmatched: unmatched.length,
      uniqueWorkersSubmitted: latestByFin.size,
      resubmissions: submissions.filter((s) => s.matchStatus === "Matched").length - latestByFin.size,
    },
  };
}

module.exports = { syncSubmissions, FORM_COLUMNS, deriveEffectiveAddress };
