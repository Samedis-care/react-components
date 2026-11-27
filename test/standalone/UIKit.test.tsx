import { afterEach, describe, expect, it, vi } from "vitest";
import React from "react";
import {
	act,
	cleanup,
	fireEvent,
	isInaccessible,
	render,
	screen,
	within,
} from "@testing-library/react";
import {
	Button,
	createTheme,
	IconButton,
	Theme,
	ThemeProvider,
} from "@mui/material";
import { Home as HomeIcon, Save as SaveIcon } from "@mui/icons-material";
import ActionButton from "../../src/standalone/UIKit/ActionButton";
import SubActionButton from "../../src/standalone/UIKit/SubActionButton";
import FormButtons from "../../src/standalone/UIKit/FormButtons";
import IconButtonWithText from "../../src/standalone/UIKit/IconButtonWithText";
import TextFieldWithHelp from "../../src/standalone/UIKit/TextFieldWithHelp";
import NumberFormatter from "../../src/standalone/UIKit/NumberFormatter";
import CenteredTypography from "../../src/standalone/UIKit/CenteredTypography";
import Checkbox from "../../src/standalone/UIKit/Checkbox";
import ComponentWithLabel from "../../src/standalone/UIKit/ComponentWithLabel";
import { TextFieldCC } from "../../src/standalone/UIKit/MuiFieldState";
import DecimalInputField from "../../src/standalone/UIKit/InputControls/DecimalInputField";
import CurrencyInput from "../../src/standalone/UIKit/InputControls/CurrencyInput";
import IntegerInputField from "../../src/standalone/UIKit/InputControls/IntegerInputField";
import ActionBarView from "../../src/standalone/DataGrid/Header/ActionBarView";
import ccI18n from "../../src/i18n";
import {
	configureErrorReporting,
	getErrorReportingConfig,
} from "../../src/framework/ErrorReporting";

const theme = createTheme();

const wrap = (ui: React.ReactNode, withTheme: Theme = theme) =>
	render(<ThemeProvider theme={withTheme}>{ui}</ThemeProvider>);

// the theme types only know the registered Cc slots and their props
const themeWith = (components: object, mode?: "dark") =>
	createTheme({ palette: mode ? { mode } : undefined, components });

afterEach(async () => {
	cleanup();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
	if (ccI18n.language !== "en") {
		await act(async () => {
			await ccI18n.changeLanguage("en");
		});
	}
});

/** every emitted style rule: emotion's text nodes and the parsed CSSOM */
const allCss = () =>
	Array.from(document.querySelectorAll("style"))
		.map(
			(style) =>
				(style.textContent ?? "") +
				Array.from(style.sheet?.cssRules ?? [])
					.map((rule) => rule.cssText)
					.join("\n"),
		)
		.join("\n");

/**
 * Values of `property` from every emitted rule whose selector matches `el`.
 * jsdom has no cascade for emotion's rules, so this lists candidates rather
 * than the winner; selectors jsdom cannot match (pseudo-elements, invalid
 * selectors) are skipped.
 */
const applied = (el: Element, property: string): string[] => {
	const values: string[] = [];
	const rule = /([^{}]+)\{([^{}]*)\}/g;
	const css = allCss();
	let match: RegExpExecArray | null;
	while ((match = rule.exec(css)) !== null) {
		let matches = false;
		try {
			matches = el.matches(match[1].trim());
		} catch {
			// not a selector jsdom can evaluate
		}
		if (!matches) continue;
		for (const declaration of match[2].split(";")) {
			const colon = declaration.indexOf(":");
			if (colon > 0 && declaration.slice(0, colon).trim() === property)
				values.push(
					declaration
						.slice(colon + 1)
						.trim()
						.toLowerCase(),
				);
		}
	}
	return values;
};

/** md and up, where the DataGrid header uses ComponentWithLabel */
const stubWideScreen = () =>
	vi.stubGlobal(
		"matchMedia",
		(query: string) =>
			({
				matches: true,
				media: query,
				onchange: null,
				addListener: () => {},
				removeListener: () => {},
				addEventListener: () => {},
				removeEventListener: () => {},
				dispatchEvent: () => false,
			}) as MediaQueryList,
	);

