import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, within } from "storybook/test";
import { Button, createTheme, ThemeProvider } from "@mui/material";
import HowToBox from "./index";
import GroupBox from "../GroupBox";

// Note: HowToBox internally calls useCCTranslations for the default title.
// The story relies on i18next being initialised (it is, via the library's ccI18n instance).

const meta: Meta<typeof HowToBox> = {
	title: "Standalone/HowToBox",
	component: HowToBox,
	parameters: { layout: "centered" },
};
export default meta;

type Story = StoryObj<typeof HowToBox>;

const MOBILE = { viewport: { value: "mobile1", isRotated: false } };

const rectOf = (el: Element | null) => {
	if (!el) throw new Error("element missing");
	return el.getBoundingClientRect();
};

const htmlElementOf = (el: Element | null) => {
	if (!(el instanceof HTMLElement)) throw new Error("HTML element missing");
	return el;
};

/** the list items of the frame (the story page has hidden <li>s of its own) */
const entriesOf = (canvasElement: HTMLElement) =>
	Array.from(canvasElement.querySelectorAll("fieldset li")).map(htmlElementOf);

export const ArrayOfStrings: Story = {
	args: {
		titleLabel: "How it works",
		labels: [
			"Open the application.",
			"Fill in the required fields.",
			"Click Save to confirm.",
		],
	},
};

export const SingleStringLabel: Story = {
	args: {
		titleLabel: "Tip",
		labels: "This is a single helpful hint.",
	},
};

export const ArrayOfNodes: Story = {
	args: {
		titleLabel: "Steps",
		labels: [
			<span key="1">
				Step <strong>1</strong>: Register
			</span>,
			<span key="2">
				Step <strong>2</strong>: Verify email
			</span>,
			<span key="3">
				Step <strong>3</strong>: Complete profile
			</span>,
		],
	},
};

export const DefaultTitle: Story = {
	// titleLabel omitted — falls back to i18n key "standalone.how-it-works.title"
	args: {
		labels: ["First step.", "Second step.", "Third step."],
	},
};

export const NoLabels: Story = {
	// labels is undefined — component renders nothing
	args: {
		labels: undefined,
	},
};

export const Issue3463Item1LineBreaksInEntryAreShown: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'ISSUE-3463-ITEM-1: a line break (`"\\n"`) inside an entry is collapsed to a space, so the three lines of the first entry run together on one line.',
			},
		},
	},
	render: (args) => (
		<div style={{ width: 600 }}>
			<HowToBox {...args} />
		</div>
	),
	args: {
		titleLabel: "How it works",
		labels: ["Line one.\nLine two.\nLine three.", "Single line."],
	},
	play: async ({ canvasElement }) => {
		await within(canvasElement).findByRole("group", { name: "How it works" });
		const [multi, single] = entriesOf(canvasElement);
		await expect(rectOf(multi).height).toBeGreaterThanOrEqual(
			3 * rectOf(single).height - 1,
		);
	},
};

export const Issue3463Item7LongWordEntryWrapsOnPhone: Story = {
	globals: MOBILE,
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				story:
					"ISSUE-3463-ITEM-7: at 320px an entry with a long compound word or a URL does not wrap: it runs over the frame's right border and the page scrolls sideways.",
			},
		},
	},
	render: (args) => (
		<div style={{ padding: "0 16px" }}>
			<HowToBox {...args} />
		</div>
	),
	args: {
		titleLabel: "Wie es funktioniert",
		labels: [
			"Lade die Importdatei über das untenstehende Upload-Feld hoch",
			"Datenschutzgrundverordnungskonformitätsbescheinigung",
			"Vorlage: https://example.com/download/staff_import.de.xlsx?version=2026-10-17",
		],
	},
	play: async ({ canvasElement }) => {
		await within(canvasElement).findByRole("group", {
			name: "Wie es funktioniert",
		});
		for (const li of entriesOf(canvasElement)) {
			await expect(li.scrollWidth).toBeLessThanOrEqual(li.clientWidth);
		}
		await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
			document.documentElement.clientWidth,
		);
	},
};

