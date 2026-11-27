import React, { useState } from "react";
import { describe, it, expect, expectTypeOf, vi, afterEach } from "vitest";
import {
	render,
	screen,
	fireEvent,
	cleanup,
	waitFor,
	within,
	act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
	ThemeProvider,
	createTheme,
	Theme,
	TypographyProps,
} from "@mui/material";
import { TaskAlt } from "@mui/icons-material";
import type { SvgIconComponent } from "@mui/icons-material";
import InfoBox, {
	InfoBoxClassKey,
	InfoBoxProps,
} from "../../src/standalone/InfoBox";
import type * as PackageRoot from "../../src";
import ccI18n from "../../src/i18n";

// A Typography variant of the app's own, declared the way an app adds one to its theme.
// tsc (tsconfig-test.json) checks the headingVariant test below against it.
declare module "@mui/material/Typography" {
	interface TypographyPropsVariantOverrides {
		caption2: true;
	}
}

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

/** the static header of a forced box (alwaysExpanded), in the box's heading */
const staticHeader = (heading: string) => {
	const el = screen.getByRole("heading", {
		name: new RegExp(heading),
	}).firstElementChild;
	if (!(el instanceof HTMLElement)) throw new Error("static header missing");
	return el;
};

type OnChange = (event: React.SyntheticEvent, expanded: boolean) => void;

