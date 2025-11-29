<script setup lang="ts">
interface ProfileRow {
  id: string
  user_id: string
  email: string | null
  role: "basic" | "admin"
  banned: boolean
  created_at: string
}

const users = ref<ProfileRow[]>([])
const loading = ref(true)
const errorMsg = ref<string | null>(null)
const successMsg = ref<string | null>(null)

const loadUsers = async () => {
  loading.value = true
  errorMsg.value = null
  successMsg.value = null
  try {
    users.value = await $fetch<ProfileRow[]>("/api/users")
  } catch (err: any) {
    console.error(err)
    errorMsg.value = err?.data?.statusMessage || "Failed to load users"
  } finally {
    loading.value = false
  }
}

const updateUser = async (userId: string, payload: Partial<ProfileRow>) => {
  errorMsg.value = null
  successMsg.value = null
  try {
    await $fetch("/api/users", {
      method: "PATCH",
      body: {
        userId,
        role: payload.role,
        banned: payload.banned,
      },
    })
    successMsg.value = "User updated"
    await loadUsers()
  } catch (err: any) {
    console.error(err)
    errorMsg.value = err?.data?.statusMessage || "Failed to update user"
  }
}

const toggleBanned = (row: ProfileRow) =>
  updateUser(row.user_id, { banned: !row.banned })

const makeAdmin = (row: ProfileRow) =>
  updateUser(row.user_id, { role: "admin" })

const makeBasic = (row: ProfileRow) =>
  updateUser(row.user_id, { role: "basic" })

onMounted(loadUsers)
</script>

<template>
  <Header />

  <main class="p-8">
    <h1 class="text-2xl font-bold mb-4">User Management</h1>

    <div v-if="loading">Loading…</div>
    <div v-else>
      <p v-if="errorMsg" class="text-red-500 mb-2">{{ errorMsg }}</p>
      <p v-if="successMsg" class="text-green-600 mb-2">{{ successMsg }}</p>

      <table class="min-w-full border">
        <thead class="bg-gray-100">
          <tr>
            <th class="border px-3 py-2 text-left">User ID</th>
            <th class="border px-3 py-2 text-left">Email</th> <!-- NEW -->
            <th class="border px-3 py-2 text-left">Role</th>
            <th class="border px-3 py-2 text-left">Status</th>
            <th class="border px-3 py-2 text-left">Created</th>
            <th class="border px-3 py-2 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="u in users" :key="u.id" class="even:bg-gray-50">
            <td class="border px-3 py-2 font-mono text-xs">
              {{ u.user_id }}
            </td>

            <td class="border px-3 py-2 text-sm"> <!-- NEW -->
              {{ u.email || "—" }}
            </td>

            <td class="border px-3 py-2 capitalize">
              {{ u.role }}
            </td>

            <td class="border px-3 py-2">
              <span
                :class="[
                  'px-2 py-1 rounded text-xs',
                  u.banned ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700',
                ]"
              >
                {{ u.banned ? "Banned" : "Active" }}
              </span>
            </td>

            <td class="border px-3 py-2 text-xs">
              {{ new Date(u.created_at).toLocaleString() }}
            </td>

            <td class="border px-3 py-2 space-x-2">
              <button
                class="px-2 py-1 rounded text-xs bg-yellow-500 text-white"
                @click="toggleBanned(u)"
              >
                {{ u.banned ? "Unban" : "Ban" }}
              </button>

              <button
                v-if="u.role !== 'admin'"
                class="px-2 py-1 rounded text-xs bg-blue-500 text-white"
                @click="makeAdmin(u)"
              >
                Make Admin
              </button>

              <button
                v-else
                class="px-2 py-1 rounded text-xs bg-gray-500 text-white"
                @click="makeBasic(u)"
              >
                Make Basic
              </button>
            </td>
          </tr>

          <tr v-if="users.length === 0">
            <td colspan="6" class="border px-3 py-2 text-center text-gray-500">
              No users found. Make sure profiles exist for your auth users.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</template>
