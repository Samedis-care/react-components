import {
	describe,
	it,
	expect,
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
} from "vitest";
import React, { useState } from "react";
import { render, act, cleanup, screen } from "@testing-library/react";
import { createMemoryHistory } from "history";
import { createTheme, ThemeProvider } from "@mui/material";
import HistoryRouter from "../../src/standalone/Routes/HistoryRouter";
import Routes from "../../src/standalone/Routes/Routes";
import Route from "../../src/standalone/Routes/Route";
import PageTitle from "../../src/non-standalone/PageTitle/PageTitle";
import FullFormDialog from "../../src/backend-components/Form/FormDialog";
import useSetFormDialogTitle from "../../src/backend-components/Form/useSetFormDialogTitle";
import { Framework } from "../../src/framework";
import ccI18n from "../../src/i18n";

// PageTitle: the page's heading, which names the document (through
// usePageTitle) or, inside a FullFormDialog, becomes the dialog's title.

const APP = "Test App";
const initialTitle = document.title;
const initialLanguage = ccI18n.language;
// jsdom does not implement matchMedia, which the Framework's ThemeProvider needs.
beforeAll(async () => {
	if (!window.matchMedia) {
		window.matchMedia = (query: string) => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: () => {},
			removeListener: () => {},
			addEventListener: () => {},
			removeEventListener: () => {},
			dispatchEvent: () => false,
		});
	}
	await ccI18n.init();
	await ccI18n.changeLanguage("en-US");
});
afterAll(async () => {
	document.title = initialTitle;
	await ccI18n.changeLanguage(initialLanguage);
});
beforeEach(() => {
	document.title = APP;
});
afterEach(() => {
	cleanup();
});

const mem = (path: string) => createMemoryHistory({ initialEntries: [path] });

describe("PageTitle on a page", () => {
	it("[ISSUE-3475-ITEM-23] renders an h1 and names the document after its text", () => {
		const { unmount } = render(
			<HistoryRouter history={mem("/devices/4711")}>
				<PageTitle>
					Device <b>4711</b>
				</PageTitle>
			</HistoryRouter>,
		);
		expect(
			screen.getByRole("heading", { level: 1, name: "Device 4711" }),
		).toBeInTheDocument();
		expect(document.title).toBe("Device 4711 – Test App");
		unmount();
		expect(document.title).toBe("Test App");
	});

	it("[ISSUE-3475-ITEM-23] follows its text, also when a child changes it", async () => {
		let setName: (name: string) => void = () => {};
		const Name = () => {
			const [name, set] = useState("loading");
			setName = set;
			return <>{name}</>;
		};
		render(
			<HistoryRouter history={mem("/")}>
				<PageTitle>
					Device <Name />
				</PageTitle>
			</HistoryRouter>,
		);
		expect(document.title).toBe("Device loading – Test App");
		// only the child re-renders, the heading's text changes
		// async act: the MutationObserver reports in a microtask
		await act(async () => {
			setName("Infusion pump 7");
			await Promise.resolve();
		});
		expect(document.title).toBe("Device Infusion pump 7 – Test App");
	});

	it("[ISSUE-3475-ITEM-23] the heading of a record page routed below a list names the document", () => {
		const history = mem("/devices/4711");
		render(
			<HistoryRouter history={history}>
				<Routes>
					{[
						<Route
							key="devices"
							path="/devices/*"
							element={
								<>
									<PageTitle>Inventory</PageTitle>
									<Routes>
										{[
											<Route
												key="id"
												path=":id"
												element={
													<PageTitle variant="h2">Device 4711</PageTitle>
												}
											/>,
										]}
									</Routes>
								</>
							}
						/>,
					]}
				</Routes>
			</HistoryRouter>,
		);
		expect(document.title).toBe("Device 4711 – Test App");
		act(() => history.push("/devices"));
		expect(document.title).toBe("Inventory – Test App");
	});

	it("[ISSUE-3475-ITEM-23] disableAutoTitle renders the heading without naming the document", () => {
		render(
			<HistoryRouter history={mem("/")}>
				<PageTitle disableAutoTitle>Section</PageTitle>
			</HistoryRouter>,
		);
		expect(
			screen.getByRole("heading", { level: 1, name: "Section" }),
		).toBeInTheDocument();
		expect(document.title).toBe("Test App");
	});

	it("[ISSUE-3475-ITEM-23] passes Typography props through and forwards its ref", () => {
		const ref = React.createRef<HTMLElement>();
		render(
			<PageTitle
				ref={ref}
				variant="h2"
				component="div"
				className="custom"
				noWrap
			>
				Devices
			</PageTitle>,
		);
		const element = screen.getByText("Devices");
		expect(element.tagName).toBe("DIV");
		expect(element).toHaveClass(
			"custom",
			"MuiTypography-h2",
			"MuiTypography-noWrap",
		);
		expect(ref.current).toBe(element);
	});

	it("[ISSUE-3475-ITEM-23] takes its default props from the theme (CcPageTitle)", () => {
		const theme = createTheme({
			components: { CcPageTitle: { defaultProps: { variant: "h3" } } },
		});
		render(
			<ThemeProvider theme={theme}>
				<PageTitle>Devices</PageTitle>
			</ThemeProvider>,
		);
		expect(
			screen.getByRole("heading", { level: 3, name: "Devices" }),
		).toBeInTheDocument();
	});
});

