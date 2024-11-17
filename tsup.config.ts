import { defineConfig } from "tsup";

export default defineConfig(({ watch = false }) => ({
  clean: true,
  target: "es2022",
  dts: true,
  sourcemap: true,
  entry: {
    index: "src/index.ts",
	//test: "test/index.ts"
  },
  external: [],
  format: ["cjs", "esm"],
  watch,
}));