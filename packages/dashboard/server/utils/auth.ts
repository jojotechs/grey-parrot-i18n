import type { H3Event } from 'h3'
import type { User } from './drizzle'
import { useSession } from '@nuxthub/core'
import { hash, verify } from 'argon2'
import { eq, sql } from 'drizzle-orm'
import { createError } from 'h3'
import { tables, useDrizzle } from './drizzle'

// 密码加密
export async function hashPassword(password: string) {
  return await hash(password)
}

// 密码验证
export async function verifyPassword(hashedPassword: string, password: string) {
  return await verify(hashedPassword, password)
}

// 从请求中获取用户信息
export async function useAuth(event: H3Event): Promise<User> {
  const session = await useSession(event)
  if (!session?.data?.userId) {
    throw createError({
      statusCode: 401,
      message: '未登录',
    })
  }

  const db = useDrizzle()
  const user = await db.query.users.findFirst({
    where: eq(tables.users.id, session.data.userId),
  })

  if (!user) {
    throw createError({
      statusCode: 401,
      message: '用户不存在',
    })
  }

  return user
}

// 检查是否是首个用户
export async function isFirstUser(): Promise<boolean> {
  const db = useDrizzle()
  const userCount = await db.select({ count: sql<number>`count(*)` })
    .from(tables.users)
    .execute()

  return userCount[0].count === 0
}

// 定义需要认证的路由处理器
export function defineAuthEventHandler<T>(handler: (event: H3Event, user: User) => Promise<T>) {
  return defineEventHandler(async (event) => {
    const user = await useAuth(event)
    return handler(event, user)
  })
}

// 定义需要管理员权限的路由处理器
export function defineAdminEventHandler<T>(handler: (event: H3Event, user: User) => Promise<T>) {
  return defineEventHandler(async (event) => {
    const user = await useAuth(event)
    if (user.role !== 'admin') {
      throw createError({
        statusCode: 403,
        message: '需要管理员权限',
      })
    }
    return handler(event, user)
  })
}

// 定义公开路由处理器
export function definePublicEventHandler<T>(handler: (event: H3Event) => Promise<T>) {
  return defineEventHandler(handler)
}
