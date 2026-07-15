<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useTasks } from "~/composables/useTasks"
import { useAuthStore } from "~/stores/auth.store"

const { getProfile, updateProfile, deleteAccount, changePassword, getPreferences, updatePreferences } = useTasks()
const authStore = useAuthStore()
const colorMode = useColorMode()

const profileLoading = ref(true)
const profileName = ref("")
const profileEmail = ref("")
const profileCreatedAt = ref("")
const profileSaving = ref(false)
const profileMsg = ref("")

const pwCurrent = ref("")
const pwNew = ref("")
const pwSaving = ref(false)
const pwMsg = ref("")

const prefsSaving = ref(false)
const prefsMsg = ref("")
const darkMode = ref(false)
const emailNotifications = ref(false)
const defaultView = ref("dashboard")

const deleteOpen = ref(false)
const deletePassword = ref("")
const deleteSaving = ref(false)
const deleteMsg = ref("")

onMounted(async () => {
  if (!authStore.accessToken) return navigateTo("/login")
  try {
    const [p, prefs] = await Promise.all([getProfile(), getPreferences()])
    profileName.value = p.name ?? ""
    profileEmail.value = p.email
    profileCreatedAt.value = p.createdAt
    defaultView.value = prefs.defaultView ?? "dashboard"
    emailNotifications.value = prefs.emailNotifications ?? false
    darkMode.value = colorMode.value === "dark"
  } catch (err) {
    console.error("Failed to load settings:", err)
  } finally {
    profileLoading.value = false
  }
})

async function saveProfile() {
  profileSaving.value = true
  profileMsg.value = ""
  try {
    const updated = await updateProfile({ name: profileName.value, email: profileEmail.value })
    profileMsg.value = "Profile updated"
    if (updated.name && authStore.user) authStore.user.name = updated.name
  } catch (err: any) {
    profileMsg.value = err?.data?.message ?? "Failed to update profile"
  } finally {
    profileSaving.value = false
  }
}

async function savePassword() {
  if (pwNew.value.length < 8) {
    pwMsg.value = "Password must be at least 8 characters"
    return
  }
  pwSaving.value = true
  pwMsg.value = ""
  try {
    await changePassword({ currentPassword: pwCurrent.value, newPassword: pwNew.value })
    pwMsg.value = "Password updated"
    pwCurrent.value = ""
    pwNew.value = ""
  } catch (err: any) {
    pwMsg.value = err?.data?.message ?? "Failed to update password"
  } finally {
    pwSaving.value = false
  }
}

function toggleDarkMode() {
  darkMode.value = !darkMode.value
  colorMode.preference = darkMode.value ? "dark" : "light"
  savePrefs()
}

async function savePrefs() {
  prefsSaving.value = true
  prefsMsg.value = ""
  try {
    await updatePreferences({
      defaultView: defaultView.value,
      emailNotifications: emailNotifications.value,
    })
    prefsMsg.value = "Preferences saved"
  } catch (err: any) {
    prefsMsg.value = err?.data?.message ?? "Failed to save preferences"
  } finally {
    prefsSaving.value = false
  }
}

async function handleDeleteAccount() {
  if (!deletePassword.value) return
  deleteSaving.value = true
  deleteMsg.value = ""
  try {
    await deleteAccount(deletePassword.value)
    authStore.logout()
    navigateTo("/login")
  } catch (err: any) {
    deleteMsg.value = err?.data?.message ?? "Failed to delete account"
  } finally {
    deleteSaving.value = false
  }
}

function getInitials(name: string | null): string {
  if (!name) return "?"
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
}
</script>

