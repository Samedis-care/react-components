import React from "react";
import { describe, it, expect, afterEach, vi, assertType } from "vitest";
import { render, screen, cleanup, act } from "@testing-library/react";
import { ThemeProvider, createTheme, Theme, styled } from "@mui/material";
import Loader from "../../src/standalone/Loader";
import FormLoaderOverlay from "../../src/standalone/Form/FormLoaderOverlay";
import ccI18n from "../../src/i18n";
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

	it("shows synchronously as a Suspense fallback and does not suspend itself, also before the library's translations have loaded", async () => {
		// translations still loading: not ready, and the load never completes. A
		// Loader that suspended on them would show the outer fallback right away
		// instead of re-suspending in a loop until the test timeout.
		vi.spyOn(ccI18n, "hasLoadedNamespace").mockReturnValue(false);
		vi.spyOn(ccI18n, "loadNamespaces").mockReturnValue(new Promise(() => {}));
		let resolve!: () => void;
		const pending = new Promise<void>((r) => {
			resolve = r;
		});
		const Content = () => {
			React.use(pending);
			return <p>Content</p>;
		};

		await act(async () => {
			renderLoader(
				<React.Suspense fallback={<span>outer fallback</span>}>
					<React.Suspense fallback={<Loader text={"Lädt…"} />}>
						<Content />
					</React.Suspense>
				</React.Suspense>,
			);
			await Promise.resolve();
		});
		// queried once, not with findBy: a Loader that suspended would show the
		// outer fallback here
		expect(screen.queryByText("outer fallback")).toBeNull();
		expect(screen.getByRole("progressbar")).toBeInTheDocument();
		expect(screen.getByText("Lädt…")).toBeInTheDocument();

		await act(async () => {
			resolve();
			await pending;
		});
		expect(screen.getByText("Content")).toBeInTheDocument();
		expect(screen.queryByRole("progressbar")).toBeNull();
	});

	it("[ISSUE-3461-ITEM-2] names the progressbar after its text", () => {
		renderLoader(<Loader text={"Loading data…"} />);
		expect(
			screen.getByRole("progressbar", { name: "Loading data…" }),
		).toBeInTheDocument();
	});

	it("[ISSUE-3461-ITEM-2] names the progressbar without text", () => {
		renderLoader(<Loader />);
		expect(screen.getByRole("progressbar", { name: /\S/ })).toBeInTheDocument();
	});

	it("[ISSUE-3461-ITEM-2] names each Loader on a page after its own text", () => {
		renderLoader(
			<>
				<Loader text={"Loading devices…"} />
				<Loader text={"Loading incidents…"} />
			</>,
		);
		expect(
			screen.getByRole("progressbar", { name: "Loading devices…" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("progressbar", { name: "Loading incidents…" }),
		).toBeInTheDocument();
	});

	it("[ISSUE-3461-ITEM-2] follows changes of its text, and without text takes the default name", () => {
		const { rerender } = renderLoader(<Loader text={"Loading devices…"} />);
		const bar = screen.getByRole("progressbar");
		expect(bar).toHaveAccessibleName("Loading devices…");

		rerender(withTheme(<Loader text={"Saving…"} />));
		expect(bar).toHaveAccessibleName("Saving…");

		rerender(withTheme(<Loader text={""} />));
		expect(bar).toHaveAccessibleName("Loading…");
		expect(bar).not.toHaveAttribute("aria-labelledby");

		rerender(withTheme(<Loader />));
		expect(bar).toHaveAccessibleName("Loading…");
		expect(bar).not.toHaveAttribute("aria-labelledby");

		rerender(withTheme(<Loader text={"Loading devices…"} />));
		expect(bar).toHaveAccessibleName("Loading devices…");
		expect(bar).not.toHaveAttribute("aria-label");
	});

	it("[ISSUE-3461-ITEM-2] takes the name a caller gives over its text and the default name", () => {
		const { rerender } = renderLoader(
			<Loader text={"Loading data…"} aria-label={"Loading devices"} />,
		);
		const bar = screen.getByRole("progressbar");
		expect(bar).toHaveAccessibleName("Loading devices");
		expect(bar).not.toHaveAttribute("aria-labelledby");

		rerender(
			withTheme(
				<>
					<Loader text={"Loading data…"} aria-labelledby={"incidents-label"} />
					<span id={"incidents-label"}>Loading incidents</span>
				</>,
			),
		);
		expect(screen.getByRole("progressbar")).toHaveAccessibleName(
			"Loading incidents",
		);
		expect(screen.getByRole("progressbar")).not.toHaveAttribute("aria-label");

		rerender(withTheme(<Loader aria-label={"Loading devices"} />));
		expect(screen.getByRole("progressbar")).toHaveAccessibleName(
			"Loading devices",
		);
	});

	it("[ISSUE-3461-ITEM-2] names the progressbar without text in the library's current language", async () => {
		const language = ccI18n.language;
		renderLoader(<Loader />);
		try {
			await act(() => ccI18n.changeLanguage("de"));
			expect(screen.getByRole("progressbar")).toHaveAccessibleName("Lädt…");
		} finally {
			await act(() => ccI18n.changeLanguage(language));
		}
		expect(screen.getByRole("progressbar")).toHaveAccessibleName("Loading…");
	});

	it('[ISSUE-3461-ITEM-2] names the progressbar "Loading…" while the library\'s translations are loading', async () => {
		const language = ccI18n.language;
		await act(() => ccI18n.changeLanguage("de"));
		try {
			vi.spyOn(ccI18n, "hasLoadedNamespace").mockReturnValue(false);
			vi.spyOn(ccI18n, "loadNamespaces").mockReturnValue(new Promise(() => {}));
			renderLoader(<Loader />);
			expect(screen.getByRole("progressbar")).toHaveAccessibleName("Loading…");
		} finally {
			vi.restoreAllMocks();
			await act(() => ccI18n.changeLanguage(language));
		}
	});

	it("[ISSUE-3461-ITEM-3] exposes loading as a polite status region around the progressbar", () => {
		renderLoader(<Loader text={"Loading data…"} />);
		const status = screen.getByRole("status");
		expect(status).toContainElement(screen.getByRole("progressbar"));
		expect(status).toHaveTextContent("Loading data…");
		expect(status).not.toHaveAttribute("aria-live", "assertive");
		expect(status).not.toHaveAttribute("tabindex");
	});

	it("[ISSUE-3461-ITEM-3] exposes loading as a status region without text too", () => {
		renderLoader(<Loader />);
		expect(screen.getByRole("status")).toContainElement(
			screen.getByRole("progressbar"),
		);
	});

	it("[ISSUE-3461-ITEM-3] keeps its status region when the text changes, so the new text is announced as a change", () => {
		const { rerender } = renderLoader(<Loader text={"Validating 1 of 3"} />);
		const status = screen.getByRole("status");

		rerender(withTheme(<Loader text={"Validating 2 of 3"} />));
		expect(screen.getByRole("status")).toBe(status);
		expect(status).toHaveTextContent("Validating 2 of 3");

		rerender(withTheme(<Loader />));
		expect(screen.getByRole("status")).toBe(status);
		expect(status).toContainElement(
			screen.getByRole("progressbar", { name: "Loading…" }),
		);
	});

	it('[ISSUE-3461-ITEM-3] stops announcing with aria-live="off", and stays a status with a named progressbar', () => {
		renderLoader(
			<>
				<Loader aria-live={"off"} />
				<Loader aria-live={"off"} text={"Loading chart…"} />
			</>,
		);
		const [withoutText, withText] = screen.getAllByRole("status");
		expect(withoutText).toHaveAttribute("aria-live", "off");
		expect(withText).toHaveAttribute("aria-live", "off");
		expect(withoutText).toContainElement(
			screen.getByRole("progressbar", { name: "Loading…" }),
		);
		expect(withText).toContainElement(
			screen.getByRole("progressbar", { name: "Loading chart…" }),
		);
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
		expect(root.getAttributeNames().sort()).toEqual(["class", "role"]);
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

	it("[ISSUE-3461-ITEM-8] puts text and spinner into the innerWrapper slot and applies the theme's styleOverrides to each slot", () => {
		const themed = createTheme({
			components: {
				CcLoader: {
					styleOverrides: {
						root: { backgroundColor: "rgb(0, 128, 0)" },
						innerWrapper: { backgroundColor: "rgb(0, 0, 128)" },
						progress: { color: "rgb(255, 0, 0)" },
					},
				},
			},
		});
		const { container } = renderLoader(<Loader text={"Loading"} />, themed);
		// slots located by structure: the CcLoader-<slot> class label exists
		// only in development builds
		const root = container.firstElementChild as HTMLElement;
		const inner = root.firstElementChild as HTMLElement;
		const bar = screen.getByRole("progressbar");
		expect(screen.getByText("Loading").parentElement).toBe(inner);
		expect(bar.parentElement).toBe(inner);
		expect(getComputedStyle(root).backgroundColor).toBe("rgb(0, 128, 0)");
		expect(getComputedStyle(inner).backgroundColor).toBe("rgb(0, 0, 128)");
		expect(getComputedStyle(bar).color).toBe("rgb(255, 0, 0)");
	});

	it("[ISSUE-3461-ITEM-7] passes className to its root element", () => {
		const { container } = renderLoader(<Loader className={"my-class"} />);
		expect(container.firstElementChild).toHaveClass("my-class");
	});

	it("[ISSUE-3461-ITEM-7] applies FormLoaderOverlay's loader slot override to its Loader", () => {
		const themed = createTheme({
			components: {
				CcFormLoaderOverlay: {
					styleOverrides: { loader: { backgroundColor: "rgb(0, 0, 255)" } },
				},
			},
		});
		const { container } = renderLoader(<FormLoaderOverlay visible />, themed);
		expect(screen.getByRole("progressbar")).toBeInTheDocument();
		const styled = Array.from(container.querySelectorAll("*")).filter(
			(el) => getComputedStyle(el).backgroundColor === "rgb(0, 0, 255)",
		);
		expect(styled).not.toHaveLength(0);
	});

	it("[ISSUE-3461-ITEM-7] applies the styles of styled(Loader) to its root element, over the Loader's own", () => {
		const TallLoader = styled(Loader)({ height: 123 });
		const { container } = renderLoader(<TallLoader text={"Loading"} />);
		const root = container.firstElementChild as HTMLElement;
		expect(root).toContainElement(screen.getByRole("progressbar"));
		expect(getComputedStyle(root).height).toBe("123px");
	});

	it("[ISSUE-3461-ITEM-7] puts classes on their slots, root together with className, and follows changes", () => {
		const { container, rerender } = renderLoader(
			<Loader
				text={"Loading"}
				className={"a"}
				classes={{ root: "r", innerWrapper: "w", progress: "p" }}
			/>,
		);
		const root = container.firstElementChild as HTMLElement;
		const inner = root.firstElementChild as HTMLElement;
		const bar = screen.getByRole("progressbar");
		expect(root).toHaveClass("a", "r");
		expect(inner).toHaveClass("w");
		expect(bar).toHaveClass("p");

		rerender(
			withTheme(
				<Loader text={"Loading"} className={"a2"} classes={{ root: "r2" }} />,
			),
		);
		expect(container.firstElementChild).toBe(root);
		expect(root).toHaveClass("a2", "r2");
		expect(root).not.toHaveClass("a");
		expect(root).not.toHaveClass("r");
		expect(inner).not.toHaveClass("w");
		expect(bar).not.toHaveClass("p");

		rerender(withTheme(<Loader text={"Loading"} />));
		expect(root).not.toHaveClass("a2");
		expect(root).not.toHaveClass("r2");
		for (const el of [root, inner, bar]) {
			expect(el.className).not.toMatch(/\b(undefined|null|false)\b/);
		}
	});

	it("[ISSUE-3461-ITEM-7] applies sx and style to its root element", () => {
		const { container } = renderLoader(
			<Loader sx={{ mt: 2 }} style={{ color: "rgb(4, 5, 6)" }} />,
		);
		const root = container.firstElementChild as HTMLElement;
		// mt: 2 is theme.spacing(2)
		expect(getComputedStyle(root).marginTop).toBe("16px");
		expect(getComputedStyle(root).color).toBe("rgb(4, 5, 6)");
		expect(root.getAttributeNames().sort()).toEqual(["class", "role", "style"]);
	});

	it("[ISSUE-3461-ITEM-7] passes id, data-* and other aria-* attributes to its root element", () => {
		const { container } = renderLoader(
			<Loader
				id={"devices-loader"}
				data-testid={"devices-loader"}
				aria-describedby={"hint"}
			/>,
		);
		const root = screen.getByTestId("devices-loader");
		expect(root).toBe(container.firstElementChild);
		expect(root).toHaveAttribute("id", "devices-loader");
		expect(root).toHaveAttribute("aria-describedby", "hint");
		expect(screen.getByRole("progressbar")).not.toHaveAttribute(
			"aria-describedby",
		);
	});

	it("[ISSUE-3461-ITEM-7] names the progressbar with aria-label or aria-labelledby, not its root element", () => {
		const { container, rerender } = renderLoader(
			<Loader aria-label={"Loading devices"} />,
		);
		const root = container.firstElementChild as HTMLElement;
		expect(
			screen.getByRole("progressbar", { name: "Loading devices" }),
		).toBeInTheDocument();
		expect(root).not.toHaveAttribute("aria-label");

		rerender(
			withTheme(
				<>
					<Loader aria-labelledby={"incidents-label"} />
					<span id={"incidents-label"}>Loading incidents</span>
				</>,
			),
		);
		expect(
			screen.getByRole("progressbar", { name: "Loading incidents" }),
		).toBeInTheDocument();
		expect(container.firstElementChild).not.toHaveAttribute("aria-labelledby");
		expect(screen.getByRole("progressbar")).not.toHaveAttribute("aria-label");
	});
});
