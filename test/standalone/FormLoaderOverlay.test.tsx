import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, it, expect, expectTypeOf, afterEach } from "vitest";
import { render, cleanup, within, screen, act } from "@testing-library/react";
import { ThemeProvider, createTheme, Theme } from "@mui/material";
import FormLoaderOverlay, {
	FormLoaderOverlayClassKey,
	FormLoaderOverlayProps,
} from "../../src/standalone/Form/FormLoaderOverlay";
import type * as PackageRoot from "../../src";

afterEach(cleanup);

const theme = createTheme();

const withTheme = (ui: React.ReactElement, t: Theme = theme) => (
	<ThemeProvider theme={t}>{ui}</ThemeProvider>
);

const renderOverlay = (ui: React.ReactElement, t: Theme = theme) =>
	render(withTheme(ui, t));

// the CcFormLoaderOverlay-root part of emotion's class name exists in development and
// test builds only; fine as a test selector, not as an app selector
const overlayRoot = (container: HTMLElement) => {
	const el = container.querySelector<HTMLElement>(
		'[class*="CcFormLoaderOverlay-root"]',
	);
	if (!el) throw new Error("overlay root not rendered");
	return el;
};

describe("FormLoaderOverlay", () => {
	it("is rendered but hidden, unpainted and without a spinner while not visible", () => {
		const { container } = renderOverlay(<FormLoaderOverlay visible={false} />);
		const root = overlayRoot(container);
		expect(getComputedStyle(root).visibility).toBe("hidden");
		// the wash's color is transparent, where every fade-in starts
		expect(getComputedStyle(root).backgroundColor).toBe("rgba(0, 0, 0, 0)");
		expect(root.querySelector('[role="progressbar"]')).toBeNull();
		expect(screen.queryByRole("progressbar")).toBeNull();
	});

	it("shows one spinner over the whole nearest positioned ancestor while visible", () => {
		const { container } = renderOverlay(<FormLoaderOverlay visible />);
		const root = overlayRoot(container);
		const style = getComputedStyle(root);
		expect(style.visibility).toBe("visible");
		expect(style.position).toBe("absolute");
		expect([style.top, style.right, style.bottom, style.left]).toEqual([
			"0px",
			"0px",
			"0px",
			"0px",
		]);
		expect(within(root).getAllByRole("progressbar")).toHaveLength(1);
		expect(screen.getAllByRole("progressbar")).toHaveLength(1);
	});

	it("keeps its root element across visibility changes and settles on the last value", () => {
		const { container, rerender } = renderOverlay(
			<FormLoaderOverlay visible={false} />,
		);
		const root = overlayRoot(container);
		act(() => {
			for (let i = 0; i < 10; i++) {
				rerender(withTheme(<FormLoaderOverlay visible={i % 2 === 0} />));
			}
		});
		// the loop ends on visible={false}
		expect(overlayRoot(container)).toBe(root);
		expect(getComputedStyle(root).visibility).toBe("hidden");
		expect(screen.queryByRole("progressbar")).toBeNull();

		rerender(withTheme(<FormLoaderOverlay visible />));
		expect(overlayRoot(container)).toBe(root);
		expect(getComputedStyle(root).visibility).toBe("visible");
		expect(screen.getAllByRole("progressbar")).toHaveLength(1);
	});

	it("leaves focus where it is and contains nothing focusable", () => {
		const ui = (visible: boolean) =>
			withTheme(
				<div style={{ position: "relative" }}>
					<input aria-label={"Name"} />
					<FormLoaderOverlay visible={visible} />
				</div>,
			);
		const { container, rerender } = render(ui(false));
		const input = screen.getByRole("textbox", { name: "Name" });
		input.focus();

		rerender(ui(true));
		expect(input).toHaveFocus();
		expect(
			overlayRoot(container).querySelectorAll(
				"a[href], button, input, select, textarea, [tabindex]",
			),
		).toHaveLength(0);

		rerender(ui(false));
		expect(input).toHaveFocus();
	});

	it("passes className to its root and follows changes", () => {
		const { container, rerender } = renderOverlay(
			<FormLoaderOverlay visible={false} className={"a"} />,
		);
		const root = overlayRoot(container);
		expect(root).toHaveClass("a");

		rerender(withTheme(<FormLoaderOverlay visible className={"b"} />));
		expect(root).toHaveClass("b");
		expect(root).not.toHaveClass("a");

		rerender(withTheme(<FormLoaderOverlay visible />));
		expect(root).not.toHaveClass("b");
		expect(root.className).not.toMatch(/\b(undefined|null|false)\b/);
	});

	it("applies the theme's root styleOverrides", () => {
		const themed = createTheme({
			components: {
				CcFormLoaderOverlay: {
					styleOverrides: { root: { backgroundColor: "rgb(1, 2, 3)" } },
				},
			},
		});
		const { container } = renderOverlay(<FormLoaderOverlay visible />, themed);
		expect(getComputedStyle(overlayRoot(container)).backgroundColor).toBe(
			"rgb(1, 2, 3)",
		);
	});

	it("[ISSUE-3461-ITEM-7] applies the theme's loader slot override to the box around the spinner", () => {
		const themed = createTheme({
			components: {
				CcFormLoaderOverlay: {
					styleOverrides: { loader: { outlineColor: "rgb(40, 40, 40)" } },
				},
			},
		});
		const { container } = renderOverlay(<FormLoaderOverlay visible />, themed);
		const root = overlayRoot(container);
		const progressbar = within(root).getByRole("progressbar");
		const styled = Array.from(root.querySelectorAll<HTMLElement>("*")).filter(
			(el) => getComputedStyle(el).outlineColor === "rgb(40, 40, 40)",
		);
		// the override reaches an element inside the overlay that holds the spinner
		expect(styled.some((el) => el.contains(progressbar))).toBe(true);
	});

	it("[ISSUE-3473-ITEM-12] puts the spinner on a disc of the theme's paper, which the theme's loader slot restyles", () => {
		const spinnerBackground = (t: Theme) => {
			renderOverlay(<FormLoaderOverlay visible />, t);
			const color = getComputedStyle(
				screen.getByRole("progressbar"),
			).backgroundColor;
			cleanup();
			return color;
		};
		const paper = createTheme({
			palette: { background: { paper: "rgb(1, 2, 3)" } },
		});
		const restyled = createTheme({
			palette: { background: { paper: "rgb(1, 2, 3)" } },
			components: {
				CcFormLoaderOverlay: {
					styleOverrides: {
						loader: {
							"& .MuiCircularProgress-root": {
								backgroundColor: "rgb(4, 5, 6)",
							},
						},
					},
				},
			},
		});
		expect([spinnerBackground(paper), spinnerBackground(restyled)]).toEqual([
			"rgb(1, 2, 3)",
			"rgb(4, 5, 6)",
		]);
	});

	it("[ISSUE-3473-ITEM-7] exposes the visible overlay as a status message", () => {
		const { rerender } = renderOverlay(<FormLoaderOverlay visible={false} />);
		rerender(withTheme(<FormLoaderOverlay visible />));
		expect(screen.getByRole("status")).toHaveTextContent(/\S/);
	});

	it("[ISSUE-3473-ITEM-7] keeps its status region in the accessibility tree while hidden, and changes only its text", () => {
		const { rerender } = renderOverlay(<FormLoaderOverlay visible={false} />);
		// a live region announces a change of its text, not its insertion: it has to be
		// there, empty, before the overlay shows
		const status = screen.getByRole("status");
		expect(status).toHaveTextContent(/^$/);
		rerender(withTheme(<FormLoaderOverlay visible />));
		expect(screen.getByRole("status")).toBe(status);
		expect(status).toHaveTextContent(/^Loading…$/);
		rerender(withTheme(<FormLoaderOverlay visible={false} />));
		expect(screen.getByRole("status")).toBe(status);
		expect(status).toHaveTextContent(/^$/);
	});

	it("[ISSUE-3473-ITEM-7] states the message it is given, which names the spinner, in its only status region", () => {
		const { rerender } = renderOverlay(
			<FormLoaderOverlay visible message={"Importing devices…"} />,
		);
		const status = screen.getByRole("status");
		expect(status).toHaveTextContent(/^Importing devices…$/);
		expect(screen.getByRole("progressbar")).toHaveAccessibleName(
			"Importing devices…",
		);
		rerender(
			withTheme(<FormLoaderOverlay visible message={"Checking devices…"} />),
		);
		expect(screen.getByRole("status")).toBe(status);
		expect(status).toHaveTextContent(/^Checking devices…$/);
		expect(screen.getByRole("progressbar")).toHaveAccessibleName(
			"Checking devices…",
		);
	});

	it("[ISSUE-3473-ITEM-7] marks the children busy while visible, and keeps its status region outside them", () => {
		const Step = ({ visible }: { visible: boolean }) => (
			<FormLoaderOverlay visible={visible}>
				<button>Start</button>
			</FormLoaderOverlay>
		);
		const { rerender } = renderOverlay(<Step visible={false} />);
		const start = screen.getByRole("button", { name: "Start" });
		const busy = (el: Element) => el.closest('[aria-busy="true"]') !== null;
		expect(busy(start)).toBe(false);
		rerender(withTheme(<Step visible />));
		expect(busy(start)).toBe(true);
		const status = screen.getByRole("status");
		expect(status).toHaveTextContent(/\S/);
		expect([busy(status), status.closest("[inert]")]).toEqual([false, null]);
		rerender(withTheme(<Step visible={false} />));
		expect(busy(start)).toBe(false);
	});

	it("[ISSUE-3473-ITEM-6] exports FormLoaderOverlay from the package root", async () => {
		const root = (await import("../../src")) as Record<string, unknown>;
		expect(
			root.FormLoaderOverlay,
			"FormLoaderOverlay is missing from the package root",
		).toBe(FormLoaderOverlay);
	}, 90000);

	it("[ISSUE-3473-ITEM-6] exports its props and class key types from the package root", () => {
		// checked by tsc (tsconfig-test.json), not at runtime
		expectTypeOf<PackageRoot.FormLoaderOverlayProps>().toEqualTypeOf<FormLoaderOverlayProps>();
		expectTypeOf<PackageRoot.FormLoaderOverlayClassKey>().toEqualTypeOf<FormLoaderOverlayClassKey>();
	});

	describe("[ISSUE-3473-ITEM-8] with the covered content as children", () => {
		const Step = ({ visible }: { visible: boolean }) => (
			<>
				<button>Help</button>
				<FormLoaderOverlay visible={visible}>
					<input aria-label={"File name"} />
					<button>Start</button>
				</FormLoaderOverlay>
				<button>Finish</button>
			</>
		);
		const renderStep = (visible: boolean) => {
			const result = renderOverlay(<Step visible={visible} />);
			return {
				...result,
				setVisible: (next: boolean) =>
					result.rerender(withTheme(<Step visible={next} />)),
			};
		};
		const inert = (el: Element) => el.closest("[inert]") !== null;

		it("[ISSUE-3473-ITEM-8] makes the children inert while visible, and only then", () => {
			const { setVisible } = renderStep(false);
			const field = screen.getByRole("textbox", { name: "File name" });
			const start = screen.getByRole("button", { name: "Start" });
			expect([inert(field), inert(start)]).toEqual([false, false]);
			setVisible(true);
			expect([inert(field), inert(start)]).toEqual([true, true]);
			// the buttons around it and the wash itself are not inert
			expect(inert(screen.getByRole("button", { name: "Help" }))).toBe(false);
			expect(inert(screen.getByRole("button", { name: "Finish" }))).toBe(false);
			expect(inert(screen.getByRole("progressbar"))).toBe(false);
			setVisible(false);
			expect([inert(field), inert(start)]).toEqual([false, false]);
		});

		it("[ISSUE-3473-ITEM-8] is inert from the start when mounted visible", () => {
			renderStep(true);
			expect(inert(screen.getByRole("button", { name: "Start" }))).toBe(true);
		});

		it("[ISSUE-3473-ITEM-8] moves keyboard focus from the children to the wash, and back once hidden", () => {
			const { container, setVisible } = renderStep(false);
			const start = screen.getByRole("button", { name: "Start" });
			start.focus();
			setVisible(true);
			expect(overlayRoot(container)).toHaveFocus();
			setVisible(false);
			expect(start).toHaveFocus();
		});

		it("[ISSUE-3473-ITEM-8] leaves focus outside the children where it is", () => {
			const { setVisible } = renderStep(false);
			const help = screen.getByRole("button", { name: "Help" });
			help.focus();
			setVisible(true);
			expect(help).toHaveFocus();
			setVisible(false);
			expect(help).toHaveFocus();
		});

		it("[ISSUE-3473-ITEM-8] does not take back focus that left the wash while it was shown", () => {
			const { setVisible } = renderStep(false);
			screen.getByRole("button", { name: "Start" }).focus();
			setVisible(true);
			const finish = screen.getByRole("button", { name: "Finish" });
			finish.focus();
			setVisible(false);
			expect(finish).toHaveFocus();
		});

		it("[ISSUE-3473-ITEM-8] places the wash in a positioned container around the children", () => {
			const { container } = renderStep(true);
			const root = overlayRoot(container);
			const box = root.parentElement;
			expect(box).not.toBeNull();
			expect(getComputedStyle(box as HTMLElement).position).toBe("relative");
			expect(box).toContainElement(
				screen.getByRole("button", { name: "Start" }),
			);
			expect(box).not.toContainElement(
				screen.getByRole("button", { name: "Help" }),
			);
		});
	});

	it("[ISSUE-3473-ITEM-8] without children it renders the wash alone, which takes no focus", () => {
		const { container } = renderOverlay(
			<div data-testid={"area"}>
				<FormLoaderOverlay visible />
			</div>,
		);
		const root = overlayRoot(container);
		expect(root.parentElement).toBe(screen.getByTestId("area"));
		expect(root).not.toHaveAttribute("tabindex");
		expect(container.querySelector("[inert]")).toBeNull();
	});

	it("[ISSUE-3473-ITEM-14] exports FormLoaderOverlay and FormPageLayout from the Form folder's index", async () => {
		const folder = (await import("../../src/standalone/Form")) as Record<
			string,
			unknown
		>;
		const { default: FormPageLayout } =
			await import("../../src/standalone/Form/FormPageLayout");
		expect([folder.FormLoaderOverlay, folder.FormPageLayout]).toEqual([
			FormLoaderOverlay,
			FormPageLayout,
		]);
	});

	it("[ISSUE-3473-ITEM-14] marks the root with CcFormLoaderOverlay-visible while visible, and only then", () => {
		const { container, rerender } = renderOverlay(
			<FormLoaderOverlay visible={false} />,
		);
		const root = overlayRoot(container);
		expect(root).not.toHaveClass("CcFormLoaderOverlay-visible");
		rerender(withTheme(<FormLoaderOverlay visible />));
		expect(overlayRoot(container)).toBe(root);
		expect(root).toHaveClass("CcFormLoaderOverlay-visible");
		rerender(withTheme(<FormLoaderOverlay visible={false} />));
		expect(root).not.toHaveClass("CcFormLoaderOverlay-visible");
	});

	it("[ISSUE-3473-ITEM-14] applies the theme's variants keyed on visible to the root", () => {
		const themed = createTheme({
			components: {
				CcFormLoaderOverlay: {
					variants: [
						{
							props: { visible: true },
							style: { outlineColor: "rgb(1, 2, 3)" },
						},
						{
							props: { visible: false },
							style: { outlineColor: "rgb(4, 5, 6)" },
						},
						{
							props: ({ visible }) => visible === true,
							style: { borderTopColor: "rgb(7, 8, 9)" },
						},
					],
				},
			},
		});
		const colorsOf = (el: HTMLElement) => {
			const style = getComputedStyle(el);
			return [style.outlineColor, style.borderTopColor === "rgb(7, 8, 9)"];
		};
		const { container, rerender } = renderOverlay(
			<FormLoaderOverlay visible={false} />,
			themed,
		);
		expect(colorsOf(overlayRoot(container))).toEqual(["rgb(4, 5, 6)", false]);
		rerender(withTheme(<FormLoaderOverlay visible />, themed));
		expect(colorsOf(overlayRoot(container))).toEqual(["rgb(1, 2, 3)", true]);
	});

	it("[ISSUE-3473-ITEM-14] calls the theme's style override functions without an ownerState", () => {
		const themed = createTheme({
			components: {
				CcFormLoaderOverlay: {
					styleOverrides: {
						root: (props: object) => ({
							outlineColor:
								"ownerState" in props && props.ownerState
									? "rgb(1, 1, 1)"
									: "rgb(2, 2, 2)",
						}),
					},
				},
			},
		});
		const { container } = renderOverlay(<FormLoaderOverlay visible />, themed);
		expect(getComputedStyle(overlayRoot(container)).outlineColor).toBe(
			"rgb(2, 2, 2)",
		);
	});

	it("[ISSUE-3473-ITEM-14] adds each key of classes to its slot, and className to the root", () => {
		const { container } = renderOverlay(
			<FormLoaderOverlay
				visible
				className={"app-overlay"}
				classes={{
					root: "app-root",
					loaderAnchor: "app-loader-anchor",
					loader: "app-loader",
					container: "app-container",
					content: "app-content",
					status: "app-status",
				}}
			>
				<button>Start</button>
			</FormLoaderOverlay>,
		);
		const only = (className: string) => {
			const found = container.querySelectorAll<HTMLElement>(`.${className}`);
			expect(found, className).toHaveLength(1);
			return found[0];
		};
		const root = overlayRoot(container);
		expect(root).toHaveClass("app-overlay", "app-root");
		const progressbar = screen.getByRole("progressbar");
		const anchor = only("app-loader-anchor");
		const loader = only("app-loader");
		expect(root).toContainElement(anchor);
		expect(anchor).toContainElement(loader);
		expect(loader).toContainElement(progressbar);
		const box = only("app-container");
		const content = only("app-content");
		expect(box).toContainElement(root);
		expect(box).toContainElement(content);
		expect(content).toContainElement(
			screen.getByRole("button", { name: "Start" }),
		);
		expect(content).not.toContainElement(root);
		expect(screen.getByRole("status")).toBe(only("app-status"));
	});

	it("[ISSUE-3473-ITEM-14] washes the covered content in the theme's paper color, so a dark theme dims it", () => {
		const washOf = (t: Theme) => {
			const { container } = renderOverlay(<FormLoaderOverlay visible />, t);
			const color = getComputedStyle(overlayRoot(container)).backgroundColor;
			cleanup();
			return color;
		};
		expect([
			washOf(createTheme()),
			washOf(createTheme({ palette: { mode: "dark" } })),
			washOf(createTheme({ palette: { background: { paper: "#faf8f0" } } })),
		]).toEqual([
			"rgba(255, 255, 255, 0.3)",
			"rgba(18, 18, 18, 0.3)",
			"rgba(250, 248, 240, 0.3)",
		]);
	});
});
