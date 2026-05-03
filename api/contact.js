const MAX_FIELD_LENGTH = 4000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const json = (response, status, body) => {
  response.status(status).setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(body));
};

const cleanText = (value) =>
  String(value ?? "")
    .replace(/\r/g, "")
    .trim()
    .slice(0, MAX_FIELD_LENGTH);

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    json(response, 405, { message: "Metodo no permitido." });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  const fromEmail = process.env.CONTACT_FROM_EMAIL;

  if (!apiKey || !toEmail || !fromEmail) {
    json(response, 500, { message: "El envio no esta configurado." });
    return;
  }

  const contactEmail = cleanText(request.body?.contactEmail).toLowerCase();
  const subject = cleanText(request.body?.subject);
  const message = cleanText(request.body?.message);
  const website = cleanText(request.body?.website);

  if (website) {
    json(response, 200, { message: "Mensaje enviado." });
    return;
  }

  if (!EMAIL_PATTERN.test(contactEmail) || !subject || !message) {
    json(response, 400, { message: "Revisa los campos del formulario." });
    return;
  }

  try {
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: contactEmail,
        subject,
        text: `${message}\n\nEmail de contacto: ${contactEmail}`,
      }),
    });

    if (!resendResponse.ok) {
      json(response, 502, { message: "No se ha podido enviar el mensaje." });
      return;
    }
  } catch {
    json(response, 502, { message: "No se ha podido enviar el mensaje." });
    return;
  }

  json(response, 200, { message: "Mensaje enviado." });
}
