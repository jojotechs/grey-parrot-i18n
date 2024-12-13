<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
    <UCard class="w-full max-w-md">
      <template #header>
        <div class="flex flex-col items-center gap-2 py-4">
          <div class="text-3xl">🦜</div>
          <h1 class="text-xl font-bold">Grey Parrot i18n</h1>
          <p v-if="isFirstUser" class="text-primary-500 font-medium">
            👋 欢迎使用！请创建管理员账号
          </p>
          <p v-else class="text-gray-500 dark:text-gray-400">
            注册新账号
          </p>
        </div>
      </template>

      <UForm
        :schema="registerSchema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormGroup
          label="邮箱"
          name="email"
          required
        >
          <UInput
            v-model="state.email"
            type="email"
            placeholder="请输入邮箱"
          />
        </UFormGroup>

        <UFormGroup
          label="密码"
          name="password"
          required
        >
          <UInput
            v-model="state.password"
            type="password"
            placeholder="请输入密码"
          />
          <div class="mt-2 text-xs space-y-1">
            <div class="flex items-center gap-2">
              <div class="flex-1 h-1 bg-gray-200 rounded">
                <div
                  class="h-full rounded transition-all"
                  :class="[
                    passwordStrength === 0 ? 'w-0' : '',
                    passwordStrength === 1 ? 'w-1/4 bg-red-500' : '',
                    passwordStrength === 2 ? 'w-2/4 bg-yellow-500' : '',
                    passwordStrength === 3 ? 'w-3/4 bg-blue-500' : '',
                    passwordStrength === 4 ? 'w-full bg-green-500' : '',
                  ]"
                />
              </div>
              <span class="text-gray-500">{{ passwordStrengthText }}</span>
            </div>
            <ul class="space-y-1 text-gray-500">
              <li :class="{ 'text-green-500': hasLength }">✓ 至少8位字符</li>
              <li :class="{ 'text-green-500': hasUpperCase }">✓ 包含大写字母</li>
              <li :class="{ 'text-green-500': hasLowerCase }">✓ 包含小写字母</li>
              <li :class="{ 'text-green-500': hasNumber }">✓ 包含数字</li>
              <li :class="{ 'text-green-500': hasSpecial }">✓ 包含特殊字符</li>
            </ul>
          </div>
        </UFormGroup>

        <UFormGroup
          label="确认密码"
          name="confirmPassword"
          required
        >
          <UInput
            v-model="state.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
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
            {{ isFirstUser ? '创建管理员账号' : '注册' }}
          </UButton>
        </div>
      </UForm>

      <template #footer>
        <div class="text-center text-sm text-gray-500 dark:text-gray-400">
          已有账号? 
          <UButton
            to="/login"
            variant="link"
            color="primary"
          >
            立即登录
          </UButton>
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { registerSchema, type RegisterFormData } from '~/server/schemas/auth'
import type { FormSubmitEvent } from '#ui/types'

definePageMeta({
  layout: false,
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/',
  },
})

const { signIn } = useAuth()
const loading = ref(false)
const isFirstUser = ref(false)

// 表单状态
const state = reactive<RegisterFormData>({
  email: '',
  password: '',
  confirmPassword: '',
})

// 密码验证规则
const hasLength = computed(() => state.password.length >= 8)
const hasUpperCase = computed(() => /[A-Z]/.test(state.password))
const hasLowerCase = computed(() => /[a-z]/.test(state.password))
const hasNumber = computed(() => /[0-9]/.test(state.password))
const hasSpecial = computed(() => /[^A-Za-z0-9]/.test(state.password))

// 密码强度计算
const passwordStrength = computed(() => {
  let strength = 0
  if (hasLength.value) strength++
  if (hasUpperCase.value) strength++
  if (hasLowerCase.value) strength++
  if (hasNumber.value) strength++
  
  // 只有当包含特殊字符时才能达到最高等级
  if (hasSpecial.value) {
    return 4 // 非常强
  }
  
  // 其他情况最多达到"强"
  return Math.min(3, strength)
})

// 密码强度文本
const passwordStrengthText = computed(() => {
  switch (passwordStrength.value) {
    case 0:
      return '非常弱'
    case 1:
      return '弱'
    case 2:
      return '一般'
    case 3:
      return '强'
    case 4:
      return '非常强'
    default:
      return ''
  }
})

// 检查是否是第一个用户
const { data: initData } = await useAsyncData('check-init', () => 
  $fetch('/api/auth/check-init')
)
isFirstUser.value = !!initData.value?.needInit

async function onSubmit(event: FormSubmitEvent<RegisterFormData>) {
  try {
    loading.value = true
    
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: event.data,
    })

    // 注册成功后自动登录
    await signIn({
      email: event.data.email,
      password: event.data.password,
    }, { callbackUrl: '/' })

    useToast().add({
      title: isFirstUser.value ? '管理员账号创建成功' : '注册成功',
      description: '正在为您跳转...',
      color: 'green',
    })
  }
  catch (error: any) {
    useToast().add({
      title: '注册失败',
      description: error?.data?.message || '请检查输入是否正确',
      color: 'red',
    })
  }
  finally {
    loading.value = false
  }
}
</script> 