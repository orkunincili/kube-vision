export async function fetchNodes() {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!base) throw new Error("NEXT_PUBLIC_BACKEND_URL missing");

  const res = await fetch(`${base}/nodes`, { cache: "no-store" });
  if (!res.ok) throw new Error(`nodes fetch failed: ${res.status}`);
  return res.json();
}