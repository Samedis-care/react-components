import React from "react";
import {
	describe,
	it,
	expect,
	vi,
	afterEach,
	beforeAll,
	beforeEach,
} from "vitest";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import { Tab } from "@mui/material";
import { createMemoryHistory, MemoryHistory } from "history";
import { Framework } from "../../src/framework";
import { setFrameworkHistory } from "../../src/framework/History";
import Routes from "../../src/standalone/Routes/Routes";
import Route from "../../src/standalone/Routes/Route";
import Form, { PageProps } from "../../src/backend-components/Form/Form";
import FormField from "../../src/backend-components/Form/Field";
import DefaultFormPage from "../../src/backend-components/Form/DefaultFormPage";
import DefaultErrorComponent from "../../src/backend-components/Form/DefaultErrorComponent";
import createTestModel from "../../src/stories/test-utils/TestModel";
import {
	RoutedTabPanelWrapper,
	RoutedTabs,
	useRoutedTabPanel,
} from "../../src/non-standalone/RoutedTabs";

// jsdom does not implement matchMedia, which the Framework's ThemeProvider needs.
beforeAll(() => {
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
});
beforeEach(() => {
	// useNavigate scrolls the window to the top on every tab click; jsdom does not implement it
	vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
});
afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});

const LOAD = { timeout: 10000 };
type TestModel = ReturnType<typeof createTestModel>;
type Page = React.ComponentType<PageProps<TestModel, { goBack: () => void }>>;

const pageCustomProps = (
	props: PageProps<TestModel, { goBack: () => void }>,
) => ({
	...props.customProps,
	open: () => {},
	hasCustomSubmitHandler: false,
});

/**
 * The form page wraps the tabs and the panels (SCF TenantContractForm,
 * FacilityDataForm, IMF RoleForm, UserForm)
 */
const TabsInsideFormPage: Page = (props) => {
	const tab = useRoutedTabPanel();
	return (
		<DefaultFormPage
			{...props}
			customProps={pageCustomProps(props)}
			autoBack={false}
		>
			<RoutedTabs aria-label="Record">
				<Tab label="General" value="" />
				<Tab label="More" value="more" />
			</RoutedTabs>
			<RoutedTabPanelWrapper>
				{[
					tab("more", <div>MORE PANEL</div>),
					tab("", <FormField name="first_name" />),
				]}
			</RoutedTabPanelWrapper>
		</DefaultFormPage>
	);
};

/**
 * The form page sits in the default panel, the tabs outside of it (IMF
 * ProfileForm)
 */
const FormPageInsidePanel: Page = (props) => {
	const tab = useRoutedTabPanel();
	return (
		<>
			<RoutedTabs aria-label="Record">
				<Tab label="General" value="" />
				<Tab label="More" value="more" />
			</RoutedTabs>
			<RoutedTabPanelWrapper>
				{[
					tab("more", <div>MORE PANEL</div>),
					tab(
						"",
						<DefaultFormPage
							{...props}
							customProps={pageCustomProps(props)}
							autoBack={false}
						>
							<FormField name="first_name" />
						</DefaultFormPage>,
					),
				]}
			</RoutedTabPanelWrapper>
		</>
	);
};

/**
 * The form page sits in the panel of the "more" tab, the tabs outside of it
 */
const FormPageInsideMorePanel: Page = (props) => {
	const tab = useRoutedTabPanel();
	return (
		<>
			<RoutedTabs aria-label="Record">
				<Tab label="General" value="" />
				<Tab label="More" value="more" />
			</RoutedTabs>
			<RoutedTabPanelWrapper>
				{[
					tab(
						"more",
						<DefaultFormPage
							{...props}
							customProps={pageCustomProps(props)}
							autoBack={false}
						>
							<FormField name="first_name" />
						</DefaultFormPage>,
					),
					tab("", <div>GENERAL PANEL</div>),
				]}
			</RoutedTabPanelWrapper>
		</>
	);
};

/** A form page with the first name only */
const FieldPage: Page = (props) => (
	<DefaultFormPage
		{...props}
		customProps={pageCustomProps(props)}
		autoBack={false}
	>
		<FormField name="first_name" />
	</DefaultFormPage>
);

/**
 * The Form itself sits in the default panel, the tabs outside of it: the route renders
 * the tabs and the panels, and the Form is the default tab's panel
 */
