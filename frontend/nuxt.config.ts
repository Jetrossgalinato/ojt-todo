import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },
  css: ["~/assets/css/tailwind.css", "~/assets/css/sonner.css"],

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:4000',
    },
  },

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        '@vueuse/core',
        'class-variance-authority',
        'clsx',
        'lucide-vue-next',
        'reka-ui',
        'tailwind-merge',
        'vue-sonner',
      ],
    },
  },

  modules: ["shadcn-nuxt", "@nuxtjs/color-mode", "@pinia/nuxt"],
  colorMode: {
    classSuffix: "",
  },
  shadcn: {
    prefix: "",
    componentDir: "@/components/ui",
  },
});