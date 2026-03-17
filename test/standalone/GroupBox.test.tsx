import React from "react";
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material";
import GroupBox from "../../src/standalone/GroupBox";

afterEach(cleanup);

const theme = createTheme();

const renderGroupBox = (ui: React.ReactElement) =>
	render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe("GroupBox", () => {
	it("renders the label as a legend", () => {
		renderGroupBox(<GroupBox label="Personal Information" />);
		expect(screen.getByText("Personal Information")).toBeInTheDocument();
	});

	it("renders children inside the fieldset", () => {
		renderGroupBox(
			<GroupBox label="Section">
				<span>Child content</span>
			</GroupBox>,
		);
		expect(screen.getByText("Child content")).toBeInTheDocument();
	});

	it("does not render a legend when label is falsy", () => {
		const { container } = renderGroupBox(
			// @ts-expect-error testing falsy label edge case
			<GroupBox label="">
				<span>Content</span>
			</GroupBox>,
		);
		const legend = container.querySelector("legend");
		expect(legend).not.toBeInTheDocument();
	});

	it("applies the provided id to the fieldset", () => {
		const { container } = renderGroupBox(
			<GroupBox id="my-group" label="Labeled" />,
		);
		const fieldset = container.querySelector("fieldset#my-group");
		expect(fieldset).toBeInTheDocument();
	});

	it("applies additional className to the root", () => {
		const { container } = renderGroupBox(
			<GroupBox label="X" className="extra-class" />,
		);
		expect(container.querySelector(".extra-class")).toBeInTheDocument();
	});

	it("renders a ReactNode label", () => {
		renderGroupBox(
			<GroupBox label={<strong data-testid="rich-label">Bold</strong>} />,
		);
		expect(screen.getByTestId("rich-label")).toBeInTheDocument();
	});
});
