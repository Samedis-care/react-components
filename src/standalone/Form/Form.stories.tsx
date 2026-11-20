import React, { useCallback, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	AppBar,
	Box,
	Button,
	createTheme,
	decomposeColor,
	Dialog,
	DialogContent,
	DialogTitle,
	getContrastRatio,
	Snackbar,
	TextField,
	Theme,
	ThemeProvider,
	Toolbar,
	Tooltip,
	Typography,
} from "@mui/material";
// eslint-disable-next-line import/no-unresolved
import { expect, fireEvent, userEvent, waitFor, within } from "storybook/test";
import FormLoaderOverlay, { FormLoaderOverlayProps } from "./FormLoaderOverlay";

// --- FormLoaderOverlay ---

const WrappedFormLoaderOverlay = (props: FormLoaderOverlayProps) => (
	<Box
		sx={{
			position: "relative",
			width: 300,
			height: 200,
			border: "1px solid #ccc",
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
		}}
	>
		<Typography>Form Content</Typography>
		<FormLoaderOverlay {...props} />
	</Box>
);

const overlayMeta: Meta<typeof WrappedFormLoaderOverlay> = {
	title: "Standalone/Form/FormLoaderOverlay",
	component: WrappedFormLoaderOverlay,
	parameters: { layout: "centered" },
	argTypes: {
		visible: { control: "boolean" },
		message: {
			control: "text",
			description:
				'The status message screen readers announce while the overlay is visible, already translated; not shown on screen. "Loading…" (translated) without it.',
		},
	},
};
export default overlayMeta;

type OverlayStory = StoryObj<typeof WrappedFormLoaderOverlay>;

type Rect = Pick<DOMRect, "top" | "bottom" | "left" | "right">;
const rectOf = (el: Element): Rect => {
	const { top, bottom, left, right } = el.getBoundingClientRect();
	return { top, bottom, left, right };
};
const hitAtCenter = (el: Element) => {
	const r = rectOf(el);
	return document.elementFromPoint(
		(r.left + r.right) / 2,
		(r.top + r.bottom) / 2,
	);
};

export const Visible: OverlayStory = {
	args: { visible: true },
};

export const Hidden: OverlayStory = {
	args: { visible: false },
};

export const Controllable: OverlayStory = {
	args: { visible: false },
};

export const Issue3473Item3DialogAboveBusyOverlay: OverlayStory = {
	args: { visible: true },
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				story:
					"ISSUE-3473-ITEM-3: a dialog opened while the overlay is shown (e.g. from a post-submit handler) opens above the wash, and its buttons can be clicked.",
			},
		},
		a11y: { test: "error" },
	},
	render: (args) => (
		<Box sx={{ position: "relative", height: "100vh" }}>
			<Typography>Form Content</Typography>
			<FormLoaderOverlay {...args} />
			<Dialog open aria-labelledby={"bug250-title"}>
				<DialogTitle id={"bug250-title"}>Occurrence info</DialogTitle>
				<DialogContent>
					<Button>Confirm</Button>
				</DialogContent>
			</Dialog>
		</Box>
	),
	play: async () => {
		const confirm = await within(document.body).findByRole("button", {
			name: "Confirm",
		});
		const hit = hitAtCenter(confirm);
		await expect(
			hit?.closest("button"),
			`Confirm's centre hits ${hit?.tagName}.${hit?.getAttribute("class")}`,
		).toBe(confirm);
	},
};

