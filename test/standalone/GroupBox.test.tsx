import React from "react";
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ThemeProvider, createTheme, Theme } from "@mui/material";
import GroupBox from "../../src/standalone/GroupBox";

afterEach(cleanup);

const theme = createTheme();

const renderGroupBox = (ui: React.ReactElement, t: Theme = theme) =>
	render(<ThemeProvider theme={t}>{ui}</ThemeProvider>);

describe("GroupBox", () => {
	it("renders the label as a legend", () => {
		renderGroupBox(<GroupBox label="Personal Information" />);
		expect(screen.getByText("Personal Information")).toBeInTheDocument();
	});

	it("renders children inside the fieldset", () => {
		renderGroupBox(
			<GroupBox label="Section">
				<span>Child content</span>
			</GroupBox>,
		);
		expect(screen.getByText("Child content")).toBeInTheDocument();
	});

	it("does not render a legend when label is falsy", () => {
		const { container } = renderGroupBox(
			<GroupBox label="">
				<span>Content</span>
			</GroupBox>,
		);
		const legend = container.querySelector("legend");
		expect(legend).not.toBeInTheDocument();
	});

	it("applies the provided id to the fieldset", () => {
		const { container } = renderGroupBox(
			<GroupBox id="my-group" label="Labeled" />,
		);
		const fieldset = container.querySelector("fieldset#my-group");
		expect(fieldset).toBeInTheDocument();
	});

	it("applies additional className to the root", () => {
		const { container } = renderGroupBox(
			<GroupBox label="X" className="extra-class" />,
		);
		expect(container.querySelector(".extra-class")).toBeInTheDocument();
	});

	it("renders a ReactNode label", () => {
		renderGroupBox(
			<GroupBox label={<strong data-testid="rich-label">Bold</strong>} />,
		);
		expect(screen.getByTestId("rich-label")).toBeInTheDocument();
	});

	it("[ISSUE-3511-ITEM-20] sets every other HTML attribute on the fieldset", () => {
		renderGroupBox(
			<GroupBox
				label="Files"
				aria-busy
				aria-describedby="hint"
				title="Your files"
				data-testid="box"
			/>,
		);
		const box = screen.getByRole("group", { name: "Files" });
		expect(box).toHaveAttribute("aria-busy", "true");
		expect(box).toHaveAttribute("aria-describedby", "hint");
		expect(box).toHaveAttribute("title", "Your files");
		expect(box).toHaveAttribute("data-testid", "box");
	});

	describe("bugs", () => {
		it("[ISSUE-3462-ITEM-2] renders with function styleOverrides for both slots, and a legend override styles the small legend by its CcGroupBox-smallLabel class", () => {
			const themed = createTheme({
				components: {
					CcGroupBox: {
						styleOverrides: {
							root: ({ theme: t }) => ({ padding: t.spacing(2) }),
							legend: ({ theme: t }) => ({
								paddingInlineStart: t.spacing(1),
								color: "rgb(0, 0, 255)",
								"&.CcGroupBox-smallLabel": { color: "rgb(255, 0, 0)" },
							}),
						},
					},
				},
			});
			const { container } = renderGroupBox(
				<>
					<GroupBox label="Normal" />
					<GroupBox label="Small" smallLabel />
				</>,
				themed,
			);
			const [normalBox, smallBox] = Array.from(
				container.querySelectorAll("fieldset"),
			);
			const [normal, small] = Array.from(container.querySelectorAll("legend"));
			expect(getComputedStyle(normalBox).paddingTop).toBe("16px");
			expect(getComputedStyle(smallBox).paddingTop).toBe("16px");
			expect(getComputedStyle(normal).paddingInlineStart).toBe("8px");
			expect(getComputedStyle(normal).color).toBe("rgb(0, 0, 255)");
			expect(getComputedStyle(small).color).toBe("rgb(255, 0, 0)");
		});

		it("[ISSUE-3462-ITEM-2] applies styleOverrides.smallLabel to the small legend only, over styleOverrides.legend and the default small size", () => {
			const themed = createTheme({
				components: {
					CcGroupBox: {
						styleOverrides: {
							legend: { color: "rgb(0, 0, 255)", fontSize: "9px" },
							smallLabel: ({ theme: t }) => ({
								color: "rgb(255, 0, 0)",
								fontSize: t.spacing(1.25),
							}),
						},
					},
				},
			});
			const { container } = renderGroupBox(
				<>
					<GroupBox label="Normal" />
					<GroupBox label="Small" smallLabel />
				</>,
				themed,
			);
			const [normal, small] = Array.from(container.querySelectorAll("legend"));
			expect(getComputedStyle(normal).color).toBe("rgb(0, 0, 255)");
			expect(getComputedStyle(normal).fontSize).toBe("9px");
			expect(getComputedStyle(small).color).toBe("rgb(255, 0, 0)");
			expect(getComputedStyle(small).fontSize).toBe("10px");
			const fieldset = container.querySelector("fieldset") as Element;
			expect(getComputedStyle(fieldset).color).not.toBe("rgb(255, 0, 0)");
		});

		it("[ISSUE-3462-ITEM-2] marks the legend with CcGroupBox-smallLabel and classes.smallLabel only while smallLabel is set, and keeps the 0.75em default", () => {
			const classes = { root: "r", smallLabel: "s" };
			const { container, rerender } = renderGroupBox(
				<GroupBox label="L" smallLabel classes={classes} />,
			);
			const fieldset = container.querySelector("fieldset");
			const legend = container.querySelector("legend") as Element;
			expect(legend).toHaveClass("CcGroupBox-smallLabel", "s");
			expect(fieldset).toHaveClass("r");
			expect(fieldset).not.toHaveClass("CcGroupBox-smallLabel");
			expect(fieldset).not.toHaveClass("s");
			expect(getComputedStyle(legend).fontSize).toBe("12px");

			rerender(
				<ThemeProvider theme={theme}>
					<GroupBox label="L" classes={classes} />
				</ThemeProvider>,
			);
			expect(container.querySelector("legend")).toBe(legend);
			expect(legend).not.toHaveClass("CcGroupBox-smallLabel");
			expect(legend).not.toHaveClass("s");
			expect(getComputedStyle(legend).fontSize).toBe("16px");
		});

		it("[ISSUE-3462-ITEM-2] types function styleOverrides without an ownerState, which no slot receives", () => {
			const themed = createTheme({
				components: {
					CcGroupBox: {
						styleOverrides: {
							// @ts-expect-error GroupBox's slots get no ownerState; the small legend has the class CcGroupBox-smallLabel
							legend: ({ ownerState }) => ({
								color: ownerState ? "red" : "blue",
							}),
						},
					},
				},
			});
			expect(themed.components?.CcGroupBox?.styleOverrides?.legend).toEqual(
				expect.any(Function),
			);
		});
	});
});
