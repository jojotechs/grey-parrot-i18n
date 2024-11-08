interface I18nMatch {
  text: string
  fullMatch: string
  start: number
  end: number
  lineNumber: number
  column: number
  params?: string
}

export function extractI18nText(content: string): I18nMatch[] {
  const regex = /\$tt\(\s*['"](.+?)['"](?:\s*,\s*(\{[^}]+\}))?\)/g
  const matches: I18nMatch[] = []

  let result
  // eslint-disable-next-line no-cond-assign
  while ((result = regex.exec(content)) !== null) {
    const beforeMatch = content.slice(0, result.index)
    const lineNumber = beforeMatch.split('\n').length
    const lastNewLine = beforeMatch.lastIndexOf('\n')
    const column = lastNewLine === -1 ? result.index : result.index - lastNewLine - 1

    matches.push({
      text: result[1],
      fullMatch: result[0],
      start: result.index,
      end: result.index + result[0].length,
      lineNumber,
      column,
      params: result[2],
    })
  }

  return matches
}

// 使用示例:
/* async function handleFile(filepath: string) {
  const content = await fs.readFile(filepath, 'utf-8')
  const matches = extractI18nText(content)

  // 输出提取结果示例
  matches.forEach((match) => {
    console.log(`
      文件: ${filepath}
      文本: ${match.text}
      位置: 第 ${match.lineNumber} 行, 第 ${match.column} 列
      完整匹配: ${match.fullMatch}
      替换范围: ${match.start}-${match.end}
      ${match.params ? `参数: ${match.params}` : ''}
    `)
  })

  // TODO: 后续可以基于这些信息进行替换操作
  // 例如: content.slice(0, match.start) + `$t('${key}')` + content.slice(match.end)
} */
