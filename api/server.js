// api/server.js — Vercel serverless entry point
// This file is generated at build time by the postbuild script.
// Do not edit manually.
import server from "../dist/server/server.js";

export default async function handler(req, res) {
  const url = new URL(req.url, `https://${req.headers.host}`);

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach((v) => headers.append(key, v));
      } else {
        headers.set(key, value);
      }
    }
  }

  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  let body = undefined;
  if (hasBody) {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    body = Buffer.concat(chunks);
  }

  const request = new Request(url.toString(), {
    method: req.method,
    headers,
    body: hasBody ? body : undefined,
    duplex: "half",
  });

  const response = await server.fetch(request);

  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  if (response.body) {
    const reader = response.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
  }
  res.end();
}
