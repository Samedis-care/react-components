import React, { useState } from "react";
import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import userEventLib from "@testing-library/user-event";
import { ThemeProvider, createTheme } from "@mui/material";
import MultiImage, {
	MultiImageImage,
	MultiImageProps,
} from "../../src/standalone/FileUpload/MultiImage/MultiImage";
import ccI18n from "../../src/i18n";

// jsdom has no canvas: the image pipeline is replaced
const processImageMock = vi.hoisted(() => vi.fn());
vi.mock("../../src/utils/processImage", () => ({ default: processImageMock }));
vi.mock("../../src/framework/ErrorReporting", async (importOriginal) => ({
	...(await importOriginal<object>()),
	captureError: vi.fn(),
}));
// getCanImageCapture caches its answer at module scope, and neither jsdom nor desktop
// browsers support the capture attribute
const canCapture = vi.hoisted(() => ({ value: false }));
vi.mock("../../src/utils/getCanImageCapture", () => ({
	default: () => canCapture.value,
}));
afterEach(() => {
	canCapture.value = false;
});

beforeAll(async () => {
	await ccI18n.init();
	// jsdom has no layout and no Element.scrollTo; ImageBox centres its swipe pane with it
	(Element.prototype as unknown as { scrollTo: unknown }).scrollTo ??= () =>
		undefined;
});

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
	processImageMock.mockReset();
});

const theme = createTheme();
const t = (key: string) => ccI18n.t(key);
const UPLOAD = "upload.png";
const REMOVE = () => t("standalone.file-upload.multi-image.remove");
const PREV = () => t("standalone.file-upload.multi-image.prev-image");
const NEXT = () => t("standalone.file-upload.multi-image.next-image");
const CLOSE = () => t("standalone.file-upload.close");
const EDIT = () => t("standalone.file-upload.multi-image.edit");
const REPLACE = () => t("standalone.file-upload.multi-image.replace");

const mk = (id: string): MultiImageImage => ({
	id,
	image: `${id}.png`,
	name: `${id}.png`,
});
const png = (name: string) => new File([name], name, { type: "image/png" });
const allDialogs = () =>
	Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"]'));
const pageImg = (container: HTMLElement) =>
	container.querySelector<HTMLImageElement>(
		'[class*="CcMultiImage-root"] img',
	)!;
const entries = (dialog: HTMLElement) =>
	Array.from(
		dialog.querySelectorAll<HTMLElement>('[class*="CcImageDialogEntry-root"]'),
	);
const openEdit = () => {
	fireEvent.click(screen.getByText(EDIT()));
	return screen.getByRole("dialog");
};

const renderPlain = (props: Partial<MultiImageProps>) =>
	render(
		<ThemeProvider theme={theme}>
			<MultiImage
				label={"Images"}
				uploadImage={UPLOAD}
				captureImage={UPLOAD}
				images={[]}
				primary={null}
				{...props}
			/>
		</ThemeProvider>,
	);

// a stateful owner, as an app would write one
const Owner = (
	props: Partial<MultiImageProps> & { initial: MultiImageImage[] },
) => {
	const { initial, ...rest } = props;
	const [images, setImages] = useState(initial);
	const [primary, setPrimary] = useState<string | null>(initial[0]?.id ?? null);
	return (
		<MultiImage
			label={"Images"}
			uploadImage={UPLOAD}
			captureImage={UPLOAD}
			images={images}
			primary={primary}
			onChange={(_name, list) => setImages(list)}
			onPrimaryChange={(_name, id) => setPrimary(id)}
			{...rest}
		/>
	);
};
const renderOwner = (
	props: Partial<MultiImageProps> & { initial: MultiImageImage[] },
) =>
	render(
		<ThemeProvider theme={theme}>
			<Owner {...props} />
		</ThemeProvider>,
	);

