export function unauthenticatedResponse(text: string, status = 401): Response {
  return new Response(text, {
    status: status,
  });
}
