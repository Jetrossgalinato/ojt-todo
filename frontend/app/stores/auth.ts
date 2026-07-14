import { defineStore } from "pinia"

interface User {
  id: string
  email: string
  name: string | null
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    accessToken: null as string | null,
    user: null as User | null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
  },

  actions: {
    setAuth(accessToken: string, user: User) {
      this.accessToken = accessToken
      this.user = user

      const token = useCookie("accessToken", {
        maxAge: 60 * 60 * 24,
        sameSite: "lax",
      })
      token.value = accessToken

      const userCookie = useCookie<User | null>("user", {
        maxAge: 60 * 60 * 24,
        sameSite: "lax",
      })
      userCookie.value = user
    },

    restoreAuth() {
      const token = useCookie("accessToken")
      const userCookie = useCookie<User | null>("user")
      if (token.value) {
        this.accessToken = token.value
        if (userCookie.value) {
          this.user = userCookie.value
        }
      }
    },

    logout() {
      this.accessToken = null
      this.user = null

      const token = useCookie("accessToken")
      token.value = null
      
      const userCookie = useCookie("user")
      userCookie.value = null
    },
  },
})