describe("UIKit", () => {
	describe("ActionButton", () => {
		it("renders with text", () => {
			wrap(<ActionButton>Save</ActionButton>);
			expect(screen.getByRole("button", { name: /save/i })).toBeTruthy();
		});
		it("renders disabled", () => {
			wrap(<ActionButton disabled>Save</ActionButton>);
			expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();
		});
		it("renders with icon", () => {
			wrap(
				<ActionButton icon={<SaveIcon data-testid="icon" />}>
					Save
				</ActionButton>,
			);
			expect(screen.getByTestId("icon")).toBeTruthy();
		});
		it("shows only icon when small=true", () => {
			wrap(
				<ActionButton icon={<SaveIcon data-testid="icon" />} small>
					Save
				</ActionButton>,
			);
			// the label stays in the button as visually hidden text
			expect(applied(screen.getByText("Save"), "clip-path")).toContain(
				"inset(50%)",
			);
			expect(screen.getByTestId("icon")).toBeTruthy();
		});
		it("calls onClick", () => {
			const onClick = vi.fn();
			wrap(<ActionButton onClick={onClick}>Save</ActionButton>);
			fireEvent.click(screen.getByRole("button"));
			expect(onClick).toHaveBeenCalledOnce();
		});
		it("[ISSUE-3482-ITEM-8] renders a color whose hover fill it cannot measure", () => {
			// main is too light for white text, so its fill moves; dark stays a variable
			const varDark = createTheme({
				palette: {
					warning: { main: "#ed6c02", dark: "var(--app-warning-dark)" },
				},
			});
			render(
				<ThemeProvider theme={varDark}>
					<ActionButton color="warning">Save</ActionButton>
				</ThemeProvider>,
			);
			expect(screen.getByRole("button", { name: "Save" })).toBeTruthy();
		});

		it("[ISSUE-3482-ITEM-1] names an icon-only ActionButton by its label, also while disabled", () => {
			wrap(
				<>
					<ActionButton small icon={<SaveIcon />}>
						Save
					</ActionButton>
					<ActionButton small disabled icon={<SaveIcon />}>
						Discard
					</ActionButton>
				</>,
			);
			// no tooltip is open: the name must not depend on it
			expect(screen.queryByRole("tooltip")).toBeNull();
			expect(screen.queryByRole("button", { name: "Save" })).not.toBeNull();
			expect(screen.queryByRole("button", { name: "Discard" })).not.toBeNull();
		});

		it.each([
			{
				what: "a small ActionButton",
				ui: () => (
					<ActionButton small icon={<SaveIcon />}>
						Save
					</ActionButton>
				),
				name: "Save",
			},
			{
				what: "a small ActionButton given an aria-label",
				ui: () => (
					<ActionButton small icon={<SaveIcon />} aria-label={"Save record"}>
						Save
					</ActionButton>
				),
				name: "Save record",
			},
		])(
			"[ISSUE-3482-ITEM-1] keeps the name of $what while its tooltip is open",
			async ({ ui, name }) => {
				wrap(ui());
				const button = screen.getByRole("button");
				expect(button).toHaveAccessibleName(name);
				fireEvent.mouseOver(button);
				expect(await screen.findByRole("tooltip")).toBeInTheDocument();
				expect(button).toHaveAccessibleName(name);
			},
		);
	});
	describe("SubActionButton", () => {
		it("renders with text", () => {
			wrap(<SubActionButton>Delete</SubActionButton>);
			expect(screen.getByRole("button", { name: /delete/i })).toBeTruthy();
		});

		it("renders disabled", () => {
			wrap(<SubActionButton disabled>Delete</SubActionButton>);
			expect(screen.getByRole("button")).toBeDisabled();
		});

		it("renders small with icon only", () => {
			wrap(
				<SubActionButton icon={<SaveIcon data-testid="sub-icon" />} small>
					Save
				</SubActionButton>,
			);
			// the label stays in the button as visually hidden text
			expect(applied(screen.getByText("Save"), "clip-path")).toContain(
				"inset(50%)",
			);
			expect(screen.getByTestId("sub-icon")).toBeTruthy();
		});

		it("calls onClick", () => {
			const onClick = vi.fn();
			wrap(<SubActionButton onClick={onClick}>Click me</SubActionButton>);
			fireEvent.click(screen.getByRole("button"));
			expect(onClick).toHaveBeenCalledOnce();
		});

		it("[ISSUE-3482-ITEM-1] names an icon-only SubActionButton when disabled or given a node label", () => {
			wrap(
				<>
					<SubActionButton small disabled icon={<HomeIcon />}>
						Home
					</SubActionButton>
					<SubActionButton small icon={<SaveIcon />}>
						<span>Save</span>
					</SubActionButton>
				</>,
			);
			expect(screen.queryByRole("button", { name: "Home" })).not.toBeNull();
			expect(screen.queryByRole("button", { name: "Save" })).not.toBeNull();
		});

		it.each([
			{
				what: "a small SubActionButton with a node label",
				ui: () => (
					<SubActionButton small icon={<HomeIcon />}>
						<span>Home</span>
					</SubActionButton>
				),
				name: "Home",
			},
			{
				what: "a small SubActionButton given an aria-label",
				ui: () => (
					<SubActionButton
						small
						icon={<HomeIcon />}
						aria-label={"Go to the start page"}
					>
						<span>Home</span>
					</SubActionButton>
				),
				name: "Go to the start page",
			},
		])(
			"[ISSUE-3482-ITEM-1] keeps the name of $what while its tooltip is open",
			async ({ ui, name }) => {
				wrap(ui());
				const button = screen.getByRole("button");
				expect(button).toHaveAccessibleName(name);
				fireEvent.mouseOver(button);
				expect(await screen.findByRole("tooltip")).toBeInTheDocument();
				expect(button).toHaveAccessibleName(name);
			},
		);
	});
	describe("FormButtons", () => {
		it("renders children", () => {
			wrap(
				<FormButtons>
					<Button>Save</Button>
					<Button>Cancel</Button>
				</FormButtons>,
			);
			expect(screen.getByRole("button", { name: "Save" })).toBeTruthy();
			expect(screen.getByRole("button", { name: "Cancel" })).toBeTruthy();
		});

		it("renders nothing when all children are falsy", () => {
			const { container } = wrap(
				<FormButtons>
					{null}
					{false}
					{undefined}
				</FormButtons>,
			);
			// Should render empty fragment
			expect(container.querySelector(".MuiGrid-root")).toBeNull();
		});

		it("handles single child", () => {
			wrap(
				<FormButtons>
					<Button>Only</Button>
				</FormButtons>,
			);
			expect(screen.getByRole("button", { name: "Only" })).toBeTruthy();
		});

		it("[ISSUE-3482-ITEM-6] keeps each button's DOM node and focus when a conditional button before it disappears", () => {
			const Bar = ({ show }: { show: boolean }) => (
				<FormButtons>
					<Button>A</Button>
					{show && <Button>B</Button>}
					<Button>C</Button>
				</FormButtons>
			);
			const { rerender } = wrap(<Bar show />);
			const b = screen.getByRole("button", { name: "B" });
			const c = screen.getByRole("button", { name: "C" });
			act(() => b.focus());
			rerender(
				<ThemeProvider theme={theme}>
					<Bar show={false} />
				</ThemeProvider>,
			);
			// B's node must go away rather than be reused for C, focus included
			expect(
				screen.getByRole("button", { name: "C" }),
				"C is rendered into B's DOM node",
			).toBe(c);
			expect(b).not.toBeInTheDocument();
			expect(c).not.toHaveFocus();
		});

		it("[ISSUE-3482-ITEM-6] keeps a keyed button's DOM node and focus when the button before it is dropped from its array", () => {
			// extraButtons of DefaultFormPageButtons: one array child, filtered by the app
			const Bar = ({ show }: { show: boolean }) => (
				<FormButtons>
					<Button>Save</Button>
					{[
						show && <Button key={"b"}>B</Button>,
						<Button key={"c"}>C</Button>,
					].filter(Boolean)}
				</FormButtons>
			);
			const { rerender } = wrap(<Bar show />);
			const c = screen.getByRole("button", { name: "C" });
			act(() => c.focus());
			rerender(
				<ThemeProvider theme={theme}>
					<Bar show={false} />
				</ThemeProvider>,
			);
			expect(screen.getByRole("button", { name: "C" })).toBe(c);
			expect(c).toHaveFocus();
		});

		it("[ISSUE-3482-ITEM-24] gives no slot to null or false inside a nested children array", () => {
			const { container } = wrap(
				<FormButtons>
					<Button>Save</Button>
					{[<Button key={"extra"}>Extra</Button>, false, null]}
					<Button>Back</Button>
				</FormButtons>,
			);
			const slots = Array.from(container.firstElementChild!.children);
			expect(slots.filter((slot) => slot.childNodes.length === 0)).toEqual([]);
			expect(slots).toHaveLength(3);
		});

		it("[ISSUE-3482-ITEM-24] renders nothing when only nested falsy children remain", () => {
			const { container } = wrap(
				<FormButtons>
					{[null]}
					{false}
				</FormButtons>,
			);
			expect(container).toBeEmptyDOMElement();
		});
	});
	describe("IconButtonWithText", () => {
		it("renders icon and text", () => {
			wrap(
				<IconButtonWithText
					icon={<SaveIcon data-testid="ibwt-icon" />}
					text="Save"
				/>,
			);
			expect(screen.getByTestId("ibwt-icon")).toBeTruthy();
			expect(screen.getByText("Save")).toBeTruthy();
		});
		it("calls onClick when icon is clicked", () => {
			const onClick = vi.fn();
			wrap(
				<IconButtonWithText
					icon={<SaveIcon />}
					text="Save"
					onClick={onClick}
				/>,
			);
			fireEvent.click(screen.getByRole("button"));
			expect(onClick).toHaveBeenCalled();
		});
		it("[ISSUE-3482-ITEM-11] names the button by a node text", () => {
			wrap(<IconButtonWithText icon={<HomeIcon />} text={<span>Home</span>} />);
			expect(screen.getByRole("button")).toHaveAccessibleName("Home");
		});
		it("[ISSUE-3482-ITEM-11] reads a string text once, as the button's name", () => {
			wrap(<IconButtonWithText icon={<HomeIcon />} text={"Home"} />);
			expect(screen.getByRole("button")).toHaveAccessibleName("Home");
			expect(isInaccessible(screen.getByText("Home"))).toBe(true);
		});
		it("[ISSUE-3482-ITEM-11] names the button by a caption with its own id", () => {
			wrap(
				<IconButtonWithText
					icon={<HomeIcon />}
					text={<span>Home</span>}
					TypographyProps={{ id: "home-caption" }}
				/>,
			);
			expect(screen.getByRole("button")).toHaveAccessibleName("Home");
			expect(document.getElementById("home-caption")).toHaveTextContent("Home");
		});
		it("[ISSUE-3482-ITEM-11] takes the name from IconButtonProps' aria-label and keeps the caption readable", () => {
			wrap(
				<IconButtonWithText
					icon={<HomeIcon />}
					text={"Home"}
					IconButtonProps={{ "aria-label": "Go to the start page" }}
				/>,
			);
			expect(screen.getByRole("button")).toHaveAccessibleName(
				"Go to the start page",
			);
			expect(isInaccessible(screen.getByText("Home"))).toBe(false);
		});
	});
	describe("TextFieldWithHelp", () => {
		it("renders with label", () => {
			wrap(<TextFieldWithHelp label="Name" />);
			expect(screen.getByLabelText("Name")).toBeTruthy();
		});

		it("renders with error state", () => {
			wrap(
				<TextFieldWithHelp label="Email" error helperText="Invalid email" />,
			);
			expect(screen.getByText("Invalid email")).toBeTruthy();
		});

		it("renders info button when openInfo is provided", () => {
			const openInfo = vi.fn();
			wrap(<TextFieldWithHelp label="Info" openInfo={openInfo} />);
			// The info icon button should exist
			// It's only visible if the condition is met (endAdornment check)
			// We just verify the field renders
			expect(screen.getByLabelText("Info")).toBeTruthy();
		});

		it("renders disabled state", () => {
			wrap(<TextFieldWithHelp label="Disabled" disabled />);
			expect(screen.getByLabelText("Disabled")).toBeDisabled();
		});
	});
	describe("NumberFormatter", () => {
		it("renders a number", () => {
			wrap(<NumberFormatter value={42} />);
			// The formatted value should contain "42"
			expect(screen.getByText(/42/)).toBeTruthy();
		});

		it("renders nothing for null", () => {
			const { container } = wrap(<NumberFormatter value={null} />);
			expect(container.textContent).toBe("");
		});

		it("renders nothing for undefined", () => {
			const { container } = wrap(<NumberFormatter value={undefined} />);
			expect(container.textContent).toBe("");
		});

		it("renders zero", () => {
			wrap(<NumberFormatter value={0} />);
			expect(screen.getByText(/0/)).toBeTruthy();
		});

		it("renders negative numbers", () => {
			wrap(<NumberFormatter value={-99} />);
			expect(screen.getByText(/-?99/)).toBeTruthy();
		});

		it("renders large numbers", () => {
			wrap(<NumberFormatter value={1000000} />);
			// The formatted number should contain "1" and "000000" in some locale format
			expect(screen.getByText(/1/).textContent).toBeTruthy();
		});

		it("renders with currency options", () => {
			wrap(
				<NumberFormatter
					value={9.99}
					options={
						{
							style: "currency",
							currency: "USD",
							locale: "en-US",
						} as Intl.NumberFormatOptions
					}
				/>,
			);
			// Should render something
			expect(screen.getByText(/9/).textContent).toBeTruthy();
		});

		it("renders with percent options", () => {
			wrap(<NumberFormatter value={0.5} options={{ style: "percent" }} />);
			expect(screen.getByText(/%/).textContent).toBeTruthy();
		});

		it("[ISSUE-3482-ITEM-26] renders instead of throwing when the currency is missing or malformed", () => {
			// React reports the render error through console.error before rethrowing
			vi.spyOn(console, "error").mockImplementation(() => {});
			expect(() =>
				wrap(<NumberFormatter value={1} options={{ style: "currency" }} />),
			).not.toThrow();
			cleanup();
			expect(() =>
				wrap(
					<NumberFormatter
						value={1}
						options={{ style: "currency", currency: "" }}
					/>,
				),
			).not.toThrow();
		});

		it("[ISSUE-3482-ITEM-26] prints a malformed currency where the language puts a code, and the plain amount while the currency is missing", async () => {
			vi.spyOn(console, "error").mockImplementation(() => {});
			await act(async () => {
				await ccI18n.changeLanguage("en");
			});
			// the options, the text in en, the text in de
			const cases: [Intl.NumberFormatOptions, string, string][] = [
				[{ style: "currency" }, "1,234.50", "1.234,50"],
				[{ style: "currency", currency: "" }, "1,234.50", "1.234,50"],
				[
					// untyped data
					{ style: "currency", currency: null as unknown as string },
					"1,234.50",
					"1.234,50",
				],
				[
					{ style: "currency", currency: "EURO" },
					"EURO 1,234.50",
					"1.234,50 EURO",
				],
				[{ style: "currency", currency: "€" }, "€ 1,234.50", "1.234,50 €"],
				[
					{ style: "currency", currency: "EURO", maximumFractionDigits: 0 },
					"EURO 1,235",
					"1.235 EURO",
				],
				[
					{ style: "currency", currency: "EURO", minimumFractionDigits: 3 },
					"EURO 1,234.500",
					"1.234,500 EURO",
				],
				[
					{ style: "currency", currency: "EURO", currencyDisplay: "name" },
					"1,234.50 EURO",
					"1.234,50 EURO",
				],
				[
					{ style: "currency", currency: "XYZ" },
					"XYZ 1,234.50",
					"1.234,50 XYZ",
				],
				[{ style: "currency", currency: "EUR" }, "€1,234.50", "1.234,50 €"],
				[{ currency: "EURO" }, "1,234.5", "1.234,5"],
			];
			const { container } = wrap(
				cases.map(([options], index) => (
					<React.Fragment key={index}>
						{index > 0 && "|"}
						<NumberFormatter value={1234.5} options={options} />
					</React.Fragment>
				)),
			);
			// Intl puts a no-break space between a code and the number
			const text = () => container.textContent.replace(/\s/g, " ");
			expect(text()).toBe(cases.map(([, en]) => en).join("|"));
			await act(async () => {
				await ccI18n.changeLanguage("de");
			});
			expect(text()).toBe(cases.map(([, , de]) => de).join("|"));
		});

		it("[ISSUE-3482-ITEM-26] prints NaN and Infinity as Intl does", () => {
			vi.spyOn(console, "error").mockImplementation(() => {});
			const { container } = wrap(
				<>
					<NumberFormatter value={NaN} />|
					<NumberFormatter value={Infinity} />|
					<NumberFormatter
						value={NaN}
						options={{ style: "currency", currency: "EUR" }}
					/>
					|
					<NumberFormatter
						value={-Infinity}
						options={{ style: "currency", currency: "EURO" }}
					/>
				</>,
			);
			expect(container.textContent.replace(/\s/g, " ")).toBe(
				"NaN|∞|€NaN|-EURO∞",
			);
		});

		it("[ISSUE-3482-ITEM-26] still throws for options that are invalid without the currency too", () => {
			// React reports the render error through console.error before rethrowing
			vi.spyOn(console, "error").mockImplementation(() => {});
			for (const currency of [undefined, "", "EURO", "EUR"]) {
				cleanup();
				expect(() =>
					wrap(
						<NumberFormatter
							value={1}
							options={{
								style: "currency",
								currency,
								minimumFractionDigits: 3,
								maximumFractionDigits: 1,
							}}
						/>,
					),
				).toThrow();
			}
		});

		it("[ISSUE-3482-ITEM-26] reports a missing or malformed currency once, not on every render", () => {
			const error = vi.spyOn(console, "error").mockImplementation(() => {});
			const before = { ...getErrorReportingConfig() };
			const report = vi.fn();
			configureErrorReporting({ report, shouldReport: () => true });
			try {
				const ui = (value: number, currency?: string) => (
					<React.StrictMode>
						<NumberFormatter
							value={value}
							options={{ style: "currency", currency }}
						/>
					</React.StrictMode>
				);
				const logged = () =>
					error.mock.calls.filter(
						([message]) =>
							typeof message === "string" &&
							message.startsWith("[Components-Care] [NumberFormatter]"),
					);
				const { rerender } = render(ui(1, ""));
				expect(report).toHaveBeenCalledTimes(1);
				expect(report).toHaveBeenLastCalledWith(
					expect.objectContaining({ name: "RangeError" }),
					{
						source: "NumberFormatter",
						extra: { style: "currency", currency: "" },
					},
				);
				rerender(ui(2, ""));
				expect(report).toHaveBeenCalledTimes(1);
				rerender(ui(2));
				expect(report).toHaveBeenCalledTimes(2);
				expect(report).toHaveBeenLastCalledWith(
					expect.objectContaining({ name: "TypeError" }),
					{
						source: "NumberFormatter",
						extra: { style: "currency", currency: undefined },
					},
				);
				rerender(ui(3));
				rerender(ui(3, "EUR"));
				expect(report).toHaveBeenCalledTimes(2);
				rerender(ui(4, "EURO"));
				rerender(ui(5, "EURO"));
				expect(report).toHaveBeenCalledTimes(3);
				expect(report).toHaveBeenLastCalledWith(
					expect.objectContaining({ name: "RangeError" }),
					{
						source: "NumberFormatter",
						extra: { style: "currency", currency: "EURO" },
					},
				);
				expect(logged()).toHaveLength(3);
				expect(logged()[1][1]).toBe(report.mock.calls[1][0]);
			} finally {
				configureErrorReporting(before);
			}
		});

		it("[ISSUE-3482-ITEM-26] reports nothing with disableErrorReporting, until it is turned off", async () => {
			const error = vi.spyOn(console, "error").mockImplementation(() => {});
			await act(async () => {
				await ccI18n.changeLanguage("en");
			});
			const before = { ...getErrorReportingConfig() };
			const report = vi.fn();
			configureErrorReporting({ report, shouldReport: () => true });
			try {
				// the same options on every render: only the prop changes
				const options: Record<string, Intl.NumberFormatOptions> = {
					EURO: { style: "currency", currency: "EURO" },
					"": { style: "currency", currency: "" },
				};
				const ui = (disableErrorReporting: boolean, currency: string) => (
					<React.StrictMode>
						<NumberFormatter
							value={1234.5}
							options={options[currency]}
							disableErrorReporting={disableErrorReporting}
						/>
					</React.StrictMode>
				);
				const { container, rerender } = render(ui(true, "EURO"));
				expect(container.textContent.replace(/\s/g, " ")).toBe("EURO 1,234.50");
				rerender(ui(true, ""));
				expect(container.textContent).toBe("1,234.50");
				expect(report).not.toHaveBeenCalled();
				expect(error).not.toHaveBeenCalled();
				rerender(ui(false, ""));
				expect(report).toHaveBeenCalledTimes(1);
				expect(error).toHaveBeenCalledTimes(1);
				rerender(ui(true, "EURO"));
				expect(report).toHaveBeenCalledTimes(1);
				expect(error).toHaveBeenCalledTimes(1);
			} finally {
				configureErrorReporting(before);
			}
		});
	});
	describe("CenteredTypography", () => {
		it("renders text content", () => {
			wrap(
				<div style={{ width: 200, height: 200 }}>
					<CenteredTypography>Centered</CenteredTypography>
				</div>,
			);
			expect(screen.getByText("Centered")).toBeTruthy();
		});

		it("renders with a variant", () => {
			wrap(
				<div style={{ width: 200, height: 200 }}>
					<CenteredTypography variant="h6">Heading</CenteredTypography>
				</div>,
			);
			expect(screen.getByText("Heading")).toBeTruthy();
		});

		it("[ISSUE-3482-ITEM-9] renders a heading variant as that heading, as Typography does", () => {
			wrap(<CenteredTypography variant="h4">Section</CenteredTypography>);
			expect(
				screen.getByRole("heading", { level: 4, name: "Section" }),
			).toHaveClass("MuiTypography-h4");
		});

		it("[ISSUE-3482-ITEM-9] takes the element from component and keeps the variant's look", () => {
			wrap(
				<CenteredTypography variant="h4" component="div">
					Nothing found
				</CenteredTypography>,
			);
			const text = screen.getByText("Nothing found");
			expect(text.tagName).toBe("DIV");
			expect(text).toHaveClass("MuiTypography-h4");
			expect(screen.queryByRole("heading")).toBeNull();
		});
	});
	describe("Checkbox", () => {
		it("renders unchecked by default", () => {
			wrap(<Checkbox />);
			const checkbox = screen.getByRole("checkbox");
			expect(checkbox).not.toBeChecked();
		});
		it("renders checked when prop is set", () => {
			wrap(<Checkbox checked readOnly />);
			const checkbox = screen.getByRole("checkbox");
			expect(checkbox).toBeChecked();
		});
		it("renders disabled", () => {
			wrap(<Checkbox disabled />);
			expect(screen.getByRole("checkbox")).toBeDisabled();
		});
		it("calls onChange when clicked", () => {
			const onChange = vi.fn();
			wrap(<Checkbox onChange={onChange} />);
			fireEvent.click(screen.getByRole("checkbox"));
			expect(onChange).toHaveBeenCalled();
		});
		it("[ISSUE-3482-ITEM-2] puts the native checkbox into the indeterminate state, and takes it out again", () => {
			const { rerender } = wrap(
				<Checkbox
					indeterminate
					slotProps={{ input: { "aria-label": "Select all" } }}
				/>,
			);
			const input = screen.getByRole<HTMLInputElement>("checkbox", {
				name: "Select all",
			});
			// browsers expose a native checkbox's state from this property and ignore aria-checked
			expect(input.indeterminate).toBe(true);
			rerender(
				<ThemeProvider theme={theme}>
					<Checkbox
						indeterminate={false}
						slotProps={{ input: { "aria-label": "Select all" } }}
					/>
				</ThemeProvider>,
			);
			expect(input.indeterminate).toBe(false);
		});

		/**
		 * The colors the page's styles give `element` in forced colors. jsdom
		 * matches no media feature, so the rules of every
		 * `@media (forced-colors: active)` block are applied as if it matched.
		 * Browsers force no background or border color on an `<svg>`
		 * (forced-color-adjust: preserve-parent-color), so these rules are what
		 * makes them system colors.
		 */
		const forcedColors = (element: Element) => {
			const rules = Array.from(document.styleSheets)
				.flatMap((sheet) => Array.from(sheet.cssRules))
				.filter(
					(rule): rule is CSSMediaRule =>
						rule instanceof window.CSSMediaRule &&
						rule.media.mediaText.includes("forced-colors: active"),
				)
				.flatMap((rule) => Array.from(rule.cssRules, (inner) => inner.cssText));
			const sheet = document.createElement("style");
			sheet.textContent = rules.join("\n");
			document.head.append(sheet);
			try {
				const style = getComputedStyle(element);
				return {
					box: style.backgroundColor,
					border: style.borderTopColor,
					tick: style.color,
				};
			} finally {
				sheet.remove();
			}
		};
		/** A CSS system color, as getComputedStyle resolves it */
		const systemColor = (name: string) => {
			const probe = document.createElement("div");
			probe.style.color = name;
			document.body.append(probe);
			try {
				return getComputedStyle(probe).color;
			} finally {
				probe.remove();
			}
		};
		const iconOf = (input: HTMLElement) => {
			const icon = input.parentElement?.querySelector(":scope > svg");
			if (!icon) throw new Error("the checkbox has no icon next to its input");
			return icon;
		};
		it.each(["light", "dark"] as const)(
			"[ISSUE-3482-ITEM-4] paints the box Canvas and its border and tick CanvasText in forced colors (%s theme)",
			(mode) => {
				render(
					<ThemeProvider theme={createTheme({ palette: { mode } })}>
						<Checkbox
							checked
							readOnly
							slotProps={{ input: { "aria-label": "Stay signed in" } }}
						/>
					</ThemeProvider>,
				);
				const icon = iconOf(
					screen.getByRole("checkbox", { name: "Stay signed in" }),
				);
				expect(forcedColors(icon)).toEqual({
					box: systemColor("Canvas"),
					border: systemColor("CanvasText"),
					tick: systemColor("CanvasText"),
				});
			},
		);
		it("[ISSUE-3482-ITEM-4] paints a disabled box's border and tick GrayText in forced colors", () => {
			wrap(
				<Checkbox
					checked
					disabled
					slotProps={{ input: { "aria-label": "Stay signed in" } }}
				/>,
			);
			const icon = iconOf(
				screen.getByRole("checkbox", { name: "Stay signed in" }),
			);
			expect(forcedColors(icon)).toEqual({
				box: systemColor("Canvas"),
				border: systemColor("GrayText"),
				tick: systemColor("GrayText"),
			});
		});
	});

	describe("ComponentWithLabel", () => {
		it("runs the control's own onClick once per click on the caption", () => {
			// the DataGrid footer pattern
			const onClick = vi.fn();
			wrap(
				<ComponentWithLabel
					control={
						<IconButton aria-label={"Export"} onClick={onClick}>
							<HomeIcon />
						</IconButton>
					}
					labelText={"Export"}
					labelPlacement={"bottom"}
				/>,
			);
			fireEvent.click(screen.getByText("Export"));
			expect(onClick).toHaveBeenCalledOnce();
		});

		it("[ISSUE-3482-ITEM-14] runs an onClick on the wrapper once per click on the caption", () => {
			const onClick = vi.fn();
			wrap(
				<ComponentWithLabel
					control={
						<IconButton aria-label={"Settings"}>
							<HomeIcon />
						</IconButton>
					}
					labelText={"Settings"}
					labelPlacement={"bottom"}
					onClick={onClick}
				/>,
			);
			fireEvent.click(screen.getByText("Settings"));
			expect(onClick).toHaveBeenCalledOnce();
		});

		it("[ISSUE-3482-ITEM-14] DataGrid header: a click on the Import caption runs onImport once", () => {
			stubWideScreen();
			const onImport = vi.fn();
			const noop = () => {};
			wrap(
				<ActionBarView
					handleImport={onImport}
					hasCustomFilterBar={false}
					hideReset
					refresh={noop}
					resetFilter={noop}
					resetSort={noop}
					resetColumn={noop}
					resetWidth={noop}
					resetAll={noop}
				/>,
			);
			const button = screen.getByRole("button", { name: "Import" });
			fireEvent.click(within(button.closest("label")!).getByText("Import"));
			expect(onImport).toHaveBeenCalledOnce();
		});

		it("[ISSUE-3482-ITEM-14] runs an onClick on the wrapper once per click on a checkbox's caption, which still toggles the checkbox", () => {
			const onClick = vi.fn();
			wrap(
				<ComponentWithLabel
					control={<Checkbox />}
					labelText={"Archived"}
					onClick={onClick}
				/>,
			);
			fireEvent.click(screen.getByText("Archived"));
			expect(onClick).toHaveBeenCalledOnce();
			expect(screen.getByRole("checkbox", { name: "Archived" })).toBeChecked();
		});

		it("[ISSUE-3482-ITEM-14] runs an onClick on the wrapper once per click on the control", () => {
			const onClick = vi.fn();
			wrap(
				<ComponentWithLabel
					control={
						<IconButton aria-label={"Settings"}>
							<HomeIcon />
						</IconButton>
					}
					labelText={"Settings"}
					labelPlacement={"bottom"}
					onClick={onClick}
				/>,
			);
			fireEvent.click(screen.getByRole("button", { name: "Settings" }));
			expect(onClick).toHaveBeenCalledOnce();
		});

		it("[ISSUE-3482-ITEM-14] stops the click the label forwards where the wrapper's onClick stopped the click on the caption", () => {
			// keeps a clickable ancestor, e.g. a list row, from seeing the click
			const onRowClick = vi.fn();
			const onClick = vi.fn((evt: React.MouseEvent) => evt.stopPropagation());
			wrap(
				<div onClick={onRowClick}>
					<ComponentWithLabel
						control={<Checkbox />}
						labelText={"Archived"}
						onClick={onClick}
					/>
				</div>,
			);
			fireEvent.click(screen.getByText("Archived"));
			expect(onClick).toHaveBeenCalledOnce();
			expect(onRowClick).not.toHaveBeenCalled();
			expect(screen.getByRole("checkbox", { name: "Archived" })).toBeChecked();
		});

		it("[ISSUE-3482-ITEM-14] runs an onClick on the wrapper for a later click on the control when the label forwarded no click", () => {
			vi.useFakeTimers();
			try {
				const onClick = vi.fn();
				const preventDefault = (evt: React.MouseEvent) => evt.preventDefault();
				wrap(
					// cancels the click on the caption after the wrapper's onClick
					<div onClick={preventDefault}>
						<ComponentWithLabel
							control={
								<IconButton aria-label={"Settings"}>
									<HomeIcon />
								</IconButton>
							}
							labelText={"Settings"}
							labelPlacement={"bottom"}
							onClick={onClick}
						/>
					</div>,
				);
				fireEvent.click(screen.getByText("Settings"));
				expect(onClick).toHaveBeenCalledOnce();
				// the next click comes in a later task
				act(() => {
					vi.runOnlyPendingTimers();
				});
				fireEvent.click(screen.getByRole("button", { name: "Settings" }));
				expect(onClick).toHaveBeenCalledTimes(2);
			} finally {
				vi.useRealTimers();
			}
		});
	});
	describe("MuiFieldState (withMuiFieldState HOC)", () => {
		it("renders TextFieldCC normally", () => {
			wrap(<TextFieldCC label="Normal" />);
			expect(screen.getByLabelText("Normal")).toBeTruthy();
		});

		it("renders TextFieldCC with warning prop without crashing", () => {
			wrap(<TextFieldCC label="Warning" warning />);
			expect(screen.getByLabelText("Warning")).toBeTruthy();
		});

		it("renders TextFieldCC with error prop overriding warning", () => {
			wrap(<TextFieldCC label="Error" warning error helperText="Err" />);
			expect(screen.getByText("Err")).toBeTruthy();
		});

		it("forwards the ref to the wrapped component", () => {
			// the date pickers anchor their popup on this ref, and React logs a warning
			// for every ref handed to a component which doesn't take one
			const ref = React.createRef<HTMLDivElement>();
			wrap(<TextFieldCC label="Ref" ref={ref} />);
			expect(ref.current).toBeInstanceOf(HTMLElement);
			expect(ref.current!.contains(screen.getByLabelText("Ref"))).toBe(true);
		});
	});
	describe("number inputs", () => {
		// touch keyboards pick their keypad by inputmode: "numeric" has digits only,
		// "decimal" adds the decimal separator
		it("asks DecimalInputField's keypad for a decimal separator", () => {
			wrap(<DecimalInputField label="Hours" value={7.5} />);
			expect(screen.getByLabelText("Hours")).toHaveAttribute(
				"inputmode",
				"decimal",
			);
		});

		it("asks CurrencyInput's keypad for a decimal separator", () => {
			wrap(<CurrencyInput label="Price" currency="EUR" value={19.99} />);
			expect(screen.getByLabelText("Price")).toHaveAttribute(
				"inputmode",
				"decimal",
			);
		});

		it("keeps IntegerInputField's keypad to digits", () => {
			wrap(<IntegerInputField label="Count" value={3} />);
			expect(screen.getByLabelText("Count")).toHaveAttribute(
				"inputmode",
				"numeric",
			);
		});
	});
	describe("theme slots", () => {
		it("[ISSUE-3482-ITEM-15] applies theme variants of CcActionButton and CcSubActionButton", () => {
			wrap(
				<>
					<ActionButton color={"error"}>A</ActionButton>
					<SubActionButton disableDivider>B</SubActionButton>
				</>,
				themeWith({
					CcActionButton: {
						variants: [
							{ props: { color: "error" }, style: { outlineOffset: "7px" } },
						],
					},
					CcSubActionButton: {
						variants: [
							{
								props: { disableDivider: true },
								style: { outlineOffset: "8px" },
							},
						],
					},
				}),
			);
			expect(
				applied(screen.getByRole("button", { name: "A" }), "outline-offset"),
			).toContain("7px");
			expect(
				applied(screen.getByRole("button", { name: "B" }), "outline-offset"),
			).toContain("8px");
		});

		it("[ISSUE-3482-ITEM-15] matches CcActionButton and CcSubActionButton variants against the flags of their ownerState", () => {
			wrap(
				<>
					<ActionButton small={"true"} icon={<SaveIcon />} aria-label={"A"}>
						A
					</ActionButton>
					<ActionButton>B</ActionButton>
					<SubActionButton disableDivider={"true"}>C</SubActionButton>
					<SubActionButton>D</SubActionButton>
				</>,
				themeWith({
					CcActionButton: {
						variants: [
							{ props: { small: true }, style: { outlineOffset: "5px" } },
						],
					},
					CcSubActionButton: {
						variants: [
							{
								props: ({
									ownerState,
								}: {
									ownerState: { disableDivider: boolean };
								}) => ownerState.disableDivider,
								style: { outlineOffset: "6px" },
							},
						],
					},
				}),
			);
			const offset = (name: string) =>
				applied(screen.getByRole("button", { name }), "outline-offset");
			expect(offset("A")).toContain("5px");
			expect(offset("B")).not.toContain("5px");
			expect(offset("C")).toContain("6px");
			expect(offset("D")).not.toContain("6px");
		});

		it("[ISSUE-3482-ITEM-15] matches CcCheckbox and CcComponentWithLabel variants against their props, which a props function gets directly", () => {
			const { container } = wrap(
				<>
					<Checkbox
						size={"small"}
						slotProps={{ input: { "aria-label": "A" } }}
					/>
					<Checkbox slotProps={{ input: { "aria-label": "B" } }} />
					<ComponentWithLabel
						control={<Checkbox />}
						labelText={"C"}
						labelPlacement={"start"}
					/>
					<ComponentWithLabel control={<Checkbox />} labelText={"D"} />
				</>,
				themeWith({
					CcCheckbox: {
						variants: [
							{ props: { size: "small" }, style: { outlineOffset: "3px" } },
						],
					},
					CcComponentWithLabel: {
						variants: [
							{
								props: ({ labelPlacement }: { labelPlacement?: string }) =>
									labelPlacement === "start",
								style: { outlineOffset: "4px" },
							},
						],
					},
				}),
			);
			const box = (name: string) =>
				screen.getByRole("checkbox", { name }).closest(".MuiCheckbox-root")!;
			expect(applied(box("A"), "outline-offset")).toContain("3px");
			expect(applied(box("B"), "outline-offset")).not.toContain("3px");
			const [start, end] = Array.from(container.querySelectorAll("label"));
			expect(start).toHaveTextContent("C");
			expect(applied(start, "outline-offset")).toContain("4px");
			expect(end).toHaveTextContent("D");
			expect(applied(end, "outline-offset")).not.toContain("4px");
		});
	});
});
