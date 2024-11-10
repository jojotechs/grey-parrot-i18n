import { defineAuthEventHandler } from '~/server/utils/auth'

export default defineAuthEventHandler(async (event, user) => {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
  }
})
