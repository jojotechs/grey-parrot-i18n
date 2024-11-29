import type { H3Event } from 'h3'
import type { User } from './drizzle'
import { sql } from 'drizzle-orm'
import { createError } from 'h3'
import { UserRole } from '../database/schema'
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

// 验证 API Token
async function validateApiToken(token: string) {
  const db = useDrizzle()
  const apiToken = await db.query.tokens.findFirst({
    where: eq(tables.tokens.token, token),
  })

  if (!apiToken) {
    throw createError({
      statusCode: 401,
      message: 'Invalid token',
    })
  }

  // 检查是否过期
  if (apiToken.expiresAt && new Date(apiToken.expiresAt) < new Date()) {
    throw createError({
      statusCode: 401,
      message: 'Token expired',
    })
  }

  return apiToken
}

// 定义需要认证的路由处理器
export function defineAuthEventHandler<T>(
  handler: (event: H3Event, user: User) => Promise<T>,
  options?: {
    allowApiToken?: boolean // 是否允许使用 API Token
  },
) {
  return defineEventHandler(async (event) => {
    const db = useDrizzle()
    const log = useLogger()
    // 先尝试 API Token
    if (options?.allowApiToken) {
      const authHeader = getRequestHeader(event, 'Authorization')
      if (authHeader?.startsWith('Bearer ')) {
        try {
          const token = authHeader.replace('Bearer ', '')
          const apiToken = await validateApiToken(token)
          const user = await db.query.users.findFirst({
            where: eq(tables.users.id, apiToken.userId),
          })
          if (user) {
            return handler(event, user)
          }
        }
        catch (error) {
          // API Token 验证失败,继续尝试用户会话
          log.debug('API Token validation failed:', error)
        }
      }
    }

    // 回退到用户会话验证
    const user = await getUserFromEvent(event)
    return handler(event, user)
  })
}

// 定义需要管理员权限的路由处理器
export function defineAdminEventHandler<T>(
  handler: (event: H3Event, user: User) => Promise<T>,
  allowedRoles: string[] = [UserRole.Admin], // 默认只允许 admin
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
