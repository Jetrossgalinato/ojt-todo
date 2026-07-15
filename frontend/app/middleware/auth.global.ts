export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()
  authStore.restoreAuth()

  const isAuthenticated = authStore.isAuthenticated
  const publicPages = ['/login', '/register', '/forgot-password', '/reset-password']
  const isPublicPage = publicPages.includes(to.path)

  if (!isAuthenticated && !isPublicPage) {
    return navigateTo('/login')
  }

  if (isAuthenticated && isPublicPage) {
    return navigateTo('/dashboard')
  }

  if (to.path === '/') {
    return navigateTo(isAuthenticated ? '/dashboard' : '/login')
  }
})