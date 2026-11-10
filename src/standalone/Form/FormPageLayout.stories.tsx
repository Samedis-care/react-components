import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	Box,
	Button,
	Dialog,
	DialogContent,
	DialogTitle,
	Grid,
	TextField,
	Typography,
} from "@mui/material";
// eslint-disable-next-line import/no-unresolved
import { expect, within } from "storybook/test";
import FormPageLayout from "./FormPageLayout";
import FormLoaderOverlay from "./FormLoaderOverlay";
import ActionButton from "../UIKit/ActionButton";
import FormButtons from "../UIKit/FormButtons";

const meta: Meta<typeof FormPageLayout> = {
	title: "Standalone/Form/FormPageLayout",
	component: FormPageLayout,
	parameters: {
		layout: "centered",
		a11y: { test: "error" },
	},
};
export default meta;

type Story = StoryObj<typeof FormPageLayout>;

export const Default: Story = {
	render: () => (
		<Box
			sx={{
				position: "relative",
				width: 500,
				height: 400,
				border: "1px solid #ccc",
			}}
		>
			<FormPageLayout
				body={
					<Box sx={{ padding: 2 }}>
						<Typography variant="h6" gutterBottom>
							User Information
						</Typography>
						<TextField label="First Name" fullWidth sx={{ mb: 2 }} />
						<TextField label="Last Name" fullWidth sx={{ mb: 2 }} />
						<TextField label="Email" fullWidth />
					</Box>
				}
				footer={
					<Box sx={{ display: "flex", gap: 1 }}>
						<Button variant="contained" color="primary">
							Save
						</Button>
						<Button variant="outlined">Cancel</Button>
					</Box>
				}
			/>
		</Box>
	),
};

export const WithOther: Story = {
	render: () => (
		<Box
			sx={{
				position: "relative",
				width: 500,
				height: 400,
				border: "1px solid #ccc",
			}}
		>
			<FormPageLayout
				body={
					<Box sx={{ padding: 2 }}>
						<Typography variant="body1">
							Main form body content goes here.
						</Typography>
					</Box>
				}
				footer={<Button variant="contained">Submit</Button>}
				other={
					<Box
						sx={{
							position: "absolute",
							top: 8,
							right: 8,
							padding: 1,
							backgroundColor: "info.light",
							borderRadius: 1,
						}}
					>
						<Typography variant="caption">Extra content</Typography>
					</Box>
				}
			/>
		</Box>
	),
};

/**
 * Outlined fields with values: their shrunk labels have z-index 1, like in every
 * DefaultFormPage.
 */
const Fields = ({ count }: { count: number }) => (
	<Grid container spacing={2}>
		{Array.from({ length: count }, (_, i) => (
			<Grid size={12} key={i}>
				<TextField
					label={`A rather long label for field number ${i}`}
					defaultValue={`value ${i}`}
					fullWidth
				/>
			</Grid>
		))}
	</Grid>
);

const SaveBackButtons = () => (
	<FormButtons>
		<ActionButton>Save</ActionButton>
		<ActionButton>Back</ActionButton>
	</FormButtons>
);

/**
 * The supported host: the Dialog paper is positioned, DialogContent scrolls.
 */
const DialogForm = ({ count }: { count: number }) => (
	<Dialog open maxWidth={"sm"} fullWidth aria-labelledby={"form-title"}>
		<DialogTitle id={"form-title"}>Edit device</DialogTitle>
		<DialogContent data-testid={"content"}>
			<FormPageLayout
				body={<Fields count={count} />}
				footer={<SaveBackButtons />}
				other={<FormLoaderOverlay visible={false} />}
			/>
		</DialogContent>
	</Dialog>
);

type Rect = Pick<DOMRect, "top" | "bottom" | "left" | "right">;
const rectOf = (el: Element): Rect => {
	const { top, bottom, left, right } = el.getBoundingClientRect();
	return { top, bottom, left, right };
};
const overlapY = (a: Rect, b: Rect) =>
	Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
