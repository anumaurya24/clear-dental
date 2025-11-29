<script setup lang="ts">
const supabase = useSupabaseClient()
const loading = ref(false)
const errorMsg = ref<string | null>(null)

const form = reactive({
  email: '',
  password: '',
})

const submit = async () => {
  loading.value = true
  errorMsg.value = null

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (error) throw error

    await navigateTo('/')
  } catch (err: any) {
    errorMsg.value = err.message || 'Login failed'
  } finally {
    loading.value = false
  }
}  



   try {
  // some $fetch or login
} catch (err: any) {
  if (err?.data?.statusCode === 403) {
    errorMsg.value = "Your account has been banned. Please contact support."
  } else {
    errorMsg.value = err?.data?.statusMessage || "Something went wrong."
  }
}

</script>

<template>
  <main class="min-h-screen flex items-center justify-center">
    <div class="border rounded p-8 w-full max-w-md space-y-4">
      <h1 class="text-2xl font-bold">Log In</h1>

      <div v-if="errorMsg" class="text-red-500 text-sm">{{ errorMsg }}</div>

      <form class="space-y-3" @submit.prevent="submit">
        <div>
          <label class="block mb-1">Email</label>
          <input
            v-model="form.email"
            type="email"
            required
            class="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label class="block mb-1">Password</label>
          <input
            v-model="form.password"
            type="password"
            required
            class="w-full border rounded px-3 py-2"
          />
        </div>

        <button
          type="submit"
          class="w-full bg-blue-600 text-white rounded py-2 disabled:opacity-60"
          :disabled="loading"
        >
          {{ loading ? 'Logging in…' : 'Log In' }}
        </button>
      </form>

      <p class="text-sm">
        Don’t have an account?
        <NuxtLink class="text-blue-600 underline" to="/signup">Sign up</NuxtLink>
      </p>
    </div>
  </main>
</template>