const FormInsideDefaultPanel = (props: { model: TestModel }) => {
	const tab = useRoutedTabPanel();
	return (
		<>
			<RoutedTabs aria-label="Record">
				<Tab label="General" value="" />
				<Tab label="More" value="more" />
			</RoutedTabs>
			<RoutedTabPanelWrapper>
				{[
					tab("more", <div>MORE PANEL</div>),
					tab(
						"",
						<Form
							model={props.model}
							id={"1"}
							errorComponent={DefaultErrorComponent}
							customProps={{ goBack: () => {} }}
						>
							{FieldPage}
						</Form>,
					),
				]}
			</RoutedTabPanelWrapper>
		</>
	);
};

/** The tabs and the panels with the Form in the default one under the route /rec/* */
const renderFormInPanel = (history: MemoryHistory) => {
	setFrameworkHistory(history);
	return render(
		<Framework>
			<Routes>
				{[
					<Route
						key="rec"
						path="/rec/*"
						element={<FormInsideDefaultPanel model={createTestModel()} />}
					/>,
				]}
			</Routes>
		</Framework>,
	);
};

/**
 * The tabs outside of a disableRouting Form, which sits in the default panel
 * (a disableRouting CRUD placed in a tab): a tab switch unmounts the Form
 */
const FormInsidePanel = (props: { model: TestModel }) => {
	const tab = useRoutedTabPanel();
	return (
		<>
			<RoutedTabs aria-label="Page">
				<Tab label="General" value="" />
				<Tab label="More" value="more" />
			</RoutedTabs>
			<RoutedTabPanelWrapper>
				{[
					tab("more", <div>MORE PANEL</div>),
					tab(
						"",
						<Form
							model={props.model}
							id={"1"}
							errorComponent={DefaultErrorComponent}
							customProps={{ goBack: () => {} }}
							disableRouting
						>
							{FieldPage}
						</Form>,
					),
				]}
			</RoutedTabPanelWrapper>
		</>
	);
};

/** A Form for record 1 under the route /rec/*, plus a page /other to leave to */
const renderForm = (
	history: MemoryHistory,
	page: Page,
	disableRouting: boolean,
) => {
	setFrameworkHistory(history);
	return render(
		<Framework>
			<Routes>
				{[
					<Route
						key="rec"
						path="/rec/*"
						element={
							<Form
								model={createTestModel()}
								id={"1"}
								errorComponent={DefaultErrorComponent}
								customProps={{ goBack: () => {} }}
								disableRouting={disableRouting}
							>
								{page}
							</Form>
						}
					/>,
					<Route key="other" path="/other" element={<div>OTHER PAGE</div>} />,
				]}
			</Routes>
		</Framework>,
	);
};

const tabEl = (name: string) => screen.getByRole("tab", { name });

/**
 * Whether a beforeunload event right now would be cancelled (the browser's "leave site?")
 */
const unloadIsBlocked = () => {
	const event = new Event("beforeunload", { cancelable: true });
	window.dispatchEvent(event);
	return event.defaultPrevented;
};

/** Types into the first name, so the form is dirty */
const makeDirty = async () => {
	const input = await screen.findByDisplayValue("Alice", undefined, LOAD);
	fireEvent.change(input, { target: { value: "AliceX" } });
	await waitFor(() =>
		expect(screen.getByRole("button", { name: /save/i })).toBeEnabled(),
	);
};

