import React from "react";
import { afterEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
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
	MultiSelectWithTags,
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

	// the JSX of the two tests below is also checked by tsc (tsconfig-test.json): children
	// take any React node, as on any MUI container
	it("[ISSUE-3465-ITEM-8] a conditional child is rendered while its condition holds, and the content stays empty while it does not", () => {
		const Entries = ({ show }: { show: boolean }) => (
			<InlineSwitch value={false} visible label="Show inactive">
				{show && (
					<ul aria-label="Entries">
						<li>Alpha</li>
					</ul>
				)}
			</InlineSwitch>
		);
		const { container, rerender } = renderSwitch(<Entries show />);
		expect(screen.getByRole("list", { name: "Entries" })).toBeInTheDocument();

		rerender(
			<ThemeProvider theme={theme}>
				<Entries show={false} />
			</ThemeProvider>,
		);
		expect(screen.queryByRole("list")).not.toBeInTheDocument();
		expect(rootOf(container).lastElementChild).toBeEmptyDOMElement();
		expect(
			screen.getByRole("switch", { name: "Show inactive" }),
		).toBeInTheDocument();
	});

	it("[ISSUE-3465-ITEM-8] takes text, a number, several sibling elements, null and undefined as children", () => {
		const { container } = renderSwitch(
			<>
				<InlineSwitch value={false} visible={false}>
					No entries
				</InlineSwitch>
				<InlineSwitch value={false} visible={false}>
					{3}
				</InlineSwitch>
				<InlineSwitch value={false} visible={false}>
					<span>Alpha</span>
					<span>Beta</span>
				</InlineSwitch>
				<InlineSwitch value={false} visible={false}>
					{null}
				</InlineSwitch>
				<InlineSwitch value={false} visible={false}>
					{undefined}
				</InlineSwitch>
			</>,
		);
		const contents = Array.from(
			container.children,
			(root) => root.lastElementChild?.innerHTML,
		);
		expect(contents).toEqual([
			"No entries",
			"3",
			"<span>Alpha</span><span>Beta</span>",
			"",
			"",
		]);
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

	it("[ISSUE-3465-ITEM-6] hiding the switch turns its filter off: later loads get switchValue false", async () => {
		const onLoad = loadSpy();
		const ui = (show: boolean) => (
			<ThemeProvider theme={theme}>
				<BaseSelector<BaseSelectorData, false>
					label="Device type"
					selected={null}
					onSelect={() => {}}
					onLoad={onLoad}
					displaySwitch={show}
					switchLabel="Show inactive"
				/>
			</ThemeProvider>
		);
		const { rerender } = render(ui(true));
		fireEvent.click(screen.getByRole("switch", { name: "Show inactive" }));
		await flush();
		await waitFor(() => expect(onLoad).toHaveBeenLastCalledWith("", true));
		rerender(ui(false));
		expect(screen.queryByRole("switch")).toBeNull();
		onLoad.mockClear();
		const combobox = screen.getByRole("combobox");
		fireEvent.mouseDown(combobox);
		await flush();
		fireEvent.change(combobox, { target: { value: "x" } });
		await flush();
		await waitFor(() =>
			expect(onLoad).toHaveBeenCalledWith("x", expect.any(Boolean)),
		);
		expect(
			onLoad.mock.calls.filter(([, switchValue]) => switchValue),
			"loads that still ask for the switched-on options",
		).toEqual([]);
	});

	describe("the switch's value when it is hidden and shown", () => {
		const INACTIVE: BaseSelectorData = { value: "c", label: "Gamma" };
		/** lists Gamma only while the switch is on */
		const filteringLoad = () =>
			vi.fn<BaseSelectorLoadHandler<BaseSelectorData>>((search, switchValue) =>
				selectorLocalLoadHandler(
					switchValue ? [...OPTIONS, INACTIVE] : OPTIONS,
				)(search),
			);
		const ui = (
			onLoad: BaseSelectorLoadHandler<BaseSelectorData>,
			show: boolean,
			{
				defaultOn,
				selected = null,
			}: { defaultOn?: boolean; selected?: BaseSelectorData | null } = {},
		) => (
			<ThemeProvider theme={theme}>
				<BaseSelector<BaseSelectorData, false>
					label="Device type"
					selected={selected}
					onSelect={() => {}}
					onLoad={onLoad}
					displaySwitch={show}
					defaultSwitchValue={defaultOn}
					switchLabel="Show inactive"
				/>
			</ThemeProvider>
		);
		const showInactive = () =>
			screen.getByRole("switch", { name: "Show inactive" });

		it("[ISSUE-3465-ITEM-6] hiding the switch while it is on lists the options without its filter", async () => {
			const onLoad = filteringLoad();
			const { rerender } = render(ui(onLoad, true));
			fireEvent.click(showInactive());
			await flush();
			rerender(ui(onLoad, false));
			await flush();
			fireEvent.mouseDown(screen.getByRole("combobox"));
			await flush();
			expect(
				await screen.findByRole("option", { name: "Alpha" }),
			).toBeInTheDocument();
			expect(screen.queryByRole("option", { name: "Gamma" })).toBeNull();
		});

		it("[ISSUE-3465-ITEM-6] a switch hidden while on is off when it is shown again", async () => {
			const onLoad = loadSpy();
			const { rerender } = render(ui(onLoad, true));
			fireEvent.click(showInactive());
			await flush();
			expect(showInactive()).toBeChecked();
			rerender(ui(onLoad, false));
			await flush();
			rerender(ui(onLoad, true));
			await flush();
			expect(showInactive()).not.toBeChecked();
			expect(onLoad).toHaveBeenLastCalledWith("", false);
		});

		it("[ISSUE-3465-ITEM-6] a switch shown after mount starts at defaultSwitchValue, and loads get it", async () => {
			const onLoad = loadSpy();
			const { rerender } = render(ui(onLoad, false, { defaultOn: true }));
			await flush();
			expect(onLoad).toHaveBeenCalled();
			expect(
				onLoad.mock.calls.filter(([, switchValue]) => switchValue),
				"loads with the hidden switch on",
			).toEqual([]);
			rerender(ui(onLoad, true, { defaultOn: true }));
			await flush();
			expect(showInactive()).toBeChecked();
			expect(onLoad).toHaveBeenLastCalledWith("", true);
			rerender(ui(onLoad, false, { defaultOn: true }));
			await flush();
			expect(onLoad).toHaveBeenLastCalledWith("", false);
			rerender(ui(onLoad, true, { defaultOn: true }));
			await flush();
			expect(showInactive()).toBeChecked();
		});

		it("[ISSUE-3465-ITEM-6] hiding the switch in the render that selects a record loads nothing with the switch on", async () => {
			const onLoad = loadSpy();
			const { rerender } = render(ui(onLoad, true));
			fireEvent.click(showInactive());
			await flush();
			onLoad.mockClear();
			rerender(ui(onLoad, false, { selected: OPTIONS[0] }));
			await flush();
			expect(onLoad).toHaveBeenCalled();
			expect(
				onLoad.mock.calls.filter(([, switchValue]) => switchValue),
				"loads that still ask for the switched-on options",
			).toEqual([]);
		});
	});

	it("[ISSUE-3465-ITEM-12] each selector's switch is described by the field it filters", () => {
		const onLoad = selectorLocalLoadHandler(OPTIONS);
		renderSwitch(
			<>
				<BaseSelector
					label="Device type"
					selected={null}
					onSelect={() => {}}
					onLoad={onLoad}
					displaySwitch
					switchLabel="Show inactive"
				/>
				<BaseSelector
					label="Responsible person"
					selected={null}
					onSelect={() => {}}
					onLoad={onLoad}
					displaySwitch
					switchLabel="Show inactive"
				/>
			</>,
		);
		const [first, second] = screen.getAllByRole("switch", {
			name: "Show inactive",
		});
		expect(first).toHaveAccessibleDescription(/Device type/);
		expect(second).toHaveAccessibleDescription(/Responsible person/);
	});

	it("[ISSUE-3465-ITEM-21] a boolean displaySwitch compiles without multiple, like a literal one", () => {
		// checked by tsc (tsconfig-test.json): `show` is a boolean, not the literal true,
		// and neither `multiple` nor type arguments are given
		const ui = (show: boolean) => (
			<ThemeProvider theme={theme}>
				<BaseSelector
					selected={null}
					onSelect={() => {}}
					onLoad={selectorLocalLoadHandler(OPTIONS)}
					displaySwitch={show}
					switchLabel="Show inactive"
				/>
			</ThemeProvider>
		);
		const { rerender } = render(ui(true));
		expect(
			screen.getByRole("switch", { name: "Show inactive" }),
		).toBeInTheDocument();
		rerender(ui(false));
		expect(screen.queryByRole("switch")).toBeNull();
	});

	it("[ISSUE-3465-ITEM-21] without type arguments, a selector without multiple is a single select and one with multiple a multi select", () => {
		// checked by tsc (tsconfig-test.json): the type onSelect's argument is inferred as
		const single = (show: boolean) => (
			<BaseSelector
				selected={OPTIONS[0]}
				onSelect={(value) => {
					expectTypeOf(value).toEqualTypeOf<BaseSelectorData | null>();
				}}
				onLoad={selectorLocalLoadHandler(OPTIONS)}
				displaySwitch={show}
				switchLabel="Single: show inactive"
			/>
		);
		const multi = (show: boolean) => (
			<BaseSelector
				multiple
				selected={[OPTIONS[0]]}
				onSelect={(value) => {
					expectTypeOf(value).toEqualTypeOf<BaseSelectorData[]>();
				}}
				onLoad={selectorLocalLoadHandler(OPTIONS)}
				displaySwitch={show}
				switchLabel="Multi: show inactive"
			/>
		);
		renderSwitch(
			<>
				{single(true)}
				{multi(true)}
			</>,
		);
		expect(
			screen.getByRole("switch", { name: "Single: show inactive" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("switch", { name: "Multi: show inactive" }),
		).toBeInTheDocument();
	});

	it("[ISSUE-3465-ITEM-21] a switch without switchLabel still does not compile, with a literal or a boolean displaySwitch", () => {
		// checked by tsc (tsconfig-test.json)
		const withLiteral = () => (
			// @ts-expect-error displaySwitch needs switchLabel: it is the switch's visible text and its name
			<BaseSelector
				selected={null}
				onSelect={() => {}}
				onLoad={selectorLocalLoadHandler(OPTIONS)}
				displaySwitch
			/>
		);
		const withBoolean = (show: boolean) => (
			// @ts-expect-error a displaySwitch that can be true needs switchLabel too
			<BaseSelector
				selected={null}
				onSelect={() => {}}
				onLoad={selectorLocalLoadHandler(OPTIONS)}
				displaySwitch={show}
			/>
		);
		renderSwitch(
			<>
				{withLiteral()}
				{withBoolean(true)}
			</>,
		);
	});
});

describe("InlineSwitch in the selectors", () => {
	it("[ISSUE-3465-ITEM-2] BaseSelector's switch keeps its place on the field label's row: no rule for its static class moves it up", () => {
		renderSwitch(
			<BaseSelector
				label="Device type"
				selected={null}
				onSelect={() => {}}
				onLoad={selectorLocalLoadHandler([])}
				displaySwitch
				switchLabel="Show inactive"
			/>,
		);
		const wrapper = screen
			.getByRole("switch", { name: "Show inactive" })
			.closest(".CcInlineSwitch-switchWrapper");
		if (!(wrapper instanceof HTMLElement)) throw new Error("wrapper missing");
		expect(getComputedStyle(wrapper).marginTop).toBe("0px");
	});

	it("[ISSUE-3465-ITEM-12] MultiSelectWithoutGroup's switch is described by the label of its search field, also with an autocompleteId of the caller", () => {
		const ui = (label: string, autocompleteId?: string) => (
			<MultiSelectWithoutGroup
				label={label}
				autocompleteId={autocompleteId}
				selected={[]}
				onSelect={() => {}}
				loadDataOptions={selectorLocalLoadHandler([])}
				displaySwitch
				switchLabel="Show inactive"
				switchValue={false}
				setSwitchValue={() => {}}
			/>
		);
		renderSwitch(
			<>
				{ui("Device types")}
				{ui("Responsible persons", "responsible")}
			</>,
		);
		const [first, second] = screen.getAllByRole("switch", {
			name: "Show inactive",
		});
		expect(first).toHaveAccessibleDescription("Device types");
		expect(second).toHaveAccessibleDescription("Responsible persons");
		expect(
			screen.getByRole("combobox", { name: "Responsible persons" }),
		).toHaveAttribute("id", "responsible");
	});

	it("[ISSUE-3465-ITEM-12] MultiSelectWithTags's switch is described by the label of its search field", () => {
		renderSwitch(
			<MultiSelectWithTags
				title="Responsible persons"
				searchInputLabel="Search persons"
				loadGroupEntries={() => []}
				loadGroupOptions={selectorLocalLoadHandler([])}
				loadDataOptions={selectorLocalLoadHandler([])}
				selected={[]}
				onChange={() => {}}
				displaySwitch
				switchLabel="Show inactive"
			/>,
		);
		expect(
			screen.getByRole("switch", { name: "Show inactive" }),
		).toHaveAccessibleDescription("Search persons");
	});

	it("[ISSUE-3465-ITEM-12] the switch of a selector without label points at no description", () => {
		renderSwitch(
			<>
				<BaseSelector
					selected={null}
					onSelect={() => {}}
					onLoad={selectorLocalLoadHandler([])}
					displaySwitch
					switchLabel="Show inactive"
				/>
				<MultiSelectWithoutGroup
					selected={[]}
					onSelect={() => {}}
					loadDataOptions={selectorLocalLoadHandler([])}
					displaySwitch
					switchLabel="Show archived"
					switchValue={false}
					setSwitchValue={() => {}}
				/>
			</>,
		);
		for (const name of ["Show inactive", "Show archived"])
			expect(screen.getByRole("switch", { name })).not.toHaveAttribute(
				"aria-describedby",
			);
	});
});
