<script setup lang="ts">
const entries = ref<any[]>([])
const loading = ref(true)
const errorMsg = ref<string | null>(null)

// reactive form state – this will create a new row in "entries"
const formState = reactive({
  title: "",
  details: "",
})

// Protect this page with auth middleware
definePageMeta({
  middleware: ["auth"],
})

// Load entries from our dedicated /api/entries endpoint
const loadEntries = async () => {
  loading.value = true
  errorMsg.value = null

  try {
    // ✅ use /api/entries (GET), NOT /api/fetchData
    entries.value = await $fetch("/api/entries")
  } catch (err: any) {
    console.error("loadEntries error", err)
    errorMsg.value =
      err?.data?.statusMessage || "Failed to load entries from server"
  } finally {
    loading.value = false
  }
}

// Called when the user clicks "Submit"
async function submitForm() {
  if (!formState.title.trim()) {
    return
  }

  try {
    await $fetch("/api/entries", {
      method: "POST",
      body: {
        title: formState.title,
        details: formState.details,
      },
    })

    // clear form
    formState.title = ""
    formState.details = ""

    // reload list with the new entry
    await loadEntries()
  } catch (err: any) {
    console.error("submitForm error", err)
    errorMsg.value =
      err?.data?.statusMessage || "Failed to save entry to server"
  }
}

// initial load when page opens
onMounted(loadEntries)
</script>

<template>
  <Header />

  <div class="flex flex-col items-center justify-center gap-10 p-8">
    <!-- DISPLAY ENTRIES -->
    <div class="flex flex-col justify-center items-center gap-4 w-full max-w-2xl">
      <h2 class="text-2xl font-bold">Entries</h2>

      <div v-if="loading">Loading…</div>
      <div v-else-if="errorMsg" class="text-red-500">{{ errorMsg }}</div>

      <ul v-else class="w-full space-y-2">
        <li
          v-for="entry in entries"
          :key="entry.id"
          class="border rounded px-4 py-3"
        >
          <div class="font-semibold">{{ entry.title }}</div>
          <div class="text-xs text-gray-500">
            {{ new Date(entry.created_at).toLocaleString() }}
          </div>
          <p class="mt-1">{{ entry.details }}</p>
        </li>

        <li v-if="entries.length === 0" class="text-gray-400">
          No entries yet. Add one with the form below.
        </li>
      </ul>
    </div>

    <!-- FORM TO ADD ENTRY -->
    <div class="flex flex-col justify-center items-center gap-4 w-full max-w-2xl">
      <h2 class="text-2xl font-bold">Add Entry</h2>

      <div class="flex flex-col gap-3 w-full">
        <div>
          <label class="block mb-1 font-medium">Title</label>
          <input
            v-model="formState.title"
            type="text"
            placeholder="Short title"
            class="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label class="block mb-1 font-medium">Details</label>
          <textarea
            v-model="formState.details"
            rows="3"
            placeholder="More details (optional)"
            class="w-full border rounded px-3 py-2"
          />
        </div>

        <button
          class="bg-blue-500 text-white px-4 py-2 rounded-md self-start disabled:opacity-50"
          :disabled="loading"
          @click="submitForm"
        >
          Submit
        </button>
      </div>
    </div>
  </div>
</template>
