import React from "react";
import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import {
	cleanup,
	createEvent,
	fireEvent,
	render,
	screen,
	within,
} from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material";
import MultiImage, {
	MultiImageProps,
} from "../../src/standalone/FileUpload/MultiImage/MultiImage";
import ccI18n from "../../src/i18n";

afterEach(cleanup);

beforeAll(async () => {
	await ccI18n.init();
	// jsdom has no layout, so it ships no Element.scrollTo — ImageBox centers its
	// swipe pane with one on mount.
	(Element.prototype as unknown as { scrollTo: unknown }).scrollTo ??= () =>
		undefined;
});

const theme = createTheme();

const PIXEL =
	"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

const renderMultiImage = (props?: Partial<MultiImageProps>) =>
	render(
		<ThemeProvider theme={theme}>
			<MultiImage
				label={"Images"}
				uploadImage={PIXEL}
				captureImage={PIXEL}
				images={[{ id: "img-1", image: PIXEL, name: "one.gif" }]}
				primary={"img-1"}
				{...props}
			/>
		</ThemeProvider>,
	);

describe("MultiImage", () => {
	it("opens the edit dialog when the edit label is clicked", async () => {
		renderMultiImage();
		fireEvent.click(screen.getByRole("link", { name: "Edit" }));
		expect(await screen.findByRole("dialog")).toBeInTheDocument();
	});

	/**
	 * The edit label is an anchor for looks and keyboard focus only. If its href
	 * navigates, the "#" entry it pushes has a null history state, which takes
	 * history@5's popstate handler down the "location we did not create" branch:
	 * it stops calling the blockers, so every FrameworkHistory.block guard on the
	 * page (the dirty form guard) silently dies. jsdom does not
	 * follow fragment links, so the cancelled default is what we can assert on.
	 */
	it("does not navigate when the edit label is clicked", () => {
		renderMultiImage();
		const editLink = screen.getByRole("link", { name: "Edit" });
		const click = createEvent.click(editLink);
		fireEvent(editLink, click);
		expect(click.defaultPrevented).toBe(true);
	});

	it("renders a custom edit label", () => {
		renderMultiImage({ editLabel: "Change pictures" });
		expect(
			screen.getByRole("link", { name: "Change pictures" }),
		).toBeInTheDocument();
	});

	it("does not render the edit label when read-only", () => {
		renderMultiImage({ readOnly: true });
		expect(screen.queryByRole("link")).not.toBeInTheDocument();
	});

	it("[ISSUE-3511-ITEM-18] shows dialogMessage in the edit dialog only", async () => {
		renderMultiImage({ dialogMessage: <div role={"alert"}>Refused</div> });
		expect(screen.queryByRole("alert")).toBe(null);

		fireEvent.click(screen.getByRole("link", { name: "Edit" }));
		const dialog = await screen.findByRole("dialog");

		expect(within(dialog).getByRole("alert")).toHaveTextContent("Refused");
	});

	it("[ISSUE-3511-ITEM-18] reports the edit dialog opening and closing", async () => {
		const onDialogOpenChange = vi.fn();
		renderMultiImage({ onDialogOpenChange });
		expect(onDialogOpenChange).not.toHaveBeenCalled();

		fireEvent.click(screen.getByRole("link", { name: "Edit" }));
		await screen.findByRole("dialog");
		expect(onDialogOpenChange.mock.calls).toEqual([[true]]);

		fireEvent.click(screen.getByRole("button", { name: "Close" }));
		expect(onDialogOpenChange.mock.calls).toEqual([[true], [false]]);
	});

	it("[ISSUE-3511-ITEM-18] reports the edit dialog closed when the control becomes read-only or unmounts with it open", async () => {
		const onDialogOpenChange = vi.fn();
		const element = (readOnly: boolean) => (
			<ThemeProvider theme={theme}>
				<MultiImage
					label={"Images"}
					uploadImage={PIXEL}
					captureImage={PIXEL}
					images={[{ id: "img-1", image: PIXEL, name: "one.gif" }]}
					primary={"img-1"}
					onDialogOpenChange={onDialogOpenChange}
					readOnly={readOnly}
				/>
			</ThemeProvider>
		);
		const { rerender, unmount } = render(element(false));
		fireEvent.click(screen.getByRole("link", { name: "Edit" }));
		await screen.findByRole("dialog");

		rerender(element(true));
		expect(onDialogOpenChange.mock.calls).toEqual([[true], [false]]);
		rerender(element(false));
		expect(onDialogOpenChange.mock.calls).toEqual([[true], [false], [true]]);
		unmount();
		expect(onDialogOpenChange.mock.calls).toEqual([
			[true],
			[false],
			[true],
			[false],
		]);
	});
});
