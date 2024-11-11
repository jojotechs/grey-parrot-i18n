import { clearServerSession } from '#auth'
import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  await clearServerSession(event)
  return { success: true }
})
