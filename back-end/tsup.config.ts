import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts"],
  outDir: "dist",
  platform: "node",
  target: "node22",
  format: ["cjs"],
  sourcemap: true,
  clean: true,
  bundle: true,
  splitting: false,
  treeshake: true,
  dts: false,
});