const overlapsX = (a: Rect, b: Rect) => a.left < b.right && a.right > b.left;
const nextFrame = () =>
	new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
const buttonBar = (scope: ParentNode) => {
	const bar = scope.querySelector('[class*="CcFormButtons-root"]');
	if (!bar) throw new Error("FormButtons not rendered");
	return bar;
};
const overlayIn = (scope: ParentNode) => {
	const overlay = scope.querySelector('[class*="CcFormLoaderOverlay-root"]');
	if (!overlay) throw new Error("FormLoaderOverlay not rendered");
	return overlay;
};

export const Issue3473Item1FooterAboveFieldLabels: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3473-ITEM-1: the footer has no z-index, so an outlined field's label (z-index 1) scrolled under the Save button is painted over it and takes the click.",
			},
		},
	},
	render: () => <DialogForm count={15} />,
	play: async () => {
		const screen = within(document.body);
		const save = await screen.findByRole("button", { name: "Save" });
		const content = screen.getByTestId("content");
		const saveRect = rectOf(save);
		const label = Array.from(content.querySelectorAll("label")).find((el) => {
			const r = rectOf(el);
			return r.top >= saveRect.bottom && overlapsX(r, saveRect);
		});
		if (!label) throw new Error("no field label below the Save button");
		// scroll the label's centre onto the Save button's centre
		const labelRect = rectOf(label);
		content.scrollTop +=
			(labelRect.top + labelRect.bottom) / 2 -
			(saveRect.top + saveRect.bottom) / 2;
		await nextFrame();

		const l = rectOf(label);
		const s = rectOf(save);
		await expect(overlapY(l, s)).toBeGreaterThan(0);
		const x = (Math.max(l.left, s.left) + Math.min(l.right, s.right)) / 2;
		const y = (s.top + s.bottom) / 2;
		const hit = document.elementFromPoint(x, y);
		await expect(
			hit?.closest("button"),
			`the point on Save hits ${hit?.tagName} "${hit?.textContent}"`,
		).toBe(save);
	},
};

export const Issue3473Item1FooterAboveRaisedBodyContent: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3473-ITEM-1: body content with a z-index far above a label's, like the DataGrid's settings panel (z-index 1000), scrolled under the Save button still stays below the footer and does not take its clicks.",
			},
		},
	},
	render: () => (
		<Dialog open maxWidth={"sm"} fullWidth aria-labelledby={"form-title"}>
			<DialogTitle id={"form-title"}>Edit device</DialogTitle>
			<DialogContent data-testid={"content"}>
				<FormPageLayout
					body={
						<>
							<Fields count={12} />
							<Box
								data-testid={"raised"}
								sx={{
									position: "relative",
									zIndex: 1000,
									height: 120,
									mt: 2,
									bgcolor: "background.paper",
									border: 1,
								}}
							>
								<Typography>Grid settings</Typography>
							</Box>
							<Fields count={8} />
						</>
					}
					footer={<SaveBackButtons />}
					other={<FormLoaderOverlay visible={false} />}
				/>
			</DialogContent>
		</Dialog>
	),
	play: async () => {
		const screen = within(document.body);
		const save = await screen.findByRole("button", { name: "Save" });
		const content = screen.getByTestId("content");
		const raised = screen.getByTestId("raised");
		// scroll the raised panel's centre onto the Save button's centre
		const saveRect = rectOf(save);
		const raisedRect = rectOf(raised);
		content.scrollTop +=
			(raisedRect.top + raisedRect.bottom) / 2 -
			(saveRect.top + saveRect.bottom) / 2;
		await nextFrame();

		// the panel lies under the whole Save button
		const r = rectOf(raised);
		const s = rectOf(save);
		await expect(r.top).toBeLessThanOrEqual(s.top);
		await expect(r.bottom).toBeGreaterThanOrEqual(s.bottom);
		await expect(r.left).toBeLessThanOrEqual(s.left);
		await expect(r.right).toBeGreaterThanOrEqual(s.right);
		const hit = document.elementFromPoint(
			(s.left + s.right) / 2,
			(s.top + s.bottom) / 2,
		);
		await expect(
			hit?.closest("button"),
			`the point on Save hits ${hit?.tagName} "${hit?.textContent}"`,
		).toBe(save);
	},
};

