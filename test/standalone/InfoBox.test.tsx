import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ThemeProvider, createTheme, Theme } from "@mui/material";
import InfoBox from "../../src/standalone/InfoBox";

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
	vi.useRealTimers();
});

const theme = createTheme();

const themed = (ui: React.ReactElement, t: Theme = theme) => (
	<ThemeProvider theme={t}>{ui}</ThemeProvider>
);

const renderInfoBox = (ui: React.ReactElement, t: Theme = theme) =>
	render(themed(ui, t));

/** the collapsible header (a disclosure button), named by the heading */
const header = (heading: string) =>
	screen.getByRole("button", { name: new RegExp(heading) });

type OnChange = (event: React.SyntheticEvent, expanded: boolean) => void;

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

	describe("bugs", () => {
		it("[ISSUE-3464-ITEM-1] alwaysExpanded={false} behaves like an unforced box: expanded opens it and a click toggles it", () => {
			const onChange = vi.fn<OnChange>();
			renderInfoBox(
				<InfoBox
					heading="H"
					message="M"
					expanded
					alwaysExpanded={false}
					onChange={onChange}
				/>,
			);
			const btn = header("H");
			expect(btn).toHaveAttribute("aria-expanded", "true");
			expect(screen.getByText("M")).toBeVisible();
			fireEvent.click(btn);
			expect(onChange).toHaveBeenLastCalledWith(expect.anything(), false);
			expect(btn).toHaveAttribute("aria-expanded", "false");
		});

		it("[ISSUE-3464-ITEM-1] a condition passed as alwaysExpanded takes effect when it changes: true forces the box open, false gives it back to the user", () => {
			const error = vi.spyOn(console, "error").mockImplementation(() => {});
			const box = (locked: boolean) =>
				themed(
					<InfoBox
						heading="H"
						message="M"
						expanded={false}
						alwaysExpanded={locked}
					/>,
				);
			const { rerender } = render(box(false));
			expect(screen.getByText("M")).not.toBeVisible();
			rerender(box(true));
			expect(screen.getByText("M")).toBeVisible();
			rerender(box(false));
			const btn = header("H");
			const before = btn.getAttribute("aria-expanded");
			expect(["true", "false"]).toContain(before);
			fireEvent.click(btn);
			expect(btn).toHaveAttribute(
				"aria-expanded",
				before === "true" ? "false" : "true",
			);
			fireEvent.click(btn);
			expect(btn).toHaveAttribute("aria-expanded", before);
			expect(error).not.toHaveBeenCalled();
		});
	});
});