export const Issue3473Item3AppLayersAboveBusyOverlay: OverlayStory = {
	args: { visible: true },
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				story:
					"ISSUE-3473-ITEM-3: the overlay stays below MUI's app-level layers (`theme.zIndex`): an app bar, a snackbar and a tooltip over the busy area are shown above the wash and can be clicked.",
			},
		},
		a11y: { test: "error" },
	},
	render: (args) => (
		<Box sx={{ position: "relative", height: "100vh" }}>
			<AppBar position={"fixed"}>
				<Toolbar>
					<Button color={"inherit"}>Menu</Button>
				</Toolbar>
			</AppBar>
			<Box sx={{ pt: 12, pl: 4 }}>
				<Tooltip open title={"Saving the device"} placement={"right"}>
					<Typography component={"span"}>Form Content</Typography>
				</Tooltip>
			</Box>
			<FormLoaderOverlay {...args} />
			<Snackbar
				open
				message={"Changes saved"}
				action={
					<Button size={"small"} color={"inherit"}>
						Undo
					</Button>
				}
			/>
		</Box>
	),
	play: async () => {
		const body = within(document.body);
		const tooltip = await body.findByRole("tooltip");
		const onTop = (el: Element) => el.contains(hitAtCenter(el));
		await expect({
			appBar: onTop(body.getByRole("button", { name: "Menu" })),
			snackbar: onTop(body.getByRole("button", { name: "Undo" })),
			tooltip: onTop(tooltip),
		}).toEqual({ appBar: true, snackbar: true, tooltip: true });
	},
};

export const Issue3473Item3BusyOverlayCoversRaisedContent: OverlayStory = {
	args: { visible: true },
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				story:
					"ISSUE-3473-ITEM-3: the overlay still covers the content of the area it is placed in that has a z-index of its own, also when it comes before that content: the shrunk label of an outlined field (z-index 1) and a raised button bar (z-index 10).",
			},
		},
		a11y: { test: "error" },
	},
	render: (args) => (
		<Box sx={{ position: "relative", height: "100vh", p: 4 }}>
			<FormLoaderOverlay {...args} />
			<TextField label={"Device name"} defaultValue={"Infusion pump"} />
			<Box sx={{ position: "relative", zIndex: 10, mt: 4 }}>
				<Button variant={"contained"}>Save</Button>
			</Box>
		</Box>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const overlay = canvasElement.querySelector(
			'[class*="CcFormLoaderOverlay-root"]',
		);
		const label = canvasElement.querySelector("label");
		if (!overlay || !label) throw new Error("overlay or label not rendered");
		const covered = (el: Element) => overlay.contains(hitAtCenter(el));
		await expect({
			label: covered(label),
			buttonBar: covered(canvas.getByRole("button", { name: "Save" })),
		}).toEqual({ label: true, buttonBar: true });
	},
};

export const Issue3473Item7BusyOverlayIsNamed: OverlayStory = {
	args: { visible: true, message: "Importing devices…" },
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3473-ITEM-7: the visible overlay is a polite status message: its status region, visually hidden, says the `message`, which also names the spinner's progressbar (axe `aria-progressbar-name`).",
			},
		},
		a11y: { test: "error" },
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByRole("status")).toHaveTextContent(
			/^Importing devices…$/,
		);
		await expect(canvas.getByRole("progressbar")).toHaveAccessibleName(
			"Importing devices…",
		);
	},
};

/**
 * A box of the given direction that an idle overlay covers: the wash alone over the
 * box, or, with `wraps`, wrapping the box's content. The box has no padding, like a
 * form page's layout, so the content starts at its edges.
 */
const CoveredBox = ({
	dir,
	wraps,
}: {
	dir: "ltr" | "rtl";
	wraps?: boolean;
}) => (
	<Box dir={dir} sx={{ position: "relative", width: 200 }}>
		{wraps ? (
			<FormLoaderOverlay visible={false}>
				<Typography>Wrapped content</Typography>
			</FormLoaderOverlay>
		) : (
			<>
				<Typography>Covered content</Typography>
				<FormLoaderOverlay visible={false} />
			</>
		)}
	</Box>
);

