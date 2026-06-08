const ADMIN_EMAILS = new Set([
  'criesemail123@gmail.com',
  'jaryn.b.healey@gmail.com',
]);

export function isAdminEmail(email?: string | null) {
  return Boolean(email && ADMIN_EMAILS.has(email.toLowerCase()));
}
