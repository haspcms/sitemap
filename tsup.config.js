import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.js"],
  format: ["cjs"],
  sourcemap: true,
  clean: true,
  dts: false,
});
