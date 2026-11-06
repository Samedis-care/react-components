import { describe, it, expect, afterEach, beforeAll, vi } from "vitest";
import React from "react";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from "@testing-library/react";
import { createTheme, ThemeProvider } from "@mui/material";
import ImageSelector, {
	ImageSelectorProps,
} from "../../src/standalone/FileUpload/Image/ImageSelector";
import ccI18n from "../../src/i18n";

// jsdom has no canvas: the pipeline is replaced, and a pending promise models a large photo
const processImageMock = vi.hoisted(() => vi.fn());
vi.mock("../../src/utils/processImage", () => ({ default: processImageMock }));
const canCapture = vi.hoisted(() => ({ value: false }));
vi.mock("../../src/utils/getCanImageCapture", () => ({
	default: () => canCapture.value,
}));

beforeAll(async () => {
	await ccI18n.init();
});

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
	processImageMock.mockReset();
	canCapture.value = false;
});

const PIXEL =
	"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
const theme = createTheme();
const t = (key: string) => ccI18n.t(key);

const renderSel = (props?: Partial<ImageSelectorProps>) => {
	const onChange = vi.fn();
	const utils = render(
		<ThemeProvider theme={theme}>
			<ImageSelector
				name={"photo"}
				value={PIXEL}
				capture={false}
				alt={"Employee photo"}
				label={"Photo"}
				readOnly={false}
				onChange={onChange}
				{...props}
			/>
		</ThemeProvider>,
	);
	return {
		...utils,
		onChange,
		input: () =>
			utils.container.querySelector<HTMLInputElement>('input[type="file"]'),
	};
};

describe("ImageSelector — roles and names", () => {
	it("[ISSUE-3490-ITEM-1] modern, empty: a named button opens the picker and carries name and onBlur", () => {
		const onBlur = vi.fn();
		const click = vi
			.spyOn(HTMLInputElement.prototype, "click")
			.mockImplementation(() => {});
		renderSel({ variant: "modern", value: "", onBlur });
		const btn = screen.getByRole("button", {
			name: /drag|upload|click|choose|image/i,
		});
		expect(btn).toHaveAttribute("name", "photo");
		fireEvent.click(btn);
		expect(click).toHaveBeenCalledTimes(1);
		fireEvent.blur(btn);
		expect(onBlur).toHaveBeenCalledTimes(1);
	});

	it("[ISSUE-3490-ITEM-1] modern, empty: the button is named by its visible text, also by uploadLabel, and does not submit a form", () => {
		const onSubmit = vi.fn((evt: React.FormEvent) => evt.preventDefault());
		vi.spyOn(HTMLInputElement.prototype, "click").mockImplementation(() => {});
		render(
			<ThemeProvider theme={theme}>
				<form onSubmit={onSubmit}>
					<ImageSelector
						name={"photo"}
						value={""}
						capture={false}
						alt={"Employee photo"}
						label={"Photo"}
						readOnly={false}
						variant={"modern"}
					/>
				</form>
			</ThemeProvider>,
		);
		const btn = screen.getByRole("button", {
			name: t("standalone.file-upload.upload-modern"),
		});
		expect(btn).toHaveAttribute("type", "button");
		fireEvent.click(btn);
		expect(onSubmit).not.toHaveBeenCalled();
		cleanup();
		renderSel({ variant: "modern", value: "", uploadLabel: "Choose picture" });
		expect(
			screen.getByRole("button", { name: "Choose picture" }),
		).toBeInTheDocument();
	});

	it("[ISSUE-3490-ITEM-1] modern, empty, read-only: the call to action is no button", () => {
		renderSel({ variant: "modern", value: "", readOnly: true });
		expect(
			screen.getByText(t("standalone.file-upload.upload-modern")),
		).toBeInTheDocument();
		expect(screen.queryByRole("button")).toBe(null);
	});

	it("[ISSUE-3490-ITEM-1] modern: after a pick, focus moves from the empty field's button to the image's upload button", async () => {
		vi.spyOn(HTMLInputElement.prototype, "click").mockImplementation(() => {});
		processImageMock.mockImplementation((file: File) => Promise.resolve(file));
		// holds the value like a form, with a URL for the File (jsdom has no object URLs)
		const Controlled = (props: { autoFocusOnImage?: boolean }) => {
			const [value, setValue] = React.useState("");
			return (
				<ThemeProvider theme={theme}>
					<button type={"button"}>before</button>
					{props.autoFocusOnImage && value && (
						<input aria-label={"next"} autoFocus />
					)}
					<ImageSelector
						name={"photo"}
						value={value}
						capture={false}
						alt={"Employee photo"}
						label={"Photo"}
						readOnly={false}
						variant={"modern"}
						onChange={() => setValue(PIXEL)}
					/>
				</ThemeProvider>
			);
		};
		const pick = async () => {
			await act(async () => {
				fireEvent.change(
					document.querySelector<HTMLInputElement>('input[type="file"]')!,
					{
						target: {
							files: [new File(["x"], "pic.png", { type: "image/png" })],
						},
					},
				);
				await new Promise((resolve) => setTimeout(resolve, 0));
			});
		};

		render(<Controlled />);
		const cta = screen.getByRole("button", {
			name: t("standalone.file-upload.upload-modern"),
		});
		act(() => cta.focus());
		fireEvent.click(cta);
		await pick();
		expect(cta).not.toBeInTheDocument();
		expect(
			screen.getByRole("button", {
				name: t("standalone.file-upload.upload-modern-btn"),
			}),
		).toHaveFocus();
		cleanup();

		// without focus in the field, the image arriving does not pull focus into it
		render(<Controlled />);
		expect(document.activeElement).toBe(document.body);
		await pick();
		expect(
			screen.getByRole("button", {
				name: t("standalone.file-upload.upload-modern-btn"),
			}),
		).toBeInTheDocument();
		expect(document.activeElement).toBe(document.body);
		cleanup();

		// focus that is elsewhere when the image arrives stays there
		render(<Controlled />);
		const before = screen.getByRole("button", { name: "before" });
		act(() => before.focus());
		await pick();
		expect(
			screen.queryByRole("button", {
				name: t("standalone.file-upload.upload-modern"),
			}),
		).toBe(null);
		expect(before).toHaveFocus();
		cleanup();

		// focus that another element takes in the same update stays there too
		render(<Controlled autoFocusOnImage />);
		const cta2 = screen.getByRole("button", {
			name: t("standalone.file-upload.upload-modern"),
		});
		act(() => cta2.focus());
		await pick();
		expect(cta2).not.toBeInTheDocument();
		expect(screen.getByRole("textbox", { name: "next" })).toHaveFocus();
	});
});
