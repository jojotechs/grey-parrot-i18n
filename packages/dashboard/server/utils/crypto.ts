const encoder = new TextEncoder()

export async function hash(password: string): Promise<string> {
  // 生成随机盐值
  const salt = crypto.getRandomValues(new Uint8Array(16))

  // 导入密码
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )

  // 使用 PBKDF2 生成密钥
  const key = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    256,
  )

  // 组合盐值和哈希结果
  const hashArray = new Uint8Array(salt.length + key.byteLength)
  hashArray.set(salt)
  hashArray.set(new Uint8Array(key), salt.length)

  // 转换为 base64 字符串
  return btoa(String.fromCharCode(...hashArray))
}

export async function verify(password: string, hash: string): Promise<boolean> {
  try {
    // 解码存储的哈希值
    const hashArray = new Uint8Array(
      atob(hash)
        .split('')
        .map(char => char.charCodeAt(0)),
    )

    // 提取盐值
    const salt = hashArray.slice(0, 16)
    const storedHash = hashArray.slice(16)

    // 重新计算哈希值
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits'],
    )

    const newKey = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      passwordKey,
      256,
    )

    // 比较哈希值
    const newHash = new Uint8Array(newKey)
    return storedHash.length === newHash.length
      && storedHash.every((value, index) => value === newHash[index])
  }
  catch {
    return false
  }
}
