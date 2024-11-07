/**
 * 判断多语言格式是否kv格式
 * @param data 多语言数据
 * @returns { boolean }
 */
export function isKeyValueMessage(data: any, lang: string): boolean {
  if (typeof data?.[lang]?.message === 'object')
    return false

  return true
} 