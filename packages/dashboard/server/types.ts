import type { User } from '~/server/utils/drizzle'

export type JWTTokenPayload = Omit<User, 'password' | 'createdAt'>