describe("PageTitle in a FullFormDialog", () => {
	it("[ISSUE-3475-ITEM-23] becomes the dialog's title, renders nothing and leaves the document title alone", async () => {
		const Dialog = (props: { withTitle: boolean }) => (
			<FullFormDialog>
				{props.withTitle && <PageTitle>Edit device</PageTitle>}
				<div>form content</div>
			</FullFormDialog>
		);
		const { rerender } = render(
			<Framework>
				<Dialog withTitle />
			</Framework>,
		);
		expect(
			await screen.findByRole("dialog", { name: "Edit device" }),
		).toBeInTheDocument();
		expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
		expect(document.title).toBe("Test App");
		// gone with the PageTitle
		rerender(
			<Framework>
				<Dialog withTitle={false} />
			</Framework>,
		);
		expect(screen.getByRole("dialog")).not.toHaveAccessibleName();
	});

	it("[ISSUE-3475-ITEM-23] the dialog's dialogTitle prop wins over it", async () => {
		render(
			<Framework>
				<FullFormDialog dialogTitle="Prop title">
					<PageTitle>Edit device</PageTitle>
				</FullFormDialog>
			</Framework>,
		);
		expect(
			await screen.findByRole("dialog", { name: "Prop title" }),
		).toBeInTheDocument();
		expect(screen.queryByText("Edit device")).toBeNull();
	});

	it("[ISSUE-3475-ITEM-23] disableAutoTitle keeps the heading in the dialog's content", async () => {
		render(
			<Framework>
				<FullFormDialog>
					<PageTitle disableAutoTitle>Section</PageTitle>
				</FullFormDialog>
			</Framework>,
		);
		const dialog = await screen.findByRole("dialog");
		expect(dialog).not.toHaveAccessibleName();
		expect(
			screen.getByRole("heading", { level: 1, name: "Section" }),
		).toBeInTheDocument();
	});
});

describe("useSetFormDialogTitle", () => {
	const SetTitle = (props: {
		enabled?: boolean;
		priority?: boolean;
		report?: (inDialog: boolean) => void;
	}) => {
		const inDialog = useSetFormDialogTitle(
			props.enabled ?? true,
			"Hook title",
			props.priority,
		);
		props.report?.(inDialog);
		return null;
	};

	it("[ISSUE-3475-ITEM-23] with priority wins over the dialogTitle prop, until it unmounts", async () => {
		const Dialog = (props: { mounted: boolean }) => (
			<FullFormDialog dialogTitle="Prop title">
				{props.mounted && <SetTitle priority />}
			</FullFormDialog>
		);
		const { rerender } = render(
			<Framework>
				<Dialog mounted />
			</Framework>,
		);
		expect(
			await screen.findByRole("dialog", { name: "Hook title" }),
		).toBeInTheDocument();
		rerender(
			<Framework>
				<Dialog mounted={false} />
			</Framework>,
		);
		expect(screen.getByRole("dialog")).toHaveAccessibleName("Prop title");
	});

	it("[ISSUE-3475-ITEM-23] reports whether the title went to a dialog, and sets nothing when disabled", async () => {
		const reports: boolean[] = [];
		const report = (inDialog: boolean) => reports.push(inDialog);
		render(<SetTitle report={report} />);
		expect(reports.at(-1)).toBe(false);
		cleanup();
		render(
			<Framework>
				<FullFormDialog>
					<SetTitle enabled={false} report={report} />
				</FullFormDialog>
			</Framework>,
		);
		expect(await screen.findByRole("dialog")).not.toHaveAccessibleName();
		expect(reports.at(-1)).toBe(false);
		cleanup();
		render(
			<Framework>
				<FullFormDialog>
					<SetTitle report={report} />
				</FullFormDialog>
			</Framework>,
		);
		expect(
			await screen.findByRole("dialog", { name: "Hook title" }),
		).toBeInTheDocument();
		expect(reports.at(-1)).toBe(true);
	});
});
