import { describe, it, expect, afterEach, beforeAll, vi } from "vitest";
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { createTheme, Theme, ThemeProvider } from "@mui/material";
import ImagePreviewDialog, {
	ImagePreviewDialogProps,
} from "../../src/standalone/FileUpload/Image/ImagePreviewDialog";
import ccI18n from "../../src/i18n";

beforeAll(async () => {
	await ccI18n.init();
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
});
