import React from "react";
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material";
import Loader from "../../src/standalone/Loader";

afterEach(cleanup);

const theme = createTheme();

const renderLoader = (ui: React.ReactElement) =>
	render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe("Loader", () => {
	it("renders a circular progress indicator", () => {
		const { container } = renderLoader(<Loader />);
		// MUI CircularProgress renders an SVG with role="progressbar"
		expect(container.querySelector("[role='progressbar']")).toBeInTheDocument();
	});

	it("does not render text when text prop is omitted", () => {
		const { container } = renderLoader(<Loader />);
		// No typography elements beyond the progress wrapper
		expect(container.querySelector("h6")).not.toBeInTheDocument();
	});

	it("renders text when text prop is provided", () => {
		renderLoader(<Loader text="Loading data…" />);
		expect(screen.getByText("Loading data…")).toBeInTheDocument();
	});

	it("renders text with a custom typography variant", () => {
		const { container } = renderLoader(
			<Loader text="Please wait" typographyVariant="body1" />,
		);
		// MUI Typography body1 maps to a <p> element by default
		const paragraph = container.querySelector("p");
		expect(paragraph).toBeInTheDocument();
		expect(paragraph?.textContent).toBe("Please wait");
	});
});