export const Issue3473Item2FooterAndOverlayStayInScrollingPanel: Story = {
	parameters: {
		a11y: {
			config: {
				// the busy overlay's spinner has no accessible name yet, a known defect of
				// the overlay; drop this line once it has one
				rules: [{ id: "aria-progressbar-name", enabled: false }],
			},
		},
		docs: {
			description: {
				story:
					"ISSUE-3473-ITEM-2: in a positioned scroll container (a Drawer's paper, a side panel with `position: relative; overflow: auto`) the footer and the busy overlay are placed against the scrolling content. Scrolled to the end, the Save bar has scrolled out of view and the overlay covers only the first screen.",
			},
		},
	},
	render: () => (
		<Box
			data-testid={"panel"}
			sx={{
				position: "relative",
				overflowY: "auto",
				width: 400,
				height: 500,
				display: "flex",
				flexDirection: "column",
			}}
		>
			<FormPageLayout
				body={<Fields count={20} />}
				footer={<SaveBackButtons />}
				other={<FormLoaderOverlay visible />}
			/>
		</Box>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const panelEl = canvas.getByTestId("panel");
		panelEl.scrollTop = panelEl.scrollHeight;
		await nextFrame();
		await expect(panelEl.scrollTop).toBeGreaterThan(0);

		const panel = rectOf(panelEl);
		const footer = rectOf(buttonBar(panelEl));
		const overlay = rectOf(overlayIn(panelEl));
		// scrollTop is a whole number while the content height can be fractional, so
		// allow a pixel of rounding
		const EPS = 1;
		// the Save bar is in view
		await expect(footer.top).toBeGreaterThanOrEqual(panel.top - EPS);
		await expect(footer.bottom).toBeLessThanOrEqual(panel.bottom + EPS);
		// the busy overlay covers what the user sees
		await expect(overlay.top).toBeLessThanOrEqual(panel.top + EPS);
		await expect(overlay.bottom).toBeGreaterThanOrEqual(panel.bottom - EPS);
	},
};

const distance = (a: number, b: number) => Math.abs(a - b);
const middleOf = (rect: Rect) => (rect.top + rect.bottom) / 2;
const progressbarIn = (scope: ParentNode) => {
	const bar = scope.querySelector('[role="progressbar"]');
	if (!bar) throw new Error("no spinner shown");
	return bar;
};

export const Issue3473Item2SaveAndSpinnerStayInViewWhileScrolling: Story = {
	parameters: {
		a11y: {
			config: {
				// the busy overlay's spinner has no accessible name yet, a known defect of
				// the overlay; drop this line once it has one
				rules: [{ id: "aria-progressbar-name", enabled: false }],
			},
		},
		docs: {
			description: {
				story:
					"ISSUE-3473-ITEM-2: a busy form much taller than the scrolling panel it is in. At the start, in the middle and at the end, the Save bar sits at the same place at the bottom of the panel, and the spinner in the middle of the panel.",
			},
		},
	},
	render: () => (
		<Box sx={{ pt: 10 }}>
			<Box
				data-testid={"panel"}
				sx={{
					position: "relative",
					overflowY: "auto",
					width: 400,
					height: 500,
					display: "flex",
					flexDirection: "column",
				}}
			>
				<FormPageLayout
					body={<Fields count={40} />}
					footer={<SaveBackButtons />}
					other={<FormLoaderOverlay visible />}
				/>
			</Box>
		</Box>
	),
	play: async ({ canvasElement }) => {
		const panelEl = within(canvasElement).getByTestId("panel");
		const panel = rectOf(panelEl);
		const EPS = 1;
		const max = panelEl.scrollHeight - panelEl.clientHeight;
		for (const scrollTop of [0, max / 2, max]) {
			panelEl.scrollTop = scrollTop;
			await nextFrame();
			const footer = rectOf(buttonBar(panelEl));
			await expect(footer.top, `Save bar at ${scrollTop}`).toBeGreaterThan(
				panel.top,
			);
			await expect(
				distance(footer.bottom, panel.bottom - 36),
				`Save bar at ${scrollTop}`,
			).toBeLessThanOrEqual(EPS);
			const spinner = rectOf(progressbarIn(panelEl));
			await expect(
				distance(middleOf(spinner), middleOf(panel)),
				`spinner at ${scrollTop}`,
			).toBeLessThanOrEqual(EPS);
		}
	},
};

