import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { createTheme, ThemeProvider } from "@mui/material";
// eslint-disable-next-line import/no-unresolved
import { fn, expect, waitFor } from "storybook/test";
import InlineSwitch from "./index";
import BaseSelector, { BaseSelectorData } from "../Selector/BaseSelector";
import { selectorLocalLoadHandler } from "../Selector";

const meta: Meta<typeof InlineSwitch> = {
	title: "Standalone/InlineSwitch",
	component: InlineSwitch,
	parameters: { layout: "centered" },
	args: {
		value: false,
		visible: true,
		onChange: fn(),
	},
};
export default meta;

type Story = StoryObj<typeof InlineSwitch>;

const MOBILE = { viewport: { value: "mobile1", isRotated: false } };

const elementOf = (el: Element | null | undefined): HTMLElement => {
	if (!(el instanceof HTMLElement)) throw new Error("element missing");
	return el;
};

export const Unchecked: Story = {
	args: {
		value: false,
		visible: true,
		label: "Enable feature",
	},
	play: async ({ canvas, userEvent, args }) => {
		// Click the switch via its label
		await userEvent.click(await canvas.findByText("Enable feature"));
		await expect(args.onChange).toHaveBeenCalledWith(true);
	},
};

export const Checked: Story = {
	args: {
		value: true,
		visible: true,
		label: "Enable feature",
	},
	play: async ({ canvas, userEvent, args }) => {
		// Click the switch via its label
		await userEvent.click(await canvas.findByText("Enable feature"));
		await expect(args.onChange).toHaveBeenCalledWith(false);
	},
};

export const WithChildren: Story = {
	args: {
		value: true,
		visible: true,
		label: "Show panel",
		children: (
			<div
				style={{
					marginTop: 8,
					padding: 8,
					border: "1px solid #ccc",
					borderRadius: 4,
				}}
			>
				Panel content is rendered here.
			</div>
		),
	},
};

export const SwitchHidden: Story = {
	args: {
		value: false,
		visible: false,
		label: "Hidden switch",
		children: <div style={{ padding: 8 }}>Only the children are visible.</div>,
	},
};

export const NoLabel: Story = {
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"Without `label`, the switch is named by `aria-label`, so it still has an accessible name.",
			},
		},
	},
	args: {
		value: false,
		visible: true,
		"aria-label": "Show inactive entries",
	},
};

export const Issue3465Item10SwitchWithoutLabelIsNamed: Story = {
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3465-ITEM-10: a switch without `label` is named by the `aria-label` given to InlineSwitch, so axe's `label` rule passes.",
			},
		},
	},
	render: (args) => (
		<InlineSwitch {...args} aria-label="Show inactive entries" />
	),
};

// Controlled interactive story
const ControlledTemplate = () => {
	const [checked, setChecked] = useState(false);
	return (
		<InlineSwitch
			value={checked}
			onChange={setChecked}
			visible
			label={checked ? "On" : "Off"}
		/>
	);
};

export const Controlled: Story = {
	render: () => <ControlledTemplate />,
};

const SELECTOR_OPTIONS: BaseSelectorData[] = [
	{ value: "a", label: "Alpha" },
	{ value: "b", label: "Beta" },
];
const loadOptions = selectorLocalLoadHandler(SELECTOR_OPTIONS);

const ringTheme = createTheme({ focusVisible: true });

const FocusRingDemo = () => (
	<div style={{ width: 300 }}>
		<button type="button">Before default</button>
		<InlineSwitch value={false} onChange={() => {}} visible label="Default" />
		<div style={{ clear: "both" }} />
		<ThemeProvider theme={ringTheme}>
			<button type="button">Before ring</button>
			<InlineSwitch
				value={false}
				onChange={() => {}}
				visible
				label="With focusVisible theme"
			/>
		</ThemeProvider>
		<div style={{ clear: "both" }} />
	</div>
);

export const Issue3465Item9FocusShowsVisibleRing: StoryObj<
	typeof FocusRingDemo
