import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material";
import InfoBox from "../../src/standalone/InfoBox";

afterEach(cleanup);

const theme = createTheme();

const renderInfoBox = (ui: React.ReactElement) =>
	render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe("InfoBox", () => {
	it("renders the heading text", () => {
		renderInfoBox(
			<InfoBox heading="Test heading" message="Details" expanded={false} />,
		);
		expect(screen.getByText("Test heading")).toBeInTheDocument();
	});

	it("shows message content when expanded=true", () => {
		renderInfoBox(
			<InfoBox heading="Title" message="Visible message" expanded={true} />,
		);
		expect(screen.getByText("Visible message")).toBeInTheDocument();
	});

	it("calls onChange when the summary is clicked", () => {
		const onChange = vi.fn();
		renderInfoBox(
			<InfoBox
				heading="Clickable"
				message="Details"
				expanded={false}
				onChange={onChange}
			/>,
		);
		// MUI AccordionSummary renders with role="button"
		const summaryButton = screen.getByRole("button");
		fireEvent.click(summaryButton);
		expect(onChange).toHaveBeenCalledTimes(1);
	});

	it("renders status info (default) without error", () => {
		renderInfoBox(
			<InfoBox
				heading="Info"
				message="Info message"
				expanded={true}
				status="info"
			/>,
		);
		expect(screen.getByText("Info")).toBeInTheDocument();
	});

	it("renders status warning without error", () => {
		renderInfoBox(
			<InfoBox
				heading="Warning"
				message="Warning message"
				expanded={true}
				status="warning"
			/>,
		);
		expect(screen.getByText("Warning")).toBeInTheDocument();
	});

	it("renders status success without error", () => {
		renderInfoBox(
			<InfoBox
				heading="Success"
				message="Success message"
				expanded={true}
				status="success"
			/>,
		);
		expect(screen.getByText("Success")).toBeInTheDocument();
	});

	it("renders status error without error", () => {
		renderInfoBox(
			<InfoBox
				heading="Error"
				message="Error message"
				expanded={true}
				status="error"
			/>,
		);
		expect(screen.getByText("Error")).toBeInTheDocument();
	});
});
