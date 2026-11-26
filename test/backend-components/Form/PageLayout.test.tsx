import "@testing-library/jest-dom/vitest";
import { describe, it, expect, afterEach, beforeAll, vi } from "vitest";
import React, { useState } from "react";
import {
	render,
	screen,
	act,
	waitFor,
	cleanup,
	fireEvent,
	within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Grid } from "@mui/material";
import { Framework, useDialogContext } from "../../../src/framework";
import FormDialog from "../../../src/backend-components/Form/FormDialog";
import Form, { PageProps } from "../../../src/backend-components/Form/Form";
import FormField from "../../../src/backend-components/Form/Field";
import DefaultFormPage from "../../../src/backend-components/Form/DefaultFormPage";
import DefaultErrorComponent from "../../../src/backend-components/Form/DefaultErrorComponent";
import FormLoaderOverlay from "../../../src/standalone/Form/FormLoaderOverlay";
import type { FormPageLayoutProps } from "../../../src/standalone/Form/FormPageLayout";
import createTestModel from "../../../src/stories/test-utils/TestModel";
import MockConnector from "../../../src/stories/test-utils/MockConnector";

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

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});

type TestModel = ReturnType<typeof createTestModel>;

const LOAD = { timeout: 10000 };

/**
 * Holds every connector update until the test calls release (or fail).
 */
const holdUpdates = (model: TestModel) => {
	const connector = model.connector as unknown as MockConnector;
	const original = connector.update.bind(connector);
	const pending: { release: () => void; fail: (e: Error) => void }[] = [];
	const spy = vi.spyOn(connector, "update").mockImplementation(
		(data) =>
			new Promise((resolve, reject) => {
				pending.push({
					release: () => resolve(original(data)),
					fail: reject,
				});
			}) as never,
	);
	return {
		spy,
		release: () => pending.shift()!.release(),
		fail: (e: Error) => pending.shift()!.fail(e),
	};
};

const makePage = (field: string, body?: React.ReactNode) => {
	const Page = (props: PageProps<TestModel, { goBack: () => void }>) => (
		<DefaultFormPage
			{...props}
			customProps={{
				...props.customProps,
				open: () => {},
				hasCustomSubmitHandler: false,
			}}
			autoBack={false}
		>
			<Grid container>
				<Grid size={12}>
					<FormField name={field} />
				</Grid>
				{body}
			</Grid>
		</DefaultFormPage>
	);
	return Page;
};

const FirstNamePage = makePage("first_name");

const renderPage = (
	model: TestModel,
	defaultTheme?: React.ComponentProps<typeof Framework>["defaultTheme"],
) =>
	render(
		<Framework defaultTheme={defaultTheme}>
			<Form
				model={model}
				id={"1"}
				errorComponent={DefaultErrorComponent}
				customProps={{ goBack: () => {} }}
				disableRouting
			>
				{FirstNamePage}
			</Form>
		</Framework>,
	);

const overlays = () =>
	Array.from(
		document.querySelectorAll<HTMLElement>(
			'[class*="CcFormLoaderOverlay-root"]',
		),
	);

const onlyOverlay = () => {
	const all = overlays();
	expect(all).toHaveLength(1);
	return all[0];
};

const saveButton = () => screen.getByRole("button", { name: /save/i });

/**
 * Types into the field and clicks Save; the save stays pending.
 */
const editAndSave = async (input: HTMLElement) => {
	fireEvent.change(input, { target: { value: "AliceX" } });
	await waitFor(() =>
		expect(saveButton()).not.toHaveAttribute("aria-disabled"),
	);
	fireEvent.click(saveButton());
	await act(async () => {});
};

