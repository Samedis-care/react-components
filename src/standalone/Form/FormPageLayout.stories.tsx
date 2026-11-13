import React from "react";
import { createPortal } from "react-dom";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	Alert,
	Box,
	Button,
	Dialog,
	DialogContent,
	DialogTitle,
	Grid,
	Paper,
	TextField,
	Typography,
} from "@mui/material";
// eslint-disable-next-line import/no-unresolved
import { expect, userEvent, within } from "storybook/test";
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
				overflowY: "auto",
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
				overflowY: "auto",
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
const bodyIn = (scope: ParentNode) => {
	const body = scope.querySelector('[class*="CcFormPageLayout-body"]');
	if (!body) throw new Error("FormPageLayout not rendered");
	return body;
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

/**
 * An app shell like IMF's: a header and a main area that scrolls, with no positioned
 * ancestor, filling the viewport.
 */
const AppShell = ({ children }: { children: React.ReactNode }) => (
	<Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
		<Box
			data-testid={"header"}
			sx={{ height: 64, flex: "none", bgcolor: "primary.main" }}
		/>
		<Box
			data-testid={"main"}
			sx={{
				flex: 1,
				minHeight: 0,
				overflow: "auto",
				display: "flex",
				flexDirection: "column",
			}}
		>
			{children}
		</Box>
	</Box>
);

const paddingOf = (el: Element) => {
	const style = getComputedStyle(el);
	return {
		top: parseFloat(style.paddingTop),
		bottom: parseFloat(style.paddingBottom),
	};
};

export const Issue3473Item2ShortFormSaveAtBottomOfPage: Story = {
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				story:
					"ISSUE-3473-ITEM-2: a short form in an app shell like IMF's profile page: the main area scrolls, a page container (a Paper) fills it, and the form page's parent fills the Paper (`height: 100%`, with padding). The layout fills its parent, so Save sits at the bottom of the page, 36px above the bottom of the main area, not right below the fields, and the busy overlay covers the parent's content area.",
			},
		},
	},
	render: () => (
		<AppShell>
			<Box sx={{ p: 2, flexGrow: 1, display: "flex", flexDirection: "column" }}>
				<Paper sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
					<Box data-testid={"page"} sx={{ height: "100%", p: 2 }}>
						<FormPageLayout
							body={<Fields count={3} />}
							footer={<SaveBackButtons />}
							other={<FormLoaderOverlay visible />}
						/>
					</Box>
				</Paper>
			</Box>
		</AppShell>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const mainEl = canvas.getByTestId("main");
		const pageEl = canvas.getByTestId("page");
		await nextFrame();
		// the form is short: nothing scrolls
		await expect(mainEl.scrollHeight).toBeLessThanOrEqual(mainEl.clientHeight);
		const EPS = 1;
		const main = rectOf(mainEl);
		const footer = rectOf(buttonBar(pageEl));
		await expect(distance(footer.bottom, main.bottom - 36)).toBeLessThanOrEqual(
			EPS,
		);
		// the busy overlay covers the content area of the layout's parent
		const page = rectOf(pageEl);
		const padding = paddingOf(pageEl);
		const overlay = rectOf(overlayIn(pageEl));
		await expect(
			distance(overlay.top, page.top + padding.top),
		).toBeLessThanOrEqual(EPS);
		await expect(
			distance(overlay.bottom, page.bottom - padding.bottom),
		).toBeLessThanOrEqual(EPS);
	},
};

export const Issue3473Item2ShortFormSaveAtBottomOfFlexColumn: Story = {
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				story:
					"ISSUE-3473-ITEM-2: a short form page in a flex column that it shares with other content, like the form element of IMF's admin pages (`min-height: 100%`) with an error above the page. The layout takes the height the error leaves: Save sits 36px above the bottom of the main area, and the main area does not scroll.",
			},
		},
	},
	render: () => (
		<AppShell>
			<Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
				<Box
					sx={{ minHeight: "100%", display: "flex", flexDirection: "column" }}
				>
					<Alert severity={"error"}>The record could not be saved.</Alert>
					<FormPageLayout
						body={<Fields count={3} />}
						footer={<SaveBackButtons />}
						other={<FormLoaderOverlay visible={false} />}
					/>
				</Box>
			</Box>
		</AppShell>
	),
	play: async ({ canvasElement }) => {
		const mainEl = within(canvasElement).getByTestId("main");
		await nextFrame();
		await expect(mainEl.scrollHeight).toBeLessThanOrEqual(mainEl.clientHeight);
		const main = rectOf(mainEl);
		const footer = rectOf(buttonBar(mainEl));
		await expect(distance(footer.bottom, main.bottom - 36)).toBeLessThanOrEqual(
			1,
		);
	},
};

