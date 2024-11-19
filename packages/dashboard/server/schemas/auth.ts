import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string()
    .min(1, '请输入邮箱')
    .email('请输入有效的邮箱地址'),
  password: z.string()
    .min(8, '密码至少8位字符')
    .regex(/[A-Z]/, '密码必须包含大写字母')
    .regex(/[a-z]/, '密码必须包含小写字母')
    .regex(/\d/, '密码必须包含数字')
    .regex(/[^A-Z0-9]/i, '密码必须包含特殊字符'),
  confirmPassword: z.string()
    .min(1, '请确认密码'),
}).refine(data => data.password === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'],
})

export type RegisterFormData = z.infer<typeof registerSchema>
