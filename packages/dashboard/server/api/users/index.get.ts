import { defineAdminEventHandler } from '~/server/utils/auth'
import { useDrizzle } from '~/server/utils/drizzle'

export default defineAdminEventHandler(async (event, user) => {
  const db = useDrizzle()

  try {
    const users = await db.query.users.findMany({
      columns: {
        id: true,
        email: true,
        role: true,
      },
    })

    return users
  }
  catch (error) {
    console.error('Failed to fetch users:', error)
    throw createError({
      statusCode: 500,
      message: '获取用户列表失败',
    })
  }
})
