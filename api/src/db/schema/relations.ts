import { relations } from 'drizzle-orm'
import { applications } from './applications'
import { tokens } from './auth'
import { bookmarks } from './bookmarks'
import { conversations, directMessages, groupMessages } from './chat'
import { feedback } from './feedback'
import { groupMembers, groups } from './groups'
import { comments, issues } from './issues'
import { notifications } from './notifications'
import { projectAttachments, projects } from './projects'
import { regards } from './regards'
import { tasks } from './tasks'
import { users } from './users'

export const usersRelations = relations(users, ({ many }) => ({
  ownedProjects: many(projects),
  applications: many(applications),
  groupMemberships: many(groupMembers),
  assignedTasks: many(tasks),
  issues: many(issues),
  comments: many(comments),
  bookmarks: many(bookmarks),
  notifications: many(notifications),
  feedback: many(feedback),
  tokens: many(tokens),
  regardsGiven: many(regards, { relationName: 'regardGiver' }),
  regardsReceived: many(regards, { relationName: 'regardReceiver' }),
  groupMessages: many(groupMessages),
  sentDirectMessages: many(directMessages),
}))

export const tokensRelations = relations(tokens, ({ one }) => ({
  user: one(users, { fields: [tokens.userId], references: [users.id] }),
}))

export const projectsRelations = relations(projects, ({ one, many }) => ({
  owner: one(users, { fields: [projects.ownerId], references: [users.id] }),
  attachments: many(projectAttachments),
  applications: many(applications),
  bookmarks: many(bookmarks),
  issues: many(issues),
  notifications: many(notifications),
  group: one(groups),
}))

export const projectAttachmentsRelations = relations(
  projectAttachments,
  ({ one }) => ({
    project: one(projects, {
      fields: [projectAttachments.projectId],
      references: [projects.id],
    }),
  }),
)

export const applicationsRelations = relations(applications, ({ one }) => ({
  project: one(projects, {
    fields: [applications.projectId],
    references: [projects.id],
  }),
  applicant: one(users, {
    fields: [applications.applicantId],
    references: [users.id],
  }),
}))

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, { fields: [bookmarks.userId], references: [users.id] }),
  project: one(projects, {
    fields: [bookmarks.projectId],
    references: [projects.id],
  }),
}))

export const groupsRelations = relations(groups, ({ one, many }) => ({
  project: one(projects, {
    fields: [groups.projectId],
    references: [projects.id],
  }),
  members: many(groupMembers),
  tasks: many(tasks),
  messages: many(groupMessages),
}))

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, {
    fields: [groupMembers.groupId],
    references: [groups.id],
  }),
  user: one(users, { fields: [groupMembers.userId], references: [users.id] }),
}))

export const tasksRelations = relations(tasks, ({ one }) => ({
  group: one(groups, { fields: [tasks.groupId], references: [groups.id] }),
  assignee: one(users, { fields: [tasks.assigneeId], references: [users.id] }),
}))

export const issuesRelations = relations(issues, ({ one, many }) => ({
  project: one(projects, {
    fields: [issues.projectId],
    references: [projects.id],
  }),
  author: one(users, { fields: [issues.authorId], references: [users.id] }),
  comments: many(comments),
}))

export const commentsRelations = relations(comments, ({ one }) => ({
  issue: one(issues, { fields: [comments.issueId], references: [issues.id] }),
  author: one(users, { fields: [comments.authorId], references: [users.id] }),
}))

export const regardsRelations = relations(regards, ({ one }) => ({
  giver: one(users, {
    fields: [regards.giverId],
    references: [users.id],
    relationName: 'regardGiver',
  }),
  receiver: one(users, {
    fields: [regards.receiverId],
    references: [users.id],
    relationName: 'regardReceiver',
  }),
}))

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
  targetProject: one(projects, {
    fields: [notifications.targetProjectId],
    references: [projects.id],
  }),
}))

export const groupMessagesRelations = relations(groupMessages, ({ one }) => ({
  group: one(groups, {
    fields: [groupMessages.groupId],
    references: [groups.id],
  }),
  author: one(users, {
    fields: [groupMessages.authorId],
    references: [users.id],
  }),
}))

export const conversationsRelations = relations(
  conversations,
  ({ one, many }) => ({
    participant1: one(users, {
      fields: [conversations.participant1Id],
      references: [users.id],
    }),
    participant2: one(users, {
      fields: [conversations.participant2Id],
      references: [users.id],
    }),
    messages: many(directMessages),
  }),
)

export const directMessagesRelations = relations(directMessages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [directMessages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [directMessages.senderId],
    references: [users.id],
  }),
}))

export const feedbackRelations = relations(feedback, ({ one }) => ({
  user: one(users, { fields: [feedback.userId], references: [users.id] }),
}))
