import { defineStore } from 'pinia'

interface User {
  id: string
  email: string
  name: string | null
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null as string | null,
    user: null as User | null,
  }),

  actions: {
    setAuth(accessToken: string, user: User) {
      this.accessToken = accessToken
      this.user = user

      const token = useCookie('accessToken', { maxAge: 60 * 60 * 24 }) // 1 day
      token.value = accessToken
    },

    logout() {
      this.accessToken = null
      this.user = null

      const token = useCookie('accessToken')
      token.value = null
    },
  },
})