export const Issue3463Item7LongWordEntryWrapsInFlexRow: Story = {
	globals: MOBILE,
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				story:
					"ISSUE-3463-ITEM-7: at 320px, in a flex row whose item keeps the default `min-width: auto`, an entry with a long compound word or a URL still wraps inside the frame: the box does not widen the row or the page.",
			},
		},
	},
	render: (args) => (
		<div style={{ display: "flex", padding: "0 16px" }}>
			<div>
				<HowToBox {...args} />
			</div>
		</div>
	),
	args: {
		titleLabel: "Wie es funktioniert",
		labels: [
			"Datenschutzgrundverordnungskonformitätsbescheinigung",
			"Vorlage: https://example.com/download/staff_import.de.xlsx?version=2026-10-17",
		],
	},
	play: async ({ canvasElement }) => {
		const group = await within(canvasElement).findByRole("group", {
			name: "Wie es funktioniert",
		});
		const viewport = document.documentElement.clientWidth;
		// the frame stays inside the row's 16px gutter
		await expect(group.getBoundingClientRect().right).toBeLessThanOrEqual(
			viewport - 16,
		);
		for (const li of entriesOf(canvasElement)) {
			await expect(li.scrollWidth).toBeLessThanOrEqual(li.clientWidth);
		}
		await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
			viewport,
		);
	},
};

export const Issue3463Item8StepsDescribeTheUploadButton: Story = {
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3463-ITEM-8: with an `id`, the list of entries gets the id `${id}-list`. The upload button below the box points its `aria-describedby` at it, so a screen reader that tabs straight to the button reads the steps after its name.",
			},
		},
	},
	render: (args) => (
		<div style={{ width: 400 }}>
			<HowToBox {...args} />
			<Button
				variant={"contained"}
				aria-describedby={args.id ? `${args.id}-list` : undefined}
			>
				Upload
			</Button>
		</div>
	),
	args: {
		id: "import-how-to",
		titleLabel: "How to import",
		labels: [
			"Download the template",
			"Fill in one row per record",
			"Upload it below",
		],
	},
	play: async ({ canvas }) => {
		await expect(
			await canvas.findByRole("button", { name: "Upload" }),
		).toHaveAccessibleDescription(
			"Download the template Fill in one row per record Upload it below",
		);
	},
};

export const Issue3463Item9NoTitle: Story = {
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					'ISSUE-3463-ITEM-9: `titleLabel={null}` shows no title, as `""` and `false` do, like the `label` of GroupBox; only an omitted (`undefined`) `titleLabel` shows the default "How it works". The untitled box is a group without a name, so it is named with `aria-label` here.',
			},
		},
	},
	args: {
		titleLabel: null,
		"aria-label": "Import instructions",
		labels: ["Download the template", "Upload it below"],
	},
	play: async ({ canvas }) => {
		const group = await canvas.findByRole("group", {
			name: "Import instructions",
		});
		await expect(group.querySelector("legend")).toBeNull();
		await expect(within(group).getAllByRole("listitem")).toHaveLength(2);
	},
};

/** a theme that styles GroupBox legends as shrunk form-field labels, and gives the how-to title a look of its own */
const fieldLabelLegendsTheme = createTheme({
	components: {
		CcGroupBox: {
			styleOverrides: {
				legend: { fontSize: "0.75rem", color: "rgba(0, 0, 0, 0.6)" },
			},
		},
		CcHowToBox: {
			styleOverrides: {
				legend: ({ theme }) => ({
					fontSize: "inherit",
					fontWeight: theme.typography.fontWeightMedium,
					color: theme.palette.text.primary,
				}),
			},
		},
	},
});

export const Issue3463Item10TitleStyledApartFromFieldLegends: Story = {
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3463-ITEM-10: a theme that styles the legends of GroupBox as small grey form-field labels gives the title of the HowToBox its own look with `CcHowToBox.styleOverrides.legend`: here the size of the entries in medium weight, so it reads as the heading of the instructions. The framed field below keeps the label look. The title names the task, as a title of the caller's own can.",
			},
		},
	},
	render: (args) => (
		<ThemeProvider theme={fieldLabelLegendsTheme}>
			<div style={{ width: 400 }}>
				<HowToBox {...args} />
				<GroupBox label={"Files"}>
					<Button variant={"outlined"}>Upload</Button>
				</GroupBox>
			</div>
		</ThemeProvider>
	),
	args: {
		titleLabel: "How to import",
		labels: ["Download the template", "Upload it below"],
	},
	play: async ({ canvas }) => {
		const howTo = await canvas.findByRole("group", { name: "How to import" });
		const title = htmlElementOf(howTo.querySelector("legend"));
		const [entry] = entriesOf(howTo);
		const label = htmlElementOf(
			canvas.getByRole("group", { name: "Files" }).querySelector("legend"),
		);
		await expect(getComputedStyle(title).fontSize).toBe(
			getComputedStyle(entry).fontSize,
		);
		await expect(getComputedStyle(title).fontWeight).toBe("500");
		await expect(getComputedStyle(title).color).toBe("rgba(0, 0, 0, 0.87)");
		await expect(getComputedStyle(label).fontSize).toBe("12px");
		await expect(getComputedStyle(label).fontWeight).toBe("400");
		await expect(getComputedStyle(label).color).toBe("rgba(0, 0, 0, 0.6)");
	},
};

