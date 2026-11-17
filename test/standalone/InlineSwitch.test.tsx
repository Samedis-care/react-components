import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import {
	render,
	screen,
	fireEvent,
	cleanup,
	act,
} from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material";
import InlineSwitch from "../../src/standalone/InlineSwitch";
import BaseSelector, {
	BaseSelectorData,
	BaseSelectorLoadHandler,
} from "../../src/standalone/Selector/BaseSelector";
import { selectorLocalLoadHandler } from "../../src/standalone/Selector";

afterEach(cleanup);

const theme = createTheme();

const renderSwitch = (ui: React.ReactElement) =>
	render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

/** lets the promises started by the last event (option loads) settle */
const flush = () => act(() => Promise.resolve());

const switchRootOf = (container: HTMLElement) => {
	const el = container.querySelector(".MuiSwitch-root");
	if (!(el instanceof HTMLElement)) throw new Error(".MuiSwitch-root missing");
	return el;
};

// MUI Switch renders an <input> with role="switch" (not role="checkbox")
describe("InlineSwitch", () => {
	it("renders without crashing", () => {
		const { container } = renderSwitch(
			<InlineSwitch value={false} visible={true} />,
		);
		expect(container.firstChild).toBeInTheDocument();
	});

	it("renders the switch input when visible=true", () => {
		renderSwitch(<InlineSwitch value={false} visible={true} label="Toggle" />);
		expect(screen.getByRole("switch")).toBeInTheDocument();
	});

	it("does not render the switch when visible=false", () => {
		renderSwitch(<InlineSwitch value={false} visible={false} label="Toggle" />);
		expect(screen.queryByRole("switch")).not.toBeInTheDocument();
	});

	it("reflects checked state when value=true", () => {
		renderSwitch(<InlineSwitch value={true} visible={true} />);
		expect(screen.getByRole("switch")).toBeChecked();
	});

	it("reflects unchecked state when value=false", () => {
		renderSwitch(<InlineSwitch value={false} visible={true} />);
		expect(screen.getByRole("switch")).not.toBeChecked();
	});

	it("calls onChange with true when unchecked switch is clicked", () => {
		const onChange = vi.fn();
		renderSwitch(
			<InlineSwitch value={false} visible={true} onChange={onChange} />,
		);
		fireEvent.click(screen.getByRole("switch"));
		expect(onChange).toHaveBeenCalledOnce();
		expect(onChange).toHaveBeenCalledWith(true);
	});

	it("calls onChange with false when checked switch is clicked", () => {
		const onChange = vi.fn();
		renderSwitch(
			<InlineSwitch value={true} visible={true} onChange={onChange} />,
		);
		fireEvent.click(screen.getByRole("switch"));
		expect(onChange).toHaveBeenCalledOnce();
		expect(onChange).toHaveBeenCalledWith(false);
	});

	it("renders the label text", () => {
		renderSwitch(
			<InlineSwitch value={false} visible={true} label="Feature flag" />,
		);
		expect(screen.getByText("Feature flag")).toBeInTheDocument();
	});

	it("renders children", () => {
		renderSwitch(
			<InlineSwitch value={true} visible={true}>
				<span data-testid="child-content">Child</span>
			</InlineSwitch>,
		);
		expect(screen.getByTestId("child-content")).toBeInTheDocument();
	});

	it("does not throw when onChange is undefined and switch is clicked", () => {
		renderSwitch(<InlineSwitch value={false} visible={true} />);
		expect(() => fireEvent.click(screen.getByRole("switch"))).not.toThrow();
	});
});

describe("InlineSwitch styling and theme", () => {
	it("[ISSUE-3465-ITEM-3] classes.switch lands on the switch", () => {
		const { container } = renderSwitch(
			<InlineSwitch
				value={false}
				visible
				label="L"
				classes={{ switch: "s" }}
			/>,
		);
		expect(switchRootOf(container)).toHaveClass("s");
	});
});

describe("InlineSwitch inside BaseSelector (displaySwitch)", () => {
	const OPTIONS: BaseSelectorData[] = [
		{ value: "a", label: "Alpha" },
		{ value: "b", label: "Beta" },
	];
	const loadSpy = () =>
		vi.fn<BaseSelectorLoadHandler<BaseSelectorData>>(
			selectorLocalLoadHandler(OPTIONS),
		);

	it("[ISSUE-3465-ITEM-1] a disabled selector disables its switch, and a click does not reload the options", async () => {
		const onLoad = loadSpy();
		renderSwitch(
			<BaseSelector
				label="Device type"
				selected={null}
				onSelect={() => {}}
				onLoad={onLoad}
				disabled
				displaySwitch
				switchLabel="Show inactive"
			/>,
		);
		expect(screen.getByRole("combobox")).toBeDisabled();
		const sw = screen.getByRole("switch", { name: "Show inactive" });
		expect(sw).toBeDisabled();
		fireEvent.click(sw);
		await flush();
		expect(sw).not.toBeChecked();
		expect(onLoad).not.toHaveBeenCalledWith("", true);
	});
});