export const Issue3473Item9FocusedFieldNotUnderFooter: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3473-ITEM-9: tabbing through a dialog form, fields that are inside the scroll area but behind the floating footer get focus without being scrolled into view, so the focused field is hidden (WCAG 2.4.11).",
			},
		},
	},
	render: () => <DialogForm count={15} />,
	play: async () => {
		const screen = within(document.body);
		await screen.findByRole("button", { name: "Save" });
		const content = screen.getByTestId("content");
		const body = bodyIn(content);
		screen.getByRole("textbox", { name: /field number 0$/ }).focus();
		const hidden: { field: string; overlap: number }[] = [];
		for (let i = 1; i < 15; i++) {
			await userEvent.tab();
			const active = document.activeElement as HTMLElement;
			if (!body.contains(active)) break;
			await nextFrame();
			const field = active.closest(".MuiFormControl-root") ?? active;
			const overlap = overlapY(rectOf(field), rectOf(buttonBar(content)));
			if (overlap > 0)
				hidden.push({
					field: (active as HTMLInputElement).labels?.[0]?.textContent ?? "",
					overlap: Math.round(overlap),
				});
		}
		await expect(hidden).toEqual([]);
	},
};

export const Issue3473Item9FocusedFieldNotUnderFooterInScrollingDocument: Story =
	{
		parameters: {
			layout: "fullscreen",
			docs: {
				description: {
					story:
						"ISSUE-3473-ITEM-9: a page whose document scrolls. Tabbing through the form, a field that the Save bar covers, or that lies below it, is scrolled up until it ends above the bar.",
				},
			},
		},
		render: () => (
			<FormPageLayout
				body={<Fields count={30} />}
				footer={<SaveBackButtons />}
				other={<FormLoaderOverlay visible={false} />}
			/>
		),
		play: async ({ canvasElement }) => {
			const canvas = within(canvasElement);
			const body = bodyIn(canvasElement);
			try {
				canvas.getByRole("textbox", { name: /field number 0$/ }).focus();
				const hidden: { field: string; overlap: number }[] = [];
				for (let i = 1; i < 30; i++) {
					await userEvent.tab();
					const active = document.activeElement as HTMLInputElement;
					if (!body.contains(active)) break;
					await nextFrame();
					const field = active.closest(".MuiFormControl-root") ?? active;
					const overlap = overlapY(
						rectOf(field),
						rectOf(buttonBar(canvasElement)),
					);
					if (overlap > 0)
						hidden.push({
							field: active.labels?.[0]?.textContent ?? "",
							overlap: Math.round(overlap),
						});
				}
				await expect(window.scrollY).toBeGreaterThan(0);
				await expect(hidden).toEqual([]);
			} finally {
				window.scrollTo(0, 0);
			}
		},
	};

/**
 * A button that the body's content renders into a portal, at the bottom of the viewport,
 * like a Select's menu that opens over the Save bar
 */
const ButtonInPortal = () =>
	createPortal(
		<Button
			variant={"contained"}
			sx={{ position: "fixed", left: 0, right: 0, bottom: 0 }}
		>
			In a portal
		</Button>,
		document.body,
	);

