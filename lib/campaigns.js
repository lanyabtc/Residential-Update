const QUARTER_MONTHS = [1, 4, 7, 10];
const FIRST_CAMPAIGN_YM = 202607;

const MONTH_NAMES = {
  1: "January",
  4: "April",
  7: "July",
  10: "October",
};

function ymToId(year, month) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function ymToLabel(year, month) {
  return `${MONTH_NAMES[month]} ${year}`;
}

function generateCampaigns(asOfDate = new Date(), lookaheadQuarters = 2) {
  const campaigns = [];
  let year = 2026;
  let qIndex = QUARTER_MONTHS.indexOf(7);

  const asOfYM = asOfDate.getFullYear() * 100 + (asOfDate.getMonth() + 1);

  let pastLookaheadCount = 0;
  const maxIterations = 200;
  let iterations = 0;

  while (iterations < maxIterations) {
    iterations++;
    const month = QUARTER_MONTHS[qIndex];
    const ym = year * 100 + month;

    if (ym >= FIRST_CAMPAIGN_YM) {
      campaigns.push({
        id: ymToId(year, month),
        label: ymToLabel(year, month),
        year,
        month,
        quarterStart: new Date(Date.UTC(year, month - 1, 1)),
        isFuture: ym > asOfYM,
      });
    }

    if (ym >= asOfYM) {
      pastLookaheadCount++;
      if (pastLookaheadCount > lookaheadQuarters) break;
    }

    qIndex++;
    if (qIndex >= QUARTER_MONTHS.length) {
      qIndex = 0;
      year++;
    }
  }

  return campaigns;
}

module.exports = { generateCampaigns, QUARTER_MONTHS, FIRST_CAMPAIGN_YM };
