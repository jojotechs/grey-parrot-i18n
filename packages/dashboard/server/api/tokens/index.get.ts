import { eq } from 'drizzle-orm'
import { defineAuthEventHandler } from '~/server/utils/auth'
import { tables, useDrizzle } from '~/server/utils/drizzle'

export default defineAuthEventHandler(async (event, user) => {
  const db = useDrizzle()

  const userTokens = await db.query.tokens.findMany({
    where: eq(tables.tokens.userId, user.id),
    orderBy: (tokens, { desc }) => [desc(tokens.createdAt)],
  })

  return userTokens
})
