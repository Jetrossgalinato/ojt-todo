export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()
  authStore.restoreAuth()

  const isAuthenticated = authStore.isAuthenticated
  const publicPages = ['/login', '/register', '/forgot-password', '/reset-password']
  const isPublicPage = publicPages.includes(to.path)

  if (!isAuthenticated && !isPublicPage) {
    return navigateTo({ path: '/login', query: { toast: 'access-denied' } })
  }

  if (isAuthenticated && isPublicPage) {
    return navigateTo({ path: '/dashboard', query: { toast: 'already-logged-in' } })
  }
})