export const Issue3473Item15StatusInsideTheWash: OverlayStory = {
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3473-ITEM-15: the visually hidden status region lies inside the area the wash covers, left to right and right to left, with and without wrapped content. With MUI's -1px margin it stuck out 1px at the start edge, so a right-to-left form page on a left-to-right page scrolled sideways.",
			},
		},
		a11y: { test: "error" },
	},
	render: () => (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
			<CoveredBox dir={"ltr"} />
			<CoveredBox dir={"rtl"} />
			<CoveredBox dir={"rtl"} wraps />
		</Box>
	),
	play: async ({ canvasElement }) => {
		const statuses = within(canvasElement).getAllByRole("status");
		await expect(statuses).toHaveLength(3);
		const cases = ["ltr", "rtl", "rtl wrapped"];
		// the edges of the area the wash covers that a status region sticks out of
		const outside = statuses.flatMap((status, i) => {
			// the wash is the element right before its status region
			const wash = status.previousElementSibling;
			if (!wash) throw new Error("wash not rendered");
			const area = rectOf(wash);
			const box = rectOf(status);
			return [
				box.left < area.left && "left",
				box.right > area.right && "right",
				box.top < area.top && "top",
				box.bottom > area.bottom && "bottom",
			]
				.filter(Boolean)
				.map((edge) => `${cases[i]}: ${edge}`);
		});
		await expect(outside).toEqual([]);
	},
};

/**
 * An import step: a file name and a Start button that makes the step busy until "Finish
 * import", outside the busy area, is pressed. The overlay wraps the step.
 */
const BusyImportStep = () => {
	const [busy, setBusy] = useState(false);
	const start = useCallback(() => setBusy(true), []);
	const finish = useCallback(() => setBusy(false), []);
	return (
		<Box sx={{ p: 4 }}>
			<Button>Help</Button>
			<FormLoaderOverlay visible={busy}>
				<Box
					data-testid={"step"}
					sx={{ display: "flex", gap: 2, alignItems: "center", py: 2 }}
				>
					<TextField label={"File name"} defaultValue={"devices.csv"} />
					<Button variant={"contained"} onClick={start}>
						Start
					</Button>
				</Box>
			</FormLoaderOverlay>
			<Button onClick={finish}>Finish import</Button>
		</Box>
	);
};

export const Issue3473Item8WrappedContentIsInert: OverlayStory = {
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3473-ITEM-8: the overlay wraps the content it covers (`children`) and makes it inert while it is shown, so the keyboard reaches none of the controls the pointer cannot reach. Keyboard focus in the content moves to the wash when the overlay shows, and back when it hides.",
			},
		},
		a11y: { test: "error" },
	},
	render: () => <BusyImportStep />,
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const field = canvas.getByRole("textbox", { name: "File name" });
		const start = canvas.getByRole("button", { name: "Start" });
		start.focus();
		await userEvent.keyboard("{Enter}");
		await canvas.findByRole("progressbar");
		const overlay = canvasElement.querySelector<HTMLElement>(
			'[class*="CcFormLoaderOverlay-root"]',
		);
		if (!overlay) throw new Error("overlay not rendered");

		// the wash covers the wrapped content and nothing else
		await expect(rectOf(overlay)).toEqual(rectOf(canvas.getByTestId("step")));
		// keyboard focus moved to the wash, not to the page
		await expect(overlay).toHaveFocus();
		// no enabled control under the wash: the keyboard cannot reach what the
		// pointer cannot
		const coveredButOperable = Array.from(
			canvasElement.querySelectorAll<HTMLElement>(
				"a[href], button, input, select, textarea, [tabindex]",
			),
		)
			.filter(
				(el) =>
					!overlay.contains(el) &&
					!(el as HTMLButtonElement).disabled &&
					!el.closest("[inert]") &&
					overlay.contains(hitAtCenter(el)),
			)
			.map((el) => el.textContent || el.tagName);
		await expect(coveredButOperable).toEqual([]);
		await expect(field.closest("[inert]")).not.toBeNull();
		for (const control of [field, start]) {
			control.focus();
			await expect(control).not.toHaveFocus();
		}

		// a click that leaves the focus where it is
		await fireEvent.click(
			canvas.getByRole("button", { name: "Finish import" }),
		);
		await waitFor(() => expect(start).toHaveFocus());
		await expect(start.closest("[inert]")).toBeNull();
	},
};

