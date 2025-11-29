export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()
  const client = useSupabaseClient()

  const publicPages = ['/login', '/signup']
  const isPublicPage = publicPages.includes(to.path)

  if (!user.value && !isPublicPage) {
    return navigateTo('/login')
  }

  if (user.value && isPublicPage) {
    return navigateTo('/')
  }

  // ✅ Correct column names here
  if (user.value && !isPublicPage) {
    const { data: profile, error } = await client
      .from('profiles')
      .select('banned')          // <- "banned"
      .eq('user_id', user.value.id) // <- compare with user_id
      .single()

    if (error) {
      console.error('banCheck error:', error)
    }

    if (profile?.banned) {
      await client.auth.signOut()
      return navigateTo('/login?error=banned')
    }
  }
})
