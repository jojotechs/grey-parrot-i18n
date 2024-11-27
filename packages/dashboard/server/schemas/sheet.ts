import { z } from 'zod'

export const sheetSchema = z.object({
  name: z.string().min(1, '请输入表名'),
  description: z.string().optional(),
  languages: z.array(z.string()).min(1, '请至少选择一种语言'),
})

export const entriesUpdateSchema = z.object({
  text: z.array(z.string()).min(1, '请输入文案'),
  currentLanguage: z.string().min(1, '请选择当前语言'),
})

export type SheetFormData = z.infer<typeof sheetSchema>
export type EntriesUpdateData = z.infer<typeof entriesUpdateSchema>
