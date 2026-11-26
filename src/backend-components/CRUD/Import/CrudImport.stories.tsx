import React, { useEffect, useMemo } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, userEvent, waitFor, within } from "storybook/test";
import XLSX from "xlsx";
import { Framework, usePermissionContext } from "../../../framework";
import CRUD from "../index";
import CrudImport, { CrudImportProps } from "./index";
import DefaultErrorComponent from "../../Form/DefaultErrorComponent";
import createTestModel from "../../../stories/test-utils/TestModel";
import { ModelUnknown } from "../../../backend-integration";
import { ValidationResult } from "../../Form";
import {
	edgesPast,
	pageScrollsSideways,
} from "../../../stories/test-utils/hiddenTextLayout";

const FrameworkDecorator = (Story: React.ComponentType) => (
	<Framework>
		<div style={{ width: "100%", height: "100vh" }}>
			<Story />
		</div>
	</Framework>
);

const meta: Meta = {
	title: "Backend-Components/CRUD/Import",
	decorators: [FrameworkDecorator],
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"`CrudImport` is the import wizard CRUD shows at `<url>/import` (guided) and `<url>/devimport` (unguided), or for the views `import`/`devimport` with `disableRouting`. It reads the first worksheet of one `.xlsx` file (step 1, Upload data), converts every row into a record with one function per model field (step 2, Connect data: JavaScript typed per field, unguided only; guided, CRUD's `importConfig` supplies the functions), validates every converted record (step 3, Validation & Review: Next only when no row has an error) and then creates (or, with `importUpdateKey`, updates) one record per row from the browser, ten requests at a time (step 4, Import data). Finish returns to the reloaded list. It runs inside a CRUD only and needs a parent with a height. These stories render the real importer (not lazy) in a `disableRouting` CRUD over the test model.",
			},
		},
	},
};

export default meta;

const ALL_PERMISSIONS = [
	"crud.delete",
	"crud.read",
	"crud.edit",
	"crud.new",
	"crud.export",
];

const PermissionSetter = (props: { children: React.ReactNode }) => {
	const [perms, setPerms] = usePermissionContext();
	useEffect(() => {
		setPerms(ALL_PERMISSIONS);
	}, [setPerms]);
	// render CRUD only once the permissions apply, so its first render sees them
	if (perms.length === 0) return null;
	return <>{props.children}</>;
};

/**
 * The conversion of the guided stories: the template's headers are the field labels
 */
const IMPORT_CONFIG: CrudImportProps<ModelUnknown>["importConfig"] = {
	first_name: (record) => record["First name"],
	last_name: (record) => record["Last name"],
	email: (record) => record["Email"],
	department: (record) => record["Department"],
};

const HOW_TO = [
	"Download the template and fill in one person per row.",
	"Upload the file, check the review and start the import.",
];

const ImporterStory = (props: {
	guided: boolean;
	importConfig?: CrudImportProps<ModelUnknown>["importConfig"];
	howTo?: CrudImportProps<ModelUnknown>["howTo"];
	validate?: CrudImportProps<ModelUnknown>["validate"];
}) => {
	const model = useMemo(createTestModel, []);
	return (
		<PermissionSetter>
			<CRUD
				model={model}
				formProps={{ errorComponent: DefaultErrorComponent }}
				gridProps={{}}
				deletePermission="crud.delete"
				readPermission="crud.read"
				editPermission="crud.edit"
				newPermission="crud.new"
				exportPermission="crud.export"
				disableRouting
				enableUserImport
				importUI={CrudImport as never}
				initialView={props.guided ? "import" : "devimport"}
				importConfig={props.importConfig}
				importHowTo={props.howTo}
				importValidate={props.validate}
			>
				{() => <div>record page</div>}
			</CRUD>
		</PermissionSetter>
	);
};

const PEOPLE = [
	["First name", "Last name", "Email", "Department"],
	["Ada", "Lovelace", "ada@example.com", "Engineering"],
	["Grace", "Hopper", "grace@example.com", "Engineering"],
];

/** An .xlsx file with the rows on one sheet "Data" */
const xlsxFile = (rows: unknown[][] = PEOPLE, name = "people.xlsx") => {
	const wb = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), "Data");
	return new File(
		[XLSX.write(wb, { type: "array", bookType: "xlsx" }) as ArrayBuffer],
		name,
	);
};

/** Picks the file through the upload's hidden file input */
const pickFile = async (canvasElement: HTMLElement, file = xlsxFile()) => {
	const input =
		canvasElement.querySelector<HTMLInputElement>("input[type=file]");
	if (!input) throw new Error("no file input");
	await userEvent.upload(input, file);
};

const LOAD = { timeout: 10000 };

/**
 * Bug (ISSUE-3508-ITEM-23): Back from Connect data disables the focused Back (step 1 has no Back),
 * and keyboard focus falls to the page instead of staying in the wizard. The import step
 * has the same defect (Issue3508Item23FocusStaysInTheWizardWhenTheImportRuns).
 */
