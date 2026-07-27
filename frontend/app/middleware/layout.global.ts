export default defineNuxtRouteMiddleware((to) => {
  if (
    to.path.startsWith('/dashboard') ||
    to.path.startsWith('/today') ||
    to.path.startsWith('/upcoming') ||
    to.path.startsWith('/completed') ||
    to.path.startsWith('/settings')
  ) {
    setPageLayout('default')
  }
})