export const Issue3473Item2FooterAndOverlayFollowDocumentScroll: Story = {
	parameters: {
		layout: "fullscreen",
		a11y: {
			config: {
				// the busy overlay's spinner has no accessible name yet, a known defect of
				// the overlay; drop this line once it has one
				rules: [{ id: "aria-progressbar-name", enabled: false }],
			},
		},
		docs: {
			description: {
				story:
					"ISSUE-3473-ITEM-2: a page whose document scrolls, with no positioned ancestor. Scrolled down, the Save bar stays at the bottom of the viewport and the busy overlay covers the viewport, with the spinner in its middle.",
			},
		},
	},
	render: () => (
		<FormPageLayout
			body={<Fields count={30} />}
			footer={<SaveBackButtons />}
			other={<FormLoaderOverlay visible />}
		/>
	),
	play: async ({ canvasElement }) => {
		try {
			window.scrollTo(0, 700);
			await nextFrame();
			await expect(window.scrollY).toBe(700);
			const EPS = 1;
			const footer = rectOf(buttonBar(canvasElement));
			const viewportHeight = document.documentElement.clientHeight;
			await expect(
				distance(footer.bottom, viewportHeight - 36),
			).toBeLessThanOrEqual(EPS);
			const overlay = rectOf(overlayIn(canvasElement));
			await expect(overlay.top).toBeLessThanOrEqual(EPS);
			await expect(overlay.bottom).toBeGreaterThanOrEqual(viewportHeight - EPS);
			const spinner = rectOf(progressbarIn(canvasElement));
			await expect(
				distance(middleOf(spinner), viewportHeight / 2),
			).toBeLessThanOrEqual(EPS);
		} finally {
			window.scrollTo(0, 0);
		}
	},
};

export const Issue3473Item2FooterStaysPutInDialog: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3473-ITEM-2: in a FormDialog the Save bar stays at the same place inside the dialog while its content scrolls, also at the end, where the last field ends above it.",
			},
		},
	},
	render: () => <DialogForm count={15} />,
	play: async () => {
		const screen = within(document.body);
		await screen.findByRole("button", { name: "Save" });
		const content = screen.getByTestId("content");
		const paper = rectOf(screen.getByRole("dialog"));
		const before = rectOf(buttonBar(content));
		await expect(before.top).toBeGreaterThan(paper.top);
		await expect(before.bottom).toBeLessThan(paper.bottom);

		content.scrollTop = content.scrollHeight;
		await nextFrame();
		await expect(content.scrollTop).toBeGreaterThan(0);
		const after = rectOf(buttonBar(content));
		// scrollTop is a whole number while the content height can be fractional
		await expect(distance(after.top, before.top)).toBeLessThanOrEqual(1);
		await expect(distance(after.bottom, before.bottom)).toBeLessThanOrEqual(1);
		const lastField = screen
			.getByRole("textbox", { name: /field number 14/ })
			.closest(".MuiFormControl-root");
		if (!lastField) throw new Error("the last field is not a FormControl");
		await expect(rectOf(lastField).bottom).toBeLessThanOrEqual(after.top);
	},
};
