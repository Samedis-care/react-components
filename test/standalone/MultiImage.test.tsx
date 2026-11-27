import React, { useState } from "react";
import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import {
	act,
	cleanup,
	createEvent,
	fireEvent,
	render,
	screen,
	within,
} from "@testing-library/react";
import { ThemeProvider, createTheme, Theme } from "@mui/material";
import MultiImage, {
	MultiImageImage,
	MultiImageProps,
} from "../../src/standalone/FileUpload/MultiImage/MultiImage";
import ccI18n from "../../src/i18n";
import { waitForCcI18n } from "../waitForCcI18n";

// jsdom has no canvas, so the image pipeline itself is replaced; what is tested here is
// when MultiImage processes files and what it does with the result
const processImageMock = vi.hoisted(() => vi.fn());
vi.mock("../../src/utils/processImage", () => ({ default: processImageMock }));

afterEach(cleanup);

beforeAll(async () => {
	await waitForCcI18n();
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

// ---------------------------------------------------------------------------
// Harness for the behavior tests below
// ---------------------------------------------------------------------------

afterEach(async () => {
	vi.restoreAllMocks();
	vi.useRealTimers();
	processImageMock.mockReset();
	if (ccI18n.language !== "en") await ccI18n.changeLanguage("en");
});

const t = (key: string) => ccI18n.t(key);
const UPLOAD = "upload.png";
const CAPTURE = "capture.png";

const mk = (id: string, name = `${id}.png`): MultiImageImage => ({
	id,
	image: `${id}.png`,
	name,
});
const png = (name: string) => new File([name], name, { type: "image/png" });
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));
const flush = () => act(tick);
const deferred = <T,>() => {
	let resolve!: (value: T) => void;
	const promise = new Promise<T>((res) => {
		resolve = res;
	});
	return { promise, resolve };
};
const last = <T,>(list: T[]): T => list[list.length - 1];
const names = (list: MultiImageImage[]) => list.map((img) => img.name);
const ids = (list: MultiImageImage[]) => list.map((img) => img.id);

const fileInput = (container: HTMLElement) =>
	container.querySelector<HTMLInputElement>('input[type="file"]')!;
const entries = (dialog: HTMLElement) =>
	Array.from(
		dialog.querySelectorAll<HTMLElement>('[class*="CcImageDialogEntry-root"]'),
	);
// the Remove button of an entry, found by its label
const removeButtonOf = (entry: HTMLElement) =>
	within(entry).getByLabelText(t("standalone.file-upload.multi-image.remove"));
// the hidden file input the entry's Replace button opens
const replaceInputOf = (entry: HTMLElement) =>
	entry.querySelector<HTMLInputElement>('input[type="file"]')!;
// found by its text, so it keeps working once the link becomes a button (ISSUE-3491-ITEM-28)
const openEdit = () => {
	fireEvent.click(
		screen.getByText(t("standalone.file-upload.multi-image.edit")),
	);
	return screen.getByRole("dialog");
};

const renderPlain = (props: Partial<MultiImageProps>, activeTheme?: Theme) => {
	const element = (p: Partial<MultiImageProps>) => (
		<ThemeProvider theme={activeTheme ?? theme}>
			<MultiImage
				label={"Images"}
				uploadImage={UPLOAD}
				captureImage={CAPTURE}
				images={[]}
				primary={null}
				{...p}
			/>
		</ThemeProvider>
	);
	const utils = render(element(props));
	return {
		...utils,
		update: (p: Partial<MultiImageProps>) =>
			utils.rerender(element({ ...props, ...p })),
	};
};

