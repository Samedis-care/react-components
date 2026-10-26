import React from "react";
import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material";
import HowToBox from "../../src/standalone/HowToBox";
import ccI18n from "../../src/i18n";

afterEach(cleanup);

beforeAll(async () => {
	await ccI18n.init();
});

const theme = createTheme();

const renderHowToBox = (ui: React.ReactElement) =>
	render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

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
});
