import { defineConfig } from "tsup";
export default defineConfig(({ watch = false }) => ({
  clean: true,
  target: "es2022",
  sourcemap: false,
  entry: {
    index: "src/index.ts",
  },
  dts: true,
  esbuildOptions(options) {
    options.define = {
    'process.env.OSU_API_KEY': 'process.env.OSU_API_KEY',
    };
  },
  external: [],
  format: ["cjs", "esm"],
  watch,
}));