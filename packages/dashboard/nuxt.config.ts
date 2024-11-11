// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@nuxthub/core', '@sidebase/nuxt-auth'],
  hub: {
    database: true,
  },
  build: {
    transpile: ['jsonwebtoken'],
  },
  auth: {
    provider: {
      type: 'local',
      endpoints: {
        signIn: { path: '/login', method: 'post' },
        signOut: { path: '/logout', method: 'post' },
        signUp: { path: '/register', method: 'post' },
        getSession: { path: '/me', method: 'get' },
      },
      pages: {
        login: '/login',
      },
      token: {
        signInResponseTokenPointer: '/token/accessToken',
        type: 'Bearer',
        headerName: 'Authorization',
        maxAgeInSeconds: 30 * 60, // 30 minutes
      },
      session: {
        dataType: {
          id: 'number',
          email: 'string',
          role: `admin | reader | editor`,
        },
        dataResponsePointer: '/user',
      },
      refresh: {
        isEnabled: true,
        endpoint: { path: '/refresh', method: 'post' },
        token: {
          signInResponseRefreshTokenPointer: '/token/refreshToken',
        },
      },
    },
    globalAppMiddleware: {
      isEnabled: true,
    },
  },
})
