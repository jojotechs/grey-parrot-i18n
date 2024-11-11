import { isFirstUser } from '~/server/utils/auth'

export default defineEventHandler(async () => {
  return {
    needInit: await isFirstUser(),
  }
})
