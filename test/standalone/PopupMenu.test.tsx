import { describe, it, expect } from "vitest";
import PopupMenu from "../../src/standalone/PopupMenu";

// importing the whole package (or the DataGrid) takes ~20s in jsdom
const importTimeout = 90000;

describe("package root exports of the small primitives", () => {
	it(
		"[ISSUE-3459-ITEM-2] exports PopupMenu",
		async () => {
			const root = (await import("../../src")) as Record<string, unknown>;
			expect(root.PopupMenu, "PopupMenu is missing from the package root").toBe(
				PopupMenu,
			);
		},
		importTimeout,
	);
});