/** the gaps between the entries of the frame, in px */
const gapsOf = (entries: HTMLElement[]) =>
	entries
		.slice(1)
		.map((entry, i) => rectOf(entry).top - rectOf(entries[i]).bottom);

export const Issue3463Item11NumberedStepsWithAGap: Story = {
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3463-ITEM-11: with `ordered`, the steps of a procedure are an ordered list numbered 1., 2., 3., so a step can be referred to by its number. Entries stand half a spacing unit apart (4px with the default spacing), so an entry of several lines does not run into the next one.",
			},
		},
	},
	render: (args) => (
		<div style={{ width: 320 }}>
			<HowToBox {...args} />
		</div>
	),
	args: {
		titleLabel: "How to import",
		ordered: true,
		labels: [
			"Download the template",
			"Create the import file using the template: one row per record, with the required fields filled in",
			"Upload the import file below",
		],
	},
	play: async ({ canvas, canvasElement }) => {
		const list = await canvas.findByRole("list");
		await expect(list.tagName).toBe("OL");
		await expect(getComputedStyle(list).listStyleType).toBe("decimal");
		const entries = entriesOf(canvasElement);
		await expect(entries).toHaveLength(3);
		await expect(getComputedStyle(entries[0]).marginTop).toBe("0px");
		await expect(gapsOf(entries)).toEqual([4, 4]);
	},
};

export const Issue3463Item11SingleHintWithoutBullet: Story = {
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3463-ITEM-11: a single entry shows without a bullet (or a number with `ordered`) and without the list's indent: a marker in front of the only entry marks nothing. It is still a list of one item for screen readers.",
			},
		},
	},
	render: (args) => (
		<div style={{ width: 320 }}>
			<HowToBox {...args} />
		</div>
	),
	args: {
		titleLabel: "Tip",
		labels: "This is a single helpful hint.",
	},
	play: async ({ canvas }) => {
		const list = await canvas.findByRole("list");
		const [entry] = within(list).getAllByRole("listitem");
		await expect(getComputedStyle(list).listStyleType).toBe("none");
		await expect(getComputedStyle(list).paddingLeft).toBe("0px");
		await expect(rectOf(entry).left).toBe(rectOf(list).left);
	},
};

/** a theme that styles the list and the entries of every HowToBox */
const entriesTheme = createTheme({
	components: {
		CcHowToBox: {
			styleOverrides: {
				ul: {
					listStyleType: "square",
					"&.CcHowToBox-singleEntry": { paddingLeft: "8px" },
				},
				li: { marginTop: "8px" },
			},
		},
	},
});

export const Issue3463Item11ThemeStylesTheEntries: Story = {
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					'ISSUE-3463-ITEM-11: a theme replaces the gap between the entries with `styleOverrides.li` (here 8px) and their marker with `styleOverrides.ul` (here squares). A single entry keeps no marker; the theme styles it with `"&.CcHowToBox-singleEntry"` in `ul` (here an indent of 8px).',
			},
		},
	},
	render: () => (
		<ThemeProvider theme={entriesTheme}>
			<div style={{ width: 320 }}>
				<HowToBox
					titleLabel={"How to import"}
					labels={["Download the template", "Upload it below"]}
				/>
				<HowToBox titleLabel={"Tip"} labels={"A single hint."} />
			</div>
		</ThemeProvider>
	),
	play: async ({ canvas }) => {
		const steps = await canvas.findByRole("group", { name: "How to import" });
		const stepList = within(steps).getByRole("list");
		await expect(getComputedStyle(stepList).listStyleType).toBe("square");
		await expect(gapsOf(entriesOf(steps))).toEqual([8]);
		const tipList = within(
			canvas.getByRole("group", { name: "Tip" }),
		).getByRole("list");
		await expect(getComputedStyle(tipList).listStyleType).toBe("none");
		await expect(getComputedStyle(tipList).paddingLeft).toBe("8px");
	},
};
