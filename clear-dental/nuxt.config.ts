// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },

  modules: [
    "@nuxtjs/supabase",
    "@nuxtjs/tailwindcss",
  ],

  supabase: {
    redirect: false,

    // TEMP: hard-coded so we know Supabase is wired correctly
    url: "https://smyvwwdpobhfhcxbrrbl.supabase.co",
    key: "sb_publishable_FBpqqzTZ-rlNOv8H3BTVZQ_dOfR-SxW",
  },
});