/**
 * The color seen at a point of the page: the background colors of the elements there,
 * from the topmost down to the first opaque one, laid over each other (over white if
 * none is opaque)
 */
const colorSeenAt = (x: number, y: number) => {
	const layers: number[][] = [];
	for (const el of document.elementsFromPoint(x, y)) {
		const [r, g, b, a = 1] = decomposeColor(
			getComputedStyle(el).backgroundColor,
		).values;
		if (a === 0) continue;
		layers.push([r, g, b, a]);
		if (a === 1) break;
	}
	const seen = layers.reduceRight(
		(below, [r, g, b, a]) =>
			[r, g, b].map((channel, i) => channel * a + below[i] * (1 - a)),
		[255, 255, 255],
	);
	return `rgb(${seen.map(Math.round).join(", ")})`;
};

/**
 * The lowest contrast of a spinner's arc against what lies right next to its ring, inside
 * and outside of it, all around
 */
const spinnerContrast = (progressbar: HTMLElement) => {
	const circle = progressbar.querySelector("circle");
	if (!circle) throw new Error("the spinner has no circle");
	const arc = getComputedStyle(circle).stroke;
	// CircularProgress sets its `size` as inline width; its ring is 3.6 of 44 units wide
	const size = parseFloat(progressbar.style.width);
	const outer = size / 2;
	const inner = outer - (size * 3.6) / 44;
	// the spinner turns about its middle, which stays the middle of its bounding box
	const r = rectOf(progressbar);
	const cx = (r.left + r.right) / 2;
	const cy = (r.top + r.bottom) / 2;
	const contrasts: number[] = [];
	for (let angle = 0; angle < 360; angle += 45) {
		const rad = (angle * Math.PI) / 180;
		for (const radius of [inner - 2, outer + 2]) {
			const seen = colorSeenAt(
				cx + radius * Math.cos(rad),
				cy + radius * Math.sin(rad),
			);
			contrasts.push(getContrastRatio(arc, seen));
		}
	}
	return Math.min(...contrasts);
};

const lightTheme = createTheme();
const darkTheme = createTheme({ palette: { mode: "dark" } });

/**
 * A busy area in the given theme whose content, also under the spinner, is a
 * primary-colored banner
 */
const BusyBanner = ({
	theme,
	name,
	overlay,
}: {
	theme: Theme;
	name: string;
	overlay: FormLoaderOverlayProps;
}) => (
	<ThemeProvider theme={theme}>
		<Box
			data-testid={name}
			sx={{ position: "relative", width: 300, height: 200 }}
		>
			<Box
				sx={{
					height: "100%",
					p: 2,
					bgcolor: "primary.main",
					color: "primary.contrastText",
				}}
			>
				<Typography>{name}: device recalled</Typography>
			</Box>
			<FormLoaderOverlay {...overlay} />
		</Box>
	</ThemeProvider>
);

export const Issue3473Item12SpinnerOnItsOwnSurface: OverlayStory = {
	args: { visible: true },
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3473-ITEM-12: the spinner sits on a surface of its own, so it keeps a contrast of at least 3:1 against what is next to it (WCAG 1.4.11), also where a primary-colored banner, button or tab lies under it, in a light and in a dark theme.",
			},
		},
		a11y: { test: "error" },
	},
	render: (args) => (
		<Box sx={{ display: "flex", gap: 2 }}>
			<BusyBanner theme={lightTheme} name={"Light theme"} overlay={args} />
			<BusyBanner theme={darkTheme} name={"Dark theme"} overlay={args} />
		</Box>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		for (const name of ["Light theme", "Dark theme"]) {
			const progressbar = within(canvas.getByTestId(name)).getByRole(
				"progressbar",
			);
			await expect(
				spinnerContrast(progressbar),
				`${name}: the spinner's contrast against what is next to it`,
			).toBeGreaterThanOrEqual(3);
		}
	},
};
