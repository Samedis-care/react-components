import { describe, it, expect, afterEach, vi } from "vitest";
import React from "react";
import { render, cleanup } from "@testing-library/react";
import { ThemeProvider, createTheme, Theme } from "@mui/material";
import * as Icons from "../../src/standalone/Icons";
import SuccessOutlinedIcon from "../../src/standalone/Icons/SuccessOutlinedIcon";

// every icon in src/standalone/Icons, including the one the barrel misses
const ALL_ICONS = { ...Icons, SuccessOutlinedIcon };
type IconName = keyof typeof ALL_ICONS;
const ALL_NAMES = Object.keys(ALL_ICONS) as IconName[];

const theme = createTheme();
const wrap = (ui: React.ReactNode, withTheme: Theme = theme) => (
	<ThemeProvider theme={withTheme}>{ui}</ThemeProvider>
);
const renderIcon = (ui: React.ReactElement, withTheme: Theme = theme) => {
	const result = render(wrap(ui, withTheme));
	const svgs = result.container.querySelectorAll("svg");
	expect(svgs).toHaveLength(1);
	return { ...result, svg: svgs[0] };
};

afterEach(() => {
	// auto-cleanup is off in this repo
	cleanup();
	vi.restoreAllMocks();
});

describe.each(ALL_NAMES)("%s", (name) => {
	const Icon = ALL_ICONS[name];

	it("passes a ref to the svg (React 19)", () => {
		const ref = React.createRef<SVGSVGElement>();
		const { svg } = renderIcon(<Icon ref={ref} />);
		expect(ref.current).toBe(svg);
		cleanup();

		const callbackRef = vi.fn();
		const { svg: svg2, unmount } = renderIcon(<Icon ref={callbackRef} />);
		expect(callbackRef).toHaveBeenCalledWith(svg2);
		unmount();
		expect(callbackRef.mock.lastCall?.[0]).toBeNull();
	});
});

describe("fill", () => {
	it("[ISSUE-3460-ITEM-4] SignIcon hard-codes no fill and passes a caller's fill through", () => {
		const { svg } = renderIcon(<Icons.SignIcon />);
		expect(svg).not.toHaveAttribute("fill");
		cleanup();
		expect(renderIcon(<Icons.SignIcon fill={"red"} />).svg).toHaveAttribute(
			"fill",
			"red",
		);
	});
});
