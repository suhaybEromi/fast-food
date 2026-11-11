import crypto from "node:crypto";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export const generateBase32Secret = (length = 20) => {
  const bytes = crypto.randomBytes(length);
  let bits = "";
  let output = "";

  for (const byte of bytes) {
    bits += byte.toString(2).padStart(8, "0");
  }

  for (let index = 0; index < bits.length; index += 5) {
    const chunk = bits.slice(index, index + 5).padEnd(5, "0");
    output += alphabet[Number.parseInt(chunk, 2)];
  }

  return output;
};

const base32ToBuffer = secret => {
  const clean = String(secret).replace(/=+$/g, "").replace(/\s+/g, "").toUpperCase();
  let bits = "";

  for (const char of clean) {
    const value = alphabet.indexOf(char);

    if (value === -1) {
      throw new Error("Invalid 2FA secret");
    }

    bits += value.toString(2).padStart(5, "0");
  }

  const bytes = [];

  for (let index = 0; index + 8 <= bits.length; index += 8) {
    bytes.push(Number.parseInt(bits.slice(index, index + 8), 2));
  }

  return Buffer.from(bytes);
};

export const generateTotp = (secret, timestamp = Date.now()) => {
  const counter = Math.floor(timestamp / 1000 / 30);
  const buffer = Buffer.alloc(8);
  buffer.writeUInt32BE(Math.floor(counter / 2 ** 32), 0);
  buffer.writeUInt32BE(counter >>> 0, 4);

  const hmac = crypto
    .createHmac("sha1", base32ToBuffer(secret))
    .update(buffer)
    .digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return String((code >>> 0) % 1000000).padStart(6, "0");
};

export const verifyTotp = (token, secret) => {
  const cleanToken = String(token || "").replace(/\s+/g, "");

  if (!/^\d{6}$/.test(cleanToken) || !secret) {
    return false;
  }

  const now = Date.now();
  const validTokens = [-1, 0, 1].map(step =>
    generateTotp(secret, now + step * 30 * 1000),
  );

  return validTokens.includes(cleanToken);
};

export const getOtpAuthUrl = ({ issuer = "FireFast", email, secret }) =>
  `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(
    email,
  )}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
