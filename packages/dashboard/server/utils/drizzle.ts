import { drizzle } from 'drizzle-orm/d1'

import * as schema from '../database/schema'

export { and, eq, or, sql } from 'drizzle-orm'

export const tables = schema

export function useDrizzle() {
  return drizzle(hubDatabase(), { schema })
}

export type Database = ReturnType<typeof useDrizzle>

// 导出常用类型
export type User = typeof schema.users.$inferSelect
export type Sheet = typeof schema.sheets.$inferSelect
export type Entry = typeof schema.entries.$inferSelect
export type Token = typeof schema.tokens.$inferSelect

// 定义 API 返回的类型，languages 已经被解析为字符串数组
export type SheetWithParsedLanguages = Omit<Sheet, 'languages'> & {
  languages: string[]
  creator?: {
    email: string
  }
}
