// middleware/admin.ts
export default defineNuxtRouteMiddleware(async () => {
  const user = useSupabaseUser()
  const { profile, loadProfile } = useProfile()

  // If no user -> go to login
  if (!user.value) {
    return navigateTo("/login")
  }

  // Ensure profile is loaded
  if (!profile.value) {
    await loadProfile()
  }

  if (!profile.value || profile.value.role !== "admin") {
    // Not an admin -> send to main page
    return navigateTo("/")
  }
})
