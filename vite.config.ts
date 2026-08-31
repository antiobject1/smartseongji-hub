
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const isGithubPages = process.env.GITHUB_PAGES === "true";

export default defineConfig({
  vite: {
    base: isGithubPages ? "/smartseongji-hub/" : "/",
  },
  // GitHub Pages 정적 배포: nitro(Cloudflare) 대신 Node 서버 빌드로
  // prerender가 동작하도록 하고, 라우트를 정적 HTML로 출력한다.
  nitro: isGithubPages ? false : undefined,
  tanstackStart: {
    prerender: {
      enabled: isGithubPages,
      crawlLinks: true,
      failOnError: false,
    },
    server: { entry: "server" },
  },
});
