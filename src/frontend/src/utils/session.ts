export function getOrCreateSessionId(): string {
  let sessionId = localStorage.getItem("secoinfi_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("secoinfi_session_id", sessionId);
  }
  return sessionId;
}

export function formatNano(nano: bigint): string {
  const ms = Number(nano / BigInt(1_000_000));
  return new Date(ms).toLocaleString();
}

export function toNano(dateStr: string): bigint {
  return BigInt(new Date(dateStr).getTime()) * BigInt(1_000_000);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
}
