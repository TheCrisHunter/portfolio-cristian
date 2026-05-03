import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";

const cvPath = path.join(
  process.cwd(),
  "public",
  "resources",
  "cv-cristian-gordillo.pdf",
);

export default async function handler(request, response) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.setHeader("Allow", "GET, HEAD");
    response.status(405).end();
    return;
  }

  try {
    const file = await stat(cvPath);

    response.setHeader("Content-Type", "application/pdf");
    response.setHeader(
      "Content-Disposition",
      'attachment; filename="cv-cristian-gordillo.pdf"',
    );
    response.setHeader("Content-Length", file.size);
    response.setHeader("Cache-Control", "private, no-store");

    if (request.method === "HEAD") {
      response.status(200).end();
      return;
    }

    createReadStream(cvPath).pipe(response);
  } catch {
    response.status(404).end();
  }
}
