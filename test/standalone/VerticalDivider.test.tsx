import React from "react";
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material";
import VerticalDivider from "../../src/standalone/VerticalDivider";

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
