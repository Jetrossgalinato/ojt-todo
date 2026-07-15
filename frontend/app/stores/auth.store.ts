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

  getters: {
    isLoggedIn: (state) => !!state.accessToken,
  },

  actions: {
    initFromCookie() {
      const cookie = useCookie<string | null>('accessToken')
      if (cookie.value) {
        this.accessToken = cookie.value
      }
    },

    setAuth(accessToken: string, user: User) {
      this.accessToken = accessToken
      this.user = user

      const token = useCookie('accessToken', { maxAge: 60 * 60 * 24 })
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
