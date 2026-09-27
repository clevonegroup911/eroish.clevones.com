export function GET() {
  return new Response("Redirecting to /icon", {
    status: 308,
    headers: { Location: "/icon" },
  });
}
