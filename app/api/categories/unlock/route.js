// UI-level gate for the Test category. Not real security — the password just
// keeps Test tasks out of casual view. Kept server-side so it isn't shipped in
// the client bundle. Configure via HIDDEN_CATEGORY_PASSWORD (defaults to "Test").
export async function POST(request) {
  try {
    const { password } = await request.json();
    const expected = process.env.HIDDEN_CATEGORY_PASSWORD ?? 'Test';
    return Response.json({ ok: password === expected });
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
}
