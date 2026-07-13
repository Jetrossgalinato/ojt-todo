export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()

  // Restore token from cookie (important on SSR / hard refresh)
  authStore.restoreAuth()

  const isAuthenticated = authStore.isAuthenticated

  // Pages na pwede pumunta kahit walang login
  const publicPages = ['/login', '/register', '/forgot-password', '/reset-password']
  const isPublicPage = publicPages.includes(to.path)

  // Case 1: Walang login pero pumupunta sa protected page (e.g. /dashboard)
  if (!isAuthenticated && !isPublicPage) {
    return navigateTo('/login')
  }

  // Case 2: May login na pero pumupunta pa rin sa /login or /register
  if (isAuthenticated && isPublicPage) {
    return navigateTo('/dashboard')
  }
})