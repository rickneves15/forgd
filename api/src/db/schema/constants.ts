/**
 * Shared enum-like value lists, validated at the Zod layer — not DB CHECK
 * constraints. Kept here so `users.interests` and `projects.category` reuse
 * the exact same tag set.
 */
export const INTEREST_TAGS = [
  'engineering',
  'btech',
  'mtech',
  'it_cs',
  'ente',
  'electrical',
  'mechanical',
  'civil',
] as const
export type InterestTag = (typeof INTEREST_TAGS)[number]

export const PROJECT_STATUSES = ['active', 'done'] as const
export type ProjectStatus = (typeof PROJECT_STATUSES)[number]

export const APPLICATION_STATUSES = ['pending', 'accepted', 'rejected'] as const
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]

export const GROUP_MEMBER_ROLES = ['admin', 'member'] as const
export type GroupMemberRole = (typeof GROUP_MEMBER_ROLES)[number]

export const NOTIFICATION_TYPES = ['general', 'application_status'] as const
export type NotificationType = (typeof NOTIFICATION_TYPES)[number]

export const ATTACHMENT_KINDS = ['photo', 'pdf'] as const
export type AttachmentKind = (typeof ATTACHMENT_KINDS)[number]

// Valid values for oauth_accounts.provider (text + Zod, no DB enum).
// Only Google ships today; the table already supports more providers.
export const OAUTH_PROVIDERS = ['google'] as const
export type OAuthProvider = (typeof OAUTH_PROVIDERS)[number]
