import "@testing-library/jest-dom/vitest";
import { describe, it, expect, afterEach, beforeAll, vi } from "vitest";
import React from "react";
import {
	render,
	screen,
	act,
	waitFor,
	cleanup,
	fireEvent,
	within,
} from "@testing-library/react";
import { Grid } from "@mui/material";
import { Framework, useDialogContext } from "../../../src/framework";
import FormDialog from "../../../src/backend-components/Form/FormDialog";
import Form, { PageProps } from "../../../src/backend-components/Form/Form";
import FormField from "../../../src/backend-components/Form/Field";
import DefaultFormPage from "../../../src/backend-components/Form/DefaultFormPage";
import DefaultErrorComponent from "../../../src/backend-components/Form/DefaultErrorComponent";
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
	await waitFor(() => expect(saveButton()).toBeEnabled());
	fireEvent.click(saveButton());
	await act(async () => {});
};

describe("FormPageLayout and FormLoaderOverlay in a form page", () => {
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
		await waitFor(() => expect(saveButton()).toBeEnabled());

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
