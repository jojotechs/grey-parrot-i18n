import type { User } from '~/server/utils/drizzle'

export function useUsers() {
  // 获取用户列表
  const { data: users, error, refresh } = useFetch<User[]>('/api/users')

  // 角色映射
  const roleMap: Record<string, string> = {
    admin: '管理员',
    reader: '只读用户',
    editor: '编辑者',
  }

  const roleOptions = [
    { value: 'admin', label: '管理员' },
    { value: 'editor', label: '编辑者' },
    { value: 'reader', label: '只读用户' },
  ]

  // 检查是否是最后一个管理员
  function isLastAdmin(user: User) {
    const adminCount = users.value?.filter(u => u.role === 'admin').length || 0
    return user.role === 'admin' && adminCount <= 1
  }

  // 更新用户角色
  async function updateUserRole(userId: number, role: string) {
    await $fetch(`/api/users/${userId}/role`, {
      method: 'PUT',
      body: { role },
    })
    await refresh()
  }

  // 删除用户
  async function deleteUser(userId: number) {
    await $fetch(`/api/users/${userId}`, {
      method: 'DELETE',
    })
    await refresh()
  }

  return {
    users,
    error,
    refresh,
    roleMap,
    roleOptions,
    isLastAdmin,
    updateUserRole,
    deleteUser,
  }
}
