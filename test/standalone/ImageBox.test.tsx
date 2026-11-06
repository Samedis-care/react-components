import React from "react";
import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import userEventLib from "@testing-library/user-event";
import { ThemeProvider, createTheme } from "@mui/material";
import ImageBox, {
	ImageBoxProps,
} from "../../src/standalone/FileUpload/MultiImage/ImageBox";
import ImageDots, {
	ImageDotsProps,
} from "../../src/standalone/FileUpload/MultiImage/ImageDots";
import ccI18n from "../../src/i18n";

beforeAll(async () => {
	await ccI18n.init();
	// jsdom has no layout and no Element.scrollTo; ImageBox centres its swipe pane with it
	(Element.prototype as unknown as { scrollTo: unknown }).scrollTo ??= () =>
		undefined;
});

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});

const theme = createTheme();

const renderBox = (props?: Partial<ImageBoxProps>) => {
	const utils = render(
		<ThemeProvider theme={theme}>
			<ImageBox image={"walk.png"} fileName={"walk.png"} {...props} />
		</ThemeProvider>,
	);
	const root = () =>
		utils.container.querySelector<HTMLElement>('[class*="CcImageBox-root"]')!;
	return { ...utils, root };
};

const renderDots = (props?: Partial<ImageDotsProps>) => {
	const setActive = vi.fn();
	const utils = render(
		<ThemeProvider theme={theme}>
			<ImageDots total={3} active={1} setActive={setActive} {...props} />
		</ThemeProvider>,
	);
	const dots = () =>
		Array.from(
			utils.container.querySelectorAll<HTMLElement>(
				'[class*="CcImageDots-imageDot"]',
			),
		);
	return { ...utils, setActive, dots };
};

describe("ImageBox", () => {
	it("[ISSUE-3491-ITEM-2] a bare ImageBox can be opened by keyboard: it contains a button named after the image", () => {
		renderBox({ fileName: "Type plate" });
		const opener = screen.getByRole("button", { name: /Type plate/ });
		fireEvent.click(opener);
		expect(screen.getByRole("dialog")).toBeInTheDocument();
	});

	it("[ISSUE-3491-ITEM-2] the open button is named after the image, or generically without a file name", () => {
		renderBox({ fileName: "Type plate" });
		expect(screen.getByRole("button")).toHaveAccessibleName(
			"Open Type plate in full screen",
		);
		cleanup();
		renderBox({ fileName: null });
		expect(screen.getByRole("button")).toHaveAccessibleName(
			"Open image in full screen",
		);
	});

	it("[ISSUE-3491-ITEM-2] a box whose click does something else, or nothing, has no open button", () => {
		const onClick = vi.fn();
		const { root } = renderBox({ onClick });
		expect(screen.queryAllByRole("button")).toEqual([]);
		fireEvent.click(root());
		expect(onClick).toHaveBeenCalledTimes(1);
		cleanup();
		renderBox({ onClick: null });
		expect(screen.queryAllByRole("button")).toEqual([]);
	});

	it("[ISSUE-3491-ITEM-2] Enter opens the full-screen view, and Escape closes it and returns focus to the open button", async () => {
		const user = userEventLib.setup();
		renderBox({ fileName: "Type plate" });
		const opener = screen.getByRole("button", { name: /Type plate/ });
		opener.focus();
		await user.keyboard("{Enter}");
		const view = screen.getByRole("dialog");
		fireEvent.keyDown(view, { key: "Escape" });
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
		expect(opener).toHaveFocus();
	});
});

describe("ImageDots", () => {
	it("[ISSUE-3491-ITEM-2] the dots are buttons named after their image's position, the active one marked current", () => {
		const { dots } = renderDots();
		expect(screen.getAllByRole("button")).toEqual(dots());
		expect(dots().map((dot) => dot.getAttribute("aria-label"))).toEqual([
			"Image 1 of 3",
			"Image 2 of 3",
			"Image 3 of 3",
		]);
		expect(dots().map((dot) => dot.getAttribute("aria-current"))).toEqual([
			null,
			"true",
			null,
		]);
		// a dot inside a form does not submit it
		for (const dot of dots()) expect(dot).toHaveAttribute("type", "button");
	});

	it("[ISSUE-3491-ITEM-2] Enter and Space on a dot show its image", async () => {
		const user = userEventLib.setup();
		const { dots, setActive } = renderDots();
		dots()[2].focus();
		await user.keyboard("{Enter}");
		dots()[0].focus();
		await user.keyboard(" ");
		expect(setActive.mock.calls).toEqual([[2], [0]]);
	});
});
