export const DEFAULT_ADMIN_EMAILS = [
  "trendyglitterzz@gmail.com",
  "admin@trendyglitterz.com",
];

export function getAdminEmails(): string[] {
  const envEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return Array.from(new Set([...DEFAULT_ADMIN_EMAILS.map((e) => e.toLowerCase()), ...envEmails]));
}

export interface MinimalClerkUser {
  primaryEmailAddress?: {
    emailAddress: string;
  } | null;
  emailAddresses?: Array<{
    emailAddress: string;
  }> | null;
  publicMetadata?: {
    role?: string;
  };
}

export function checkIsAdmin(user: MinimalClerkUser | null | undefined): boolean {
  if (!user) return false;

  // 1. Metadata check
  if (user.publicMetadata?.role === "admin") return true;

  // 2. Email checks
  const adminEmails = getAdminEmails();

  const primary = user.primaryEmailAddress?.emailAddress?.trim().toLowerCase();
  if (primary && adminEmails.includes(primary)) return true;

  if (user.emailAddresses && Array.isArray(user.emailAddresses)) {
    return user.emailAddresses.some(
      (e) => e.emailAddress && adminEmails.includes(e.emailAddress.trim().toLowerCase())
    );
  }

  return false;
}