describe("FormPageLayout and FormLoaderOverlay in a form page", () => {
	it("shows the busy overlay while a save is pending and hides it afterwards", async () => {
		const model = createTestModel();
		const updates = holdUpdates(model);
		renderPage(model);
		const input = await screen.findByDisplayValue("Alice", undefined, LOAD);

		expect(getComputedStyle(onlyOverlay()).visibility).toBe("hidden");
		expect(screen.queryByRole("progressbar")).toBeNull();

		await editAndSave(input);
		await waitFor(() =>
			expect(within(onlyOverlay()).getByRole("progressbar")).toBeVisible(),
		);
		expect(getComputedStyle(onlyOverlay()).visibility).toBe("visible");
		// Save stays a focusable button while saving, marked aria-disabled, and a second
		// click sends nothing
		expect(saveButton()).toHaveAttribute("aria-disabled", "true");
		expect(screen.getByDisplayValue("AliceX")).toBeDisabled();
		fireEvent.click(saveButton());
		expect(updates.spy).toHaveBeenCalledTimes(1);

		updates.release();
		await act(async () => {});
		await waitFor(() =>
			expect(within(onlyOverlay()).queryByRole("progressbar")).toBeNull(),
		);
		expect(getComputedStyle(onlyOverlay()).visibility).toBe("hidden");
		expect(screen.getByDisplayValue("AliceX")).toBeEnabled();
		expect(updates.spy).toHaveBeenCalledTimes(1);
	});

	it("hides the busy overlay and unlocks the form when the save fails", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		const model = createTestModel();
		const updates = holdUpdates(model);
		renderPage(model);
		const input = await screen.findByDisplayValue("Alice", undefined, LOAD);

		await editAndSave(input);
		await waitFor(() =>
			expect(within(onlyOverlay()).getByRole("progressbar")).toBeVisible(),
		);

		updates.fail(new Error("Server said no"));
		await act(async () => {});
		await waitFor(() =>
			expect(within(onlyOverlay()).queryByRole("progressbar")).toBeNull(),
		);
		expect(getComputedStyle(onlyOverlay()).visibility).toBe("hidden");
		// shown form-level, in an error dialog
		const dialog = await screen.findByRole("dialog");
		expect(dialog).toHaveTextContent("Server said no");
		fireEvent.click(within(dialog).getByRole("button"));
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
		expect(screen.getByDisplayValue("AliceX")).toBeEnabled();
		expect(saveButton()).not.toHaveAttribute("aria-disabled");
	});

	it("renders the theme's formPageLayoutComponent with body, footer and the busy overlay", async () => {
		const layout = vi.fn((p: FormPageLayoutProps) => (
			<div data-testid={"custom-layout"}>
				<div data-testid={"custom-body"}>{p.body}</div>
				<div data-testid={"custom-footer"}>{p.footer}</div>
				{p.other}
			</div>
		));
		const CustomLayout = (p: FormPageLayoutProps) => layout(p);
		const model = createTestModel();
		const updates = holdUpdates(model);
		renderPage(model, () => ({
			components: {
				CcBasicFormPage: {
					defaultProps: { formPageLayoutComponent: CustomLayout },
				},
			},
		}));
		const input = await screen.findByDisplayValue("Alice", undefined, LOAD);

		expect(
			document.querySelector('[class*="CcFormPageLayout-root"]'),
		).toBeNull();
		expect(screen.getByTestId("custom-body")).toContainElement(input);
		expect(screen.getByTestId("custom-footer")).toContainElement(saveButton());
		const props = layout.mock.calls.at(-1)![0];
		expect(Object.keys(props).sort()).toEqual(["body", "footer", "other"]);
		const other = props.other as React.ReactElement<{ visible: boolean }>;
		expect(other.type).toBe(FormLoaderOverlay);
		expect(other.props.visible).toBe(false);

		await editAndSave(input);
		await waitFor(() =>
			expect(
				(
					layout.mock.calls.at(-1)![0].other as React.ReactElement<{
						visible: boolean;
					}>
				).props.visible,
			).toBe(true),
		);
		expect(
			within(screen.getByTestId("custom-layout")).getByRole("progressbar"),
		).toBeInTheDocument();
		updates.release();
		await act(async () => {});
		await waitFor(() => expect(screen.queryByRole("progressbar")).toBeNull());
	});

	it("a nested form page hides the parent's footer and busy overlay until it unmounts", async () => {
		const innerModel = createTestModel();
		const InnerPage = makePage("last_name");
		const Toggle = () => {
			const [shown, setShown] = useState(false);
			return (
				<Grid size={12}>
					<button type={"button"} onClick={() => setShown((s) => !s)}>
						Toggle inner page
					</button>
					{shown && (
						<Form
							model={innerModel}
							id={"2"}
							errorComponent={DefaultErrorComponent}
							customProps={{ goBack: () => {} }}
							disableRouting
						>
							{InnerPage}
						</Form>
					)}
				</Grid>
			);
		};
		const OuterPage = makePage("first_name", <Toggle />);
		render(
			<Framework>
				<Form
					model={createTestModel()}
					id={"1"}
					errorComponent={DefaultErrorComponent}
					customProps={{ goBack: () => {} }}
					disableRouting
				>
					{OuterPage}
				</Form>
			</Framework>,
		);
		const outerInput = await screen.findByDisplayValue(
			"Alice",
			undefined,
			LOAD,
		);
		const outerRoot = document.querySelector<HTMLElement>(
			'[class*="CcFormPageLayout-root"]',
		)!;
		const outerBody = outerRoot.querySelector<HTMLElement>(
			'[class*="CcFormPageLayout-body"]',
		)!;
		// the outer layout's own footer, not the one of a page nested in its body
		const outerFooter = () =>
			outerRoot.querySelector<HTMLElement>(
				':scope > [class*="CcFormPageLayout-wrapper"] > [class*="CcFormPageLayout-footer"]',
			);
		expect(outerFooter()).toContainElement(saveButton());
		expect(onlyOverlay().parentElement).toBe(outerRoot);

		fireEvent.change(outerInput, { target: { value: "AliceX" } });
		outerInput.focus();
		fireEvent.click(screen.getByRole("button", { name: "Toggle inner page" }));
		await screen.findByDisplayValue("Smith", undefined, LOAD);

		// one button bar and one overlay: the inner page's, inside the outer body. The
		// inner page hides the parent's from an effect, so wait for the re-render.
		await waitFor(() =>
			expect(screen.getAllByRole("button", { name: /save/i })).toHaveLength(1),
		);
		expect(outerBody).toContainElement(saveButton());
		expect(outerBody).toContainElement(onlyOverlay());
		// no footer element, not an empty one
		expect(outerFooter()).toBeNull();

		fireEvent.click(screen.getByRole("button", { name: "Toggle inner page" }));
		await waitFor(() => expect(screen.queryByDisplayValue("Smith")).toBeNull());
		await waitFor(() => expect(outerFooter()).toContainElement(saveButton()));
		expect(onlyOverlay().parentElement).toBe(outerRoot);
		expect(screen.getByDisplayValue("AliceX")).toBe(outerInput);
	});

	it("[ISSUE-3473-ITEM-7] announces the save in a status region while the form is submitting", async () => {
		const model = createTestModel();
		const updates = holdUpdates(model);
		renderPage(model);
		const input = await screen.findByDisplayValue("Alice", undefined, LOAD);

		await editAndSave(input);
		await waitFor(() =>
			expect(within(onlyOverlay()).getByRole("progressbar")).toBeVisible(),
		);
		const statuses = screen.queryAllByRole("status");
		expect(
			statuses.some((s) => /\S/.test(s.textContent ?? "")),
			"no status region with a message while saving",
		).toBe(true);
		updates.release();
		await act(async () => {});
	});

	it("[ISSUE-3473-ITEM-7] marks the form busy while it saves and says that it is being saved, then falls silent", async () => {
		const model = createTestModel();
		const updates = holdUpdates(model);
		const { container } = renderPage(model);
		const input = await screen.findByDisplayValue("Alice", undefined, LOAD);
		const form = container.querySelector("form")!;
		const status = screen.getByRole("status");
		expect(form).not.toHaveAttribute("aria-busy");
		expect(status).toHaveTextContent(/^$/);

		await editAndSave(input);
		await waitFor(() =>
			expect(within(onlyOverlay()).getByRole("progressbar")).toBeVisible(),
		);
		expect(form).toHaveAttribute("aria-busy", "true");
		expect(screen.getByRole("status")).toBe(status);
		expect(status).toHaveTextContent(/^The form is currently being saved$/);
		expect(screen.getByRole("progressbar")).toHaveAccessibleName(
			"The form is currently being saved",
		);
		// not busy itself, so that the busy form around it does not hold it back
		expect(status).toHaveAttribute("aria-busy", "false");

		updates.release();
		await act(async () => {});
		await waitFor(() => expect(form).not.toHaveAttribute("aria-busy"));
		expect(status).toHaveTextContent(/^$/);
	});

	it("[ISSUE-3473-ITEM-10] keeps keyboard focus in the form page when Save is pressed", async () => {
		const user = userEvent.setup();
		const model = createTestModel();
		const updates = holdUpdates(model);
		renderPage(model);
		const input = await screen.findByDisplayValue("Alice", undefined, LOAD);
		fireEvent.change(input, { target: { value: "AliceX" } });
		await waitFor(() =>
			expect(saveButton()).not.toHaveAttribute("aria-disabled"),
		);
		saveButton().focus();
		expect(saveButton()).toHaveFocus();

		await user.keyboard("{Enter}");
		await waitFor(() =>
			expect(within(onlyOverlay()).getByRole("progressbar")).toBeVisible(),
		);
		const layout = document.querySelector('[class*="CcFormPageLayout-root"]')!;
		expect(
			layout.contains(document.activeElement),
			`focus moved to ${document.activeElement?.tagName} while saving`,
		).toBe(true);

		updates.release();
		await act(async () => {});
		await waitFor(() => expect(screen.queryByRole("progressbar")).toBeNull());
		expect(
			layout.contains(document.activeElement),
			`focus moved to ${document.activeElement?.tagName} after saving`,
		).toBe(true);
	});

	const renderFormDialog = (model: TestModel) => {
		const DialogForm = () => {
			const [, popDialog] = useDialogContext();
			return (
				<FormDialog dialogTitle={"Edit person"}>
					<Form
						model={model}
						id={"1"}
						errorComponent={DefaultErrorComponent}
						customProps={{ goBack: popDialog }}
						disableRouting
					>
						{FirstNamePage}
					</Form>
				</FormDialog>
			);
		};
		const Opener = () => {
			const [pushDialog] = useDialogContext();
			React.useEffect(() => {
				pushDialog(<DialogForm />);
			}, [pushDialog]);
			return null;
		};
		render(
			<Framework>
				<Opener />
			</Framework>,
		);
	};

	it("asks before Escape closes a form dialog with unsaved changes", async () => {
		renderFormDialog(createTestModel());
		const input = await screen.findByDisplayValue("Alice", undefined, LOAD);
		fireEvent.change(input, { target: { value: "AliceX" } });
		await waitFor(() =>
			expect(saveButton()).not.toHaveAttribute("aria-disabled"),
		);

		fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
		expect(await screen.findByText("Leave form page?")).toBeInTheDocument();
		expect(input.isConnected).toBe(true);
	});

	it("[ISSUE-3473-ITEM-4] Escape during a save does not close the form dialog without asking", async () => {
		const model = createTestModel();
		const updates = holdUpdates(model);
		renderFormDialog(model);
		const input = await screen.findByDisplayValue("Alice", undefined, LOAD);
		await editAndSave(input);
		await waitFor(() =>
			expect(within(onlyOverlay()).getByRole("progressbar")).toBeVisible(),
		);

		const edited = screen.getByDisplayValue("AliceX");
		fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
		await act(async () => {});
		// either the dialog stays open, or it asks first (then the form is still mounted
		// below the confirm dialog)
		expect(edited.isConnected, "the form dialog was closed mid-save").toBe(
			true,
		);
		updates.release();
		await act(async () => {});
	});

	it("[ISSUE-3473-ITEM-4] Escape during a save asks; No keeps the dialog, and a save that fails afterwards is shown", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		const model = createTestModel();
		const updates = holdUpdates(model);
		renderFormDialog(model);
		const input = await screen.findByDisplayValue("Alice", undefined, LOAD);
		await editAndSave(input);
		await waitFor(() =>
			expect(within(onlyOverlay()).getByRole("progressbar")).toBeVisible(),
		);

		fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
		const prompt = await screen.findByRole("dialog", {
			name: "Leave form page?",
		});
		fireEvent.click(within(prompt).getByRole("button", { name: "No" }));
		await waitFor(() =>
			expect(
				screen.queryByRole("dialog", { name: "Leave form page?" }),
			).toBeNull(),
		);

		updates.fail(new Error("Server said no"));
		const error = await screen.findByRole("dialog", { name: /error/i });
		expect(error).toHaveTextContent("Server said no");
		expect(screen.getByDisplayValue("AliceX")).toBeInTheDocument();
	});
});
