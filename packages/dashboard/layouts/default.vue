<template>
  <div class="h-screen flex flex-col">
    <!-- 顶部导航栏 -->
    <header class="h-[60px] border-b px-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="font-bold text-lg">🦜 Grey Parrot i18n</div>
      </div>
      <div>
        <UButton
          color="gray"
          variant="ghost"
          icon="i-heroicons-user-circle"
        />
      </div>
    </header>

    <!-- 主要内容区域 -->
    <div class="flex flex-1 overflow-hidden">
      <!-- 左侧导航 -->
      <aside class="w-64 border-r border-gray-200 dark:border-gray-800 p-4 overflow-y-auto">
        <UVerticalNavigation
          :links="navigationLinks"
          :ui="{
            wrapper: 'space-y-2',
            base: 'group flex items-center gap-2 w-full p-2 rounded-md',
            active: 'text-primary-500 dark:text-primary-400 bg-primary-50 dark:bg-primary-950',
            inactive: 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
          }"
        />
      </aside>

      <!-- 主内容区 -->
      <main class="flex-1 overflow-auto p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const navigationLinks = [
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
  {
    label: '用户管理',
    icon: 'i-heroicons-users',
    to: '/users'
  },
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
</script>

<style>
html, body {
  @apply h-full m-0;
}

#__nuxt {
  @apply h-full;
}
</style> 