export const Issue3508Item23FocusStaysInTheWizardOnAStepChange: StoryObj = {
	render: () => <ImporterStory guided={false} />,
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await canvas.findByText("Upload data", undefined, LOAD);
		const next = () => canvas.getByRole("button", { name: "Next" });
		await pickFile(canvasElement);
		await waitFor(() => expect(next()).toBeEnabled(), LOAD);
		next().focus();
		await userEvent.keyboard("{Enter}");
		await canvas.findByText('record["First name"]', undefined, LOAD);
		// Next stayed enabled, so it kept the focus
		await expect(next()).toHaveFocus();

		const back = canvas.getByRole("button", { name: "Back" });
		back.focus();
		await userEvent.keyboard("{Enter}");
		await canvas.findByRole("button", { name: "Upload" }, LOAD);
		await waitFor(() => expect(back).toBeDisabled());
		await expect(document.activeElement).not.toBe(document.body);
		await expect(canvasElement.contains(document.activeElement)).toBe(true);
	},
};

/**
 * Bug (ISSUE-3508-ITEM-23): Next on the review turns into a disabled Finish while the import runs,
 * so keyboard focus falls to the page, and it is still there when Finish is enabled.
 */
export const Issue3508Item23FocusStaysInTheWizardWhenTheImportRuns: StoryObj = {
	render: () => (
		<ImporterStory guided importConfig={IMPORT_CONFIG} howTo={HOW_TO} />
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await canvas.findByText(HOW_TO[0], undefined, LOAD);
		const next = () => canvas.getByRole("button", { name: "Next" });
		await pickFile(canvasElement);
		await waitFor(() => expect(next()).toBeEnabled(), LOAD);
		await userEvent.click(next());
		await canvas.findByText("ada@example.com", undefined, LOAD);
		await waitFor(() => expect(next()).toBeEnabled(), LOAD);
		next().focus();
		await userEvent.keyboard("{Enter}");
		const finish = await canvas.findByRole("button", { name: "Finish" });
		await waitFor(() => expect(finish).toBeEnabled(), LOAD);
		await expect(document.activeElement).not.toBe(document.body);
		await expect(canvasElement.contains(document.activeElement)).toBe(true);
	},
};

/**
 * ISSUE-3508-ITEM-23: where the focus goes, by keyboard only. When a step change disables
 * the focused Back or Next, the new step (a group named after it) takes the focus; Next
 * gets it back once the review passed, also on a second visit of the review, and Finish
 * once the import is done.
 */
export const Issue3508Item23FocusGoesToTheStepAndBackToNextAndFinish: StoryObj =
	{
		render: () => (
			<ImporterStory guided importConfig={IMPORT_CONFIG} howTo={HOW_TO} />
		),
		parameters: { a11y: { test: "error" } },
		play: async ({ canvasElement }) => {
			const canvas = within(canvasElement);
			await canvas.findByText(HOW_TO[0], undefined, LOAD);
			const next = () => canvas.getByRole("button", { name: "Next" });
			await pickFile(canvasElement);
			await waitFor(() => expect(next()).toBeEnabled(), LOAD);
			next().focus();
			await userEvent.keyboard("{Enter}");
			// Next is disabled until the review passed, then it has the focus again
			await canvas.findByText("ada@example.com", undefined, LOAD);
			await waitFor(() => expect(next()).toHaveFocus(), LOAD);

			// Back to the upload disables the focused Back: the upload step takes the focus
			canvas.getByRole("button", { name: "Back" }).focus();
			await userEvent.keyboard("{Enter}");
			const upload = await canvas.findByRole(
				"group",
				{ name: "Upload data" },
				LOAD,
			);
			await waitFor(() => expect(upload).toHaveFocus());
			// the next Tab goes into the step, not out of the wizard
			await userEvent.tab();
			await expect(upload.contains(document.activeElement)).toBe(true);

			// the review again: it checks the rows again before Next gets the focus back
			next().focus();
			await userEvent.keyboard("{Enter}");
			await canvas.findByText("ada@example.com", undefined, LOAD);
			await waitFor(() => expect(next()).toHaveFocus(), LOAD);

			// Next turns into a disabled Finish while the import runs, Finish gets the focus
			// when it is done
			await userEvent.keyboard("{Enter}");
			const finish = await canvas.findByRole(
				"button",
				{ name: "Finish" },
				LOAD,
			);
			await waitFor(() => expect(finish).toBeEnabled(), LOAD);
			await waitFor(() => expect(finish).toHaveFocus());
			await expect(canvas.getByText("Success: 2")).toBeVisible();
		},
	};

/**
 * ISSUE-3508-ITEM-23: a review with an error keeps Next disabled, so the focus that Next
 * had stays on the review step (a group named after it), from where Tab goes into the
 * review.
 */
