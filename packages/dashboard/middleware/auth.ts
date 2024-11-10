export default defineNuxtRouteMiddleware(async (to) => {
  const user = await useFetch('/api/auth/me')

  // 如果是首个用户且未登录，重定向到激活页面
  const isFirst = await useFetch('/api/auth/is-first-user')
  if (isFirst.data.value && !user.data.value) {
    return navigateTo('/activate')
  }

  // 未登录用户重定向到登录页
  if (!user.data.value && to.path !== '/login' && to.path !== '/register') {
    return navigateTo('/login')
  }

  // 已登录用户访问登录/注册页面，重定向到首页
  if (user.data.value && (to.path === '/login' || to.path === '/register')) {
    return navigateTo('/')
  }
})