> = {
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3465-ITEM-9: Tab to the switch: the only focus cue is a faint pulsating ripple under the thumb (1.3:1 against the unfocused switch). With MUI's opt-in `createTheme({ focusVisible: true })` the ring on the track is clipped by the switch root's `overflow: hidden`. Expected: a static, unclipped focus ring in both cases.",
			},
		},
	},
	render: () => <FocusRingDemo />,
	play: async ({ canvas, userEvent }) => {
		for (const [before, name] of [
			["Before default", "Default"],
			["Before ring", "With focusVisible theme"],
		]) {
			const sw = canvas.getByRole("switch", { name });
			canvas.getByRole("button", { name: before }).focus();
			await userEvent.tab();
			await expect(sw).toHaveFocus();
			const label = elementOf(sw.closest("label"));
			const switchRoot = elementOf(sw.closest(".MuiSwitch-root"));
			await waitFor(() =>
				expect(switchRoot.querySelector(".Mui-focusVisible")).not.toBeNull(),
			);
			// a static ring: an outline of 2px or more, or a box-shadow, on the
			// label or a part of the switch (not the invisible input, not a ripple)
			const ringed = [label, ...label.querySelectorAll("*")].filter((el) => {
				if (el === sw || el.closest(".MuiTouchRipple-root")) return false;
				const cs = getComputedStyle(el);
				return (
					(cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) >= 2) ||
					cs.boxShadow !== "none"
				);
			});
			await expect(ringed, `focus ring for "${name}"`).not.toEqual([]);
			// a ring inside the 35x16 switch root must not be clipped by it
			if (ringed.some((el) => switchRoot.contains(el) && el !== switchRoot)) {
				await expect(
					getComputedStyle(switchRoot).overflow,
					`overflow of the switch root for "${name}"`,
				).toBe("visible");
			}
			sw.blur();
		}
	},
};

export const Issue3465Item9InputCoversOnlyTheTrack: Story = {
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3465-ITEM-9: the switch root does not clip its content, so the focus ring around the track shows in full. The switch's invisible input still covers just the track, off and on, so a click beside the switch does not toggle it.",
			},
		},
	},
	render: () => (
		<div style={{ width: 300 }}>
			<div style={{ display: "flow-root" }}>
				<InlineSwitch value={false} onChange={() => {}} visible label="Off" />
			</div>
			<div style={{ display: "flow-root" }}>
				<InlineSwitch value onChange={() => {}} visible label="On" />
			</div>
		</div>
	),
	play: async ({ canvas }) => {
		for (const name of ["Off", "On"]) {
			const input = canvas.getByRole("switch", { name });
			const track = elementOf(
				input.closest(".MuiSwitch-root"),
			).getBoundingClientRect();
			const rect = input.getBoundingClientRect();
			await expect(rect.left, `input left, ${name}`).toBeCloseTo(track.left, 0);
			await expect(rect.right, `input right, ${name}`).toBeCloseTo(
				track.right,
				0,
			);
			await expect(rect.height, `input height, ${name}`).toBeCloseTo(
				track.height,
				0,
			);
		}
	},
};

export const Issue3465Item9FocusDoesNotPulse: StoryObj<typeof FocusRingDemo> = {
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3465-ITEM-9: keyboard focus shows the static ring only. MUI's pulsating focus ripple, which ran for as long as the switch had focus and ignored `prefers-reduced-motion`, is off. A click still shows the ripple.",
			},
		},
	},
	render: () => <FocusRingDemo />,
	play: async ({ canvas, canvasElement, userEvent }) => {
		const sw = canvas.getByRole("switch", { name: "Default" });
		canvas.getByRole("button", { name: "Before default" }).focus();
		await userEvent.tab();
		await expect(sw).toHaveFocus();
		await waitFor(() =>
			expect(canvasElement.querySelector(".Mui-focusVisible")).not.toBeNull(),
		);
		// the ripple would be added by an effect after the focus-visible render
		for (let frame = 0; frame < 3; ++frame) {
			await new Promise((resolve) => requestAnimationFrame(resolve));
		}
		await expect(
			canvasElement.querySelector(".MuiTouchRipple-ripplePulsate"),
		).toBeNull();
		sw.blur();
	},
};

