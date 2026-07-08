import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["~/assets/css/tailwind.css"],

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:4000',
    },
  },

  vite: {
    plugins: [tailwindcss()],
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