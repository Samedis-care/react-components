import { describe, it, expect, afterEach, vi } from "vitest";
import React from "react";
import { render, cleanup } from "@testing-library/react";
import { ThemeProvider, createTheme, Theme } from "@mui/material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import * as Icons from "../../src/standalone/Icons";

// every icon in src/standalone/Icons
const ALL_ICONS = { ...Icons };
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

describe("viewBox", () => {
	const CALLER_VIEW_BOX = "-4 -4 32 32";

	it.each(ALL_NAMES)(
		"[ISSUE-3460-ITEM-11] %s draws in a caller's viewBox, like a Material icon",
		(name) => {
			const Icon = ALL_ICONS[name];
			// a Material icon takes a caller's viewBox in place of SvgIcon's 0 0 24 24
			expect(
				renderIcon(<FilterAltIcon viewBox={CALLER_VIEW_BOX} />).svg,
				"Material icon",
			).toHaveAttribute("viewBox", CALLER_VIEW_BOX);
			cleanup();
			expect(
				renderIcon(<Icon viewBox={CALLER_VIEW_BOX} />).svg,
			).toHaveAttribute("viewBox", CALLER_VIEW_BOX);
		},
	);

	it.each(ALL_NAMES)(
		"[ISSUE-3460-ITEM-11] %s draws in its glyph's own viewBox when the caller passes none or undefined",
		(name) => {
			const Icon = ALL_ICONS[name];
			const own = renderIcon(<Icon />).svg.getAttribute("viewBox");
			// the glyph's viewBox, not SvgIcon's default
			expect(own).toMatch(/\S/);
			expect(own).not.toBe("0 0 24 24");
			cleanup();
			// like a Material icon's 0 0 24 24, the default also holds for an explicit undefined
			expect(renderIcon(<Icon viewBox={undefined} />).svg).toHaveAttribute(
				"viewBox",
				own,
			);
		},
	);
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