export const Issue3465Item11SelectorLabelFitsOnPhone: Story = {
	globals: MOBILE,
	parameters: {
		layout: "fullscreen",
		// BaseSelector's own combobox is unnamed (Selector unit); check the switch
		a11y: { context: { include: [".MuiSwitch-root"] } },
		docs: {
			description: {
				story:
					"ISSUE-3465-ITEM-11: at 320px the switch takes the right part of the selector's label row, and a field label that fits on its own is cut to an ellipsis. Expected: the field label stays readable (the switch moves to its own row when both do not fit).",
			},
		},
	},
	render: () => (
		<div style={{ padding: "16px 16px 0" }}>
			<div data-testid="plain">
				<BaseSelector
					label="Verantwortliche Person"
					selected={null}
					onSelect={() => {}}
					onLoad={loadOptions}
				/>
			</div>
			<div data-testid="switch">
				<BaseSelector
					label="Verantwortliche Person"
					selected={null}
					onSelect={() => {}}
					onLoad={loadOptions}
					displaySwitch
					switchLabel="Inaktive Einträge anzeigen"
				/>
			</div>
		</div>
	),
	play: async ({ canvasElement }) => {
		const fieldLabel = (id: string) => {
			const box = elementOf(canvasElement.querySelector(`[data-testid=${id}]`));
			return elementOf(
				Array.from(box.querySelectorAll("label")).find(
					(el) => el.textContent === "Verantwortliche Person",
				),
			);
		};
		const plain = fieldLabel("plain");
		// the label fits the field when no switch shares its row
		await expect(plain.scrollWidth).toBeLessThanOrEqual(plain.clientWidth);
		const withSwitch = fieldLabel("switch");
		await expect(
			withSwitch.scrollWidth,
			"field label width needed vs. shown",
		).toBeLessThanOrEqual(withSwitch.clientWidth);
	},
};

export const Issue3465Item11SwitchMovesOnlyWhenTheLabelDoesNotFit: Story = {
	globals: MOBILE,
	parameters: {
		layout: "fullscreen",
		// BaseSelector's own combobox is unnamed (Selector unit); check the switches
		a11y: { context: { include: [".MuiSwitch-root"] } },
		docs: {
			description: {
				story:
					"ISSUE-3465-ITEM-11: at 320px a short field label keeps the switch on its row. A field label that does not fit beside the switch starts below it, on the full width, and nothing scrolls sideways.",
			},
		},
	},
	render: () => (
		<div style={{ padding: "16px 16px 0" }}>
			{["Typ", "Verantwortliche Person"].map((label) => (
				<div data-testid={label} key={label}>
					<BaseSelector
						label={label}
						selected={null}
						onSelect={() => {}}
						onLoad={loadOptions}
						displaySwitch
						switchLabel={`${label}: inaktive anzeigen`}
					/>
				</div>
			))}
		</div>
	),
	play: async ({ canvas, canvasElement }) => {
		const parts = (label: string) => {
			const box = elementOf(
				canvasElement.querySelector(`[data-testid="${label}"]`),
			);
			const fieldLabel = elementOf(
				Array.from(box.querySelectorAll("label")).find(
					(el) => el.textContent === label,
				),
			);
			const switchRow = elementOf(
				canvas
					.getByRole("switch", { name: `${label}: inaktive anzeigen` })
					.closest("label"),
			);
			return {
				box: box.getBoundingClientRect(),
				fieldLabel: fieldLabel.getBoundingClientRect(),
				switchRow: switchRow.getBoundingClientRect(),
				input: elementOf(
					box.querySelector("[role=combobox]"),
				).getBoundingClientRect(),
			};
		};
		const short = parts("Typ");
		await expect(
			Math.abs(short.switchRow.top - short.fieldLabel.top),
			"short label: on the switch's row",
		).toBeLessThan(8);
		await expect(short.switchRow.bottom).toBeLessThanOrEqual(short.input.top);
		const long = parts("Verantwortliche Person");
		await expect(
			long.switchRow.bottom,
			"long label: below the switch's row",
		).toBeLessThanOrEqual(long.fieldLabel.top);
		await expect(Math.abs(long.fieldLabel.left - long.box.left)).toBeLessThan(
			1,
		);
		await expect(
			Math.abs(long.switchRow.right - long.box.right),
			"switch flush right",
		).toBeLessThan(2);
		await expect(long.fieldLabel.bottom).toBeLessThanOrEqual(long.input.top);
		const page = canvasElement.ownerDocument.documentElement;
		await expect(page.scrollWidth, "no sideways scroll").toBeLessThanOrEqual(
			page.clientWidth,
		);
	},
};
