import { relations, sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// 用户表
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role', { enum: ['admin', 'reader', 'editor'] }).notNull().default('reader'),
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

// 定义关联关系
export const sheetsRelations = relations(sheets, ({ one }) => ({
  creator: one(users, {
    fields: [sheets.createdBy],
    references: [users.id],
  }),
}))

export const usersRelations = relations(users, ({ many }) => ({
  sheets: many(sheets),
}))

// 文案条目表 - 每个 sheet 的具体文案内容
export const entries = sqliteTable('entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sheetId: integer('sheet_id').references(() => sheets.id).notNull(),
  key: text('key').notNull(), // 语义化 key
  originalText: text('original_text').notNull(), // 原始文案
  // 存储所有翻译，如: {"zh-CN": "你好", "en": "Hello"}
  translations: text('translations').notNull(),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().default(sql`CURRENT_TIMESTAMP`),
})

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
