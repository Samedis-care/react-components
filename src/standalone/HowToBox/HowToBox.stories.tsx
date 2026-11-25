import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, within } from "storybook/test";
import HowToBox from "./index";

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
