import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, it, expect, expectTypeOf, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { ThemeProvider, createTheme, Theme } from "@mui/material";
import FormPageLayout, {
	FormPageLayoutClassKey,
	FormPageLayoutProps,
} from "../../src/standalone/Form/FormPageLayout";
import type * as PackageRoot from "../../src";

afterEach(cleanup);

const theme = createTheme();

const renderLayout = (ui: React.ReactElement, t: Theme = theme) =>
	render(<ThemeProvider theme={t}>{ui}</ThemeProvider>);

type Slot = "root" | "wrapper" | "body" | "footer";

// the CcFormPageLayout-<slot> part of emotion's class names exists in development and
// test builds only; fine as a test selector, not as an app selector
const slotOf = (container: HTMLElement, name: Slot) =>
	container.querySelector<HTMLElement>(`[class*="CcFormPageLayout-${name}"]`);

const slots = (container: HTMLElement) => {
	const get = (name: Slot) => {
		const el = slotOf(container, name);
		if (!el) throw new Error(`slot ${name} not rendered`);
		return el;
	};
	return {
		root: get("root"),
		wrapper: get("wrapper"),
		body: get("body"),
		footer: get("footer"),
	};
};

describe("FormPageLayout", () => {
	it("puts body and footer into the wrapper, and other after the wrapper", () => {
		const { container } = renderLayout(
			<FormPageLayout
				body={<input aria-label={"Name"} />}
				footer={<button>Save</button>}
				other={<div data-testid={"other"} />}
			/>,
		);
		const { root, wrapper, body, footer } = slots(container);
		const input = screen.getByRole("textbox", { name: "Name" });
		const save = screen.getByRole("button", { name: "Save" });
		const other = screen.getByTestId("other");

		expect(container.firstElementChild).toBe(root);
		expect(Array.from(root.children)).toEqual([wrapper, other]);
		expect(Array.from(wrapper.children)).toEqual([body, footer]);
		expect(input.parentElement).toBe(body);
		expect(save.parentElement).toBe(footer);
		// document order (and so tab order): body, footer, other
		expect(
			input.compareDocumentPosition(save) & Node.DOCUMENT_POSITION_FOLLOWING,
		).toBeTruthy();
		expect(
			save.compareDocumentPosition(other) & Node.DOCUMENT_POSITION_FOLLOWING,
		).toBeTruthy();
	});

	it("adds no role, tab stop or label of its own", () => {
		const { container } = renderLayout(
			<FormPageLayout
				body={<input aria-label={"Name"} />}
				footer={<button>Save</button>}
				other={<span>note</span>}
			/>,
		);
		for (const el of Object.values(slots(container))) {
			expect(el.tagName).toBe("DIV");
			// class only: no role, tabindex, aria-* or id
			expect(el.getAttributeNames()).toEqual(["class"]);
		}
		expect(screen.getAllByRole("textbox")).toHaveLength(1);
		expect(screen.getAllByRole("button")).toHaveLength(1);
	});

	it("keeps the body's DOM node, value and focus when footer and other change", () => {
		const body = <input data-testid={"in"} />;
		const { rerender, container } = renderLayout(
			<FormPageLayout
				body={body}
				footer={<button>Save</button>}
				other={<span data-testid={"other"} />}
			/>,
		);
		const input = screen.getByTestId<HTMLInputElement>("in");
		fireEvent.change(input, { target: { value: "typed" } });
		input.focus();

		// what BasicFormPage passes while a nested form page is active
		rerender(
			<ThemeProvider theme={theme}>
				<FormPageLayout body={body} footer={null} other={undefined} />
			</ThemeProvider>,
		);
		expect(screen.getByTestId("in")).toBe(input);
		expect(input.value).toBe("typed");
		expect(input).toHaveFocus();
		expect(screen.queryByRole("button", { name: "Save" })).toBeNull();
		expect(screen.queryByTestId("other")).toBeNull();

		rerender(
			<ThemeProvider theme={theme}>
				<FormPageLayout
					body={body}
					footer={<button>Back</button>}
					other={<span data-testid={"other"} />}
				/>
			</ThemeProvider>,
		);
		expect(screen.getByTestId("in")).toBe(input);
		expect(input.value).toBe("typed");
		expect(input).toHaveFocus();
		expect(slots(container).footer).toContainElement(
			screen.getByRole("button", { name: "Back" }),
		);
		expect(screen.getByTestId("other")).toBeInTheDocument();
	});

	it("replaces the body when body changes", () => {
		const { rerender } = renderLayout(
			<FormPageLayout body={<p>old</p>} footer={null} />,
		);
		rerender(
			<ThemeProvider theme={theme}>
				<FormPageLayout body={<p>new</p>} footer={null} />
			</ThemeProvider>,
		);
		expect(screen.getByText("new")).toBeInTheDocument();
		expect(screen.queryByText("old")).toBeNull();
	});

	it("puts className and classes on their slots and follows prop changes", () => {
		const { rerender, container } = renderLayout(
			<FormPageLayout
				body={<span />}
				footer={<span />}
				className={"a"}
				classes={{ root: "r", wrapper: "w", body: "b", footer: "f" }}
			/>,
		);
		let s = slots(container);
		expect(s.root).toHaveClass("a", "r");
		expect(s.wrapper).toHaveClass("w");
		expect(s.body).toHaveClass("b");
		expect(s.footer).toHaveClass("f");

		rerender(
			<ThemeProvider theme={theme}>
				<FormPageLayout
					body={<span />}
					footer={<span />}
					className={"a2"}
					classes={{ root: "r2" }}
				/>
			</ThemeProvider>,
		);
		s = slots(container);
		expect(s.root).toHaveClass("a2", "r2");
		expect(s.root).not.toHaveClass("a");
		expect(s.root).not.toHaveClass("r");
		expect(s.wrapper).not.toHaveClass("w");
		expect(s.body).not.toHaveClass("b");
		expect(s.footer).not.toHaveClass("f");

		rerender(
			<ThemeProvider theme={theme}>
				<FormPageLayout body={<span />} footer={<span />} />
			</ThemeProvider>,
		);
		for (const el of Object.values(slots(container))) {
			expect(el.className).not.toMatch(/\b(undefined|null|false)\b/);
		}
	});

	it("applies theme styleOverrides to every slot", () => {
		const themed = createTheme({
			components: {
				CcFormPageLayout: {
					styleOverrides: {
						root: { outlineColor: "rgb(1, 2, 3)", padding: 7 },
						wrapper: { outlineColor: "rgb(4, 5, 6)" },
						body: { outlineColor: "rgb(7, 8, 9)" },
						footer: { outlineColor: "rgb(10, 11, 12)" },
					},
				},
			},
		});
		const { container } = renderLayout(
			<FormPageLayout body={<span />} footer={<span />} />,
			themed,
		);
		const s = slots(container);
		expect(getComputedStyle(s.root).outlineColor).toBe("rgb(1, 2, 3)");
		expect(getComputedStyle(s.root).padding).toBe("7px");
		expect(getComputedStyle(s.wrapper).outlineColor).toBe("rgb(4, 5, 6)");
		expect(getComputedStyle(s.body).outlineColor).toBe("rgb(7, 8, 9)");
		expect(getComputedStyle(s.footer).outlineColor).toBe("rgb(10, 11, 12)");
	});

	it("lets the theme hide the body, as an app that replaces the layout does to catch pages that still render this one", () => {
		const themed = createTheme({
			components: {
				CcFormPageLayout: { styleOverrides: { body: { display: "none" } } },
			},
		});
		const { container } = renderLayout(
			<FormPageLayout body={<span />} footer={<span />} />,
			themed,
		);
		expect(getComputedStyle(slots(container).body).display).toBe("none");
	});

	it.each([
		["null", null],
		["undefined", undefined],
		["false", false],
	] as const)(
		"[ISSUE-3473-ITEM-5] renders no footer and reserves no space for it when footer is %s",
		(_, footer) => {
			const { container } = renderLayout(
				<FormPageLayout body={<span />} footer={footer} />,
			);
			const body = slotOf(container, "body");
			expect(body).not.toBeNull();
			expect(parseFloat(getComputedStyle(body!).paddingBottom || "0")).toBe(0);
			expect(slotOf(container, "footer")).toBeNull();
		},
	);

	it("[ISSUE-3473-ITEM-6] exports FormPageLayout from the package root", async () => {
		const root = (await import("../../src")) as Record<string, unknown>;
		expect(
			root.FormPageLayout,
			"FormPageLayout is missing from the package root",
		).toBe(FormPageLayout);
	}, 90000);

	it("[ISSUE-3473-ITEM-6] exports its props and class key types from the package root", () => {
		// checked by tsc (tsconfig-test.json), not at runtime
		expectTypeOf<PackageRoot.FormPageLayoutProps>().toEqualTypeOf<FormPageLayoutProps>();
		expectTypeOf<PackageRoot.FormPageLayoutClassKey>().toEqualTypeOf<FormPageLayoutClassKey>();
	});
});
