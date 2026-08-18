export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()
  authStore.restoreAuth()

  const isAuthenticated = authStore.isAuthenticated
  const publicPages = ['/login', '/register', '/forgot-password', '/reset-password', '/auth/callback']
  const isPublicPage = publicPages.includes(to.path)

  if (to.path === '/') {
    return navigateTo('/login')
  }

  const routeExists = to.matched.length > 0

  if (!isAuthenticated && !isPublicPage && routeExists) {
    return navigateTo({
      path: '/login',
      query: { toast: 'access-denied' },
      replace: true,
    })
  }

  if (isAuthenticated && isPublicPage) {
    return navigateTo('/dashboard')
  }
})
