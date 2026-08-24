import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";

import { playwright } from "@vitest/browser-playwright";

const dirname =
	typeof __dirname !== "undefined"
		? __dirname
		: path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
	test: {
		projects: [
			{
				// Unit tests: test/**/*.test.{ts,tsx}
				test: {
					name: "unit",
					environment: "jsdom",
					// The heavy suites do real work per test — importing the full
					// barrel files, or mounting a MUI picker once per timezone —
					// and 46 files transform in parallel. The 5s default is a coin
					// flip on a loaded machine (and CI runners are slower still).
					testTimeout: 30000,
					hookTimeout: 30000,
					include: ["test/**/*.test.{ts,tsx}"],
					setupFiles: ["test/setup.ts"],
					server: {
						deps: {
							inline: [/@mui\//, /@emotion\//, "react-color", "xlsx"],
						},
					},
				},
			},
			{
				extends: true,
				// These two are reached only through addon-docs at runtime, so the
				// optimizer discovers them mid-run, re-bundles, and bumps the
				// browser hash — which invalidates the ?v= URLs of every module
				// already in flight and fails whole story files at import. Naming
				// them here puts them in the first pass instead.
				optimizeDeps: {
					include: [
						"@storybook/addon-docs > @mdx-js/react",
						"@storybook/addon-docs > @storybook/react-dom-shim",
					],
				},
				plugins: [
					// The plugin will run tests for the stories defined in your Storybook config
					// See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
					storybookTest({ configDir: path.join(dirname, ".storybook") }),
				],
				test: {
					name: "storybook",
					browser: {
						enabled: true,
						headless: true,
						provider: playwright({}),
						instances: [{ browser: "chromium" }],
					},
				},
			},
		],
	},
});
