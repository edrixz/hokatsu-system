// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  future: {
    compatibilityVersion: 4,
  },
  css: ["./app/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss()],
  },
  modules: ["@nuxtjs/supabase", "shadcn-nuxt"],
  supabase: {
    redirect: false,
  },
  runtimeConfig: {
    public: {
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
    },
  },
  shadcn: {
    prefix: "",
    componentDir: "./app/components/ui",
  },
  hooks: {
    "components:dirs"(dirs) {
      for (const dir of dirs) {
        if (typeof dir === "object" && dir.path?.includes("components/ui")) {
          dir.extensions = ["vue"];
        }
      }
    },
  },
});
