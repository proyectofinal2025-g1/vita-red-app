import * as crypto from 'crypto';

export function verifyMercadoPagoSignature(
  signatureHeader: string,
  rawBody: Buffer,
  secret: string,
): boolean {
  if (!signatureHeader) return false;

  const parts = signatureHeader.split(',');
  const tsPart = parts.find((p) => p.startsWith('ts='));
  const v1Part = parts.find((p) => p.startsWith('v1='));

  if (!tsPart || !v1Part) return false;

  const ts = tsPart.replace('ts=', '');
  const signature = v1Part.replace('v1=', '');

  const payload = `${ts}.${rawBody.toString()}`;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature),
  );
}
