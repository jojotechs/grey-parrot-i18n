// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@nuxthub/core', '@sidebase/nuxt-auth'],
  hub: {
    database: true,
  },
  auth: {
    provider: {
      type: 'local',
      endpoints: {
        signIn: { path: '/api/auth/login', method: 'post' },
        signOut: { path: '/api/auth/logout', method: 'post' },
        signUp: { path: '/api/auth/register', method: 'post' },
        getSession: { path: '/api/auth/me', method: 'get' },
      },
      pages: {
        login: '/login',
      },
    },
    session: {
      enableSessionRefresh: true,
      strategyKey: 'user',
    },
  },
})
