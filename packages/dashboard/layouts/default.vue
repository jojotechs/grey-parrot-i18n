<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
    <div class="flex flex-col h-[calc(100vh-2rem)] gap-4">
      <!-- 顶部导航栏 -->
      <UCard :ui="{ 
        body: {
          padding: '!py-3'
        }
       }">
        <div class="h-[40px] flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="font-bold text-lg">🦜 Grey Parrot i18n</div>
          </div>
          <div>
            <UDropdown
              :items="userMenuItems"
              :popper="{ placement: 'bottom-end' }"
            >
              <UButton
                color="gray"
                variant="ghost"
                class="gap-2"
              >
                <div class="i-heroicons-user-circle text-xl" />
                <span class="text-sm">{{ data?.email }}</span>
                <div class="i-heroicons-chevron-down text-sm" />
              </UButton>
            </UDropdown>
          </div>
        </div>
      </UCard>

      <!-- 主要内容区域 -->
      <div class="flex flex-1 gap-4 overflow-hidden p-[1px]">
        <!-- 左侧导航 -->
        <UCard class="w-64">
          <div class="h-full">
            <UVerticalNavigation
              :links="navigationLinks"
              :ui="{
                wrapper: 'space-y-2',
                base: 'group flex items-center gap-2 w-full p-2 rounded-md',
                active: 'text-primary-500 dark:text-primary-400 bg-primary-50 dark:bg-primary-950',
                inactive: 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }"
            />
          </div>
        </UCard>

        <!-- 主内容区 -->
        <UCard class="flex-1">
          <main class="h-full overflow-auto">
            <slot />
          </main>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { signOut, data } = useAuth()

// 用户菜单项
const userMenuItems = computed(() => [
  [
    {
      label: `角色：${data.value?.role}`,
      disabled: true,
    },
    {
      label: '登出',
      icon: 'i-heroicons-arrow-right-circle-20-solid',
      click: async () => {
        try {
          await signOut({callbackUrl: '/login'})
        }
        catch (error) {
          console.log(error)
          useToast().add({
            title: '登出失败',
            description: '稍后重试',
            color: 'red',
          })
        }
      },
    },
  ],
])

// 导航链接
const navigationLinks = computed(() => {
  const baseLinks = [
    {
      label: '仪表盘',
      icon: 'i-heroicons-home',
      to: '/'
    },
    {
      label: '多语言表',
      icon: 'i-heroicons-language',
      to: '/sheets'
    },
    // admin 专属链接
    ...(data.value?.role === 'admin' ? [{
      label: '用户管理',
      icon: 'i-heroicons-users',
      to: '/users'
    }] : []),
    {
      label: 'API Token',
      icon: 'i-heroicons-key',
      to: '/tokens'
    },
    {
      label: '设置',
      icon: 'i-heroicons-cog-6-tooth',
      to: '/settings'
    }
  ]

  return baseLinks
})
</script>

<style>
html, body {
  @apply h-full m-0;
}

#__nuxt {
  @apply h-full;
}
</style> 