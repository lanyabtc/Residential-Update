import { validateHeaders, validateRows } from "../../../lib/csv-validate";

export async function POST(req) {
  const { headers, rows } = await req.json();

  const headerCheck = validateHeaders(headers);
  if (!headerCheck.valid) {
    return Response.json(
      { error: "Missing required columns", missing: headerCheck.missing },
      { status: 400 }
    );
  }

  const result = validateRows(rows);

  return Response.json(result);
}
