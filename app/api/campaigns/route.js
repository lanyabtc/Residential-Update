import { generateCampaigns } from "../../../lib/campaigns";

export async function GET() {
  const campaigns = generateCampaigns(new Date(), 2);
  return Response.json({ campaigns });
}
