/**
 * Central storage configuration. Public images can be served from /images.
 * Team documents and private photos must be fetched via authenticated,
 * short-lived signed URLs from server-side endpoints after authorization.
 */
export const STORAGE_BUCKETS = {
  publicTeams: 'team-public',
  privateTeams: 'team-private',
  privateJury: 'jury-private',
} as const;
export type StorageBucket = typeof STORAGE_BUCKETS[keyof typeof STORAGE_BUCKETS];
export const PUBLIC_ASSET_ROOT = '/images';
export function safeObjectPath(teamId: string, filename: string): string {
  if (!/^[0-9a-f-]{36}$/i.test(teamId)) throw new Error('Invalid team identifier');
  const basename = filename.normalize('NFKC').replace(/[^a-zA-Z0-9._-]/g, '_').replace(/^\.+/, '').slice(0, 120);
  if (!basename || basename === '.' || basename === '..') throw new Error('Invalid filename');
  return `${teamId}/${crypto.randomUUID()}-${basename}`;
}
