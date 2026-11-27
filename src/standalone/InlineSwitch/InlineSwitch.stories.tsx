import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { createTheme, ThemeProvider } from "@mui/material";
// eslint-disable-next-line import/no-unresolved
import { fn, expect, waitFor } from "storybook/test";
import InlineSwitch from "./index";
import BaseSelector, { BaseSelectorData } from "../Selector/BaseSelector";
import { selectorLocalLoadHandler } from "../Selector";
import MultiSelectWithoutGroup from "../Selector/MultiSelectWithoutGroup";
import type { MultiSelectorData } from "../Selector/MultiSelect";

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

/** WCAG relative luminance contrast ratio of two computed rgb() colors */
const contrast = (a: string, b: string) => {
	const lum = (rgb: string) => {
		const [r, g, bl] = (rgb.match(/[\d.]+/g) ?? [])
			.slice(0, 3)
			.map(Number)
			.map((v) => {
				const c = v / 255;
				return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
			});
		return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
	};
	const [x, y] = [lum(a), lum(b)];
	return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
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

const darkTheme = createTheme({ palette: { mode: "dark" } });

export const Issue3465Item13SwitchColorsMeet3To1: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3465-ITEM-13: the unchecked thumb and the track border are `grey[500]` on white (2.68:1); in the dark palette the checked thumb is white on `primary.main` (1.75:1) and the unchecked track stays white. Expected: 3:1 for the thumb against the track and for the track's edge against the page (WCAG 1.4.11).",
			},
		},
	},
	render: () => (
		<div style={{ display: "flex", gap: 16 }}>
			<div data-testid="light" style={{ background: "#fff", padding: 16 }}>
				<InlineSwitch value={false} onChange={() => {}} visible label="Off" />
			</div>
			<ThemeProvider theme={darkTheme}>
				<div
					data-testid="dark"
					style={{
						background: darkTheme.palette.background.default,
						padding: 16,
					}}
				>
					<InlineSwitch value onChange={() => {}} visible label="On" />
				</div>
			</ThemeProvider>
		</div>
	),
	play: async ({ canvasElement }) => {
		const part = (id: string, selector: string) =>
			getComputedStyle(
				elementOf(
					canvasElement.querySelector(`[data-testid=${id}] ${selector}`),
				),
			);
		const lightTrack = part("light", ".MuiSwitch-track");
		await expect(
			contrast(
				part("light", ".MuiSwitch-thumb").backgroundColor,
				lightTrack.backgroundColor,
			),
			"light, off: thumb vs track",
		).toBeGreaterThanOrEqual(3);
		await expect(
			contrast(lightTrack.borderTopColor, "rgb(255, 255, 255)"),
			"light, off: track border vs page",
		).toBeGreaterThanOrEqual(3);
		await expect(
			contrast(
				part("dark", ".MuiSwitch-thumb").backgroundColor,
				part("dark", ".MuiSwitch-track").backgroundColor,
			),
			"dark, on: thumb vs track",
		).toBeGreaterThanOrEqual(3);
	},
};

const SWITCH_STATES = [
	["off", false, false],
	["on", true, false],
	["off-disabled", false, true],
	["on-disabled", true, true],
] as const;

/** The switch in every state, on a page of the given colors */
const SwitchStates = (props: {
	id: string;
	background: string;
	color: string;
	className?: string;
}) => (
	<div
		data-testid={props.id}
		className={props.className}
		style={{
			background: props.background,
			color: props.color,
			padding: 16,
			width: 220,
		}}
	>
		{SWITCH_STATES.map(([state, value, disabled]) => (
			<div key={state} data-state={state} style={{ display: "flow-root" }}>
				<InlineSwitch
					value={value}
					disabled={disabled}
					onChange={() => {}}
					visible
					label={`${props.id} ${state}`}
				/>
			</div>
		))}
	</div>
);

