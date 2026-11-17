import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, it, expect, expectTypeOf, afterEach } from "vitest";
import { render, cleanup, within, screen } from "@testing-library/react";
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
});
