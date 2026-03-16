import { customAlphabet } from "nanoid";

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateApiKey(): string {
  const generate = customAlphabet(alphabet, 32);
  return `nl_${generate()}`;
}

export function generateVoucherCode(): string {
  const generate = customAlphabet("0123456789", 8);
  return generate();
}

export function generateVoucherCodes(count: number): string[] {
  const codes = new Set<string>();
  while (codes.size < count) {
    codes.add(generateVoucherCode());
  }
  return Array.from(codes);
}
