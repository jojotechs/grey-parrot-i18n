import type { H3Event } from 'h3'
import type { User } from './drizzle'
import { sql } from 'drizzle-orm'
import { createError } from 'h3'
import { hash, verify } from './crypto'
import { tables, useDrizzle } from './drizzle'

// 密码加密
export async function hashPassword(password: string) {
  return await hash(password)
}

// 密码验证
export async function verifyPassword(hashedPassword: string, password: string) {
  return await verify(password, hashedPassword)
}

// 提取 token
export function extractToken(authorizationHeader: string) {
  // 匹配 Bearer token
  const matches = authorizationHeader.match(/^Bearer\s(\S.*)$/i)
  return matches ? matches[1].trim() : authorizationHeader
}

// 检查是否是首个用户
export async function isFirstUser(): Promise<boolean> {
  const db = useDrizzle()
  const userCount = await db.select({ count: sql<number>`count(*)` })
    .from(tables.users)
    .execute()

  return userCount[0].count === 0
}

// 从请求中获取用户信息
async function getUserFromEvent(event: H3Event) {
  try {
    // 从 cookie 中获取 token
    const token = getCookie(event, 'auth.token')

    const response = await $fetch('/api/auth/me', {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    })

    return response.user as User
  }
  catch (error) {
    console.error('Failed to fetch user:', error)
    throw createError({
      statusCode: 401,
      message: '未登录',
    })
  }
}

// 定义需要认证的路由处理器
export function defineAuthEventHandler<T>(handler: (event: H3Event, user: User) => Promise<T>) {
  return defineEventHandler(async (event) => {
    const user = await getUserFromEvent(event)
    return handler(event, user)
  })
}

// 定义需要管理员权限的路由处理器
export function defineAdminEventHandler<T>(
  handler: (event: H3Event, user: User) => Promise<T>,
  allowedRoles: string[] = ['admin'], // 默认只允许 admin
) {
  return defineEventHandler(async (event) => {
    const user = await getUserFromEvent(event)

    if (!allowedRoles.includes(user.role)) {
      throw createError({
        statusCode: 403,
        message: '权限不足',
      })
    }

    return handler(event, user)
  })
}