export const Issue3508Item23FocusStaysOnAReviewWithErrors: StoryObj = {
	render: () => (
		<ImporterStory
			guided
			importConfig={{
				...IMPORT_CONFIG,
				email: (record) => {
					if (record["First name"] === "Grace")
						throw new Error("Grace has no account");
					return record["Email"];
				},
			}}
			howTo={HOW_TO}
		/>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await canvas.findByText(HOW_TO[0], undefined, LOAD);
		const next = () => canvas.getByRole("button", { name: "Next" });
		await pickFile(canvasElement);
		await waitFor(() => expect(next()).toBeEnabled(), LOAD);
		next().focus();
		await userEvent.keyboard("{Enter}");
		const review = await canvas.findByRole(
			"group",
			{ name: "Validation & Review" },
			LOAD,
		);
		// the review is done (its grid is shown) and has an error
		await canvas.findAllByText("Data conversion errors", undefined, LOAD);
		await expect(next()).toBeDisabled();
		await expect(review).toHaveFocus();
	},
};

/**
 * The extra validation of Issue3508Item23FocusReturnsToNextAfterASlowReview: every call
 * waits until the play releases the review
 */
const slowReview = (() => {
	let pending: (() => void)[] = [];
	let released = false;
	return {
		validate: () =>
			new Promise<ValidationResult>((resolve) => {
				if (released) resolve({});
				else pending.push(() => resolve({}));
			}),
		release: () => {
			released = true;
			pending.forEach((resolve) => resolve());
			pending = [];
		},
		reset: () => {
			released = false;
			pending = [];
		},
	};
})();

/**
 * ISSUE-3508-ITEM-23: a review that takes longer (an async importValidate) keeps Next
 * disabled while it runs: the review step has the focus meanwhile, and Next gets it back
 * when the review passed.
 */
export const Issue3508Item23FocusReturnsToNextAfterASlowReview: StoryObj = {
	render: () => (
		<ImporterStory
			guided
			importConfig={IMPORT_CONFIG}
			howTo={HOW_TO}
			validate={slowReview.validate}
		/>
	),
	beforeEach: () => slowReview.reset(),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await canvas.findByText(HOW_TO[0], undefined, LOAD);
		const next = () => canvas.getByRole("button", { name: "Next" });
		await pickFile(canvasElement);
		await waitFor(() => expect(next()).toBeEnabled(), LOAD);
		next().focus();
		await userEvent.keyboard("{Enter}");
		const review = await canvas.findByRole(
			"group",
			{ name: "Validation & Review" },
			LOAD,
		);
		await expect(next()).toBeDisabled();
		await waitFor(() => expect(review).toHaveFocus());
		slowReview.release();
		await canvas.findByText("ada@example.com", undefined, LOAD);
		await waitFor(() => expect(next()).toBeEnabled(), LOAD);
		await expect(next()).toHaveFocus();
	},
};

/**
 * Bug (ISSUE-3508-ITEM-28): while a typed script is checked (1 s), its card shows a spinner that is
 * an unnamed progressbar (axe aria-progressbar-name). The play ends while the check runs,
 * and checks the name itself as well.
 */
export const Issue3508Item28PendingScriptCheckHasAName: StoryObj = {
	render: () => <ImporterStory guided={false} />,
	parameters: { a11y: { test: "error" } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await canvas.findByText("Upload data", undefined, LOAD);
		const next = () => canvas.getByRole("button", { name: "Next" });
		await pickFile(canvasElement);
		await waitFor(() => expect(next()).toBeEnabled(), LOAD);
		await userEvent.click(next());
		await canvas.findByText('record["First name"]', undefined, LOAD);
		const script = canvasElement.querySelector<HTMLTextAreaElement>(
			'textarea[name="first_name"]',
		)!;
		await userEvent.type(script, "5");
		// the check runs a second after the last keystroke, so it is still pending here
		const spinner = canvas.getByRole("progressbar", { hidden: true });
		// a spinner screen readers reach needs a name
		if (canvas.queryByRole("progressbar"))
			await expect(spinner).toHaveAccessibleName();
	},
};

export const Issue3473Item16HiddenScriptStatusStaysInside: StoryObj = {
	globals: { viewport: { value: "mobile1", isRotated: false } },
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3473-ITEM-16: at 320px in a right-to-left part of a left-to-right page, the visually hidden status of each script's check on Connect data lies inside the card of its field, the box it is placed in, so it never makes the page scroll sideways. With MUI's visually hidden style, its -1px margin put it 1px past the top and start edges of its container wherever it began the container.",
			},
		},
	},
	render: () => (
		<div dir={"rtl"}>
			<ImporterStory guided={false} />
		</div>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await canvas.findByText("Upload data", undefined, LOAD);
		const next = () => canvas.getByRole("button", { name: "Next" });
		await pickFile(canvasElement);
		await waitFor(() => expect(next()).toBeEnabled(), LOAD);
		await userEvent.click(next());
		await canvas.findByText('record["First name"]', undefined, LOAD);
		const statuses = canvasElement.querySelectorAll<HTMLElement>(
			'[class*="CcCrudImportStep2-statusText"]',
		);
		await expect(statuses.length).toBeGreaterThan(0);
		// each in the card of its field, not in a corner of the page
		for (const status of statuses)
			await expect(edgesPast(status, status.closest(".MuiCard-root"))).toEqual(
				[],
			);
		await expect(pageScrollsSideways()).toBe(false);
	},
};
