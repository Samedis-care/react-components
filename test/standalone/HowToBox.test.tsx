import React from "react";
import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ThemeProvider, createTheme, Theme } from "@mui/material";
import i18next, { Resource } from "i18next";
import HowToBox, { HowToBoxTranslate } from "../../src/standalone/HowToBox";
import ccI18n from "../../src/i18n";

afterEach(cleanup);

// HowToBox suspends until the components-care "translation" namespace is
// loaded. ccI18n.init() alone does not load it under vitest (initAsync), and a
// suspended first render leaves the container empty whatever the props are,
// so every "renders nothing" assertion would pass vacuously.
beforeAll(async () => {
	await ccI18n.loadNamespaces("translation");
	expect(ccI18n.hasLoadedNamespace("translation")).toBe(true);
});

const theme = createTheme();

const renderHowToBox = (ui: React.ReactElement) =>
	render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

const withTheme = (ui: React.ReactElement, t: Theme = theme) => (
	<ThemeProvider theme={t}>{ui}</ThemeProvider>
);

const fieldsetOf = (container: HTMLElement) => {
	const fieldset = container.querySelector("fieldset");
	if (!fieldset) throw new Error("no fieldset rendered");
	return fieldset;
};

const makeAppI18n = async (resources: Resource) => {
	const inst = i18next.createInstance();
	await inst.init({ lng: "en", resources, initAsync: false });
	return inst;
};

describe("HowToBox", () => {
	it("renders nothing when labels is undefined", () => {
		const { container } = renderHowToBox(<HowToBox labels={undefined} />);
		expect(container.firstChild).toBeNull();
	});

	it("renders a single string label as a list item", async () => {
		renderHowToBox(<HowToBox labels="Single step" />);
		expect(await screen.findByText("Single step")).toBeInTheDocument();
	});

	it("renders an array of strings as separate list items", async () => {
		renderHowToBox(
			<HowToBox labels={["Step one", "Step two", "Step three"]} />,
		);
		expect(await screen.findByText("Step one")).toBeInTheDocument();
		expect(await screen.findByText("Step two")).toBeInTheDocument();
		expect(await screen.findByText("Step three")).toBeInTheDocument();
	});

	it("renders the custom titleLabel", async () => {
		renderHowToBox(<HowToBox titleLabel="Instructions" labels={["Do this"]} />);
		expect(await screen.findByText("Instructions")).toBeInTheDocument();
	});

	it("renders ReactNode items inside the list", async () => {
		renderHowToBox(
			<HowToBox
				labels={[
					<span key="1" data-testid="node-item">
						Rich item
					</span>,
				]}
			/>,
		);
		expect(await screen.findByTestId("node-item")).toBeInTheDocument();
	});

	describe("bugs", () => {
		it("[ISSUE-3463-ITEM-2] renders nothing for an empty labels array", () => {
			const { container, rerender } = renderHowToBox(
				<HowToBox labels={["x"]} />,
			);
			expect(fieldsetOf(container)).toBeInTheDocument();
			rerender(withTheme(<HowToBox labels={[]} />));
			expect(container).toBeEmptyDOMElement();
		});

		it("[ISSUE-3463-ITEM-2] HowToBoxTranslate renders nothing for a key that holds an empty array", async () => {
			const app = await makeAppI18n({
				en: { translation: { steps: ["Step one"], none: [] } },
			});
			const { container, rerender } = renderHowToBox(
				<HowToBoxTranslate t={app.t} labels="steps" />,
			);
			expect(fieldsetOf(container)).toBeInTheDocument();
			rerender(withTheme(<HowToBoxTranslate t={app.t} labels="none" />));
			expect(container).toBeEmptyDOMElement();
			rerender(withTheme(<HowToBoxTranslate t={app.t} labels="steps" />));
			expect(
				screen.getByRole("group", { name: "How it works" }),
			).toHaveTextContent("Step one");
		});
	});
});