interface OwnerLog {
	changes: MultiImageImage[][];
	primary: (string | null)[];
	/** applies the last onChange list (only needed with deferImages) */
	applyImages: () => void;
}
type OwnerProps = Partial<MultiImageProps> & {
	initial: MultiImageImage[];
	initialPrimary?: string | null;
	log: OwnerLog;
	/** keep the images until log.applyImages() runs, like an owner that saves first */
	deferImages?: boolean;
};
// a stateful owner, as an app would write one
const Owner = (props: OwnerProps) => {
	const { initial, initialPrimary, log, deferImages, ...rest } = props;
	const [images, setImages] = useState(initial);
	const [primary, setPrimary] = useState<string | null>(initialPrimary ?? null);
	log.applyImages = () => setImages(last(log.changes));
	return (
		<MultiImage
			label={"Images"}
			uploadImage={UPLOAD}
			captureImage={CAPTURE}
			images={images}
			primary={primary}
			onChange={(_name, list) => {
				log.changes.push(list);
				if (!deferImages) setImages(list);
			}}
			onPrimaryChange={(_name, id) => {
				log.primary.push(id);
				setPrimary(id);
			}}
			{...rest}
		/>
	);
};
const renderOwner = (props: Omit<OwnerProps, "log">) => {
	const log: OwnerLog = { changes: [], primary: [], applyImages: () => {} };
	return {
		...render(
			<ThemeProvider theme={theme}>
				<Owner log={log} {...props} />
			</ThemeProvider>,
		),
		log,
	};
};

// ---------------------------------------------------------------------------
// Adding images
// ---------------------------------------------------------------------------

describe("MultiImage — adding images", () => {
	it("[ISSUE-3491-ITEM-3] two overlapping picks: both images are added", async () => {
		const first = deferred<File>();
		const second = deferred<File>();
		processImageMock
			.mockReturnValueOnce(first.promise)
			.mockReturnValueOnce(second.promise);
		const { container, log } = renderOwner({
			initial: [mk("x")],
			initialPrimary: "x",
		});
		const [a, b] = [png("a.png"), png("b.png")];
		fireEvent.change(fileInput(container), { target: { files: [a] } });
		fireEvent.change(fileInput(container), { target: { files: [b] } });
		await act(async () => {
			second.resolve(b);
			await tick();
		});
		await act(async () => {
			first.resolve(a);
			await tick();
		});
		const final = names(last(log.changes));
		expect(final).toHaveLength(3);
		expect(final).toEqual(expect.arrayContaining(["x.png", "a.png", "b.png"]));
	});

	it("[ISSUE-3491-ITEM-3] an image removed while a pick is being processed stays removed", async () => {
		const pending = deferred<File>();
		processImageMock.mockReturnValueOnce(pending.promise);
		const { container, log } = renderOwner({
			initial: [mk("x"), mk("y")],
			initialPrimary: "x",
		});
		const a = png("a.png");
		fireEvent.change(fileInput(container), { target: { files: [a] } });
		const dialog = openEdit();
		fireEvent.click(removeButtonOf(entries(dialog)[1]));
		await flush();
		expect(ids(log.changes[0])).toEqual(["x"]);
		await act(async () => {
			pending.resolve(a);
			await tick();
		});
		expect(names(last(log.changes))).toEqual(["x.png", "a.png"]);
	});

	it("[ISSUE-3491-ITEM-3] a pick that finishes while a delete confirmation is open is kept when the delete is confirmed", async () => {
		const confirm = deferred<boolean>();
		const pending = deferred<File>();
		processImageMock.mockReturnValueOnce(pending.promise);
		const { container, log } = renderOwner({
			initial: [mk("x"), mk("y")],
			initialPrimary: "x",
			onDelete: () => confirm.promise,
		});
		const a = png("a.png");
		fireEvent.change(fileInput(container), { target: { files: [a] } });
		const dialog = openEdit();
		fireEvent.click(removeButtonOf(entries(dialog)[1]));
		await act(async () => {
			pending.resolve(a);
			await tick();
		});
		expect(names(log.changes[0])).toEqual(["x.png", "y.png", "a.png"]);
		await act(async () => {
			confirm.resolve(true);
			await tick();
		});
		expect(names(last(log.changes))).toEqual(["x.png", "a.png"]);
	});

	it("[ISSUE-3491-ITEM-15] two picks that finish in the same millisecond get different ids", async () => {
		vi.useFakeTimers({ toFake: ["Date"] });
		vi.setSystemTime(1000);
		processImageMock.mockImplementation((file: File) => Promise.resolve(file));
		const onChange = vi.fn();
		const { container } = renderPlain({ onChange });
		fireEvent.change(fileInput(container), {
			target: { files: [png("1.png")] },
		});
		fireEvent.change(fileInput(container), {
			target: { files: [png("2.png")] },
		});
		await flush();
		const added = (onChange.mock.calls as [string, MultiImageImage[]][]).map(
			([, list]) => last(list).id,
		);
		expect(added).toHaveLength(2);
		expect(added[0]).not.toBe(added[1]);
	});
});

