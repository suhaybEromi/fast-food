export const prepareRequest = options => {
  const headers = new Headers(options.headers || {});
  let body = options.body;

  if (body && !(body instanceof FormData)) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    if (typeof body !== "string") {
      body = JSON.stringify(body);
    }
  }

  return {
    body,
    headers,
    method: options.method || "GET",
  };
};
