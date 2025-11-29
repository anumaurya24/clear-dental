// middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()

  // routes that do NOT require auth
  const publicRoutes = ['/login', '/signup']

  // if not logged in and trying to access a protected route → go to login
  if (!user.value && !publicRoutes.includes(to.path)) {
    return navigateTo('/login')
  }

  // if logged in and trying to go to login/signup → send home
  if (user.value && publicRoutes.includes(to.path)) {
    return navigateTo('/')
  }
})
