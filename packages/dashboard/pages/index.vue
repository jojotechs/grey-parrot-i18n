<template>
  <div>
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold">欢迎使用 Grey Parrot i18n</h2>
        </div>
      </template>
      
      <div class="space-y-4">
        <p>这是一个全流程的多语言管理方案，帮助您轻松管理项目中的多语言内容。</p>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UCard>
            <template #header>
              <h3 class="font-bold">多语言表</h3>
            </template>
            <p>创建和管理您的多语言翻译表</p>
            <template #footer>
              <UButton
                to="/sheets"
                color="primary"
                variant="solid"
              >
                查看多语言表
              </UButton>
            </template>
          </UCard>

          <UCard>
            <template #header>
              <h3 class="font-bold">用户管理</h3>
            </template>
            <p>管理用户权限和访问控制</p>
            <template #footer>
              <UButton
                to="/users"
                color="primary"
                variant="solid"
              >
                管理用户
              </UButton>
            </template>
          </UCard>

          <UCard>
            <template #header>
              <h3 class="font-bold">API Token</h3>
            </template>
            <p>生成和管理 API Token</p>
            <template #footer>
              <UButton
                to="/tokens"
                color="primary"
                variant="solid"
              >
                管理 Token
              </UButton>
            </template>
          </UCard>
        </div>
      </div>
    </UCard>
  </div>
</template> 

<script lang="ts" setup>
definePageMeta({
  auth: true,
})
</script>
