export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()
  const client = useSupabaseClient()

  // Public pages
  const publicPages = ['/login', '/signup']
  const isPublicPage = publicPages.includes(to.path)

  // If not logged in and trying to access protected page
  if (!user.value && !isPublicPage) {
    return navigateTo('/login')
  }

  // If logged in and trying to access auth pages
  if (user.value && isPublicPage) {
    return navigateTo('/')
  }

  // Check if user is banned
  if (user.value && !isPublicPage) {
    const { data: profile } = await client
      .from('profiles')
      .select('is_banned')
      .eq('id', user.value.id)
      .single()

    if (profile?.is_banned) {
      await client.auth.signOut()
      return navigateTo('/login?error=banned')
    }
  }
})
