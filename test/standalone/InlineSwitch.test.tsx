import React from "react";
import { afterEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from "@testing-library/react";
import { createTheme, styled, Theme, ThemeProvider } from "@mui/material";
import InlineSwitch, {
	InlineSwitchClassKey,
	InlineSwitchProps,
} from "../../src/standalone/InlineSwitch";
import type * as PackageRoot from "../../src";
import BaseSelector, {
	BaseSelectorData,
	BaseSelectorLoadHandler,
} from "../../src/standalone/Selector/BaseSelector";
import {
	MultiSelectWithoutGroup,
	selectorLocalLoadHandler,
	SingleSelect,
} from "../../src/standalone/Selector";

afterEach(cleanup);

const theme = createTheme();

const renderSwitch = (ui: React.ReactElement, t: Theme = theme) =>
	render(<ThemeProvider theme={t}>{ui}</ThemeProvider>);

/** lets the promises started by the last event (option loads) settle */
const flush = () => act(() => Promise.resolve());

const rootOf = (container: HTMLElement) => {
	const root = container.firstElementChild;
	if (!(root instanceof HTMLElement)) throw new Error("root missing");
	return root;
};

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

describe("InlineSwitch label and name", () => {
	it("[ISSUE-3465-ITEM-10] an aria-label given to InlineSwitch names a switch without label", () => {
		renderSwitch(
			<InlineSwitch
				value={false}
				visible
				aria-label="Show inactive entries"
				onChange={vi.fn()}
			/>,
		);
		expect(screen.getByRole("switch")).toHaveAccessibleName(
			"Show inactive entries",
		);
	});

	it("[ISSUE-3465-ITEM-10] slotProps.input reaches the switch input, so it can have an id, a name and a description", () => {
		renderSwitch(
			<>
				<span id="switch-help">Only inactive entries are listed</span>
				<InlineSwitch
					value={false}
					visible
					slotProps={{
						input: {
							id: "show-inactive",
							name: "inactive",
							"aria-describedby": "switch-help",
						},
					}}
				/>
			</>,
		);
		const sw = screen.getByRole("switch");
		expect(sw).toHaveAttribute("id", "show-inactive");
		expect(sw).toHaveAttribute("name", "inactive");
		expect(sw).toHaveAccessibleDescription("Only inactive entries are listed");
	});

	it("[ISSUE-3465-ITEM-10] aria-label, aria-labelledby and aria-describedby are typed props of InlineSwitch", () => {
		const name: Partial<InlineSwitchProps> = {
			"aria-label": "Show inactive entries",
		};
		const description: Partial<InlineSwitchProps> = {
			"aria-describedby": "switch-help",
		};
		renderSwitch(
			<>
				<span id="switch-help">Only inactive entries are listed</span>
				<InlineSwitch value={false} visible {...name} {...description} />
			</>,
		);
		const sw = screen.getByRole("switch");
		expect(sw).toHaveAccessibleName("Show inactive entries");
		expect(sw).toHaveAccessibleDescription("Only inactive entries are listed");
	});

	it("[ISSUE-3465-ITEM-10] a selector's switch is named by switchLabel", () => {
		renderSwitch(
			<SingleSelect
				label="Device type"
				selected={null}
				onSelect={() => {}}
				onLoad={selectorLocalLoadHandler([])}
				displaySwitch
				switchLabel="Show inactive"
			/>,
		);
		expect(
			screen.getByRole("switch", { name: "Show inactive" }),
		).toBeInTheDocument();
	});

	it("[ISSUE-3465-ITEM-10] displaySwitch without switchLabel does not compile", () => {
		renderSwitch(
			// @ts-expect-error displaySwitch needs switchLabel: it is the switch's visible text and its name
			<SingleSelect
				label="Device type"
				selected={null}
				onSelect={() => {}}
				onLoad={selectorLocalLoadHandler([])}
				displaySwitch
			/>,
		);
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

	it("[ISSUE-3465-ITEM-2] the slots carry static CcInlineSwitch-root, -switchWrapper and -switch classes", () => {
		const { container } = renderSwitch(
			<InlineSwitch value={false} visible label="L" />,
		);
		expect(rootOf(container)).toHaveClass("CcInlineSwitch-root");
		expect(rootOf(container).firstElementChild).toHaveClass(
			"CcInlineSwitch-switchWrapper",
		);
		expect(switchRootOf(container)).toHaveClass("CcInlineSwitch-switch");
	});

	it("[ISSUE-3465-ITEM-2] a parent's style reaches the switch wrapper and the switch by their static classes", () => {
		const Parent = styled(InlineSwitch)({
			"& .CcInlineSwitch-switchWrapper": { paddingLeft: 5 },
			"& .CcInlineSwitch-switch": { marginLeft: 6 },
		});
		const { container } = renderSwitch(
			<Parent value={false} visible label="L" />,
		);
		const wrapper = rootOf(container).firstElementChild!;
		expect(getComputedStyle(wrapper).paddingLeft).toBe("5px");
		expect(getComputedStyle(switchRootOf(container)).marginLeft).toBe("6px");
	});

	it("[ISSUE-3465-ITEM-4] marks the root with CcInlineSwitch-checked, -visible and -disabled while value, visible and disabled are set", () => {
		const classes = { root: "r" };
		const { container, rerender } = renderSwitch(
			<InlineSwitch
				value
				visible
				disabled
				label="L"
				className="c"
				classes={classes}
			/>,
		);
		const root = rootOf(container);
		expect(root).toHaveClass(
			"c",
			"r",
			"CcInlineSwitch-checked",
			"CcInlineSwitch-visible",
			"CcInlineSwitch-disabled",
		);

		rerender(
			<ThemeProvider theme={theme}>
				<InlineSwitch
					value={false}
					visible={false}
					className="c"
					classes={classes}
				/>
			</ThemeProvider>,
		);
		expect(rootOf(container)).toBe(root);
		expect(root).toHaveClass("c", "r");
		expect(root).not.toHaveClass("CcInlineSwitch-checked");
		expect(root).not.toHaveClass("CcInlineSwitch-visible");
		expect(root).not.toHaveClass("CcInlineSwitch-disabled");
	});
	it("[ISSUE-3465-ITEM-4] a theme styles the root by value, visible and disabled through its state classes, with function overrides for every slot", () => {
		const t = createTheme({
			components: {
				CcInlineSwitch: {
					styleOverrides: {
						root: ({ theme: th }) => ({
							paddingTop: th.spacing(1),
							"&.CcInlineSwitch-checked": { outlineStyle: "dotted" },
							"&:not(.CcInlineSwitch-visible)": { paddingTop: 7 },
							"&.CcInlineSwitch-disabled": { outlineColor: "rgb(255, 0, 0)" },
						}),
						switchWrapper: ({ theme: th }) => ({ paddingLeft: th.spacing(2) }),
						switch: ({ theme: th }) => ({ marginLeft: th.spacing(3) }),
					},
				},
			},
		});
		const { container } = renderSwitch(
			<>
				<InlineSwitch value={true} visible label="On" />
				<InlineSwitch value={false} visible={false} />
				<InlineSwitch value={false} visible disabled label="Off" />
			</>,
			t,
		);
		const [on, hidden, disabled] = Array.from(container.children);
		expect(getComputedStyle(on).outlineStyle).toBe("dotted");
		expect(getComputedStyle(on).paddingTop).toBe("8px");
		expect(getComputedStyle(on).outlineColor).not.toBe("rgb(255, 0, 0)");
		expect(getComputedStyle(hidden).outlineStyle).not.toBe("dotted");
		expect(getComputedStyle(hidden).paddingTop).toBe("7px");
		expect(getComputedStyle(disabled).outlineColor).toBe("rgb(255, 0, 0)");
		expect(getComputedStyle(disabled).outlineStyle).not.toBe("dotted");
		expect(getComputedStyle(on.firstElementChild!).paddingLeft).toBe("16px");
		expect(getComputedStyle(switchRootOf(container)).marginLeft).toBe("24px");
	});
	it("[ISSUE-3465-ITEM-4] types function styleOverrides without an ownerState and offers no variants, which nothing would match", () => {
		const t = createTheme({
			components: {
				CcInlineSwitch: {
					styleOverrides: {
						// @ts-expect-error InlineSwitch's slots get no ownerState; the root has state classes
						root: ({ ownerState }) => ({
							color: ownerState ? "red" : "blue",
						}),
					},
					// @ts-expect-error InlineSwitch has no theme variants; the root has state classes
					variants: [{ props: { value: true }, style: { color: "red" } }],
				},
			},
		});
		expect(t.components?.CcInlineSwitch?.styleOverrides?.root).toEqual(
			expect.any(Function),
		);
	});
});

describe("InlineSwitch exports", () => {
	const importTimeout = 90000;
	it(
		"[ISSUE-3465-ITEM-5] exports InlineSwitch from the package root",
		async () => {
			const root = (await import("../../src")) as Record<string, unknown>;
			expect(
				root.InlineSwitch,
				"InlineSwitch is missing from the package root",
			).toBe(InlineSwitch);
		},
		importTimeout,
	);
	it("[ISSUE-3465-ITEM-5] exports its props and class key types from the package root", () => {
		// checked by tsc (tsconfig-test.json), not at runtime
		expectTypeOf<PackageRoot.InlineSwitchProps>().toEqualTypeOf<InlineSwitchProps>();
		expectTypeOf<PackageRoot.InlineSwitchClassKey>().toEqualTypeOf<InlineSwitchClassKey>();
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

describe("InlineSwitch in the selectors", () => {
	it("[ISSUE-3465-ITEM-2] the selectors keep their switch's place: BaseSelector's is not moved up, MultiSelectWithoutGroup's label is not put before it", async () => {
		renderSwitch(
			<>
				<BaseSelector
					label="Device type"
					selected={null}
					onSelect={() => {}}
					onLoad={selectorLocalLoadHandler([])}
					displaySwitch
					switchLabel="Show inactive"
				/>
				<MultiSelectWithoutGroup
					label="Fruits"
					selected={[]}
					onSelect={() => {}}
					loadDataOptions={selectorLocalLoadHandler([])}
					displaySwitch
					switchLabel="Show archived"
				/>
			</>,
		);
		await flush();
		const wrapperOf = (name: string) => {
			const el = screen
				.getByRole("switch", { name })
				.closest(".CcInlineSwitch-switchWrapper");
			if (!(el instanceof HTMLElement)) throw new Error("wrapper missing");
			return el;
		};
		expect(getComputedStyle(wrapperOf("Show inactive")).marginTop).toBe("0px");
		expect(getComputedStyle(wrapperOf("Show archived")).direction).not.toBe(
			"rtl",
		);
	});
});
