import { describe, it, expect, afterEach, beforeAll, vi } from "vitest";
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createTheme, Theme, ThemeProvider } from "@mui/material";
import ImagePreviewDialog, {
	ImagePreviewDialogProps,
} from "../../src/standalone/FileUpload/Image/ImagePreviewDialog";
import ccI18n, { langs } from "../../src/i18n";
import { waitForCcI18n } from "../waitForCcI18n";

beforeAll(async () => {
	await waitForCcI18n();
});

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});

const PIXEL =
	"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
const defaultTheme = createTheme();

const renderDialog = (
	props?: Partial<ImagePreviewDialogProps>,
	theme: Theme = defaultTheme,
) => {
	const onClose = vi.fn();
	const utils = render(
		<ThemeProvider theme={theme}>
			<ImagePreviewDialog
				src={PIXEL}
				alt={"Test image"}
				open
				onClose={onClose}
				{...props}
			/>
		</ThemeProvider>,
	);
	return { ...utils, onClose };
};

describe("ImagePreviewDialog", () => {
	it("[ISSUE-3490-ITEM-7] the dialog is named by the image's alt", async () => {
		renderDialog();
		expect(await screen.findByRole("dialog")).toHaveAccessibleName(
			/Test image/,
		);
	});

	it("[ISSUE-3490-ITEM-7] the name is exactly the alt, follows a changed alt, and comes from the image", async () => {
		const ui = renderDialog();
		const dialog = await screen.findByRole("dialog");
		expect(dialog).toHaveAccessibleName("Test image");
		const labelledBy = dialog.getAttribute("aria-labelledby");
		expect(labelledBy).toBeTruthy();
		expect(document.getElementById(labelledBy!)).toBe(
			screen.getByRole("img", { name: "Test image" }),
		);
		ui.rerender(
			<ThemeProvider theme={defaultTheme}>
				<ImagePreviewDialog
					src={PIXEL}
					alt={"Other image"}
					open
					onClose={ui.onClose}
				/>
			</ThemeProvider>,
		);
		expect(screen.getByRole("dialog")).toHaveAccessibleName("Other image");
	});

	it("[ISSUE-3490-ITEM-8] zoom in, zoom out and reset zoom are named buttons, also without rotation, and take their classes", () => {
		const classes = {
			toolbar: "my-toolbar",
			zoomButtons: "my-zoom-buttons",
			zoomInButton: "my-zoom-in",
			zoomOutButton: "my-zoom-out",
			resetZoomButton: "my-reset-zoom",
		};
		renderDialog({ classes });
		const zoomIn = screen.getByRole("button", { name: "Zoom in" });
		expect(zoomIn).toHaveClass("my-zoom-in");
		expect(screen.getByRole("button", { name: "Zoom out" })).toHaveClass(
			"my-zoom-out",
		);
		expect(screen.getByRole("button", { name: "Reset zoom" })).toHaveClass(
			"my-reset-zoom",
		);
		expect(zoomIn.parentElement).toHaveClass("my-zoom-buttons");
		// the rotate buttons share the toolbar
		const toolbar = zoomIn.parentElement?.parentElement;
		expect(toolbar).toHaveClass("my-toolbar");
		expect(toolbar).toContainElement(
			screen.getByRole("button", { name: "Rotate left" }),
		);
		cleanup();
		renderDialog({ disableRotation: true });
		expect(screen.queryByRole("button", { name: "Rotate left" })).toBeNull();
		expect(
			screen
				.getAllByRole("button")
				.map((button) => button.getAttribute("aria-label")),
		).toEqual(["Close", "Zoom in", "Zoom out", "Reset zoom"]);
	});

	it("[ISSUE-3490-ITEM-8] the keys zoom the image, and the container is marked zoomed while it is", () => {
		renderDialog({ classes: { container: "my-container" } });
		const dialog = screen.getByRole("dialog");
		const image = screen.getByRole("img");
		const container = image.parentElement!;
		expect(container).toHaveClass("my-container");
		expect(container).not.toHaveClass("CcImagePreviewDialog-zoomed");
		fireEvent.keyDown(dialog, { key: "+" });
		expect(image.style.transform).toContain("scale(1.5)");
		expect(container).toHaveClass("my-container");
		expect(container).toHaveClass("CcImagePreviewDialog-zoomed");
		fireEvent.keyDown(dialog, { key: "=" });
		expect(image.style.transform).toContain("scale(2.25)");
		fireEvent.keyDown(dialog, { key: "-" });
		expect(image.style.transform).toContain("scale(1.5)");
		fireEvent.keyDown(dialog, { key: "0" });
		expect(image.style.transform).toContain("scale(1)");
		expect(container).not.toHaveClass("CcImagePreviewDialog-zoomed");
		// the browser's own zoom
		fireEvent.keyDown(dialog, { key: "+", ctrlKey: true });
		expect(image.style.transform).toContain("scale(1)");
	});

	it("[ISSUE-3490-ITEM-8] every locale names the zoom buttons", async () => {
		await ccI18n.loadLanguages(langs);
		const keys = ["zoom-in", "zoom-out", "reset-zoom"];
		const missing = langs.flatMap((lng) =>
			keys
				.filter(
					(key) =>
						!ccI18n.getResource(
							lng.split("-")[0],
							"translation",
							`standalone.file-upload.${key}`,
						),
				)
				.map((key) => `${lng}: ${key}`),
		);
		expect(missing, "missing translations").toEqual([]);
	});
});
