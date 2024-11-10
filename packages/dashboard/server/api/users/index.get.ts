import { defineAdminEventHandler } from '~/server/utils/auth'

export default defineAdminEventHandler(async (event, user) => {
  const db = useDrizzle()
  const users = await db.query.users.findMany()

  return users.map(user => ({
    id: user.id,
    email: user.email,
    role: user.role,
  }))
})
