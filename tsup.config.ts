import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  target: "es2022",
  sourcemap: false,
  entry: {
    index: "src/index.ts",
  },
  dts: true,
  format: ["cjs"],
});