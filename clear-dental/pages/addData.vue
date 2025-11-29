<script setup lang="ts">
// Load logged-in user from Supabase
const user = useSupabaseUser()

// Store profile result
const profile = ref(null)
const profileError = ref<string | null>(null)

// Load profile on mount
onMounted(async () => {
  try {
    profile.value = await $fetch("/api/users", {
      query: { self: "true" },
    })
  } catch (err: any) {
    console.error("Profile load error:", err)
    profileError.value =
      err?.data?.statusMessage || "Failed to load profile"
  }
})

/* ---------------------- ADD ENTRY FORM ---------------------- */
const form = reactive({
  title: "",
  details: "",
})

// pages/addData.vue
definePageMeta({
  middleware: ["auth"],
})

const success = ref(false)
const errorMsg = ref<string | null>(null)

async function addEntry() {
  errorMsg.value = null
  success.value = false

  try {
    await $fetch("/api/entries", {
      method: "POST",
      body: {
        title: form.title,
        details: form.details,
      },
    })

    success.value = true
    form.title = ""
    form.details = ""
  } catch (err: any) {
    console.error(err)
    errorMsg.value =
      err?.data?.statusMessage || "Failed to submit entry"
  }
}
</script>

<template>
  <Header />

  <div class="max-w-xl mx-auto mt-10 p-6 border rounded shadow flex flex-col gap-4">
    <h1 class="text-2xl font-bold">Add New Entry</h1>

    <!-- PROFILE ERROR -->
    <p v-if="profileError" class="text-red-500">{{ profileError }}</p>

    <div>
      <label class="block font-medium mb-1">Title</label>
      <input
        v-model="form.title"
        type="text"
        class="w-full border rounded px-3 py-2"
        placeholder="Short title"
      />
    </div>

    <div>
      <label class="block font-medium mb-1">Details</label>
      <textarea
        v-model="form.details"
        rows="3"
        class="w-full border rounded px-3 py-2"
        placeholder="More details"
      />
    </div>

    <button
      class="bg-green-600 text-white px-4 py-2 rounded w-fit"
      @click="addEntry"
    >
      Submit
    </button>

    <p v-if="success" class="text-green-600">Entry added successfully!</p>
    <p v-if="errorMsg" class="text-red-500">{{ errorMsg }}</p>
  </div>
</template>
