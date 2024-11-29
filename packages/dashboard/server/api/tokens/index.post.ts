import { nanoid } from 'nanoid'
import { z } from 'zod'
import { defineAdminEventHandler } from '~/server/utils/auth'
import { tables, useDrizzle } from '~/server/utils/drizzle'

const createTokenSchema = z.object({
  name: z.string().min(1, '请输入名称'),
})

export default defineAdminEventHandler(async (event, user) => {
  const body = await readBody(event)
  const data = createTokenSchema.parse(body)

  const db = useDrizzle()
  const token = nanoid(32)

  // 设置3年后过期
  const expiresAt = new Date()
  expiresAt.setFullYear(expiresAt.getFullYear() + 3)

  const [newToken] = await db.insert(tables.tokens)
    .values({
      name: data.name,
      token,
      userId: user.id,
      permissions: JSON.stringify(['write']),
      expiresAt,
    })
    .returning()

  return {
    ...newToken,
    token, // 只在创建时返回完整token
  }
}, ['admin', 'editor'])
