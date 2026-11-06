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

const ImporterStory = (props: {
	guided: boolean;
	importConfig?: CrudImportProps<ModelUnknown>["importConfig"];
	howTo?: CrudImportProps<ModelUnknown>["howTo"];
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
