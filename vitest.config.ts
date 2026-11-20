import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      // Tests import the site's server modules outside a React Server Components bundler.
      "server-only": path.resolve(import.meta.dirname, "node_modules/server-only/empty.js"),
    },
  },
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    // next/link adds the trailing slash (next.config.ts: trailingSlash) only when Next.js sets this.
    env: { __NEXT_TRAILING_SLASH: "true" },
    // @lumenary/core ships TypeScript source: transform it rather than load it with Node.
    server: { deps: { inline: [/@lumenary\/core/] } },
    // Compiling an MDX page takes a moment, and much longer on a loaded CI machine.
    testTimeout: 60_000,
  },
});
