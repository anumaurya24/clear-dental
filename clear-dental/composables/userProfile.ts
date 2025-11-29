// composables/useProfile.ts
export const useProfile = () => {
  const profile = useState<any | null>("profile", () => null)

  const loadProfile = async () => {
    const user = useSupabaseUser()
    if (!user.value) {
      profile.value = null
      return
    }

    try {
      const data = await $fetch("/api/users", {
        query: { self: "true" },
      })
      profile.value = data
    } catch (e) {
      console.error("Failed to load profile", e)
      profile.value = null
    }
  }

  return { profile, loadProfile }
}