export const Issue3473Item9FocusInPortalLeavesFormAlone: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3473-ITEM-9: focus that React passes on from a portal the body's content renders (a menu, a popover) is not in the layout, so the form does not scroll, even where the portal's element lies over the Save bar.",
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
				body={
					<>
						<Fields count={20} />
						<ButtonInPortal />
					</>
				}
				footer={<SaveBackButtons />}
				other={<FormLoaderOverlay visible={false} />}
			/>
		</Box>
	),
	play: async ({ canvasElement }) => {
		const panelEl = within(canvasElement).getByTestId("panel");
		const inPortal = within(document.body).getByRole("button", {
			name: "In a portal",
		});
		await expect(canvasElement.contains(inPortal)).toBe(false);
		await expect(rectOf(inPortal).bottom > rectOf(buttonBar(panelEl)).top).toBe(
			true,
		);
		inPortal.focus();
		await nextFrame();
		await nextFrame();
		await expect(panelEl.scrollTop).toBe(0);
	},
};

export const Issue3473Item9FooterInFlowOnShortScreen: Story = {
	globals: { viewport: { value: "zoomed400", isRotated: false } },
	parameters: {
		layout: "fullscreen",
		viewport: {
			options: {
				zoomed400: {
					name: "1280×1024 zoomed to 400%",
					styles: { width: "320px", height: "256px" },
					type: "desktop",
				},
			},
		},
		docs: {
			description: {
				story:
					"ISSUE-3473-ITEM-9: a page zoomed to 400% (320×256 CSS px) below a 64px app header. A floating Save bar would cover 120px of the 192px main area, so a 4-row text area could never be seen whole. On a screen at most 480px tall the footer stays in flow after the body: nothing covers the form while it scrolls, the text area can be seen whole, and at the end Save rests where a floating footer would, 36px above the bottom of the main area.",
			},
		},
	},
	render: () => (
		<AppShell>
			<FormPageLayout
				body={
					<Box sx={{ p: 2 }}>
						<Grid container spacing={2}>
							<Grid size={12}>
								<TextField
									label={"First name"}
									defaultValue={"Alice"}
									fullWidth
								/>
							</Grid>
							<Grid size={12}>
								<TextField
									label={"Last name"}
									defaultValue={"Smith"}
									fullWidth
								/>
							</Grid>
							<Grid size={12}>
								<TextField
									label={"Notes"}
									defaultValue={"one\ntwo\nthree\nfour"}
									multiline
									rows={4}
									fullWidth
								/>
							</Grid>
							<Grid size={12}>
								<TextField
									label={"Email"}
									defaultValue={"alice@example.com"}
									fullWidth
								/>
							</Grid>
							<Grid size={12}>
								<TextField
									label={"Phone"}
									defaultValue={"555 0100"}
									fullWidth
								/>
							</Grid>
						</Grid>
					</Box>
				}
				footer={<SaveBackButtons />}
				other={<FormLoaderOverlay visible={false} />}
			/>
		</AppShell>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const mainEl = canvas.getByTestId("main");
		await nextFrame();
		await expect(document.documentElement.clientHeight).toBe(256);
		const main = rectOf(mainEl);
		const EPS = 1;
		// nothing covers the form while it scrolls
		const max = mainEl.scrollHeight - mainEl.clientHeight;
		await expect(max).toBeGreaterThan(0);
		for (const scrollTop of [0, max / 2]) {
			mainEl.scrollTop = scrollTop;
			await nextFrame();
			await expect(
				overlapY(rectOf(buttonBar(mainEl)), main),
				`Save bar over the main area at ${scrollTop}`,
			).toBe(0);
		}
		// the text area can be seen whole
		const notes = canvas
			.getByRole("textbox", { name: "Notes" })
			.closest(".MuiFormControl-root");
		if (!notes) throw new Error("the text area is not a FormControl");
		mainEl.scrollTop += rectOf(notes).top - main.top;
		await nextFrame();
		await expect(rectOf(notes).top).toBeGreaterThanOrEqual(main.top - EPS);
		await expect(rectOf(notes).bottom).toBeLessThanOrEqual(main.bottom + EPS);
		await expect(overlapY(rectOf(notes), rectOf(buttonBar(mainEl)))).toBe(0);
		// at the end Save rests where a floating footer would
		mainEl.scrollTop = max;
		await nextFrame();
		await expect(
			distance(rectOf(buttonBar(mainEl)).bottom, main.bottom - 36),
		).toBeLessThanOrEqual(EPS);
	},
};