describe("RoutedTabs in a form", () => {
	it("routed form: a tab switch on a dirty form is not prompted and keeps the edit; leaving the page is prompted", async () => {
		const h = createMemoryHistory({ initialEntries: ["/rec"] });
		renderForm(h, TabsInsideFormPage, false);
		await makeDirty();
		fireEvent.click(tabEl("More"));
		await waitFor(() => expect(h.location.pathname).toBe("/rec/more"));
		expect(screen.getByText("MORE PANEL")).toBeInTheDocument();
		expect(screen.queryByText("Leave form page?")).toBeNull();
		fireEvent.click(tabEl("General"));
		expect(await screen.findByDisplayValue("AliceX")).toBeInTheDocument();
		act(() => h.push("/other"));
		expect(await screen.findByText("Leave form page?")).toBeInTheDocument();
		expect(h.location.pathname).not.toBe("/other");
		expect(screen.queryByText("OTHER PAGE")).toBeNull();
	});

	it("disableRouting form inside a tab panel: a tab switch on a dirty form is prompted, because it unmounts the form and loses the edit", async () => {
		const h = createMemoryHistory({ initialEntries: ["/rec"] });
		setFrameworkHistory(h);
		const model = createTestModel();
		render(
			<Framework>
				<Routes>
					{[
						<Route
							key="rec"
							path="/rec/*"
							element={<FormInsidePanel model={model} />}
						/>,
					]}
				</Routes>
			</Framework>,
		);
		await makeDirty();
		fireEvent.click(tabEl("More"));
		expect(await screen.findByText("Leave form page?")).toBeInTheDocument();
		expect(h.location.pathname).toBe("/rec");
		fireEvent.click(screen.getByRole("button", { name: "Yes" }));
		expect(await screen.findByText("MORE PANEL")).toBeInTheDocument();
		expect(h.location.pathname).toBe("/rec/more");
		fireEvent.click(tabEl("General"));
		expect(
			await screen.findByDisplayValue("Alice", undefined, LOAD),
		).toBeInTheDocument();
		expect(screen.queryByDisplayValue("AliceX")).toBeNull();
	});

	it("[ISSUE-3500-ITEM-4] a form page inside a tab panel keeps guarding its unsaved changes after another tab was opened", async () => {
		const h = createMemoryHistory({ initialEntries: ["/rec"] });
		renderForm(h, FormPageInsidePanel, false);
		await makeDirty();
		fireEvent.click(tabEl("More"));
		await waitFor(() => expect(h.location.pathname).toBe("/rec/more"));
		expect(screen.getByText("MORE PANEL")).toBeInTheDocument();
		act(() => h.push("/other"));
		await act(async () => {});
		expect(screen.queryByText("OTHER PAGE")).toBeNull();
		expect(h.location.pathname).not.toBe("/other");
		expect(screen.getByText("Leave form page?")).toBeInTheDocument();
	});

	it("[ISSUE-3500-ITEM-4] closing the browser tab still asks after another tab was opened, until the form is saved", async () => {
		const h = createMemoryHistory({ initialEntries: ["/rec"] });
		renderForm(h, FormPageInsidePanel, false);
		await makeDirty();
		fireEvent.click(tabEl("More"));
		await waitFor(() => expect(h.location.pathname).toBe("/rec/more"));
		expect(unloadIsBlocked()).toBe(true);

		fireEvent.click(tabEl("General"));
		fireEvent.click(await screen.findByRole("button", { name: /save/i }));
		await waitFor(() => expect(unloadIsBlocked()).toBe(false));
		act(() => h.push("/other"));
		expect(await screen.findByText("OTHER PAGE")).toBeInTheDocument();
		expect(screen.queryByText("Leave form page?")).toBeNull();
	});

	it("[ISSUE-3500-ITEM-4] a form page in another tab's panel: opening the default tab keeps the edit without asking, leaving the form asks", async () => {
		const h = createMemoryHistory({ initialEntries: ["/rec/more"] });
		renderForm(h, FormPageInsideMorePanel, false);
		await makeDirty();
		fireEvent.click(tabEl("General"));
		expect(await screen.findByText("GENERAL PANEL")).toBeInTheDocument();
		expect(screen.queryByText("Leave form page?")).toBeNull();
		expect(unloadIsBlocked()).toBe(true);

		fireEvent.click(tabEl("More"));
		expect(await screen.findByDisplayValue("AliceX")).toBeInTheDocument();
		act(() => h.push("/other"));
		expect(await screen.findByText("Leave form page?")).toBeInTheDocument();
		expect(h.location.pathname).toBe("/rec/more");
	});

	it("[ISSUE-3500-ITEM-4] the guard ends with the Form: closing the Form after another tab was opened leaves nothing guarded", async () => {
		const h = createMemoryHistory({ initialEntries: ["/rec"] });
		setFrameworkHistory(h);
		const model = createTestModel();
		const ClosableForm = () => {
			const [open, setOpen] = React.useState(true);
			return (
				<>
					<button type={"button"} onClick={() => setOpen(false)}>
						Close form
					</button>
					{open && (
						<Routes>
							{[
								<Route
									key="rec"
									path="/rec/*"
									element={
										<Form
											model={model}
											id={"1"}
											errorComponent={DefaultErrorComponent}
											customProps={{ goBack: () => {} }}
										>
											{FormPageInsidePanel}
										</Form>
									}
								/>,
							]}
						</Routes>
					)}
				</>
			);
		};
		render(
			<Framework>
				<ClosableForm />
			</Framework>,
		);
		await makeDirty();
		fireEvent.click(tabEl("More"));
		await waitFor(() => expect(h.location.pathname).toBe("/rec/more"));
		expect(unloadIsBlocked()).toBe(true);

		fireEvent.click(screen.getByRole("button", { name: "Close form" }));
		expect(unloadIsBlocked()).toBe(false);
		act(() => h.push("/other"));
		await act(async () => {});
		expect(h.location.pathname).toBe("/other");
		expect(screen.queryByText("Leave form page?")).toBeNull();
	});

	it("[ISSUE-3500-ITEM-24] a routed Form in the default panel: a tab switch on a dirty form is prompted", async () => {
		const h = createMemoryHistory({ initialEntries: ["/rec"] });
		renderFormInPanel(h);
		await makeDirty();
		fireEvent.click(tabEl("More"));
		const prompt = await screen.findByRole("dialog", {
			name: "Leave form page?",
		});
		expect(h.location.pathname).toBe("/rec");
		expect(screen.queryByText("MORE PANEL")).toBeNull();
		expect(screen.getByDisplayValue("AliceX")).toBeInTheDocument();

		// No stays on the tab with the edit
		fireEvent.click(within(prompt).getByRole("button", { name: "No" }));
		await waitFor(() =>
			expect(
				screen.queryByRole("dialog", { name: "Leave form page?" }),
			).toBeNull(),
		);
		expect(h.location.pathname).toBe("/rec");
		expect(screen.getByDisplayValue("AliceX")).toBeInTheDocument();

		// Yes opens the tab, and the edit is gone with the Form
		fireEvent.click(tabEl("More"));
		fireEvent.click(
			within(
				await screen.findByRole("dialog", { name: "Leave form page?" }),
			).getByRole("button", { name: "Yes" }),
		);
		expect(await screen.findByText("MORE PANEL")).toBeInTheDocument();
		expect(h.location.pathname).toBe("/rec/more");
		fireEvent.click(tabEl("General"));
		expect(
			await screen.findByDisplayValue("Alice", undefined, LOAD),
		).toBeInTheDocument();
	});

	it("[ISSUE-3500-ITEM-24] a routed Form in the default panel: a navigation that keeps the default panel passes without a prompt", async () => {
		const h = createMemoryHistory({ initialEntries: ["/rec"] });
		renderFormInPanel(h);
		await makeDirty();
		// no tab claims /rec/details, so the default panel and the Form stay
		act(() => h.push("/rec/details"));
		await act(async () => {});
		expect(h.location.pathname).toBe("/rec/details");
		expect(screen.queryByText("Leave form page?")).toBeNull();
		expect(screen.getByDisplayValue("AliceX")).toBeInTheDocument();
		// and leaving the Form still asks
		act(() => h.push("/rec/more"));
		expect(await screen.findByText("Leave form page?")).toBeInTheDocument();
		expect(h.location.pathname).toBe("/rec/details");
	});

	it("[ISSUE-3500-ITEM-5] disableRouting form: a tab switch on a dirty form is not prompted", async () => {
		const h = createMemoryHistory({ initialEntries: ["/rec"] });
		renderForm(h, TabsInsideFormPage, true);
		await makeDirty();
		fireEvent.click(tabEl("More"));
		await act(async () => {});
		expect(screen.queryByText("Leave form page?")).toBeNull();
		expect(h.location.pathname).toBe("/rec/more");
		expect(screen.getByText("MORE PANEL")).toBeInTheDocument();
	});

	it("[ISSUE-3500-ITEM-5] disableRouting form: the edit is still there after a tab switch and the browser's back, and leaving the page asks", async () => {
		const h = createMemoryHistory({ initialEntries: ["/rec"] });
		renderForm(h, TabsInsideFormPage, true);
		await makeDirty();
		fireEvent.click(tabEl("More"));
		await waitFor(() => expect(h.location.pathname).toBe("/rec/more"));
		act(() => h.back());
		await act(async () => {});
		expect(h.location.pathname).toBe("/rec");
		expect(screen.queryByText("Leave form page?")).toBeNull();
		expect(await screen.findByDisplayValue("AliceX")).toBeInTheDocument();

		act(() => h.push("/other"));
		expect(await screen.findByText("Leave form page?")).toBeInTheDocument();
		expect(h.location.pathname).toBe("/rec");
		expect(screen.queryByText("OTHER PAGE")).toBeNull();
	});

	it("[ISSUE-3500-ITEM-5] disableRouting form with its form page in the default panel: a tab switch keeps the edit without asking, leaving the Form asks", async () => {
		const h = createMemoryHistory({ initialEntries: ["/rec"] });
		renderForm(h, FormPageInsidePanel, true);
		await makeDirty();
		fireEvent.click(tabEl("More"));
		await act(async () => {});
		expect(screen.queryByText("Leave form page?")).toBeNull();
		expect(h.location.pathname).toBe("/rec/more");
		expect(screen.getByText("MORE PANEL")).toBeInTheDocument();

		fireEvent.click(tabEl("General"));
		expect(await screen.findByDisplayValue("AliceX")).toBeInTheDocument();
		act(() => h.push("/other"));
		expect(await screen.findByText("Leave form page?")).toBeInTheDocument();
		expect(h.location.pathname).not.toBe("/other");
		expect(screen.queryByText("OTHER PAGE")).toBeNull();
	});
});
