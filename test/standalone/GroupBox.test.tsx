import React from "react";
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ThemeProvider, createTheme, Theme } from "@mui/material";
import GroupBox from "../../src/standalone/GroupBox";
import { labelWithDirtyMarker } from "../../src/standalone/UIKit/MuiFieldState";

afterEach(cleanup);

const theme = createTheme();

const renderGroupBox = (ui: React.ReactElement, t: Theme = theme) =>
	render(<ThemeProvider theme={t}>{ui}</ThemeProvider>);

const fieldsetOf = (container: HTMLElement) => {
	const fieldset = container.querySelector("fieldset");
	if (!fieldset) throw new Error("no fieldset rendered");
	return fieldset;
};

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

		it("[ISSUE-3462-ITEM-3] applies theme variants keyed on smallLabel", () => {
			const themed = createTheme({
				components: {
					CcGroupBox: {
						variants: [
							{
								props: { smallLabel: true },
								style: { outlineStyle: "dotted" },
							},
						],
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
			const [normal, small] = Array.from(
				container.querySelectorAll("fieldset"),
			);
			expect(getComputedStyle(normal).outlineStyle).not.toBe("dotted");
			expect(getComputedStyle(small).outlineStyle).toBe("dotted");
		});

		it("[ISSUE-3462-ITEM-3] matches function variants on smallLabel and label, with smallLabel false when it is not set", () => {
			const themed = createTheme({
				components: {
					CcGroupBox: {
						variants: [
							{
								props: (p) => !!p.smallLabel,
								style: { outlineStyle: "dotted" },
							},
							{
								props: { smallLabel: false },
								style: { borderTopStyle: "dashed" },
							},
							{
								props: ({ label }) => !label,
								style: { paddingTop: "2px" },
							},
						],
					},
				},
			});
			const { container } = renderGroupBox(
				<>
					<GroupBox label="Normal" />
					<GroupBox label="Small" smallLabel />
					<GroupBox label={null} />
				</>,
				themed,
			);
			const [normal, small, untitled] = Array.from(
				container.querySelectorAll("fieldset"),
			).map((el) => getComputedStyle(el));
			expect(normal.outlineStyle).not.toBe("dotted");
			expect(normal.borderTopStyle).toBe("dashed");
			expect(normal.paddingTop).toBe("8px");
			expect(small.outlineStyle).toBe("dotted");
			expect(small.borderTopStyle).toBe("solid");
			expect(small.paddingTop).toBe("8px");
			expect(untitled.outlineStyle).not.toBe("dotted");
			expect(untitled.borderTopStyle).toBe("dashed");
			expect(untitled.paddingTop).toBe("2px");
		});

		it("[ISSUE-3462-ITEM-3] matches variants on a smallLabel from the theme's defaultProps, and follows smallLabel changing after mount", () => {
			const themed = createTheme({
				components: {
					CcGroupBox: {
						defaultProps: { smallLabel: true },
						variants: [
							{
								props: { smallLabel: true },
								style: { outlineStyle: "dotted" },
							},
						],
					},
				},
			});
			const { container, rerender } = renderGroupBox(
				<GroupBox label="L" />,
				themed,
			);
			const fieldset = fieldsetOf(container);
			expect(getComputedStyle(fieldset).outlineStyle).toBe("dotted");

			rerender(
				<ThemeProvider theme={themed}>
					<GroupBox label="L" smallLabel={false} />
				</ThemeProvider>,
			);
			expect(fieldsetOf(container)).toBe(fieldset);
			expect(getComputedStyle(fieldset).outlineStyle).not.toBe("dotted");
		});

		it("[ISSUE-3462-ITEM-3] sizes the small legend through a smallLabel variant under a theme legend font size, and keeps label off the fieldset", () => {
			const themed = createTheme({
				components: {
					CcGroupBox: {
						styleOverrides: { legend: { fontSize: "12px" } },
						variants: [
							{
								props: { smallLabel: true },
								style: { "& > legend": { fontSize: "9px" } },
							},
						],
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
			expect(getComputedStyle(normal).fontSize).toBe("12px");
			expect(getComputedStyle(small).fontSize).toBe("9px");
			for (const fieldset of Array.from(
				container.querySelectorAll("fieldset"),
			)) {
				expect(fieldset).not.toHaveAttribute("label");
			}
		});

		it("[ISSUE-3462-ITEM-4] puts classes.legend on the legend, also from theme defaultProps", () => {
			const themed = createTheme({
				components: {
					CcGroupBox: { defaultProps: { classes: { legend: "theme-legend" } } },
				},
			});
			const { container } = renderGroupBox(
				<GroupBox label="L" classes={{ root: "r", legend: "l" }} />,
			);
			expect(container.querySelector("fieldset")).toHaveClass("r");
			expect(container.querySelector("fieldset")).not.toHaveClass("l");
			expect(container.querySelector("legend")).toHaveClass("l");
			cleanup();
			const themedRender = renderGroupBox(<GroupBox label="L" />, themed);
			expect(themedRender.container.querySelector("legend")).toHaveClass(
				"theme-legend",
			);
		});

		it("[ISSUE-3462-ITEM-4] keeps classes.legend on the small legend next to classes.smallLabel, and follows classes changing after mount", () => {
			const { container, rerender } = renderGroupBox(
				<GroupBox
					label="L"
					smallLabel
					classes={{ legend: "l", smallLabel: "s" }}
				/>,
			);
			const legend = container.querySelector("legend") as Element;
			expect(legend).toHaveClass("l", "s", "CcGroupBox-smallLabel");

			rerender(
				<ThemeProvider theme={theme}>
					<GroupBox label="L" classes={{ legend: "l2" }} />
				</ThemeProvider>,
			);
			expect(container.querySelector("legend")).toBe(legend);
			expect(legend).toHaveClass("l2");
			expect(legend).not.toHaveClass("l");
			expect(legend).not.toHaveClass("s");
		});

		it("[ISSUE-3462-ITEM-5] shows label={0} as the legend, not as stray text in the box", () => {
			const { container } = renderGroupBox(
				<GroupBox label={0}>
					<span>c</span>
				</GroupBox>,
			);
			const fieldset = fieldsetOf(container);
			const strayText = Array.from(fieldset.childNodes).filter(
				(node) => node.nodeType === Node.TEXT_NODE,
			);
			expect(strayText).toHaveLength(0);
			expect(screen.getByRole("group", { name: "0" })).toBe(fieldset);
		});

		it("[ISSUE-3462-ITEM-5] shows label={NaN} as the legend, and follows a label changing between 0, nothing and text after mount", () => {
			const { container, rerender } = renderGroupBox(
				<GroupBox label={NaN}>
					<span>c</span>
				</GroupBox>,
			);
			const fieldset = fieldsetOf(container);
			expect(fieldset.firstElementChild?.tagName).toBe("LEGEND");
			expect(fieldset.firstChild).toBe(fieldset.firstElementChild);
			expect(screen.getByRole("group", { name: "NaN" })).toBe(fieldset);

			const relabel = (label: React.ReactNode) =>
				rerender(
					<ThemeProvider theme={theme}>
						<GroupBox label={label}>
							<span>c</span>
						</GroupBox>
					</ThemeProvider>,
				);
			relabel(null);
			expect(fieldset.querySelector("legend")).toBeNull();
			expect(fieldset.childNodes).toHaveLength(1);
			relabel(0);
			expect(fieldset.firstChild).toBe(fieldset.querySelector("legend"));
			expect(fieldset).toHaveAccessibleName("0");
			relabel("Files");
			expect(fieldset).toHaveAccessibleName("Files");
		});

		it.each([
			["true", true],
			["false", false],
			["null", null],
			["undefined", undefined],
			["an empty string", ""],
		])(
			"[ISSUE-3462-ITEM-5] renders no legend and no text before the children for label %s",
			(_name, label) => {
				const { container } = renderGroupBox(
					<GroupBox label={label}>
						<span>c</span>
					</GroupBox>,
				);
				const fieldset = fieldsetOf(container);
				expect(fieldset.querySelector("legend")).toBeNull();
				expect(fieldset.childNodes).toHaveLength(1);
				expect(fieldset.firstChild).toHaveTextContent("c");
			},
		);

		it("[ISSUE-3462-ITEM-5] renders a legend for a label that is only the dirty marker", async () => {
			renderGroupBox(
				<GroupBox label={labelWithDirtyMarker("", true)}>
					<span>c</span>
				</GroupBox>,
			);
			// the marker's text suspends until the library's translations load
			const legend = (await screen.findByRole("group")).firstElementChild;
			expect(legend?.tagName).toBe("LEGEND");
			expect(legend?.querySelector("[aria-hidden='true']")).toBeTruthy();
		});

		it("[ISSUE-3462-ITEM-8] passes aria-describedby, aria-labelledby, data-* and ref to the fieldset", () => {
			const ref = React.createRef<HTMLFieldSetElement>();
			renderGroupBox(
				<>
					<GroupBox
						label="Files"
						aria-describedby="files-error"
						data-testid="files-box"
						ref={ref}
					>
						<button>Upload</button>
					</GroupBox>
					<p id="files-error">At least one file is required</p>
					<GroupBox label={null} aria-labelledby="device-title">
						<h2 id="device-title">Device X</h2>
					</GroupBox>
				</>,
			);
			const files = screen.getByRole("group", { name: "Files" });
			expect(files).toHaveAccessibleDescription(
				"At least one file is required",
			);
			expect(files).toHaveAttribute("data-testid", "files-box");
			expect(ref.current).toBe(files);
			expect(screen.getByRole("group", { name: "Device X" })).toBeTruthy();
		});

		it("[ISSUE-3462-ITEM-8] applies sx to the fieldset, over the theme's root override", () => {
			const themed = createTheme({
				components: {
					CcGroupBox: {
						styleOverrides: {
							root: { padding: "4px", color: "rgb(0, 0, 255)" },
						},
					},
				},
			});
			renderGroupBox(
				<GroupBox label="Files" sx={{ padding: 3, marginTop: 1 }} />,
				themed,
			);
			const box = screen.getByRole("group", { name: "Files" });
			expect(getComputedStyle(box).padding).toBe("24px");
			expect(getComputedStyle(box).marginTop).toBe("8px");
			expect(getComputedStyle(box).color).toBe("rgb(0, 0, 255)");
		});
	});
});
