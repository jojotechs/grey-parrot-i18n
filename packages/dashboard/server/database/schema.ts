import { relations, sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// 用户角色枚举
export enum UserRole {
  Admin = 'admin',
  Editor = 'editor',
  Reader = 'reader',
}

// 用户表
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role', {
    enum: Object.values(UserRole) as [string, ...string[]],
  }).notNull().default(UserRole.Reader),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(sql`CURRENT_TIMESTAMP`),
})

// 多语言表
export const sheets = sqliteTable('sheets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  languages: text('languages').notNull(),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().default(sql`CURRENT_TIMESTAMP`),
})

// 文案条目表
export const entries = sqliteTable('entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sheetId: integer('sheet_id').references(() => sheets.id).notNull(),
  key: text('key').notNull(), // 语义化 key
  // 存储所有翻译，如: {"zh-CN": "你好", "en": "Hello"}
  translations: text('translations').notNull(),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().default(sql`CURRENT_TIMESTAMP`),
})

// 定义关联关系
export const sheetsRelations = relations(sheets, ({ one, many }) => ({
  creator: one(users, {
    fields: [sheets.createdBy],
    references: [users.id],
  }),
  entries: many(entries),
}))

export const entriesRelations = relations(entries, ({ one }) => ({
  sheet: one(sheets, {
    fields: [entries.sheetId],
    references: [sheets.id],
  }),
  creator: one(users, {
    fields: [entries.createdBy],
    references: [users.id],
  }),
}))

export const usersRelations = relations(users, ({ many }) => ({
  sheets: many(sheets),
  entries: many(entries),
}))

// API tokens 表
export const tokens = sqliteTable('tokens', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  token: text('token').notNull().unique(),
  userId: integer('user_id').references(() => users.id).notNull(),
  // 存储权限，如: ["read", "write"]
  permissions: text('permissions').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  expiresAt: integer('expires_at', { mode: 'timestamp_ms' }),
})
