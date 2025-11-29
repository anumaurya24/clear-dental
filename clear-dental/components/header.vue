<script setup lang="ts">
type Role = 'admin' | 'basic' | null

const user = useSupabaseUser()
const supabase = useSupabaseClient()

// shared across app so every page sees the same role
const role = useState<Role>('role', () => null)

const loadingProfile = ref(false)
const profileError = ref<string | null>(null)

/**
 * Load the current user's profile (role) from /api/users?self=true
 * This endpoint should look up profiles by user_id and return the row
 * for the currently authenticated user.
 */
const loadProfile = async () => {
  if (!user.value) return

  loadingProfile.value = true
  profileError.value = null

  try {
    const data = await $fetch<{ role: 'admin' | 'basic' }>('/api/users', {
      query: { self: 'true' },
    })

    // default to basic if something is off, but prefer the real role
    role.value = data?.role ?? 'basic'
  } catch (err) {
    console.error('failed to load profile in Header', err)
    profileError.value = 'Profile not found'
    role.value = 'basic'
  } finally {
    loadingProfile.value = false
  }
}

/**
 * React to auth changes:
 * - when logging in: fetch profile
 * - when logging out: clear role + state
 */
watch(
  user,
  (newUser) => {
    if (!newUser) {
      // logged out
      role.value = null
      profileError.value = null
      loadingProfile.value = false
      return
    }

    // logged in → fetch profile (only once per session)
    loadProfile()
  },
  { immediate: true }
)

const goLogin = () => navigateTo('/login')
const goSignup = () => navigateTo('/signup')

const logout = async () => {
  await supabase.auth.signOut()
  role.value = null
  await navigateTo('/login')
}
</script>

<template>
  <div class="flex flex-row justify-between w-full px-4 pt-4">
    <img
      src="/full_logo.png"
      alt="Clear Lakes Dental"
      class="w-[256px] h-[152px]"
    />

    <div class="flex flex-row gap-8 h-fit pt-16 items-center">
      <!-- MAIN NAV: always visible -->
      <h1
        class="text-3xl font-semibold border-2 border-[#a5dcb0] rounded-lg p-2 hover:bg-[#a5dcb0] hover:text-white cursor-pointer"
        @click="navigateTo('/')"
      >
        Main Page
      </h1>

      <!-- ADMIN-ONLY NAV ITEMS -->
      <template v-if="user && role === 'admin'">
        <h1
          class="text-3xl font-semibold border-2 border-[#9ad7db] rounded-lg p-2 hover:bg-[#9ad7db] hover:text-white cursor-pointer"
          @click="navigateTo('/addData')"
        >
          Add Data
        </h1>

        <h1
          class="text-3xl font-semibold border-2 border-[#f3b267] rounded-lg p-2 hover:bg-[#f3b267] hover:text-white cursor-pointer"
          @click="navigateTo('/users')"
        >
          Manage Users
        </h1>
      </template>

      <!-- SMALL STATUS ABOUT PROFILE LOADING / ERRORS -->
      <span v-if="user && loadingProfile" class="text-sm text-gray-500">
        Loading profile…
      </span>
      <span v-else-if="user && profileError" class="text-sm text-red-500">
        {{ profileError }}
      </span>

      <!-- AUTH BUTTONS -->
      <!-- When NOT logged in: Login + Sign Up -->
      <div v-if="!user" class="flex flex-row gap-4 ml-6">
        <button
          class="text-xl border-2 border-gray-400 rounded-lg px-4 py-2 hover:bg-gray-200"
          @click="goLogin"
        >
          Login
        </button>

        <button
          class="text-xl border-2 border-gray-400 rounded-lg px-4 py-2 hover:bg-gray-200"
          @click="goSignup"
        >
          Sign Up
        </button>
      </div>

      <!-- When logged in: Logout -->
      <button
        v-else
        class="text-xl border-2 border-red-400 rounded-lg px-4 py-2 hover:bg-red-400 hover:text-white ml-6"
        @click="logout"
      >
        Logout
      </button>
    </div>
  </div>
</template>
