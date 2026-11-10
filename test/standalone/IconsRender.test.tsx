import { describe, it, expect, afterEach, vi } from "vitest";
import React from "react";
import { render, cleanup, fireEvent, within } from "@testing-library/react";
import { ThemeProvider, createTheme, styled, Theme } from "@mui/material";
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

	it("renders one decorative svg with its glyph", () => {
		const { svg, container } = renderIcon(<Icon />);
		expect(svg).toHaveClass("MuiSvgIcon-root", "MuiSvgIcon-fontSizeMedium");
		// color defaults to "inherit": no palette class
		expect(
			Array.from(svg.classList).filter((cls) =>
				cls.startsWith("MuiSvgIcon-color"),
			),
		).toEqual([]);
		expect(svg).toHaveAttribute("aria-hidden", "true");
		expect(svg).toHaveAttribute("focusable", "false");
		expect(svg).not.toHaveAttribute("role");
		expect(svg).not.toHaveAttribute("tabindex");
		expect(within(container).queryByRole("img")).toBeNull();
		expect(svg.querySelector("title")).toBeNull();
		// each glyph is a single path
		expect(Array.from(svg.children, (child) => child.tagName)).toEqual([
			"path",
		]);
	});

	it("forwards SvgIcon and DOM props to the svg", () => {
		const clickTargets: EventTarget[] = [];
		const onClick = vi.fn((event: React.MouseEvent<SVGSVGElement>) => {
			clickTargets.push(event.currentTarget);
		});
		const onMouseEnter = vi.fn();
		const { svg } = renderIcon(
			<Icon
				className={"caller"}
				color={"warning"}
				fontSize={"small"}
				sx={{ marginLeft: "7px" }}
				style={{ opacity: 0.3 }}
				id={"icon-id"}
				data-testid={"icon"}
				aria-describedby={"description"}
				tabIndex={-1}
				onClick={onClick}
				onMouseEnter={onMouseEnter}
			/>,
		);
		expect(svg).toHaveClass(
			"caller",
			"MuiSvgIcon-colorWarning",
			"MuiSvgIcon-fontSizeSmall",
		);
		expect(getComputedStyle(svg).marginLeft).toBe("7px");
		expect(svg.style.opacity).toBe("0.3");
		expect(svg).toHaveAttribute("id", "icon-id");
		expect(svg).toHaveAttribute("data-testid", "icon");
		expect(svg).toHaveAttribute("aria-describedby", "description");
		expect(svg).toHaveAttribute("tabindex", "-1");
		fireEvent.click(svg);
		fireEvent.mouseEnter(svg);
		expect(onClick).toHaveBeenCalledTimes(1);
		expect(clickTargets).toEqual([svg]);
		expect(onMouseEnter).toHaveBeenCalledTimes(1);
	});

	it("takes styles and a slot class from styled(), as a theme slot does", () => {
		const Slot = styled(Icon, { name: "CcIconsTest", slot: "icon" })({
			width: 16,
			height: "auto",
		});
		const slotTheme = createTheme({
			components: {
				// @ts-expect-error CcIconsTest is a test-only slot, not in theme-def.ts
				CcIconsTest: { styleOverrides: { icon: { marginTop: "3px" } } },
			},
		});
		const { svg } = renderIcon(<Slot className={"caller"} />, slotTheme);
		expect(getComputedStyle(svg).width).toBe("16px");
		expect(getComputedStyle(svg).marginTop).toBe("3px");
		expect(svg).toHaveClass("caller", "MuiSvgIcon-root");
	});

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

	it("is named by titleAccess, and decorative again without it", () => {
		const { svg, container, rerender } = renderIcon(
			<Icon titleAccess={"Zurücksetzen"} />,
		);
		expect(within(container).getByRole("img", { name: "Zurücksetzen" })).toBe(
			svg,
		);
		expect(svg).not.toHaveAttribute("aria-hidden");
		// the <title> comes after the glyph
		expect(svg.lastElementChild?.tagName).toBe("title");
		expect(svg.lastElementChild).toHaveTextContent("Zurücksetzen");

		rerender(wrap(<Icon />));
		expect(container.querySelector("svg")).toBe(svg);
		expect(svg).toHaveAttribute("aria-hidden", "true");
		expect(svg).not.toHaveAttribute("role");
		expect(svg.querySelector("title")).toBeNull();
		expect(within(container).queryByRole("img")).toBeNull();
	});

	it("updates the same svg when its props change", () => {
		const first = vi.fn();
		const second = vi.fn();
		const { svg, container, rerender } = renderIcon(
			<Icon
				color={"primary"}
				fontSize={"small"}
				className={"a"}
				sx={{ marginLeft: "1px" }}
				htmlColor={"#000000"}
				onClick={first}
			/>,
		);
		rerender(
			wrap(
				<Icon
					color={"error"}
					fontSize={"large"}
					className={"b"}
					sx={{ marginLeft: "2px" }}
					htmlColor={"#111111"}
					onClick={second}
				/>,
			),
		);
		expect(container.querySelector("svg")).toBe(svg);
		expect(svg).toHaveClass(
			"b",
			"MuiSvgIcon-colorError",
			"MuiSvgIcon-fontSizeLarge",
		);
		expect(svg).not.toHaveClass(
			"a",
			"MuiSvgIcon-colorPrimary",
			"MuiSvgIcon-fontSizeSmall",
		);
		expect(getComputedStyle(svg).marginLeft).toBe("2px");
		expect(svg).toHaveAttribute("color", "#111111");
		fireEvent.click(svg);
		expect(first).not.toHaveBeenCalled();
		expect(second).toHaveBeenCalledTimes(1);
	});

	it("applies the theme's MuiSvgIcon default props and style overrides", () => {
		const iconTheme = createTheme({
			components: {
				MuiSvgIcon: {
					defaultProps: { fontSize: "small", color: "primary" },
					styleOverrides: { root: { opacity: 0.5 } },
				},
			},
		});
		const { svg } = renderIcon(<Icon />, iconTheme);
		expect(svg).toHaveClass(
			"MuiSvgIcon-fontSizeSmall",
			"MuiSvgIcon-colorPrimary",
		);
		expect(getComputedStyle(svg).opacity).toBe("0.5");
		cleanup();

		const { svg: large } = renderIcon(<Icon fontSize={"large"} />, iconTheme);
		expect(large).toHaveClass("MuiSvgIcon-fontSizeLarge");
		expect(large).not.toHaveClass("MuiSvgIcon-fontSizeSmall");
	});

	it("does not render again when its parent re-renders with equal props (memo)", () => {
		let renders = 0;
		const Counting = React.forwardRef<
			SVGSVGElement,
			React.SVGProps<SVGSVGElement>
		>(function Counting(props, ref) {
			renders++;
			return <svg ref={ref} {...props} />;
		});
		const stableSx = { marginLeft: "1px" };
		const Parent = (props: { tick: number; sx: object }) => (
			<div data-tick={props.tick}>
				<Icon component={Counting} fontSize={"small"} sx={props.sx} />
			</div>
		);
		const { rerender } = render(wrap(<Parent tick={0} sx={stableSx} />));
		expect(renders).toBe(1);
		rerender(wrap(<Parent tick={1} sx={stableSx} />));
		expect(renders).toBe(1);
		rerender(wrap(<Parent tick={2} sx={{ marginLeft: "1px" }} />));
		expect(renders).toBe(2);
	});

	it("renders without console errors or warnings in StrictMode", () => {
		const error = vi.spyOn(console, "error").mockImplementation(() => {});
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const ref = React.createRef<SVGSVGElement>();
		const variants: React.ReactElement[] = [
			<Icon key={"plain"} />,
			<Icon key={"small"} fontSize={"small"} />,
			<Icon key={"medium"} fontSize={"medium"} />,
			<Icon key={"large"} fontSize={"large"} />,
			<Icon key={"inherit-size"} fontSize={"inherit"} />,
			<Icon key={"inherit"} color={"inherit"} />,
			<Icon key={"action"} color={"action"} />,
			<Icon key={"disabled"} color={"disabled"} />,
			<Icon key={"primary"} color={"primary"} />,
			<Icon key={"secondary"} color={"secondary"} />,
			<Icon key={"error"} color={"error"} />,
			<Icon key={"info"} color={"info"} />,
			<Icon key={"success"} color={"success"} />,
			<Icon key={"warning"} color={"warning"} />,
			<Icon key={"html"} htmlColor={"#ff0000"} />,
			<Icon key={"title"} titleAccess={"Titel"} />,
			<Icon key={"ref"} ref={ref} />,
			<Icon key={"sx"} sx={{ marginLeft: 1 }} className={"caller"} />,
			<Icon key={"viewBox"} viewBox={"0 0 24 24"} />,
		];
		const { container } = render(
			<React.StrictMode>{wrap(variants)}</React.StrictMode>,
		);
		expect(container.querySelectorAll("svg")).toHaveLength(variants.length);
		expect(error).not.toHaveBeenCalled();
		expect(warn).not.toHaveBeenCalled();
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
	it.each(ALL_NAMES)(
		"%s hard-codes no fill and passes a caller's fill through",
		(name) => {
			const Icon = ALL_ICONS[name];
			const { svg } = renderIcon(<Icon />);
			expect(svg).not.toHaveAttribute("fill");
			expect(svg.querySelectorAll("[fill]")).toHaveLength(0);
			cleanup();
			expect(renderIcon(<Icon fill={"red"} />).svg).toHaveAttribute(
				"fill",
				"red",
			);
		},
	);

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
