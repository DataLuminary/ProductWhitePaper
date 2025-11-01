import * as path from "node:path";
import { defineConfig } from "rspress/config";

export default defineConfig({
  root: path.join(__dirname, "docs"),
  title: "DataLuminary",
  icon: "/brand-logo.png",
  logo: {
    light: "/brand-logo.png",
    dark: "/brand-logo.png",
  },
  globalStyles: path.join(__dirname, "docs/styles/index.css"),
  themeConfig: {
    socialLinks: [
      {
        icon: "github",
        mode: "link",
        content: "https://github.com/DataLuminary",
      },
    ],
  },
});
