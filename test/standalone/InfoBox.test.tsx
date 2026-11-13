import React, { useState } from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import {
	render,
	screen,
	fireEvent,
	cleanup,
	waitFor,
} from "@testing-library/react";
import { ThemeProvider, createTheme, Theme } from "@mui/material";
import { TaskAlt } from "@mui/icons-material";
import type { SvgIconComponent } from "@mui/icons-material";
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

/** what an svg draws, its viewBox and path data: tells the icons apart */
const glyphOf = (svg: SVGSVGElement | null | undefined) => ({
	viewBox: svg?.getAttribute("viewBox"),
	paths: Array.from(svg?.querySelectorAll("path") ?? [], (path) =>
		path.getAttribute("d"),
	),
});

/** the glyph of a Material icon */
const materialGlyph = (Icon: SvgIconComponent) => {
	const { container, unmount } = render(<Icon />);
	const glyph = glyphOf(container.querySelector("svg"));
	unmount();
	return glyph;
};

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

	it("[ISSUE-3460-ITEM-12] status success shows MUI's TaskAlt", () => {
		const taskAlt = materialGlyph(TaskAlt);
		renderInfoBox(
			<InfoBox heading="Done" message="M" expanded={false} status="success" />,
		);
		expect(glyphOf(header("Done").querySelector("svg"))).toEqual(taskAlt);
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
		it("[ISSUE-3464-ITEM-1] alwaysExpanded={false} behaves like an unforced box: defaultExpanded opens it and a click toggles it", () => {
			const onChange = vi.fn<OnChange>();
			renderInfoBox(
				<InfoBox
					heading="H"
					message="M"
					defaultExpanded
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
						defaultExpanded={false}
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

		it("[ISSUE-3464-ITEM-2] mirroring onChange into expanded logs no MUI error", () => {
			const error = vi.spyOn(console, "error").mockImplementation(() => {});
			const Mirror = () => {
				const [open, setOpen] = useState(false);
				return (
					<InfoBox
						heading="H"
						message="M"
						expanded={open}
						onChange={(_, next) => setOpen(next)}
					/>
				);
			};
			renderInfoBox(<Mirror />);
			fireEvent.click(header("H"));
			expect(header("H")).toHaveAttribute("aria-expanded", "true");
			expect(error).not.toHaveBeenCalled();
		});

		it("[ISSUE-3464-ITEM-2] removing alwaysExpanded after mount keeps aria-expanded on the header", () => {
			const error = vi.spyOn(console, "error").mockImplementation(() => {});
			const { rerender } = renderInfoBox(
				<InfoBox heading="H" message="M" expanded alwaysExpanded />,
			);
			rerender(themed(<InfoBox heading="H" message="M" expanded />));
			expect(header("H")).toHaveAttribute("aria-expanded");
			expect(error).not.toHaveBeenCalled();
		});

		it("[ISSUE-3464-ITEM-2] with onChange mirrored into expanded, closing the box from code takes effect", async () => {
			const error = vi.spyOn(console, "error").mockImplementation(() => {});
			const Mirror = () => {
				const [open, setOpen] = useState(false);
				return (
					<>
						<button type="button" onClick={() => setOpen(false)}>
							close from code
						</button>
						<InfoBox
							heading="H"
							message="M"
							expanded={open}
							onChange={(_, next) => setOpen(next)}
						/>
					</>
				);
			};
			renderInfoBox(<Mirror />);
			fireEvent.click(header("H"));
			expect(header("H")).toHaveAttribute("aria-expanded", "true");
			fireEvent.click(screen.getByRole("button", { name: "close from code" }));
			expect(header("H")).toHaveAttribute("aria-expanded", "false");
			// hidden once the Collapse's exit transition ends
			await waitFor(() => expect(screen.getByText("M")).not.toBeVisible());
			expect(error).not.toHaveBeenCalled();
		});

		it("[ISSUE-3464-ITEM-2] expanded controls the box: a value set after mount opens and closes it", () => {
			const error = vi.spyOn(console, "error").mockImplementation(() => {});
			const box = (expanded: boolean) =>
				themed(<InfoBox heading="H" message="M" expanded={expanded} />);
			const { rerender } = render(box(false));
			expect(header("H")).toHaveAttribute("aria-expanded", "false");
			rerender(box(true));
			expect(header("H")).toHaveAttribute("aria-expanded", "true");
			expect(screen.getByText("M")).toBeVisible();
			rerender(box(false));
			expect(header("H")).toHaveAttribute("aria-expanded", "false");
			expect(error).not.toHaveBeenCalled();
		});

		it("[ISSUE-3464-ITEM-2] a click on a box with expanded set only reports the request: the box keeps showing expanded", () => {
			const onChange = vi.fn<OnChange>();
			renderInfoBox(
				<InfoBox
					heading="H"
					message="M"
					expanded={false}
					onChange={onChange}
				/>,
			);
			fireEvent.click(header("H"));
			expect(onChange).toHaveBeenLastCalledWith(expect.anything(), true);
			expect(header("H")).toHaveAttribute("aria-expanded", "false");
			expect(screen.getByText("M")).not.toBeVisible();
		});

		it("[ISSUE-3464-ITEM-2] removing expanded after mount keeps aria-expanded on the header and logs MUI's error for InfoBox", () => {
			const error = vi.spyOn(console, "error").mockImplementation(() => {});
			const { rerender } = renderInfoBox(
				<InfoBox heading="H" message="M" expanded />,
			);
			rerender(themed(<InfoBox heading="H" message="M" />));
			expect(header("H")).toHaveAttribute("aria-expanded", "false");
			expect(error).toHaveBeenCalledTimes(1);
			expect(error).toHaveBeenCalledWith(
				expect.stringContaining("controlled expanded state of InfoBox"),
			);
		});

		it("[ISSUE-3464-ITEM-2] defaultExpanded sets the initial state, and the user toggles the box", () => {
			const onChange = vi.fn<OnChange>();
			renderInfoBox(
				<>
					<InfoBox heading="Open" message="open msg" defaultExpanded />
					<InfoBox heading="Closed" message="closed msg" onChange={onChange} />
				</>,
			);
			expect(header("Open")).toHaveAttribute("aria-expanded", "true");
			expect(screen.getByText("open msg")).toBeVisible();
			expect(header("Closed")).toHaveAttribute("aria-expanded", "false");
			fireEvent.click(header("Closed"));
			expect(onChange).toHaveBeenLastCalledWith(expect.anything(), true);
			expect(header("Closed")).toHaveAttribute("aria-expanded", "true");
			fireEvent.click(header("Open"));
			expect(header("Open")).toHaveAttribute("aria-expanded", "false");
		});
	});
});