<template>
  <div class="flex flex-col gap-6 p-4 sm:p-8 max-w-3xl mx-auto w-full">
    <div>
      <h1 class="text-2xl font-semibold text-foreground">Settings</h1>
      <p class="text-sm text-muted-foreground mt-1">Manage your account</p>
    </div>

    <div v-if="profileLoading" class="text-center py-10 text-sm text-muted-foreground">Loading...</div>

    <template v-else>
      <!-- Profile -->
      <div class="rounded-xl border border-border bg-white shadow-sm p-6 animate-card-in stagger-1">
        <h2 class="text-base font-semibold text-foreground mb-4">Profile</h2>
        <div class="flex items-start gap-5">
          <div class="flex flex-col items-center gap-2">
            <div class="w-16 h-16 rounded-full bg-teal-700 text-white flex items-center justify-center text-lg font-bold">
              {{ getInitials(profileName || profileEmail) }}
            </div>
            <button class="text-xs text-teal-700 hover:underline cursor-pointer transition-colors">
              Change photo
            </button>
          </div>
          <div class="flex-1 flex flex-col gap-3 max-w-sm">
            <div class="flex flex-col gap-1">
              <label class="text-sm text-foreground">Name</label>
              <input
                v-model="profileName"
                type="text"
                class="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-teal-500 transition-colors duration-150"
                placeholder="Your name"
              >
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-sm text-foreground">Email</label>
              <input
                v-model="profileEmail"
                type="email"
                class="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-teal-500 transition-colors duration-150"
              >
            </div>
            <p class="text-xs text-muted-foreground">
              Member since {{ profileCreatedAt ? new Date(profileCreatedAt).toLocaleDateString() : "" }}
            </p>
            <div class="flex items-center gap-2">
              <Button
                @click="saveProfile"
                :disabled="profileSaving"
                class="rounded-lg px-4 py-1.5 text-xs h-auto bg-teal-700 hover:bg-teal-800 text-white border-0 animate-btn-press"
              >
                {{ profileSaving ? "Saving..." : "Save profile" }}
              </Button>
              <span v-if="profileMsg" class="text-xs text-emerald-600">{{ profileMsg }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Password -->
      <div class="rounded-xl border border-border bg-white shadow-sm p-6 animate-card-in stagger-2">
        <h2 class="text-base font-semibold text-foreground mb-4">Password</h2>
        <div class="flex flex-col gap-3 max-w-sm">
          <div class="flex flex-col gap-1">
            <label class="text-sm text-foreground">Current password</label>
            <input
              v-model="pwCurrent"
              type="password"
              class="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-teal-500 transition-colors duration-150"
              placeholder="Enter current password"
            >
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm text-foreground">New password</label>
            <input
              v-model="pwNew"
              type="password"
              class="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-teal-500 transition-colors duration-150"
              placeholder="Enter new password"
            >
          </div>
          <div class="flex items-center gap-2">
            <Button
              @click="savePassword"
              :disabled="pwSaving"
              class="rounded-lg px-4 py-1.5 text-xs h-auto bg-teal-700 hover:bg-teal-800 text-white border-0 animate-btn-press"
            >
              {{ pwSaving ? "Saving..." : "Update password" }}
            </Button>
            <span v-if="pwMsg" class="text-xs" :class="pwMsg.includes('Failed') ? 'text-rose-600' : 'text-emerald-600'">{{ pwMsg }}</span>
          </div>
        </div>
      </div>

      <!-- Preferences -->
      <div class="rounded-xl border border-border bg-white shadow-sm p-6 animate-card-in stagger-3">
        <h2 class="text-base font-semibold text-foreground mb-4">Preferences</h2>
        <div class="flex flex-col gap-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-foreground">Dark mode</p>
              <p class="text-xs text-muted-foreground">Switch to a darker theme</p>
            </div>
            <button
              @click="toggleDarkMode"
              class="relative inline-flex h-6 w-11 items-center rounded-full animate-toggle-track"
              :class="darkMode ? 'bg-teal-700' : 'bg-gray-300'"
            >
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white animate-toggle-knob shadow-sm"
                :class="darkMode ? 'translate-x-6' : 'translate-x-1'"
              ></span>
            </button>
          </div>

          <div class="h-px bg-border"></div>

          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-foreground">Email notifications</p>
              <p class="text-xs text-muted-foreground">Get reminders for due tasks</p>
            </div>
            <button
              @click="emailNotifications = !emailNotifications; savePrefs()"
              class="relative inline-flex h-6 w-11 items-center rounded-full animate-toggle-track"
              :class="emailNotifications ? 'bg-teal-700' : 'bg-gray-300'"
            >
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white animate-toggle-knob shadow-sm"
                :class="emailNotifications ? 'translate-x-6' : 'translate-x-1'"
              ></span>
            </button>
          </div>

          <div class="h-px bg-border"></div>

          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-foreground">Default view</p>
              <p class="text-xs text-muted-foreground">Page shown after login</p>
            </div>
            <select
              v-model="defaultView"
              @change="savePrefs()"
              class="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-teal-500 transition-colors duration-150"
            >
              <option value="dashboard">My tasks</option>
              <option value="today">Today</option>
              <option value="upcoming">Upcoming</option>
            </select>
          </div>

          <span v-if="prefsMsg" class="text-xs text-emerald-600">{{ prefsMsg }}</span>
        </div>
      </div>

      <!-- Danger zone -->
      <div class="rounded-xl border-2 border-rose-200 bg-white shadow-sm p-6 animate-card-in stagger-4">
        <h2 class="text-base font-semibold text-rose-600 mb-1">Delete account</h2>
        <p class="text-sm text-muted-foreground mb-4">Permanently delete your account and all tasks</p>

        <template v-if="!deleteOpen">
          <Button
            variant="outline"
            @click="deleteOpen = true"
            class="rounded-lg px-4 py-1.5 text-xs h-auto border-rose-300 text-rose-600 hover:bg-rose-50 animate-btn-press"
          >
            Delete account
          </Button>
        </template>

        <template v-else>
          <div class="flex flex-col gap-3 max-w-sm animate-modal-in">
            <p class="text-xs text-rose-600">Type your password to confirm:</p>
            <input
              v-model="deletePassword"
              type="password"
              class="rounded-lg border border-rose-300 bg-background px-3 py-2 text-sm outline-none focus:border-rose-500 transition-colors duration-150"
              placeholder="Confirm password"
              :class="deleteMsg ? 'animate-shake' : ''"
            >
            <div class="flex items-center gap-2">
              <Button
                @click="handleDeleteAccount"
                :disabled="deleteSaving || !deletePassword"
                class="rounded-lg px-4 py-1.5 text-xs h-auto bg-rose-600 hover:bg-rose-700 text-white border-0 animate-btn-press"
              >
                {{ deleteSaving ? "Deleting..." : "Yes, delete my account" }}
              </Button>
              <Button
                variant="ghost"
                @click="deleteOpen = false; deletePassword = ''; deleteMsg = ''"
                class="rounded-lg px-4 py-1.5 text-xs h-auto animate-btn-press"
              >
                Cancel
              </Button>
            </div>
            <span v-if="deleteMsg" class="text-xs text-rose-600 animate-shake">{{ deleteMsg }}</span>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>