/** The parts of the switch in the given state of the given SwitchStates */
const switchParts = (canvasElement: HTMLElement, id: string, state: string) => {
	const box = elementOf(canvasElement.querySelector(`[data-testid="${id}"]`));
	const row = elementOf(box.querySelector(`[data-state="${state}"]`));
	const style = (selector: string) =>
		getComputedStyle(elementOf(row.querySelector(selector)));
	return {
		page: getComputedStyle(box),
		track: style(".MuiSwitch-track"),
		thumb: style(".MuiSwitch-thumb"),
		label: style(".CcInlineSwitch-switchWrapper"),
	};
};

/** The rgb() color a computed rgb()/rgba() color shows over an opaque one */
const over = (color: string, background: string) => {
	const [r, g, b, alpha = 1] = (color.match(/[\d.]+/g) ?? []).map(Number);
	const under = (background.match(/[\d.]+/g) ?? []).map(Number);
	const mix = (c: number, i: number) => c * alpha + under[i] * (1 - alpha);
	return `rgb(${mix(r, 0)}, ${mix(g, 1)}, ${mix(b, 2)})`;
};

export const Issue3465Item13EveryStateMeets3To1: Story = {
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3465-ITEM-13: off and on, in the light and the dark palette, the thumb is at least 3:1 against the track and the track's edge at least 3:1 against the page, with semi-transparent colors blended over what lies under them (WCAG 1.4.11). Disabled switches are exempt.",
			},
		},
	},
	render: () => (
		<div style={{ display: "flex" }}>
			<SwitchStates id="light" background="#fff" color="rgba(0, 0, 0, 0.87)" />
			<ThemeProvider theme={darkTheme}>
				<SwitchStates
					id="dark"
					background={darkTheme.palette.background.default}
					color={darkTheme.palette.text.primary}
				/>
			</ThemeProvider>
		</div>
	),
	play: async ({ canvasElement }) => {
		for (const id of ["light", "dark"]) {
			for (const state of ["off", "on"]) {
				const { page, track, thumb } = switchParts(canvasElement, id, state);
				await expect(track.opacity).toBe("1");
				const fill = over(track.backgroundColor, page.backgroundColor);
				await expect(
					contrast(over(thumb.backgroundColor, fill), fill),
					`${id}, ${state}: thumb vs track`,
				).toBeGreaterThanOrEqual(3);
				// the border is drawn over the track's own background
				await expect(
					contrast(
						over(over(track.borderTopColor, fill), page.backgroundColor),
						page.backgroundColor,
					),
					`${id}, ${state}: track edge vs page`,
				).toBeGreaterThanOrEqual(3);
			}
		}
	},
};

// CSS variables with both color schemes; an element with the class
// `scheme-dark` gives its subtree the dark scheme's variables
const cssVarsTheme = createTheme({
	cssVariables: { colorSchemeSelector: ".scheme-%s" },
	colorSchemes: { light: true, dark: true },
});
// keep the provider's color scheme off the page and out of the storage; MUI types
// colorSchemeNode only for apps that declare their CSS variables in its types
const SCHEME_IN_STORY_ONLY = { colorSchemeNode: null, storageManager: null };

export const Issue3465Item13ColorsFollowTheColorScheme: Story = {
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3465-ITEM-13: with a theme of CSS variables, the switch takes its colors from the variables, so in the dark color scheme (right) it looks as with the dark palette (left), not as in the light scheme.",
			},
		},
	},
	render: () => (
		<div style={{ display: "flex" }}>
			<ThemeProvider theme={darkTheme}>
				<SwitchStates
					id="palette"
					background={darkTheme.palette.background.default}
					color={darkTheme.palette.text.primary}
				/>
			</ThemeProvider>
			<ThemeProvider theme={cssVarsTheme} {...SCHEME_IN_STORY_ONLY}>
				<SwitchStates
					id="scheme"
					className="scheme-dark"
					background="var(--mui-palette-background-default)"
					color="var(--mui-palette-text-primary)"
				/>
			</ThemeProvider>
		</div>
	),
	play: async ({ canvasElement }) => {
		for (const [state] of SWITCH_STATES) {
			const palette = switchParts(canvasElement, "palette", state);
			const scheme = switchParts(canvasElement, "scheme", state);
			await expect(scheme.page.backgroundColor).toBe(
				palette.page.backgroundColor,
			);
			for (const [part, property] of [
				["thumb", "backgroundColor"],
				["track", "backgroundColor"],
				["track", "borderTopColor"],
				["track", "opacity"],
				["label", "color"],
			] as const) {
				await expect(
					scheme[part][property],
					`${state}: ${part} ${property}`,
				).toBe(palette[part][property]);
			}
		}
	},
};

