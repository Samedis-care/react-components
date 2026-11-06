import React from "react";
import { describe, it, expect, vi, afterEach, beforeAll } from "vitest";
import {
	render,
	screen,
	fireEvent,
	cleanup,
	act,
	within,
} from "@testing-library/react";
import { Dialog, ThemeProvider, createTheme } from "@mui/material";
import ccI18n from "../../src/i18n";
import { DialogTitle } from "../../src/non-standalone/Dialog/DialogTitle";

beforeAll(async () => {
	await ccI18n.loadNamespaces("translation");
});
afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});

const closeButton = () => screen.getByRole("button", { name: "Close" });
/** the element the dialog's aria-labelledby points at */
const dialogLabel = () =>
	document.getElementById(
		screen.getByRole("dialog").getAttribute("aria-labelledby") ?? "",
	);

describe("DialogTitle", () => {
	it("shows the children and a close button named Close that calls onClose once", () => {
		const onClose = vi.fn();
		render(<DialogTitle onClose={onClose}>My Title</DialogTitle>);
		expect(screen.getByText("My Title")).toBeInTheDocument();
		fireEvent.click(closeButton());
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("renders the close button only while onClose is set, and noTitle as a root class", () => {
		const { container, rerender } = render(
			<DialogTitle onClose={() => {}}>Title</DialogTitle>,
		);
		const root = () => container.firstElementChild;
		expect(root()).not.toHaveClass("CcDialogTitle-noTitle");
		rerender(<DialogTitle>Title</DialogTitle>);
		expect(screen.queryByRole("button")).toBeNull();
		rerender(
			<DialogTitle onClose={() => {}} noTitle>
				Other
			</DialogTitle>,
		);
		expect(screen.getByText("Other")).toBeInTheDocument();
		expect(closeButton()).toBeInTheDocument();
		expect(root()).toHaveClass("CcDialogTitle-noTitle");
		rerender(<DialogTitle onClose={() => {}}>Other</DialogTitle>);
		expect(root()).not.toHaveClass("CcDialogTitle-noTitle");
	});

	it("puts className and classes on their slots", () => {
		const { container } = render(
			<DialogTitle
				onClose={() => {}}
				className="own"
				classes={{
					root: "r",
					textWrapper: "tw",
					text: "t",
					closeButton: "cb",
				}}
			>
				My Title
			</DialogTitle>,
		);
		expect(container.firstElementChild).toHaveClass("r", "own");
		expect(screen.getByText("My Title")).toHaveClass("t");
		expect(screen.getByText("My Title").parentElement).toHaveClass("tw");
		expect(closeButton()).toHaveClass("cb");
	});

	it("takes theme defaultProps for CcDialogTitle; a prop beats the default", () => {
		const theme = createTheme({
			components: {
				CcDialogTitle: {
					defaultProps: { noTitle: true, className: "fromTheme" },
				},
			},
		});
		const { container, rerender } = render(
			<ThemeProvider theme={theme}>
				<DialogTitle>Title</DialogTitle>
			</ThemeProvider>,
		);
		expect(container.firstElementChild).toHaveClass(
			"fromTheme",
			"CcDialogTitle-noTitle",
		);
		rerender(
			<ThemeProvider theme={theme}>
				<DialogTitle noTitle={false}>Title</DialogTitle>
			</ThemeProvider>,
		);
		expect(container.firstElementChild).not.toHaveClass(
			"CcDialogTitle-noTitle",
		);
	});

	it("names the close button in the current language", async () => {
		try {
			await act(() => ccI18n.changeLanguage("de"));
			render(<DialogTitle onClose={() => {}}>Titel</DialogTitle>);
			expect(
				screen.getByRole("button", { name: "Schließen" }),
			).toBeInTheDocument();
		} finally {
			await act(() => ccI18n.changeLanguage("en"));
		}
	});

	it("names the MUI Dialog it is placed in", () => {
		render(
			<Dialog open>
				<DialogTitle>My Title</DialogTitle>
			</Dialog>,
		);
		expect(screen.getByRole("dialog")).toHaveAccessibleName("My Title");
		expect(dialogLabel()).toHaveTextContent("My Title");
	});

	it("[ISSUE-3497-ITEM-13] the element naming the dialog holds only the title: no close button, no second heading", () => {
		render(
			<Dialog open>
				<DialogTitle onClose={() => {}}>My Title</DialogTitle>
			</Dialog>,
		);
		// jsdom leaves the button out of the name; Chromium says "My Title Close"
		const label = dialogLabel();
		expect({
			buttonInLabel: !!label?.querySelector("button"),
			headings: within(screen.getByRole("dialog"))
				.getAllByRole("heading")
				.map((h) => h.tagName),
		}).toEqual({ buttonInLabel: false, headings: ["H2"] });
	});
});
