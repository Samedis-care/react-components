/**
 * Shared scaffolding of the CRUD tests: a stub grid (via `gridComponent`) that records the
 * props CRUD computes for it, a stub importer (via `importUI`), a DefaultFormPage over the
 * people model with a probe of the Form's context, a permission gate, and mounts as a routed
 * CRUD (memory history, `<Route path="/rec/*">`) or as a disableRouting CRUD.
 *
 * The stub grid keeps the virtualized DataGrid out of jsdom: a test asserts exactly what CRUD
 * passes to BackendDataGrid. The real grid runs in the stories.
 *
 * Not a test file itself (no `.test.` in the name), so vitest only runs it through the files
 * that import it.
 */
import React, { useEffect, useImperativeHandle } from "react";
import {
	act,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { beforeEach, expect, vi } from "vitest";
import { createMemoryHistory, MemoryHistory } from "history";
import { Framework, usePermissionContext } from "../../../src/framework";
import { setFrameworkHistory } from "../../../src/framework/History";
import Routes from "../../../src/standalone/Routes/Routes";
import Route from "../../../src/standalone/Routes/Route";
import CRUD, {
	CrudDispatch,
	CrudFormProps,
	CrudProps,
} from "../../../src/backend-components/CRUD";
import type { CrudImportProps } from "../../../src/backend-components/CRUD/Import";
import {
	PageProps,
	useFormContextLite,
} from "../../../src/backend-components/Form/Form";
import FormField from "../../../src/backend-components/Form/Field";
import DefaultFormPage from "../../../src/backend-components/Form/DefaultFormPage";
import DefaultErrorComponent from "../../../src/backend-components/Form/DefaultErrorComponent";
import type { ModelUnknown } from "../../../src/backend-integration";
import type { BackendDataGridProps } from "../../../src/backend-components/DataGrid";
import type {
	DataGridDispatch,
	DataGridQuery,
} from "../../../src/standalone/DataGrid/DataGrid";
import {
	connectorOf,
	LOAD,
	makePeopleModel,
	PeopleModel,
	setupPageTests,
} from "../Form/pageFixture";

export { LOAD, connectorOf };

type GridProps = BackendDataGridProps<ModelUnknown>;

/**
 * What the stub grids saw: mounts, renders and the props of every render
 */
export const gridLog = {
	mounts: 0,
	renders: 0,
	props: [] as GridProps[],
};

/**
 * The props of the stub grid's latest render
 */
export const lastGrid = () => gridLog.props[gridLog.props.length - 1];

/**
 * The query the stub grid's ref returns
 */
export const STUB_QUERY: DataGridQuery = {
	quickFilter: "",
	additionalFilters: {},
	fieldFilter: {},
	sort: [],
};

const StubGridInner = (props: GridProps, ref: React.Ref<DataGridDispatch>) => {
	gridLog.renders++;
	gridLog.props.push(props);
	useEffect(() => {
		gridLog.mounts++;
	}, []);
	useImperativeHandle(
		ref,
		() => ({ updateRow: () => {}, getQuery: () => STUB_QUERY }),
		[],
	);
	const { onEdit, onImport } = props;
	return (
		<div data-testid={"grid"}>
			<button type={"button"} onClick={() => onEdit?.("1")}>
				Edit 1
			</button>
			<button type={"button"} onClick={() => onImport?.()}>
				Import
			</button>
		</div>
	);
};

/**
 * A BackendDataGrid stand-in that records its props and forwards a ref with getQuery
 */
export const StubGrid = React.forwardRef(
	StubGridInner,
) as unknown as NonNullable<CrudProps<ModelUnknown>["gridComponent"]>;

/**
 * StubGrid behind React.memo, like the real BackendDataGrid: it only renders when a prop
 * changed
 */
export const MemoStubGrid = React.memo(
	React.forwardRef(StubGridInner),
) as unknown as NonNullable<CrudProps<ModelUnknown>["gridComponent"]>;

/**
 * A stub grid that does not forward its ref (as SCF's phone list does not)
 */
export const RefLessGrid = ((props: GridProps) => {
	gridLog.props.push(props);
	return <div data-testid={"grid"} />;
}) as unknown as NonNullable<CrudProps<ModelUnknown>["gridComponent"]>;

/**
 * An importer stand-in that prints the props CRUD gives it
 */
export const StubImport = (props: CrudImportProps<ModelUnknown>) => (
	<div data-testid={"importer"}>
		{"IMPORT guided=" +
			String(props.guided) +
			" config=" +
			String(!!props.importConfig) +
			" updateKey=" +
			String(props.updateKey) +
			" filters=" +
			JSON.stringify(props.updateKeyAdditionalFilters ?? null) +
			" howTo=" +
			String(typeof props.howTo) +
			" validate=" +
			String(typeof props.validate)}
	</div>
);

/**
 * The page props of the latest render of the form page, to call customProps from a test
 */
export const pageLog = {
	mounts: 0,
	current: null as PageProps<ModelUnknown, CrudFormProps> | null,
};

/**
 * Prints the Form's id, readOnlyReasons and customProps (functions as "fn")
 */
const FormProbe = () => {
	const { id, readOnlyReasons, customProps } = useFormContextLite<
		ModelUnknown,
		CrudFormProps
	>();
	const cp = Object.fromEntries(
		Object.entries(customProps as unknown as Record<string, unknown>).map(
			([key, value]) => [key, typeof value === "function" ? "fn" : value],
		),
	);
	return (
		<>
			<div data-testid={"form-id"}>{String(id)}</div>
			<div data-testid={"reasons"}>{JSON.stringify(readOnlyReasons)}</div>
			<div data-testid={"custom-props"}>{JSON.stringify(cp)}</div>
		</>
	);
};

const PageMountCounter = () => {
	useEffect(() => {
		pageLog.mounts++;
	}, []);
	return null;
};

/**
 * The record page: a DefaultFormPage (no autoBack) with the four people fields and the
 * FormProbe
 */
export const Page = (props: PageProps<ModelUnknown, CrudFormProps>) => {
	pageLog.current = props;
	return (
		<DefaultFormPage {...props} autoBack={false}>
			<PageMountCounter />
			<FormField name="first_name" />
			<FormField name="last_name" />
			<FormField name="email" />
			<FormField name="department" />
			<FormProbe />
		</DefaultFormPage>
	);
};

/**
 * Sets the permissions and renders the children only once they are applied, so CRUD's
 * first render already sees them
 */
export const SetPerms = (props: {
	perms: string[];
	children: React.ReactNode;
}) => {
	const [perms, setPerms] = usePermissionContext();
	useEffect(() => {
		setPerms(props.perms);
	}, [setPerms, props.perms]);
	if (perms.length !== props.perms.length) return null;
	return <>{props.children}</>;
};

export const ALL = [
	"crud.delete",
	"crud.read",
	"crud.edit",
	"crud.new",
	"crud.export",
];

export type CP = Partial<CrudProps<ModelUnknown>>;

/**
 * A CRUD over the model with the crud.* permissions, StubGrid, StubImport and Page
 * @param extra Props to set or override
 * @param ref The CrudDispatch ref
 * @param page The record page: Page by default, another page component, or false for a
 *        CRUD without a record page (`children={undefined}`)
 */
export const crudEl = (
	model: ModelUnknown,
	extra: CP = {},
	ref?: React.Ref<CrudDispatch>,
	page: NonNullable<CrudProps<ModelUnknown>["children"]> | false = Page,
) => (
	<CRUD
		model={model}
		formProps={{ errorComponent: DefaultErrorComponent }}
		gridProps={{}}
		deletePermission={"crud.delete"}
		readPermission={"crud.read"}
		editPermission={"crud.edit"}
		newPermission={"crud.new"}
		exportPermission={"crud.export"}
		gridComponent={StubGrid}
		importUI={StubImport}
		ref={ref}
		{...extra}
	>
		{page || undefined}
	</CRUD>
);

/**
 * Mounts the CRUD as the element of `<Route path="/rec/*">`, next to a page at /other
 */
export const renderRouted = (
	history: MemoryHistory,
	el: React.ReactElement,
	perms: string[] = ALL,
) => {
	setFrameworkHistory(history);
	return render(
		<Framework>
			<SetPerms perms={perms}>
				<Routes>
					{[
						<Route key={"rec"} path={"/rec/*"} element={el} />,
						<Route
							key={"other"}
							path={"/other"}
							element={<div>OTHER PAGE</div>}
						/>,
					]}
				</Routes>
			</SetPerms>
		</Framework>,
	);
};

/**
 * Mounts the CRUD without a Route (for disableRouting), under a memory history at /page
 */
export const renderPlain = (el: React.ReactElement, perms: string[] = ALL) => {
	setFrameworkHistory(createMemoryHistory({ initialEntries: ["/page"] }));
	return render(
		<Framework>
			<SetPerms perms={perms}>{el}</SetPerms>
		</Framework>,
	);
};

/**
 * A people model of its own (no shared react-query cache between tests)
 */
export const peopleModel = () => makePeopleModel() as unknown as ModelUnknown;

/**
 * The CcCrud-gridWrapper element around the stub grid
 */
export const gridWrapper = () => screen.getByTestId("grid").parentElement!;

/**
 * Fills the four textboxes of the create form with v0…v3 and waits until Save is enabled
 * @returns The inputs
 */
export const fillCreateForm = async () => {
	const inputs = await screen.findAllByRole("textbox", undefined, LOAD);
	inputs.forEach((input, index) =>
		fireEvent.change(input, { target: { value: "v" + String(index) } }),
	);
	await waitFor(() =>
		expect(screen.getByRole("button", { name: "Save" })).toBeEnabled(),
	);
	return inputs;
};

/**
 * Holds every connector create until the test calls release
 */
export const holdCreates = (model: ModelUnknown) => {
	const connector = connectorOf(model as unknown as PeopleModel);
	const original = connector.create.bind(connector);
	const pending: (() => void)[] = [];
	const spy = vi.spyOn(connector, "create").mockImplementation(
		(data) =>
			new Promise((resolve) => {
				pending.push(() => resolve(original(data)));
			}) as never,
	);
	return {
		spy,
		release: async () => {
			await act(async () => {
				pending.shift()!();
				await Promise.resolve();
			});
		},
	};
};

/**
 * Registers the page-test setup (matchMedia, scrollTo stub, translations, cleanup) and
 * resets the grid and page logs before each test
 */
export const setupCrudTests = () => {
	setupPageTests();
	beforeEach(() => {
		gridLog.mounts = 0;
		gridLog.renders = 0;
		gridLog.props = [];
		pageLog.mounts = 0;
		pageLog.current = null;
	});
};