const LONG_COMPOUND =
	"Medizinproduktebetreiberverordnungskonformitätsbescheinigungen anzeigen";

export const Issue3465Item14LongLabelStaysOnScreenOnPhone: Story = {
	globals: MOBILE,
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				story:
					"ISSUE-3465-ITEM-14: at 320px a label with a word longer than the row widens the floated switch row past the left edge of the screen, so the switch cannot be seen or scrolled to; a long label also drops below the switch. Expected: the label wraps beside the switch and everything stays on screen.",
			},
		},
	},
	args: { label: LONG_COMPOUND },
	render: (args) => (
		<div style={{ padding: "0 16px" }}>
			<InlineSwitch {...args}>
				<div>Device list</div>
			</InlineSwitch>
		</div>
	),
	play: async ({ canvas, canvasElement }) => {
		const sw = canvas.getByRole("switch", { name: LONG_COMPOUND });
		const switchRect = elementOf(
			sw.closest(".MuiSwitch-root"),
		).getBoundingClientRect();
		const range = document.createRange();
		range.selectNodeContents(canvas.getByText(LONG_COMPOUND));
		const text = range.getBoundingClientRect();
		const viewport = canvasElement.ownerDocument.documentElement.clientWidth;
		await expect(switchRect.left, "switch left edge").toBeGreaterThanOrEqual(0);
		await expect(text.left, "label left edge").toBeGreaterThanOrEqual(0);
		await expect(text.right, "label right edge").toBeLessThanOrEqual(viewport);
		await expect(
			Math.abs(text.top - switchRect.top),
			"label starts on the switch's row",
		).toBeLessThanOrEqual(8);
	},
};

const LONG_SENTENCE =
	"Show inactive entries of all departments and their locations";
const LONG_SENTENCE_RTL = "הצג רשומות לא פעילות של כל המחלקות והמיקומים שלהן";
const NO_ENTRIES: MultiSelectorData[] = [];
const loadNoEntries = selectorLocalLoadHandler(NO_ENTRIES);
const ignore = () => {};

/** one InlineSwitch per case, each in a box that contains its float */
const WrapCases = () => (
	<div style={{ padding: "0 16px" }}>
		{[
			{ id: "short", label: "Show inactive" },
			{ id: "long", label: LONG_SENTENCE },
			{ id: "rtl", label: LONG_SENTENCE_RTL, dir: "rtl" },
		].map(({ id, label, dir }) => (
			<div key={id} data-testid={id} dir={dir} style={{ display: "flow-root" }}>
				<InlineSwitch value={false} visible label={label} onChange={ignore} />
			</div>
		))}
		<div data-testid="nolabel" style={{ display: "flow-root" }}>
			<InlineSwitch
				value={false}
				visible
				aria-label="Show archived"
				onChange={ignore}
			/>
		</div>
		<div data-testid="multi" style={{ display: "flow-root" }}>
			<MultiSelectWithoutGroup<MultiSelectorData>
				label="Departments"
				selected={NO_ENTRIES}
				onSelect={ignore}
				loadDataOptions={loadNoEntries}
				displaySwitch
				switchLabel={`${LONG_SENTENCE}?`}
				switchValue={false}
				setSwitchValue={ignore}
			/>
		</div>
	</div>
);

