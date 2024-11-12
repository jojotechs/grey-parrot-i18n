<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
    <UCard class="w-full max-w-md">
      <template #header>
        <div class="flex flex-col items-center gap-2 py-4">
          <div class="text-3xl">🦜</div>
          <h1 class="text-xl font-bold">Grey Parrot i18n</h1>
          <p class="text-gray-500 dark:text-gray-400">
            登录以继续使用
          </p>
        </div>
      </template>

      <form class="space-y-4" @submit.prevent="handleLogin">
        <UFormGroup
          label="邮箱"
          name="email"
          required
        >
          <UInput
            v-model="form.email"
            type="email"
            placeholder="请输入邮箱"
            :ui="{ 
              wrapper: 'relative flex-1',
              base: 'relative block w-full',
              input: 'w-full'
            }"
            required
          />
        </UFormGroup>

        <UFormGroup
          label="密码"
          name="password"
          required
        >
          <UInput
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            :ui="{
              wrapper: 'relative flex-1',
              base: 'relative block w-full',
              input: 'w-full'
            }"
            required
          />
        </UFormGroup>

        <div class="pt-4">
          <UButton
            type="submit"
            color="primary"
            variant="solid"
            block
            :loading="loading"
          >
            登录
          </UButton>
        </div>
      </form>

      <template #footer>
        <div class="text-center text-sm text-gray-500 dark:text-gray-400">
          还没有账号? 
          <UButton
            to="/register"
            variant="link"
            color="primary"
          >
            注册新账号
          </UButton>
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/',
  },
})

const { signIn } = useAuth()
const loading = ref(false)
const form = reactive({
  email: '',
  password: '',
})

async function handleLogin() {
  try {
    loading.value = true
    await signIn({
      email: form.email,
      password: form.password,
    }, {
      callbackUrl: '/',
      redirect: true,
    })
  }
  catch (error: any) {
    useToast().add({
      title: '登录失败',
      description: error?.data?.message || '请检查邮箱和密码是否正确',
      color: 'red',
    })
  }
  finally {
    loading.value = false
  }
}
</script> 