/** the state classes of status and alwaysExpanded on an element of the box */
const stateClassesOf = (el: Element | null) =>
	Array.from(el?.classList ?? []).filter((name) =>
		/^CcInfoBox-(status|alwaysExpanded)/.test(name),
	);

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

		it("[ISSUE-3464-ITEM-4] marks the root and the header with the state classes of status and alwaysExpanded", () => {
			const classes = { root: "r", summary: "s" };
			const { container, rerender } = renderInfoBox(
				<InfoBox
					heading="H"
					message="M"
					status="error"
					alwaysExpanded
					className="c"
					classes={classes}
				/>,
			);
			const root = container.firstElementChild;
			expect(root).toHaveClass("MuiAccordion-root", "c", "r");
			const forced = staticHeader("H");
			expect(forced).toHaveClass("s");
			for (const el of [root, forced]) {
				expect(stateClassesOf(el)).toEqual([
					"CcInfoBox-statusError",
					"CcInfoBox-alwaysExpanded",
				]);
			}

			let summary: HTMLElement | undefined;

			for (const [status, statusClass] of [
				["warning", "CcInfoBox-statusWarning"],
				["success", "CcInfoBox-statusSuccess"],
				["info", "CcInfoBox-statusInfo"],
				[undefined, "CcInfoBox-statusInfo"],
			] as const) {
				rerender(
					themed(
						<InfoBox
							heading="H"
							message="M"
							status={status}
							alwaysExpanded={false}
							className="c"
							classes={classes}
						/>,
					),
				);
				expect(container.firstElementChild).toBe(root);
				// the toggle, the same element across status changes
				summary ??= header("H");
				expect(header("H")).toBe(summary);
				expect(root).toHaveClass("c", "r");
				expect(summary).toHaveClass("s");
				for (const el of [root, summary]) {
					expect(stateClassesOf(el), String(status)).toEqual([statusClass]);
				}
			}
		});

		it("[ISSUE-3464-ITEM-4] a theme styles one status through its state class, with function overrides for every slot", () => {
			const red = "rgb(255, 0, 0)";
			const t = createTheme({
				components: {
					CcInfoBox: {
						styleOverrides: {
							root: ({ theme: th }) => ({
								paddingTop: th.spacing(1),
								"&.CcInfoBox-statusError": { outlineStyle: "dotted" },
							}),
							summary: ({ theme: th }) => ({
								paddingBottom: th.spacing(1),
								"&.CcInfoBox-statusError": { outlineColor: red },
								"&.CcInfoBox-alwaysExpanded": { outlineWidth: "3px" },
							}),
							summaryRoot: ({ theme: th }) => ({ paddingRight: th.spacing(2) }),
							iconButton: ({ theme: th }) => ({ marginRight: th.spacing(3) }),
							heading: ({ theme: th }) => ({ marginLeft: th.spacing(4) }),
							statusName: ({ theme: th }) => ({ marginTop: th.spacing(5) }),
							details: ({ theme: th }) => ({ marginBottom: th.spacing(6) }),
							detailsText: ({ theme: th }) => ({ paddingLeft: th.spacing(7) }),
						},
					},
				},
			});
			const { container } = renderInfoBox(
				<>
					<InfoBox heading="E" message="M" alwaysExpanded status="error" />
					<InfoBox heading="I" message="M" expanded status="info" />
				</>,
				t,
			);
			const [errorBox, infoBox] = Array.from(container.children);
			expect(getComputedStyle(errorBox).outlineStyle).toBe("dotted");
			expect(getComputedStyle(infoBox).outlineStyle).not.toBe("dotted");
			expect(getComputedStyle(errorBox).paddingTop).toBe("8px");
			expect(getComputedStyle(staticHeader("E")).outlineColor).toBe(red);
			expect(getComputedStyle(header("I")).outlineColor).not.toBe(red);
			expect(getComputedStyle(staticHeader("E")).outlineWidth).toBe("3px");
			expect(getComputedStyle(header("I")).outlineWidth).not.toBe("3px");
			expect(getComputedStyle(header("I")).paddingBottom).toBe("8px");
			const slot = (box: Element, selector: string) => {
				const el = box.querySelector(selector);
				if (!el) throw new Error(`${selector} missing`);
				return getComputedStyle(el);
			};
			const summaryRoot = staticHeader("E").querySelector(
				"[class*=CcInfoBox-summaryRoot]",
			);
			if (!summaryRoot) throw new Error("summaryRoot missing");
			expect(getComputedStyle(summaryRoot).paddingRight).toBe("16px");
			const icon = summaryRoot.firstElementChild;
			if (!icon) throw new Error("iconButton missing");
			expect(getComputedStyle(icon).marginRight).toBe("24px");
			expect(slot(errorBox, ".MuiTypography-root").marginLeft).toBe("32px");
			expect(
				getComputedStyle(screen.getByText("Error:", { exact: false }))
					.marginTop,
			).toBe("40px");
			expect(slot(errorBox, ".MuiAccordionDetails-root").marginBottom).toBe(
				"48px",
			);
			expect(
				slot(errorBox, ".MuiAccordionDetails-root > div").paddingLeft,
			).toBe("56px");
		});

		it("[ISSUE-3464-ITEM-4] a theme's summary background replaces the color of every status, and a rule for a status class that of one", () => {
			const green = "rgb(0, 128, 0)";
			const custom = "rgb(1, 2, 3)";
			const t = createTheme({
				components: {
					CcInfoBox: {
						styleOverrides: {
							summary: {
								backgroundColor: green,
								"&.CcInfoBox-statusError": { backgroundColor: custom },
							},
						},
					},
				},
			});
			renderInfoBox(
				<>
					<InfoBox heading="E" message="M" status="error" />
					<InfoBox heading="W" message="M" status="warning" />
					<InfoBox heading="I" message="M" />
				</>,
				t,
			);
			expect(getComputedStyle(header("E")).backgroundColor).toBe(custom);
			expect(getComputedStyle(header("W")).backgroundColor).toBe(green);
			expect(getComputedStyle(header("I")).backgroundColor).toBe(green);
		});

		it("[ISSUE-3464-ITEM-4] types function styleOverrides without an ownerState and offers no variants, which nothing would match", () => {
			const t = createTheme({
				components: {
					CcInfoBox: {
						styleOverrides: {
							// @ts-expect-error InfoBox's slots get no ownerState; the root and the header have state classes
							summary: ({ ownerState }) => ({
								outlineColor: ownerState ? "red" : "blue",
							}),
						},
						// @ts-expect-error InfoBox has no theme variants; the root and the header have state classes
						variants: [
							{ props: { status: "error" }, style: { outlineStyle: "dotted" } },
						],
					},
				},
			});
			expect(t.components?.CcInfoBox?.styleOverrides?.summary).toEqual(
				expect.any(Function),
			);
		});

		it.each([
			["warning", /warning/i],
			["success", /success/i],
			["error", /error/i],
		] as const)(
			"[ISSUE-3464-ITEM-7] the header announces the %s status",
			(status, word) => {
				renderInfoBox(
					<InfoBox
						heading="Upload finished"
						message="M"
						expanded
						status={status}
					/>,
				);
				const announced =
					screen.queryByRole("button", { name: word }) ??
					screen.queryByRole("button", { description: word });
				expect(
					announced,
					`the ${status} status is in neither the name nor the description of the header`,
				).not.toBeNull();
			},
		);

		it.each([undefined, "info"] as const)(
			"[ISSUE-3464-ITEM-7] announces no status for %s",
			(status) => {
				renderInfoBox(
					<InfoBox
						heading="Upload finished"
						message="M"
						expanded
						status={status}
					/>,
				);
				expect(screen.getByRole("button")).toHaveAccessibleName(
					"Upload finished",
				);
			},
		);

		it("[ISSUE-3464-ITEM-7] the announced status follows the library's language", async () => {
			const language = ccI18n.language;
			renderInfoBox(
				<InfoBox
					heading="Upload finished"
					message="M"
					expanded
					status="warning"
				/>,
			);
			try {
				await act(() => ccI18n.changeLanguage("de"));
				expect(screen.getByRole("button")).toHaveAccessibleName(
					"Warnung: Upload finished",
				);
			} finally {
				await act(() => ccI18n.changeLanguage(language));
			}
			expect(screen.getByRole("button")).toHaveAccessibleName(
				"Warning: Upload finished",
			);
		});

		it("[ISSUE-3464-ITEM-9] a forced box has a static header: no button, no tab stop, and a click reports no change", async () => {
			const user = userEvent.setup();
			const onChange = vi.fn<OnChange>();
			renderInfoBox(
				<>
					<button>Before</button>
					<InfoBox
						heading="Notice"
						message="M"
						expanded
						alwaysExpanded
						onChange={onChange}
					/>
					<button>After</button>
				</>,
			);
			expect(screen.queryByRole("button", { name: /Notice/ })).toBeNull();
			expect(
				screen.getByRole("heading", { name: /Notice/ }),
			).toBeInTheDocument();
			screen.getByRole("button", { name: "Before" }).focus();
			await user.tab();
			expect(screen.getByRole("button", { name: "After" })).toHaveFocus();
			await user.click(screen.getByText("Notice"));
			expect(onChange).not.toHaveBeenCalled();
		});

		it("[ISSUE-3464-ITEM-9] the static header has the open header's classes, and no role or aria-expanded", () => {
			renderInfoBox(
				<InfoBox
					heading="Notice"
					message="M"
					status="warning"
					alwaysExpanded
					classes={{ summary: "s" }}
				/>,
			);
			const forced = staticHeader("Notice");
			expect(forced).toHaveTextContent("Warning: Notice");
			expect(forced).not.toHaveAttribute("role");
			expect(forced).not.toHaveAttribute("aria-expanded");
			expect(forced).toHaveClass(
				"s",
				"CcInfoBox-statusWarning",
				"CcInfoBox-alwaysExpanded",
				"Mui-expanded",
			);
			expect(screen.getByText("M")).toBeVisible();
		});

		it("[ISSUE-3464-ITEM-9] the header that has keyboard focus passes it on when alwaysExpanded swaps the toggle and the static header", () => {
			const box = (locked: boolean) =>
				themed(
					<>
						<button>Elsewhere</button>
						<InfoBox
							heading="Notice"
							message="M"
							defaultExpanded
							alwaysExpanded={locked}
						/>
					</>,
				);
			const { rerender } = render(box(false));
			// focus elsewhere stays there
			screen.getByRole("button", { name: "Elsewhere" }).focus();
			rerender(box(true));
			expect(screen.getByRole("button", { name: "Elsewhere" })).toHaveFocus();
			rerender(box(false));
			expect(screen.getByRole("button", { name: "Elsewhere" })).toHaveFocus();

			header("Notice").focus();
			rerender(box(true));
			expect(staticHeader("Notice")).toHaveFocus();
			rerender(box(false));
			expect(header("Notice")).toHaveFocus();
		});

		it("[ISSUE-3464-ITEM-11] headingVariant changes only the look: one heading per box and only phrasing content in the header button", () => {
			renderInfoBox(
				<>
					<InfoBox
						heading="Variant h6"
						message="M"
						expanded
						headingVariant="h6"
					/>
					<InfoBox
						heading="Variant body1"
						message="M"
						expanded
						headingVariant="body1"
					/>
				</>,
			);
			expect(screen.getAllByRole("heading").map((h) => h.textContent)).toEqual([
				"Variant h6",
				"Variant body1",
			]);
			for (const btn of screen.getAllByRole("button")) {
				expect(
					Array.from(
						btn.querySelectorAll("div, p, h1, h2, h3, h4, h5, h6"),
					).map((el) => el.tagName),
				).toEqual([]);
			}
		});

		it("[ISSUE-3464-ITEM-11] headingVariant keeps its look: the heading has the variant's class", () => {
			renderInfoBox(
				<InfoBox heading="Variant h6" message="M" headingVariant="h6" />,
			);
			const text = screen.getByText("Variant h6");
			expect(text.tagName).toBe("SPAN");
			expect(text).toHaveClass("MuiTypography-h6");
		});

		it("[ISSUE-3464-ITEM-11] headingComponent sets the level of the box's heading, in the toggle and in a forced box", () => {
			renderInfoBox(
				<>
					<InfoBox heading="Toggle" message="M" headingComponent="h2" />
					<InfoBox
						heading="Forced"
						message="M"
						alwaysExpanded
						headingComponent="h4"
					/>
					<InfoBox heading="Default" message="M" />
				</>,
			);
			expect(
				screen
					.getAllByRole("heading")
					.map((h) => [h.textContent, h.tagName, h.className]),
			).toEqual([
				["Toggle", "H2", expect.stringContaining("MuiAccordion-heading")],
				["Forced", "H4", expect.stringContaining("MuiAccordion-heading")],
				["Default", "H3", expect.stringContaining("MuiAccordion-heading")],
			]);
			// the toggle stays the button inside the heading
			expect(
				screen.getByRole("heading", { level: 2, name: "Toggle" }),
			).toContainElement(header("Toggle"));
			expect(staticHeader("Forced").parentElement?.tagName).toBe("H4");
		});

		it("[ISSUE-3464-ITEM-11] headingComponent another element than a heading leaves the box out of the outline", () => {
			renderInfoBox(
				<>
					<InfoBox heading="Toggle" message="M" headingComponent="div" />
					<InfoBox
						heading="Forced"
						message="M"
						alwaysExpanded
						headingComponent="div"
					/>
				</>,
			);
			expect(screen.queryAllByRole("heading")).toEqual([]);
			expect(header("Toggle")).toHaveAttribute("aria-expanded", "false");
			expect(screen.getByText("Forced")).toBeVisible();
		});

		it("[ISSUE-3464-ITEM-11] a theme's defaultProps set the heading's element of every box, and a change after mount takes effect", () => {
			const box = (level?: "h2" | "h5") => (
				<InfoBox heading="Notice" message="M" headingComponent={level} />
			);
			const t = createTheme({
				components: { CcInfoBox: { defaultProps: { headingComponent: "h4" } } },
			});
			const { rerender } = render(themed(box(), t));
			expect(screen.getByRole("heading", { name: "Notice" }).tagName).toBe(
				"H4",
			);
			rerender(themed(box("h2"), t));
			expect(screen.getByRole("heading", { name: "Notice" }).tagName).toBe(
				"H2",
			);
			rerender(themed(box("h5"), t));
			expect(screen.getByRole("heading", { name: "Notice" }).tagName).toBe(
				"H5",
			);
		});
	});
});