// ---------------------------------------------------------------------------
// Removing images
// ---------------------------------------------------------------------------

describe("MultiImage — removing images", () => {
	it("[ISSUE-3491-ITEM-3] a removal confirmed after the owner passed the images again as new objects removes the image", async () => {
		const confirm = deferred<boolean>();
		const onChange = vi.fn();
		const { update } = renderPlain({
			images: [mk("x"), mk("y")],
			primary: "x",
			onChange,
			onDelete: () => confirm.promise,
		});
		const dialog = openEdit();
		fireEvent.click(removeButtonOf(entries(dialog)[1]));
		// the same images, e.g. loaded again, as new objects
		update({ images: [mk("x"), mk("y")] });
		await act(async () => {
			confirm.resolve(true);
			await tick();
		});
		expect(onChange).toHaveBeenCalledTimes(1);
		expect(ids(onChange.mock.calls[0][1] as MultiImageImage[])).toEqual(["x"]);
	});
});

// ---------------------------------------------------------------------------
// Replacing an image
// ---------------------------------------------------------------------------

describe("MultiImage — replacing an image", () => {
	it("[ISSUE-3491-ITEM-3] an image removed while a replacement is being processed stays removed", async () => {
		const pending = deferred<File>();
		processImageMock.mockReturnValueOnce(pending.promise);
		const { log } = renderOwner({
			initial: [mk("x"), mk("y")],
			initialPrimary: "x",
		});
		const dialog = openEdit();
		const replacement = png("new.png");
		fireEvent.change(replaceInputOf(entries(dialog)[0]), {
			target: { files: [replacement] },
		});
		fireEvent.click(removeButtonOf(entries(dialog)[1]));
		await flush();
		expect(ids(log.changes[0])).toEqual(["x"]);
		await act(async () => {
			pending.resolve(replacement);
			await tick();
		});
		const final = last(log.changes);
		expect(ids(final)).toEqual(["x"]);
		expect(final[0].image).toBe(replacement);
	});

	it("[ISSUE-3491-ITEM-3] a replacement that finishes after the owner passed the images again as new objects replaces the image", async () => {
		const pending = deferred<File>();
		processImageMock.mockReturnValueOnce(pending.promise);
		const onChange = vi.fn();
		const { update } = renderPlain({
			images: [mk("x"), mk("y")],
			primary: "x",
			onChange,
		});
		const dialog = openEdit();
		const replacement = png("new.png");
		fireEvent.change(replaceInputOf(entries(dialog)[1]), {
			target: { files: [replacement] },
		});
		// the same images, e.g. loaded again, as new objects
		update({ images: [mk("x"), mk("y")] });
		await act(async () => {
			pending.resolve(replacement);
			await tick();
		});
		expect(onChange).toHaveBeenCalledTimes(1);
		const list = onChange.mock.calls[0][1] as MultiImageImage[];
		expect(ids(list)).toEqual(["x", "y"]);
		expect(list[1].image).toBe(replacement);
	});

	it("[ISSUE-3491-ITEM-3] a replacement that finishes after its image was removed changes nothing", async () => {
		const pending = deferred<File>();
		processImageMock.mockReturnValueOnce(pending.promise);
		const { log } = renderOwner({
			initial: [mk("x"), mk("y")],
			initialPrimary: "x",
		});
		const dialog = openEdit();
		const replacement = png("new.png");
		fireEvent.change(replaceInputOf(entries(dialog)[1]), {
			target: { files: [replacement] },
		});
		fireEvent.click(removeButtonOf(entries(dialog)[1]));
		await flush();
		expect(ids(log.changes[0])).toEqual(["x"]);
		await act(async () => {
			pending.resolve(replacement);
			await tick();
		});
		expect(log.changes).toHaveLength(1);
	});
});
