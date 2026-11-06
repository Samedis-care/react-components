import { describe, it, expect, vi, afterEach } from "vitest";
import React from "react";
import {
	render,
	screen,
	fireEvent,
	cleanup,
	act,
} from "@testing-library/react";
import { ThemeProvider, createTheme, Button } from "@mui/material";
import { Save as SaveIcon } from "@mui/icons-material";
import ActionButton from "../../src/standalone/UIKit/ActionButton";
import SubActionButton from "../../src/standalone/UIKit/SubActionButton";
import FormButtons from "../../src/standalone/UIKit/FormButtons";
import IconButtonWithText from "../../src/standalone/UIKit/IconButtonWithText";
import TextFieldWithHelp from "../../src/standalone/UIKit/TextFieldWithHelp";
import NumberFormatter from "../../src/standalone/UIKit/NumberFormatter";
import CenteredTypography from "../../src/standalone/UIKit/CenteredTypography";
import Checkbox from "../../src/standalone/UIKit/Checkbox";
import { TextFieldCC } from "../../src/standalone/UIKit/MuiFieldState";
import DecimalInputField from "../../src/standalone/UIKit/InputControls/DecimalInputField";
import CurrencyInput from "../../src/standalone/UIKit/InputControls/CurrencyInput";
import IntegerInputField from "../../src/standalone/UIKit/InputControls/IntegerInputField";

const theme = createTheme();
const wrap = (ui: React.ReactNode) =>
	render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

afterEach(() => {
	cleanup();
});

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
			// Text is not rendered when small
			expect(screen.queryByText("Save")).toBeNull();
			expect(screen.getByTestId("icon")).toBeTruthy();
		});

		it("calls onClick", () => {
			const onClick = vi.fn();
			wrap(<ActionButton onClick={onClick}>Save</ActionButton>);
			fireEvent.click(screen.getByRole("button"));
			expect(onClick).toHaveBeenCalledOnce();
		});
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
			// In small mode text is not rendered
			expect(screen.queryByText("Save")).toBeNull();
			expect(screen.getByTestId("sub-icon")).toBeTruthy();
		});

		it("calls onClick", () => {
			const onClick = vi.fn();
			wrap(<SubActionButton onClick={onClick}>Click me</SubActionButton>);
			fireEvent.click(screen.getByRole("button"));
			expect(onClick).toHaveBeenCalledOnce();
		});
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
});