describe("MultiImage a11y — bugs", () => {
	it("[ISSUE-3491-ITEM-1] edit dialog: each image has a reachable Remove button, the add tile is a button, and the other images have a make-primary control", () => {
		renderPlain({
			images: [mk("a"), mk("b")],
			primary: "a",
			onChange: vi.fn(),
			onPrimaryChange: vi.fn(),
		});
		const dialog = openEdit();
		// role queries skip what is hidden from assistive technology (visibility: hidden)
		expect(
			within(dialog).getAllByRole("button", {
				name: new RegExp(REMOVE(), "i"),
			}),
		).toHaveLength(2);
		expect(
			within(dialog).getByRole("button", { name: /add|upload/i }),
		).toBeInTheDocument();
		const makePrimary = ["button", "radio", "checkbox", "switch"].flatMap(
			(role) =>
				within(entries(dialog)[1]).queryAllByRole(role, { name: /primary/i }),
		);
		expect(makePrimary).toHaveLength(1);
	});

	it("[ISSUE-3491-ITEM-1] Remove, Replace and make primary are visible and name the image they act on", () => {
		renderPlain({
			images: [mk("a"), mk("b")],
			primary: "a",
			onChange: vi.fn(),
			onPrimaryChange: vi.fn(),
		});
		const entry = within(entries(openEdit())[1]);
		expect(
			entry.getByRole("button", { name: `${REMOVE()} b.png` }),
		).toBeVisible();
		expect(
			entry.getByRole("button", { name: `${REPLACE()} b.png` }),
		).toBeVisible();
		expect(
			entry.getByRole("button", { name: /primary/i }),
		).toHaveAccessibleName(/b\.png/);
	});

	it("[ISSUE-3491-ITEM-1] make primary is a toggle button: pressed on the primary image, and Enter on another one makes that image primary and keeps focus", async () => {
		const user = userEventLib.setup();
		renderOwner({ initial: [mk("a"), mk("b")] });
		const dialog = openEdit();
		const stars = entries(dialog).map((entry) =>
			within(entry).getByRole("button", { name: /primary/i }),
		);
		const pressed = () =>
			stars.map((star) => star.getAttribute("aria-pressed"));
		expect(pressed()).toEqual(["true", "false"]);
		stars[1].focus();
		await user.keyboard("{Enter}");
		expect(pressed()).toEqual(["false", "true"]);
		expect(stars[1]).toHaveFocus();
	});

	it("[ISSUE-3491-ITEM-1] a read-only image offers no Remove or Replace, but can be made primary", () => {
		const onPrimaryChange = vi.fn();
		renderPlain({
			images: [{ ...mk("a"), readOnly: true }, mk("b")],
			primary: "b",
			onChange: vi.fn(),
			onPrimaryChange,
		});
		const entry = within(entries(openEdit())[0]);
		expect(
			entry.queryByRole("button", { name: new RegExp(REMOVE()) }),
		).toBeNull();
		expect(
			entry.queryByRole("button", { name: new RegExp(REPLACE()) }),
		).toBeNull();
		fireEvent.click(entry.getByRole("button", { name: /primary/i }));
		expect(onPrimaryChange).toHaveBeenCalledWith(undefined, "a");
	});

	it("[ISSUE-3491-ITEM-1] Replace opens a file picker, and the picked file replaces that image", async () => {
		processImageMock.mockImplementation((file: File) => Promise.resolve(file));
		const user = userEventLib.setup({ applyAccept: false });
		const onChange = vi.fn();
		const images = [mk("a"), mk("b")];
		renderPlain({ images, primary: "a", onChange });
		const dialog = openEdit();
		const click = vi.spyOn(HTMLInputElement.prototype, "click");
		fireEvent.click(
			within(entries(dialog)[1]).getByRole("button", {
				name: new RegExp(REPLACE()),
			}),
		);
		expect(click).toHaveBeenCalledTimes(1);
		const input = click.mock.contexts[0] as HTMLInputElement;
		expect(input).toHaveAttribute("type", "file");
		expect(input).not.toHaveAttribute("multiple");
		click.mockRestore();

		const replacement = png("new.png");
		await act(async () => {
			await user.upload(input, replacement);
		});
		await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
		const [, list] = onChange.mock.calls[0] as [string, MultiImageImage[]];
		expect(list.map((img) => img.id)).toEqual(["a", "b"]);
		expect(list[0]).toBe(images[0]);
		expect(list[1].image).toBe(replacement);
		// cleared, so the same file can be picked again
		expect(input.value).toBe("");
	});

	it("[ISSUE-3491-ITEM-1] the add and camera tiles are buttons that open the file picker by keyboard, the camera tile with capture", async () => {
		canCapture.value = true;
		const user = userEventLib.setup();
		const { container } = renderPlain({
			images: [mk("a")],
			primary: "a",
			onChange: vi.fn(),
			capture: "environment",
		});
		const input =
			container.querySelector<HTMLInputElement>('input[type="file"]')!;
		const opened: (string | null)[] = [];
		vi.spyOn(input, "click").mockImplementation(() => {
			opened.push(input.getAttribute("capture"));
		});
		const dialog = openEdit();
		within(dialog)
			.getByRole("button", {
				name: t("standalone.file-upload.multi-image.add"),
			})
			.focus();
		await user.keyboard("{Enter}");
		within(dialog)
			.getByRole("button", {
				name: t("standalone.file-upload.upload-capture.image"),
			})
			.focus();
		await user.keyboard(" ");
		expect(opened).toEqual([null, "environment"]);
	});

	it("[ISSUE-3491-ITEM-2] page: a button named after the shown image opens the full-screen view, and Previous and Next are reachable", () => {
		const { container } = renderPlain({
			images: [mk("a"), mk("b"), mk("c")],
			primary: "b",
			readOnly: true,
		});
		const opener = within(container).getByRole("button", { name: /b\.png/ });
		// before the view opens: the modal view hides the page from assistive technology
		expect(
			within(container).getByRole("button", { name: PREV() }),
		).toBeInTheDocument();
		expect(
			within(container).getByRole("button", { name: NEXT() }),
		).toBeInTheDocument();
		fireEvent.click(opener);
		expect(screen.getByRole("dialog")).toBeInTheDocument();
	});

	it("[ISSUE-3491-ITEM-2] page: Tab reaches the open button, Previous, Next and a dot per image, in that order", async () => {
		const user = userEventLib.setup();
		renderPlain({
			images: [mk("a"), mk("b"), mk("c")],
			primary: "b",
			onChange: vi.fn(),
		});
		const reached: string[] = [];
		for (let step = 0; step < 7; step++) {
			await user.tab();
			reached.push(
				document.activeElement!.getAttribute("aria-label") ??
					document.activeElement!.textContent,
			);
		}
		expect(reached).toEqual([
			"Open b.png in full screen",
			PREV(),
			NEXT(),
			"Image 1 of 3",
			"Image 2 of 3",
			"Image 3 of 3",
			EDIT(),
		]);
	});

	it("[ISSUE-3491-ITEM-2] page: a dot shows its image, and the shown image's dot is marked current", () => {
		const { container } = renderPlain({
			images: [mk("a"), mk("b"), mk("c")],
			primary: "a",
			readOnly: true,
		});
		const dot = (n: number) =>
			within(container).getByRole("button", { name: `Image ${n} of 3` });
		expect(dot(1)).toHaveAttribute("aria-current", "true");
		fireEvent.click(dot(3));
		expect(pageImg(container)).toHaveAttribute("src", "c.png");
		expect(dot(3)).toHaveAttribute("aria-current", "true");
		expect(dot(1)).not.toHaveAttribute("aria-current");
		expect(
			within(container).getByRole("button", { name: /c\.png/ }),
		).toHaveAccessibleName("Open c.png in full screen");
	});

	it("[ISSUE-3491-ITEM-2] full-screen view: the dots are buttons too", () => {
		const { container } = renderPlain({
			images: [mk("a"), mk("b")],
			primary: "a",
			readOnly: true,
		});
		fireEvent.click(within(container).getByRole("button", { name: /a\.png/ }));
		const view = screen.getByRole("dialog");
		fireEvent.click(within(view).getByRole("button", { name: "Image 2 of 2" }));
		expect(view.querySelector("img")).toHaveAttribute("src", "b.png");
		expect(
			within(view).getByRole("button", { name: "Image 2 of 2" }),
		).toHaveAttribute("aria-current", "true");
	});

	it("[ISSUE-3491-ITEM-2] edit dialog: each image opens the full-screen view by keyboard, and Escape returns focus to it", async () => {
		const user = userEventLib.setup();
		renderPlain({
			images: [mk("a"), mk("b")],
			primary: "a",
			onChange: vi.fn(),
		});
		const dialog = openEdit();
		const opener = within(entries(dialog)[1]).getByRole("button", {
			name: "Open b.png in full screen",
		});
		opener.focus();
		await user.keyboard("{Enter}");
		expect(allDialogs()).toHaveLength(2);
		expect(allDialogs()[1].querySelector("img")).toHaveAttribute(
			"src",
			"b.png",
		);
		fireEvent.keyDown(allDialogs()[1], { key: "Escape" });
		await waitFor(() => expect(allDialogs()).toHaveLength(1));
		expect(opener).toHaveFocus();
		expect(
			within(dialog).getByRole("button", { name: CLOSE() }),
		).toBeInTheDocument();
	});
});