describe("InfoBox props types and exports", () => {
	// the JSX of the tests below is also checked by tsc (tsconfig-test.json)
	it("[ISSUE-3464-ITEM-5] heading takes any node: emphasis in it renders in the header, which it names", () => {
		renderInfoBox(
			<InfoBox
				status="warning"
				heading={
					<>
						Please <strong>review</strong> the import
					</>
				}
				message="M"
			/>,
		);
		const button = screen.getByRole("button");
		expect(button).toHaveAccessibleName("Warning: Please review the import");
		expect(within(button).getByText("review").tagName).toBe("STRONG");
	});

	it("[ISSUE-3464-ITEM-5] headingVariant takes every variant Typography takes: one the app adds and inherit", () => {
		renderInfoBox(
			<>
				<InfoBox heading="Own variant" message="M" headingVariant="caption2" />
				<InfoBox heading="Inherited" message="M" headingVariant="inherit" />
			</>,
		);
		expect(screen.getByText("Own variant")).toHaveClass(
			"MuiTypography-caption2",
		);
		expect(screen.getByText("Inherited")).toHaveClass("MuiTypography-inherit");
		// checked by tsc, not at runtime
		expectTypeOf<InfoBoxProps["headingVariant"]>().toEqualTypeOf<
			TypographyProps["variant"]
		>();
	});

	it("[ISSUE-3464-ITEM-5] expanded is optional: a forced box needs none, and a theme's defaultProps value applies", () => {
		renderInfoBox(
			<InfoBox heading="Forced" message="Forced message" alwaysExpanded />,
		);
		renderInfoBox(
			<InfoBox heading="Themed" message="Themed message" />,
			createTheme({
				components: { CcInfoBox: { defaultProps: { expanded: true } } },
			}),
		);
		expect(header("Themed")).toHaveAttribute("aria-expanded", "true");
		expect(screen.getByText("Forced message")).toBeVisible();
		expect(screen.getByText("Themed message")).toBeVisible();
	});

	it("[ISSUE-3464-ITEM-5] exports its props and class key types from the package root", () => {
		// checked by tsc, not at runtime
		expectTypeOf<PackageRoot.InfoBoxProps>().toEqualTypeOf<InfoBoxProps>();
		expectTypeOf<PackageRoot.InfoBoxClassKey>().toEqualTypeOf<InfoBoxClassKey>();
	});
});
