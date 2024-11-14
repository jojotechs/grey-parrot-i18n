import { z } from 'zod'

export const sheetSchema = z.object({
  name: z.string().min(1, '请输入表名'),
  description: z.string().optional(),
  languages: z.array(z.string()).min(1, '请至少选择一种语言'),
})

export type SheetFormData = z.infer<typeof sheetSchema>
