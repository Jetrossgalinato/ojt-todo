export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()
  authStore.restoreAuth()

  const isAuthenticated = authStore.isAuthenticated
  const publicPages = ['/login', '/register', '/forgot-password', '/reset-password']
  const isPublicPage = publicPages.includes(to.path)

  if (!isAuthenticated && !isPublicPage) {
    return showError(
      createError({
        statusCode: 404,
        statusMessage: 'Page Not Found',
        fatal: true,
      })
    )
  }

  if (isAuthenticated && isPublicPage) {
    return navigateTo('/dashboard')
  }
})