export default {
  base: "./",
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: "index.html",
        login: "login.html",
        register: "register.html",
        profile: "profile.html",
        feed: "feed.html",
      },
    },
  },
};