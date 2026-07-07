<script>
export default {
  name: "Navbar",
  data() {
    return {
      searchQuery: "",
      isDark: false,
    };
  },
  mounted() {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
 
    this.isDark = stored ? stored === "dark" : prefersDark;
    this.applyTheme();
  },
  methods: {
    handleSearch() {
      this.$emit("search", this.searchQuery);
    },
    handleLogout() {
      this.$emit("logout");
    },
    toggleDarkMode() {
      this.isDark = !this.isDark;
      localStorage.setItem("theme", this.isDark ? "dark" : "light");
      this.applyTheme();
    },
    applyTheme() {
      document.documentElement.classList.toggle("dark", this.isDark);
    },
  },
};
</script>
<template>
  <nav
    class="flex items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900 sm:px-8 sm:py-4"
  >
    <div class="flex items-center gap-4 sm:gap-8">
      <span class="text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
        Todo
      </span>

      <div class="hidden items-center gap-6 sm:flex">
        <router-link
          to="/dashboard"
          class="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          active-class="text-gray-900 font-semibold dark:text-white"
        >
          Dashboard
        </router-link>
        <router-link
          to="/my-tasks"
          class="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          active-class="text-gray-900 font-semibold dark:text-white"
        >
          My Tasks
        </router-link>
      </div>
    </div>

    <div class="flex items-center gap-3 sm:gap-4">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Search tasks..."
        class="w-32 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-gray-500 sm:w-56"
        @keyup.enter="handleSearch"
      />
         <button
        class="flex items-center justify-center rounded-md p-1.5 text-gray-900 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
        @click="toggleDarkMode"
        title="Toggle dark mode"
      >
        <svg
          v-if="isDark"
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="M4.93 4.93l1.41 1.41" />
          <path d="M17.66 17.66l1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="M6.34 17.66l-1.41 1.41" />
          <path d="M19.07 4.93l-1.41 1.41" />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </button>

      <button
        class="flex items-center justify-center rounded-md p-1.5 text-gray-900 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
        @click="handleLogout"
        title="Logout"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </button>
    </div>
  </nav>
</template>

