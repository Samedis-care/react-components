import React from "react";
import { describe, it, expect, afterEach, vi, assertType } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ThemeProvider, createTheme, Theme } from "@mui/material";
import Loader from "../../src/standalone/Loader";
import type { LoaderClassKey, LoaderProps } from "../../src";

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});

const theme = createTheme();

const withTheme = (ui: React.ReactElement, t: Theme = theme) => (
	<ThemeProvider theme={t}>{ui}</ThemeProvider>
);

const renderLoader = (ui: React.ReactElement, t: Theme = theme) =>
	render(withTheme(ui, t));

describe("Loader", () => {
	it("renders a circular progress indicator", () => {
		const { container } = renderLoader(<Loader />);
		// MUI CircularProgress renders an SVG with role="progressbar"
		expect(container.querySelector("[role='progressbar']")).toBeInTheDocument();
	});

	it("does not render text when text prop is omitted", () => {
		const { container } = renderLoader(<Loader />);
		// No typography elements beyond the progress wrapper
		expect(container.querySelector("h6")).not.toBeInTheDocument();
	});

	it("renders text when text prop is provided", () => {
		renderLoader(<Loader text="Loading data…" />);
		expect(screen.getByText("Loading data…")).toBeInTheDocument();
	});

	it("renders text with a custom typography variant", () => {
		const { container } = renderLoader(
			<Loader text="Please wait" typographyVariant="body1" />,
		);
		// MUI Typography body1 maps to a <p> element by default
		const paragraph = container.querySelector("p");
		expect(paragraph).toBeInTheDocument();
		expect(paragraph?.textContent).toBe("Please wait");
	});

	it("[ISSUE-3461-ITEM-10] applies theme variants for CcLoader", () => {
		const themed = createTheme({
			components: {
				CcLoader: {
					variants: [{ props: {}, style: { backgroundColor: "rgb(1, 2, 3)" } }],
				},
			},
		});
		const { container } = renderLoader(<Loader />, themed);
		expect(
			getComputedStyle(container.firstElementChild as HTMLElement)
				.backgroundColor,
		).toBe("rgb(1, 2, 3)");
	});

	it("[ISSUE-3461-ITEM-10] matches theme variants on the Loader's props, with their defaults", () => {
		const themed = createTheme({
			components: {
				CcLoader: {
					variants: [
						{
							props: { typographyVariant: "caption" },
							style: { backgroundColor: "rgb(1, 2, 3)" },
						},
						{
							props: { typographyVariant: "h6" },
							style: { color: "rgb(4, 5, 6)" },
						},
						{
							props: ({ text }) => !!text,
							style: { borderTopColor: "rgb(7, 8, 9)" },
						},
					],
				},
			},
		});
		const { container, rerender } = renderLoader(
			<Loader text={"Loading"} typographyVariant={"caption"} />,
			themed,
		);
		const root = () => getComputedStyle(container.firstElementChild as Element);
		expect(root().backgroundColor).toBe("rgb(1, 2, 3)");
		expect(root().color).not.toBe("rgb(4, 5, 6)");
		expect(root().borderTopColor).toBe("rgb(7, 8, 9)");

		// without text, typographyVariant is its default "h6"
		rerender(withTheme(<Loader />, themed));
		expect(root().backgroundColor).not.toBe("rgb(1, 2, 3)");
		expect(root().color).toBe("rgb(4, 5, 6)");
		expect(root().borderTopColor).not.toBe("rgb(7, 8, 9)");
	});

	it("[ISSUE-3461-ITEM-10] matches theme variants on props set by the theme's defaultProps", () => {
		const themed = createTheme({
			components: {
				CcLoader: {
					defaultProps: { typographyVariant: "caption" },
					variants: [
						{
							props: { typographyVariant: "caption" },
							style: { backgroundColor: "rgb(1, 2, 3)" },
						},
					],
				},
			},
		});
		const { container } = renderLoader(<Loader />, themed);
		expect(
			getComputedStyle(container.firstElementChild as Element).backgroundColor,
		).toBe("rgb(1, 2, 3)");
	});

	it("[ISSUE-3461-ITEM-10] keeps the props theme variants match on off the DOM", () => {
		const error = vi.spyOn(console, "error").mockImplementation(() => {});
		const { container } = renderLoader(
			<Loader text={"Loading"} typographyVariant={"caption"} />,
		);
		const root = container.firstElementChild as Element;
		expect(root.getAttributeNames()).toEqual(["class"]);
		expect(error).not.toHaveBeenCalled();
	});

	it("[ISSUE-3461-ITEM-10] applies the theme's root styleOverrides to its outer box", () => {
		const themed = createTheme({
			components: {
				CcLoader: {
					styleOverrides: { root: { backgroundColor: "rgb(1, 2, 3)" } },
				},
			},
		});
		const { container } = renderLoader(<Loader text={"Loading"} />, themed);
		const root = container.firstElementChild as Element;
		expect(root).toContainElement(screen.getByRole("progressbar"));
		expect(getComputedStyle(root).backgroundColor).toBe("rgb(1, 2, 3)");
	});

	it('[ISSUE-3461-ITEM-10] takes "inherit" as typographyVariant, as Typography does', () => {
		renderLoader(<Loader text={"Loading"} typographyVariant={"inherit"} />);
		expect(screen.getByText("Loading")).toHaveClass("MuiTypography-inherit");
	});

	it("[ISSUE-3461-ITEM-11] exports LoaderProps and LoaderClassKey from the package root", () => {
		// A type test: vitest does not type-check, tsc does
		// (node_modules/.bin/tsc -p tsconfig-test.json --noEmit). While the package
		// root lacks these types, the import above does not compile.
		assertType<LoaderProps>({ text: "Loading", typographyVariant: "caption" });
		assertType<LoaderClassKey>("root");
	});
});
