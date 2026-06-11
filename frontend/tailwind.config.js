export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#081120",
        panel: "#0f1b33",
        panel2: "#13213d",
        primary: "#7c3aed",
        cyan: "#22d3ee",
        green: "#22c55e",
        pink: "#ec4899",
        text: "#e5eefc"
      },
      boxShadow: {
        glow: "0 0 30px rgba(124,58,237,.25)"
      }
    }
  },
  plugins: []
}