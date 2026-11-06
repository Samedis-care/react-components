import { describe, expect, it } from "vitest";
import addSlotAttributes from "../../src/utils/internal/addSlotAttributes";

describe("addSlotAttributes", () => {
	it("[ISSUE-3501-ITEM-13] returns the caller's slotProps as they are when there is nothing to add", () => {
		const slotProps = { htmlInput: { maxLength: 5 } };
		expect(
			addSlotAttributes(slotProps, "htmlInput", {
				"aria-describedby": undefined,
			}),
		).toBe(slotProps);
	});

	it("[ISSUE-3501-ITEM-13] adds to an object slot and keeps the caller's other slots and attributes", () => {
		const input = { readOnly: true };
		expect(
			addSlotAttributes({ htmlInput: { maxLength: 5 }, input }, "htmlInput", {
				"aria-describedby": "msg",
				"aria-invalid": true,
			}),
		).toEqual({
			htmlInput: {
				maxLength: 5,
				"aria-describedby": "msg",
				"aria-invalid": true,
			},
			input,
		});
		expect(
			addSlotAttributes(undefined, "input", { "aria-invalid": false }),
		).toEqual({ input: { "aria-invalid": false } });
	});

	it("[ISSUE-3501-ITEM-13] appends aria-describedby to the caller's", () => {
		expect(
			addSlotAttributes(
				{ htmlInput: { "aria-describedby": "hint" } },
				"htmlInput",
				{
					"aria-describedby": "msg",
				},
			),
		).toEqual({ htmlInput: { "aria-describedby": "hint msg" } });
	});

	it("[ISSUE-3501-ITEM-13] wraps a slot given as a function, passing the owner state on", () => {
		const result = addSlotAttributes(
			{
				htmlInput: (state: { error: boolean }) => ({
					"data-error": state.error,
					"aria-describedby": "hint",
				}),
			},
			"htmlInput",
			{ "aria-describedby": "msg" },
		) as { htmlInput: (state: { error: boolean }) => Record<string, unknown> };
		expect(result.htmlInput({ error: true })).toEqual({
			"data-error": true,
			"aria-describedby": "hint msg",
		});
	});
});