export const Issue3465Item14LabelWrapsBesideTheSwitch: Story = {
	globals: MOBILE,
	parameters: {
		layout: "fullscreen",
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3465-ITEM-14: at 320px a label too long for the space beside the switch wraps there, in lines of the caption's line height, and its first line stays centered beside the switch, as a short label is. The same in a right-to-left page and in MultiSelectWithoutGroup's switch row, whose label comes before the switch. Without a label the row stays as high as the switch.",
			},
		},
	},
	render: () => <WrapCases />,
	play: async ({ canvasElement }) => {
		const parts = (id: string) => {
			const box = elementOf(
				canvasElement.querySelector(`[data-testid="${id}"]`),
			);
			const sw = elementOf(
				box.querySelector(".MuiSwitch-root"),
			).getBoundingClientRect();
			const label = elementOf(
				box.querySelector(".CcInlineSwitch-switchWrapper label > :last-child"),
			);
			const range = document.createRange();
			range.selectNodeContents(label);
			const lines = Array.from(range.getClientRects()).filter(
				(line, index, all) => index === 0 || line.top - all[index - 1].top > 1,
			);
			return {
				sw,
				text: range.getBoundingClientRect(),
				// the distance of the first two lines' tops, 0 for one line
				pitch: lines.length > 1 ? lines[1].top - lines[0].top : 0,
				// how far the first line's middle is from the switch's middle
				offset: Math.abs(
					(lines[0].top + lines[0].bottom) / 2 - (sw.top + sw.bottom) / 2,
				),
			};
		};
		const viewport = canvasElement.ownerDocument.documentElement.clientWidth;

		const short = parts("short");
		await expect(short.pitch, "short: one line").toBe(0);
		await expect(short.text.left, "short: after the switch").toBeGreaterThan(
			short.sw.right,
		);
		await expect(
			short.offset,
			"short: centered beside the switch",
		).toBeLessThan(1.5);

		const long = parts("long");
		await expect(long.text.left, "long: after the switch").toBeGreaterThan(
			long.sw.right,
		);
		await expect(long.text.right, "long: on screen").toBeLessThanOrEqual(
			viewport,
		);
		await expect(
			long.offset,
			"long: first line beside the switch",
		).toBeLessThan(1.5);
		await expect(long.pitch, "long: wraps").toBeGreaterThan(0);
		await expect(
			long.pitch,
			"long: lines of the caption's height",
		).toBeLessThan(24);

		const rtl = parts("rtl");
		await expect(rtl.sw.right, "rtl: switch on screen").toBeLessThanOrEqual(
			viewport,
		);
		await expect(rtl.text.right, "rtl: before the switch").toBeLessThan(
			rtl.sw.left,
		);
		await expect(rtl.text.left, "rtl: on screen").toBeGreaterThanOrEqual(0);
		await expect(rtl.offset, "rtl: first line beside the switch").toBeLessThan(
			1.5,
		);
		await expect(rtl.pitch, "rtl: wraps").toBeGreaterThan(0);

		const multi = parts("multi");
		await expect(multi.text.right, "multi: before the switch").toBeLessThan(
			multi.sw.left,
		);
		await expect(
			multi.offset,
			"multi: first line beside the switch",
		).toBeLessThan(1.5);
		await expect(multi.pitch, "multi: wraps").toBeGreaterThan(0);
		await expect(
			multi.pitch,
			"multi: lines of the caption's height",
		).toBeLessThan(24);

		const noLabel = elementOf(
			canvasElement.querySelector('[data-testid="nolabel"]'),
		);
		await expect(
			elementOf(
				noLabel.querySelector(".CcInlineSwitch-switchWrapper"),
			).getBoundingClientRect().height,
			"no label: the row is as high as the switch",
		).toBe(
			elementOf(
				noLabel.querySelector(".MuiSwitch-root"),
			).getBoundingClientRect().height,
		);

		const page = canvasElement.ownerDocument.documentElement;
		await expect(page.scrollWidth, "no sideways scroll").toBeLessThanOrEqual(
			page.clientWidth,
		);
	},
};
