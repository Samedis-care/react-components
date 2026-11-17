import React from "react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material";
import VerticalDivider from "../../src/standalone/VerticalDivider";
import type { VerticalDividerProps } from "../../src";

afterEach(cleanup);

const theme = createTheme();

const renderDivider = (ui: React.ReactElement) =>
	render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe("VerticalDivider", () => {
	it("renders a div element", () => {
		const { container } = renderDivider(<VerticalDivider />);
		expect(container.firstChild).toBeInTheDocument();
		expect(container.firstChild?.nodeName).toBe("DIV");
	});

	it("forwards a className to the root element", () => {
		const { container } = renderDivider(
			<VerticalDivider className="my-divider" />,
		);
		expect(container.querySelector(".my-divider")).toBeInTheDocument();
	});

	it("renders inline (display: inline-block) so it sits between text nodes", () => {
		const { container } = renderDivider(
			<div style={{ display: "flex", alignItems: "center" }}>
				<span>Left</span>
				<VerticalDivider />
				<span>Right</span>
			</div>,
		);
		// Three children: span, div (divider), span
		const parent = container.firstChild as HTMLElement;
		expect(parent.children).toHaveLength(3);
	});
});

describe("[ISSUE-3459-ITEM-6] VerticalDivider flexItem", () => {
	// first, as React warns about an unknown DOM prop only once per name
	it("[ISSUE-3459-ITEM-6] does not pass flexItem on to the div", () => {
		const consoleError = vi
			.spyOn(console, "error")
			.mockImplementation(() => {});
		try {
			const { container } = renderDivider(<VerticalDivider flexItem />);
			expect((container.firstChild as Element).attributes).toHaveLength(1);
			expect(consoleError).not.toHaveBeenCalled();
		} finally {
			consoleError.mockRestore();
		}
	});

	it("[ISSUE-3459-ITEM-6] flexItem stretches it to the height of its flex row (align-self: stretch, height: auto)", () => {
		const { container } = renderDivider(<VerticalDivider flexItem />);
		const style = getComputedStyle(container.firstChild as Element);
		expect(style.alignSelf).toBe("stretch");
		expect(style.height).toBe("auto");
		expect(style.borderRight).toBe(`1px solid ${theme.palette.divider}`);
	});

	it("[ISSUE-3459-ITEM-6] without flexItem it is height: 100% of its parent and not stretched", () => {
		const { container } = renderDivider(<VerticalDivider />);
		const style = getComputedStyle(container.firstChild as Element);
		expect(style.height).toBe("100%");
		expect(style.alignSelf).not.toBe("stretch");
	});

	it("[ISSUE-3459-ITEM-6] forwards a ref to its div", () => {
		const ref = React.createRef<HTMLDivElement>();
		const { container } = renderDivider(<VerticalDivider ref={ref} />);
		expect(ref.current).toBe(container.firstChild);
	});
});

describe("[ISSUE-3459-ITEM-14] VerticalDivider theme slot and props", () => {
	it("[ISSUE-3459-ITEM-14] applies the theme's CcVerticalDivider default props", () => {
		const themed = createTheme({
			components: {
				CcVerticalDivider: {
					defaultProps: { className: "from-theme", flexItem: true },
				},
			},
		});
		const { container } = render(
			<ThemeProvider theme={themed}>
				<VerticalDivider />
				<VerticalDivider className={"from-props"} flexItem={false} />
			</ThemeProvider>,
		);
		const [fromTheme, fromProps] = Array.from(container.children);
		expect(fromTheme).toHaveClass("from-theme", "CcVerticalDivider-flexItem");
		expect(fromProps).toHaveClass("from-props");
		expect(fromProps).not.toHaveClass("from-theme");
		expect(fromProps).not.toHaveClass("CcVerticalDivider-flexItem");
	});

	it("[ISSUE-3459-ITEM-14] applies the theme's CcVerticalDivider variants, matched against flexItem", () => {
		const themed = createTheme({
			components: {
				CcVerticalDivider: {
					variants: [
						{ props: { flexItem: true }, style: { marginLeft: 12 } },
						{ props: { flexItem: false }, style: { marginLeft: 6 } },
					],
				},
			},
		});
		const { container } = render(
			<ThemeProvider theme={themed}>
				<VerticalDivider flexItem />
				<VerticalDivider />
			</ThemeProvider>,
		);
		const [flexItem, plain] = Array.from(container.children);
		expect(getComputedStyle(flexItem).marginLeft).toBe("12px");
		expect(getComputedStyle(plain).marginLeft).toBe("6px");
	});

	it("[ISSUE-3459-ITEM-14] applies a function in the theme's CcVerticalDivider styleOverrides", () => {
		const themed = createTheme({
			components: {
				CcVerticalDivider: {
					styleOverrides: {
						root: ({ theme }) => ({ marginRight: theme.spacing(2) }),
					},
				},
			},
		});
		const { container } = render(
			<ThemeProvider theme={themed}>
				<VerticalDivider />
			</ThemeProvider>,
		);
		expect(getComputedStyle(container.firstChild as Element).marginRight).toBe(
			"16px",
		);
	});

	it("[ISSUE-3459-ITEM-14] takes sx, and its props type is exported from the package root", () => {
		const props: VerticalDividerProps = { sx: { mx: 2 } };
		const { container } = renderDivider(<VerticalDivider {...props} />);
		expect(getComputedStyle(container.firstChild as Element).marginLeft).toBe(
			"16px",
		);
	});
});
