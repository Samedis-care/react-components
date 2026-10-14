import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material";
import { hexToRgb } from "@mui/material/styles";
import StatTile from "../../src/standalone/StatTile";

afterEach(cleanup);

const theme = createTheme();

const renderTile = (ui: React.ReactElement) =>
	render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe("StatTile", () => {
	it("renders title, value and subtitle", () => {
		renderTile(<StatTile title="Overdue" value={3} subtitle="in 30 days" />);
		expect(screen.getByText("Overdue")).toBeInTheDocument();
		expect(screen.getByText("3")).toBeInTheDocument();
		expect(screen.getByText("in 30 days")).toBeInTheDocument();
	});

	it("shows a second figure after a middle dot", () => {
		renderTile(<StatTile value={11} secondaryValue="42,180 €" />);
		expect(screen.getByText(/· 42,180 €/)).toBeInTheDocument();
	});

	it("shows the placeholder instead of the skeleton for a missing value", () => {
		renderTile(<StatTile value={null} noValuePlaceholder="—" />);
		expect(screen.getByText("—")).toBeInTheDocument();
	});

	it("keeps the subtitle line when one-line and empty", () => {
		const { container } = renderTile(
			<StatTile value={1} subtitle={null} subtitleNoWrap />,
		);
		expect(container.querySelector("p")?.textContent).toBe(" ");
	});

	it("omits the subtitle line otherwise", () => {
		const { container } = renderTile(<StatTile value={1} subtitle={null} />);
		expect(container.querySelector("p")).toBeNull();
	});

	it("colours the figure in the tone", () => {
		renderTile(<StatTile value={7} tone="error" />);
		const value = screen.getByText("7");
		expect(getComputedStyle(value).color).toBe(
			hexToRgb(theme.palette.error.main),
		);
	});

	it("calls onClick", () => {
		const onClick = vi.fn();
		renderTile(<StatTile value={5} onClick={onClick} />);
		fireEvent.click(screen.getByText("5"));
		expect(onClick).toHaveBeenCalledTimes(1);
	});
});
