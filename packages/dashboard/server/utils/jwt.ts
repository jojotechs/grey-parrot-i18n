import * as jose from 'jose'
import { JWT_SECRET } from './constant'

const secret = new TextEncoder().encode(JWT_SECRET)

export async function signToken(payload: any, expiresIn: string | number) {
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(expiresIn)
    .sign(secret)
}

export async function verifyToken<T = any>(token: string): Promise<T> {
  try {
    const { payload } = await jose.jwtVerify(token, secret)
    return payload as T
  }
  catch (error) {
    throw createError({
      statusCode: 401,
      message: '无效的token',
    })
  }
}
