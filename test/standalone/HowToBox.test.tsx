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
		await expect(screen.findByText("Single step")).resolves.toBeInTheDocument();
	});

	it("renders an array of strings as separate list items", async () => {
		renderHowToBox(
			<HowToBox labels={["Step one", "Step two", "Step three"]} />,
		);
		await expect(screen.findByText("Step one")).resolves.toBeInTheDocument();
		await expect(screen.findByText("Step two")).resolves.toBeInTheDocument();
		await expect(screen.findByText("Step three")).resolves.toBeInTheDocument();
	});

	it("renders the custom titleLabel", async () => {
		renderHowToBox(<HowToBox titleLabel="Instructions" labels={["Do this"]} />);
		await expect(
			screen.findByText("Instructions"),
		).resolves.toBeInTheDocument();
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
		await expect(screen.findByTestId("node-item")).resolves.toBeInTheDocument();
	});
});
