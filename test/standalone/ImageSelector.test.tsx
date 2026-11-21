import { describe, it, expect, afterEach, beforeAll, vi } from "vitest";
import React from "react";
import {
	act,
	cleanup,
	createEvent,
	fireEvent,
	render,
	waitFor,
} from "@testing-library/react";
import userEventLib from "@testing-library/user-event";
import { createTheme, Theme, ThemeProvider } from "@mui/material";
import ImageSelector, {
	ImageSelectorProps,
} from "../../src/standalone/FileUpload/Image/ImageSelector";
import ccI18n from "../../src/i18n";

// jsdom has no canvas, so the image pipeline itself is replaced; what is tested here is
// when the control processes, what it does with the result and how it reports failures
const processImageMock = vi.hoisted(() => vi.fn());
vi.mock("../../src/utils/processImage", () => ({ default: processImageMock }));
// getCanImageCapture caches its answer at module scope, and neither jsdom nor desktop
// browsers support the capture attribute
const canCapture = vi.hoisted(() => ({ value: false }));
vi.mock("../../src/utils/getCanImageCapture", () => ({
	default: () => canCapture.value,
}));
const captureErrorMock = vi.hoisted(() => vi.fn());
vi.mock("../../src/framework/ErrorReporting", async (importOriginal) => ({
	...(await importOriginal<object>()),
	captureError: captureErrorMock,
}));

beforeAll(async () => {
	await ccI18n.init();
	// jsdom does not implement matchMedia, which the Framework's ThemeProvider needs.
	if (!window.matchMedia) {
		window.matchMedia = (query: string) => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: () => {},
			removeListener: () => {},
			addEventListener: () => {},
			removeEventListener: () => {},
			dispatchEvent: () => false,
		});
	}
});

afterEach(async () => {
	cleanup();
	vi.restoreAllMocks();
	processImageMock.mockReset();
	captureErrorMock.mockReset();
	canCapture.value = false;
	if (ccI18n.language !== "en") await ccI18n.changeLanguage("en");
});

const PIXEL =
	"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
const theme = createTheme();
// the drop zones: the Grid inside the frame (normal, modern) or the root (profile_picture)
const ZONES = { rootClassic: "zone", rootModern: "zone", pfpRoot: "zone" };
const VARIANTS = ["normal", "modern", "profile_picture"] as const;

const png = (name: string) => new File([name], name, { type: "image/png" });
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

const renderSel = (
	props?: Partial<ImageSelectorProps>,
	activeTheme: Theme = theme,
) => {
	const onChange = vi.fn<(name: string, value: File) => void>();
	const element = (p?: Partial<ImageSelectorProps>) => (
		<ThemeProvider theme={activeTheme}>
			<ImageSelector
				name={"photo"}
				value={PIXEL}
				capture={false}
				alt={"Photo"}
				label={"Photo label"}
				readOnly={false}
				onChange={onChange}
				classes={ZONES}
				{...p}
			/>
		</ThemeProvider>
	);
	const utils = render(element(props));
	const input = () =>
		utils.container.querySelector<HTMLInputElement>('input[type="file"]');
	return {
		...utils,
		onChange,
		input,
		update: (p?: Partial<ImageSelectorProps>) =>
			utils.rerender(element({ ...props, ...p })),
		zone: () => utils.container.querySelector(".zone")!,
		pick: async (file: File) => {
			await act(async () => {
				fireEvent.change(input()!, { target: { files: [file] } });
				await flush();
			});
		},
		drop: async (files: File[]) => {
			const zone = utils.container.querySelector(".zone")!;
			let evt!: Event;
			await act(async () => {
				evt = createEvent.drop(zone, { dataTransfer: { files } });
				fireEvent(zone, evt);
				await flush();
			});
			return evt;
		},
		dragOver: () => {
			const zone = utils.container.querySelector(".zone")!;
			const evt = createEvent.dragOver(zone);
			fireEvent(zone, evt);
			return evt;
		},
	};
};

describe("ImageSelector — picking an image", () => {
	it("[ISSUE-3490-ITEM-2] clears the input after a pick, so the same file can be picked again", async () => {
		processImageMock.mockImplementation((f: File) => Promise.resolve(f));
		const user = userEventLib.setup({ applyAccept: false });
		for (const variant of VARIANTS) {
			const ui = renderSel({ value: "", variant });
			await act(async () => {
				await user.upload(ui.input()!, png("me.png"));
			});
			await waitFor(() => expect(ui.onChange).toHaveBeenCalledTimes(1));
			// browsers fire no change event for a selection equal to the input's current value
			expect(ui.input()!.value, variant).toBe("");
			cleanup();
		}
	});

	it("[ISSUE-3490-ITEM-2] clears the input after a cancelled postEditCallback", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		const user = userEventLib.setup({ applyAccept: false });
		const postEditCallback = vi.fn(() =>
			Promise.reject(new Error("User cancelled")),
		);
		const ui = renderSel({ value: "", postEditCallback });
		await act(async () => {
			await user.upload(ui.input()!, png("me.png"));
		});
		await waitFor(() => expect(postEditCallback).toHaveBeenCalledTimes(1));
		expect(ui.input()!.value).toBe("");
	});

	it("[ISSUE-3490-ITEM-2] the same image picked again after a cancelled edit, an error or a change the owner did not apply is processed again", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		// like a browser, user-event fires no change event for a selection equal to the input's
		const user = userEventLib.setup({ applyAccept: false });
		const me = png("me.png");
		const onError = vi.fn();
		const postEditCallback = vi
			.fn<(f: File) => Promise<Blob>>()
			.mockRejectedValueOnce(new Error("User cancelled"))
			.mockImplementation((f) => Promise.resolve(f));
		processImageMock
			.mockRejectedValueOnce(new Error("canvas"))
			.mockImplementation((f: File) => Promise.resolve(f));
		const ui = renderSel({ value: "", onError, postEditCallback });
		const pickMe = async () => {
			await act(async () => {
				await user.upload(ui.input()!, me);
			});
		};
		// cancelled in the edit dialog
		await pickMe();
		expect(postEditCallback).toHaveBeenCalledTimes(1);
		// edited, then the image cannot be processed
		await pickMe();
		await waitFor(() => expect(onError).toHaveBeenCalledTimes(1));
		// handed to onChange, which the owner does not apply: the value stays empty
		await pickMe();
		await waitFor(() => expect(ui.onChange).toHaveBeenCalledTimes(1));
		await pickMe();
		await waitFor(() => expect(ui.onChange).toHaveBeenCalledTimes(2));
		expect(postEditCallback).toHaveBeenCalledTimes(4);
		expect(ui.onChange.mock.calls[1][0]).toBe("photo");
		expect(ui.onChange.mock.calls[1][1]).toBe(me);
	});
});
