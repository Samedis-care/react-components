import React, {
	Suspense,
	useCallback,
	useContext,
	useEffect,
	useImperativeHandle,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	ModelRecord,
	ModelUnknown,
} from "../../backend-integration/Model/Model";
import BackendDataGrid, { BackendDataGridProps } from "../DataGrid";
import { Form, FormProps } from "../Form";
import { FORM_PAGE_MOVE_STATE } from "../Form/FormPageGuard";
import {
	hasPermission,
	Permission,
	usePermissionContext,
} from "../../framework";
import { CrudImportProps, CrudImportType } from "./Import";
import Loader from "../../standalone/Loader";
import throwError from "../../utils/throwError";
import focusContainer from "../../utils/internal/focusContainer";
import {
	DataGridDispatch,
	DataGridQuery,
	IDataGridAddButton,
} from "../../standalone/DataGrid/DataGrid";
import useNavigate from "../../standalone/Routes/useNavigate";
import { useHistoryRouterContext } from "../../standalone/Routes/HistoryRouter";
import Route, { RouteContext, RouteProps } from "../../standalone/Routes/Route";
import useLocation from "../../standalone/Routes/useLocation";
import useParams from "../../standalone/Routes/useParams";
import Routes from "../../standalone/Routes/Routes";
import { styled } from "@mui/material";
import { Visibility as ViewIcon } from "@mui/icons-material";
import DialogContextProvider from "../../framework/DialogContextProvider";
import useCCTranslations from "../../utils/useCCTranslations";

const CrudImport = React.lazy(() => import("./Import")) as CrudImportType;

export interface CrudFormProps {
	/**
	 * Callback for closing the form page
	 * @param forceGridRefresh force grid refresh? (default false)
	 */
	goBack: (forceGridRefresh?: boolean) => void;
	/**
	 * Open view
	 * @param id The ID of the record or special values for special views
	 * @param forceRefresh force refresh data grid?
	 * @see CrudSpecialIds
	 */
	open: (
		id: "import" | "devimport" | "new" | string,
		forceRefresh?: boolean,
	) => void;
	/**
	 * Does the Form have a custom submit handler?
	 */
	hasCustomSubmitHandler: boolean;
}

export interface GridWrapperProps {
	children: React.ReactNode;
}

export interface CrudProps<M extends ModelUnknown> {
	/**
	 * The model to use
	 */
	model: M;
	/**
	 * The properties to pass to form
	 * @remarks `onSubmit` is wrapped. After a successful save of the create form,
	 *          CRUD first moves on to the saved record, if the create form is
	 *          still shown then: routed, it replaces `<url>/new…` with
	 *          `<url>/<id>…` (the location when the save finishes, so a tab
	 *          opened meanwhile stays open); with disableRouting, the "new" view
	 *          becomes the saved id. A user who left the create form while it
	 *          saved (another record, the list, another page, a closed view)
	 *          stays there. Then CRUD reloads the grid and awaits this onSubmit,
	 *          also when the user has left.
	 */
	formProps: Omit<
		FormProps<M, CrudFormProps>,
		| "id"
		| "model"
		| "children"
		| "customProps"
		| "disableRouting"
		| "readOnly"
		| "readOnlyReason"
	> & {
		/**
		 * override for default form custom props passed in by CRUD component
		 */
		customProps?: FormProps<M, CrudFormProps>["customProps"];
	};
	/**
	 * The page component of the record Form; it gets
	 * `PageProps<M, CrudFormProps>`.
	 * Pass `{undefined}` for a list without a record page: the grid then has
	 * no Edit/View, and no default New (it would open the create form);
	 * gridProps.onAddNew and gridProps.forceAddNew still apply.
	 */
	children: FormProps<M, CrudFormProps>["children"] | undefined;
	/**
	 * The properties to pass to the grid (BackendDataGrid, or gridComponent)
	 * @remarks `onAddNew` replaces what the grid's New does; see onAddNew and
	 *          forceAddNew below
	 */
	gridProps: Omit<
		BackendDataGridProps<M>,
		| "model"
		| "enableDelete"
		| "disableExport"
		| "onEdit"
		| "forceRefreshToken"
		| "onAddNew"
	> &
		Pick<Partial<BackendDataGridProps<M>>, never> & {
			/**
			 * What the grid's New does, for users with newPermission (users
			 * without it get newPermissionHint instead), with or without a record
			 * page (`children`):
			 * - not set: New opens the create form ("new"), and there is no New
			 *   without a record page;
			 * - a function: New calls it with `showNew`, which opens the create
			 *   form (call it only with a record page);
			 * - a string: a disabled New with this string as its tooltip;
			 * - an array: one button per entry, whose onClick gets `showNew`
			 *   (`onClick: undefined` disables the button).
			 * Any other value throws "invalid type" while rendering.
			 */
			onAddNew?:
				| ((showNew: () => void) => void)
				| string
				| (Omit<IDataGridAddButton, "onClick"> & {
						onClick: ((showNew: () => void) => void) | undefined;
				  })[];
			/**
			 * Passed to the grid's onAddNew as it is, without the newPermission
			 * check; replaces onAddNew and newPermissionHint when set
			 */
			forceAddNew?: BackendDataGridProps<M>["onAddNew"];
		};
	/**
	 * Component wrapping the DataGrid
	 */
	gridWrapper?: React.ComponentType<GridWrapperProps>;
	/**
	 * Custom BackendDataGrid component
	 * @remarks It gets a ref, which it has to pass on to BackendDataGrid for
	 *          CrudDispatch.getGridQuery
	 */
	gridComponent?: React.ComponentType<
		BackendDataGridProps<M> & React.RefAttributes<DataGridDispatch>
	>;
	/**
	 * The record delete permission
	 */
	deletePermission: Permission;
	/**
	 * Hint as to why delete permissions are not granted
	 */
	deletePermissionHint?: string;
	/**
	 * The view permission (shows form in read-only mode if edit permission is not present)
	 * Set to `false` to only show the form page if edit permissions are present
	 */
	readPermission: Permission;
	/**
	 * The record edit permission
	 */
	editPermission: Permission;
	/**
	 * Hint as to why edit permissions are not granted
	 */
	editPermissionHint?: string;
	/**
	 * Creating records: the grid's New (see gridProps.onAddNew), the "new"
	 * view and the importer
	 */
	newPermission: Permission;
	/**
	 * For users without newPermission: the grid shows a disabled New with this
	 * text as its tooltip. Without it they get no New. Users with
	 * newPermission never see it.
	 */
	newPermissionHint?: string;
	/**
	 * The records export permission
	 */
	exportPermission: Permission;
	/**
	 * Disables routing and uses an internal state instead (useful for dialogs)
	 */
	disableRouting?: boolean;
	/**
	 * Unmounts the grid when showing form. Resets scroll in grid when coming back from form.
	 * Useful for performance optimization or dialog handling where no Grid is shown
	 */
	disableBackgroundGrid?: boolean;
	/**
	 * If routing is disabled: set the initial view (id, "new", "import", "devimport" or null), defaults to null
	 */
	initialView?: string | null;
	/**
	 * Forbidden page to show if the user navigated to a URL he has no permissions for,
	 * and for an import view ("import" or "devimport", also with disableRouting) that is
	 * not enabled (enableUserImport, enableDevImport) or that the user may not import in
	 * (see enableUserImport)
	 * If not set: Shows edit form in read-only mode and an enabled import view to every
	 * user; an import view that is not enabled shows nothing
	 */
	forbiddenPage?: React.ComponentType;
	/**
	 * Route component to use
	 */
	routeComponent?: React.ComponentType<RouteProps>;
	/**
	 * Enables the import: the grid's Import, for users with newPermission (and
	 * editPermission when importUpdateKey is set), and the view it opens,
	 * `<url>/import` (with disableRouting the view "import"). Without it that
	 * view does not exist: it shows forbiddenPage, or nothing.
	 * @remarks The library's importer is the guided one with importConfig only;
	 *          without importConfig it is the unguided one (see enableDevImport)
	 * @default false
	 */
	enableUserImport?: boolean;
	/**
	 * Enables the unguided developer importer at `<url>/devimport` (with
	 * disableRouting the view "devimport"), for users who may import (see
	 * enableUserImport); the grid offers no button for it. Its Connect data step
	 * runs the JavaScript the user types for each field, and its last step creates
	 * (or updates) the records through the connector: a tool for developers
	 * working out an importConfig, not for end users, e.g.
	 * `enableDevImport={process.env.NODE_ENV === "development"}`. Without it
	 * that view does not exist: it shows forbiddenPage, or nothing.
	 * @default false
	 */
	enableDevImport?: boolean;
	/**
	 * Import config (should be set if enableUserImport set)
	 */
	importConfig?: CrudImportProps<M>["importConfig"];
	/**
	 * Import update key (primary key substitute)
	 */
	importUpdateKey?: CrudImportProps<M>["updateKey"];
	/**
	 * Additional filters to be sent when doing update key index requests
	 */
	importUpdateKeyAdditionalFilters?: CrudImportProps<M>["updateKeyAdditionalFilters"];
	/**
	 * How-to information for the import
	 */
	importHowTo?: CrudImportProps<M>["howTo"];
	/**
	 * Additional record validation for imported records
	 */
	importValidate?: CrudImportProps<M>["validate"];
	/**
	 * Custom Import UI
	 */
	importUI?: React.ComponentType<CrudImportProps<M>>;
	/**
	 * Callback called when goBack is called in form (returning from form to data grid)
	 */
	goBackCallback?: () => void;
}

export interface CRUDGridVisibilityWrapperOwnerState {
	hidden: boolean;
}
const GridVisibilityWrapper = styled("div", {
	name: "CcCrud",
	slot: "gridWrapper",
})({
	width: "100%",
	height: "100%",
	// takes the focus when the list comes back without a control to return it to, as long
	// as it has it (tabindex -1, not a tab stop): no focus ring
	outline: "none",
	"&.Mui-hidden": {
		display: "none",
	},
});

const ViewWrapper = styled("div", {
	name: "CcCrud",
	slot: "view",
})({
	width: "100%",
	height: "100%",
	// takes the focus when the view opens, as long as it has it (tabindex -1, not a tab
	// stop): no focus ring
	outline: "none",
});

/**
 * The theme slots of CRUD (`components.CcCrud.styleOverrides`):
 * - `gridWrapper`: the element around the grid (and gridWrapper); while another view
 *   shows it has the class `Mui-hidden` (display: none)
 * - `view`: the element around the record page or the importer, present while one of
 *   them shows
 * Both fill their parent (width and height 100%). When a view switch gives one of them the
 * keyboard focus, it has `tabindex="-1"` for as long as it keeps the focus, and no outline.
 */
export type CrudClassKey = "gridWrapper" | "view";

export interface CrudDispatch {
	/**
	 * Force-refreshes the grid
	 */
	refreshGrid: () => void;
	/**
	 * Go back to datagrid
	 * @param forceRefresh refresh grid, default false
	 */
	showOverview: (forceRefresh?: boolean) => void;
	/**
	 * Open view
	 * @param id ID to open
	 * @param forceRefresh force refresh grid, default false
	 */
	openView: (
		id: "import" | "devimport" | "new" | string,
		forceRefresh?: boolean,
	) => void;
	/**
	 * The query the grid currently shows
	 * @returns The query, see DataGridDispatch.getQuery, or undefined while the
	 *          grid isn't mounted (disableBackgroundGrid with a form open),
	 *          while it waits for the state its persistence provider loads, or
	 *          if the gridComponent doesn't pass its ref on
	 */
	getGridQuery: () => DataGridQuery | undefined;
}

const CrudDispatchContext = React.createContext<CrudDispatch | undefined>(
	undefined,
);
export const useCrudDispatchContext = (): CrudDispatch => {
	const ctx = useContext(CrudDispatchContext);
	if (!ctx) throw new Error("CrudDispatchContext not set");
	return ctx;
};

export const CrudSpecialIds = ["import", "devimport", "new"];

interface FormPageWrapperProps<M extends ModelUnknown> {
	children: CrudProps<M>["children"];
	form: (
		id: string,
		children: NonNullable<CrudProps<M>["children"]>,
	) => React.ReactElement;
}
const FormPageWrapper = <M extends ModelUnknown>(
	props: FormPageWrapperProps<M>,
) => {
	const params = useParams();
	if (!props.children) return <></>;
	return (
		<Suspense fallback={<Loader />}>
			{props.form(params.id ?? "", props.children)}
		</Suspense>
	);
};

/**
 * A location pathname in the form of a route's url, which has no trailing or repeated slashes
 * @param pathname The pathname
 */
const toRouteUrl = (pathname: string) =>
	"/" +
	pathname
		.split("/")
		.filter((segment) => segment)
		.join("/");

/**
 * The view a routed CRUD shows
 * @param pathname The location pathname
 * @param routeUrl The url of the CRUD's route
 * @returns null for the list, else the first segment below the CRUD's url: a record id,
 *          "new", "import" or "devimport" (the record page's own sub-routes, e.g. tabs,
 *          are part of that view)
 */
const toRoutedView = (pathname: string, routeUrl: string): string | null => {
	const path = toRouteUrl(pathname);
	if (path === routeUrl) return null;
	return (
		path
			.substring(routeUrl.length)
			.split("/")
			.find((segment) => segment) ?? ""
	);
};

/**
 * Has the keyboard focus no place to stay after a view switch: on no element, on the page or
 * on a container around the element that is to take it (where it falls when the focused
 * element is removed), or inside the part of the CRUD that was just hidden?
 * @param target The element that is to take the focus
 * @param hidden The part of the CRUD that was hidden, if any
 */
const isFocusLost = (target: HTMLElement, hidden: HTMLElement | null) => {
	const active = target.ownerDocument.activeElement;
	if (active === target) return false;
	return !active || active.contains(target) || !!hidden?.contains(active);
};

const CRUD = <M extends ModelUnknown>(
	props: CrudProps<M>,
	ref: React.Ref<CrudDispatch>,
) => {
	const { t } = useCCTranslations();
	const navigate = useNavigate();
	const routeCtx = useContext(RouteContext);
	if (!props.disableRouting && !routeCtx) throw new Error("no route match");
	const routeUrl = routeCtx ? routeCtx.url : "";
	const location = useLocation();
	const [perms] = usePermissionContext();
	const {
		disableRouting,
		disableBackgroundGrid,
		forbiddenPage: ForbiddenPage,
		enableUserImport: requestEnableUserImport,
		enableDevImport,
		importConfig,
		importUpdateKey,
		importHowTo,
		importUpdateKeyAdditionalFilters,
		importValidate,
		goBackCallback,
	} = props;
	const hasImportPermission =
		(!importUpdateKey || hasPermission(perms, props.editPermission)) &&
		hasPermission(perms, props.newPermission);
	const enableUserImport = requestEnableUserImport && hasImportPermission;
	const GridWrapper = props.gridWrapper ?? React.Fragment;
	const RouteComponent = props.routeComponent ?? Route;
	const ImportUI = props.importUI ?? CrudImport;
	const [id, setId] = useState<string | null>(props.initialView ?? null);
	const [gridRefreshToken, setGridRefreshToken] = useState<string>(
		new Date().getTime().toString(),
	);
	const skipNextFormIdReset = useRef<string | null>(null);

	const showEditPage = useCallback(
		(id: string) => {
			if (disableRouting) {
				setId(id);
			} else {
				navigate(`${routeUrl}/${id}`);
			}
		},
		[navigate, routeUrl, disableRouting],
	);

	const showNewPage = useCallback(() => {
		if (disableRouting) {
			setId("new");
		} else {
			navigate(`${routeUrl}/new`);
		}
	}, [navigate, routeUrl, disableRouting]);

	const refreshGrid = useCallback(() => {
		setGridRefreshToken(new Date().getTime().toString());
	}, []);

	const gridRef = useRef<DataGridDispatch>(null);
	const getGridQuery = useCallback(() => gridRef.current?.getQuery(), []);

	const showOverview = useCallback(
		(forceRefresh?: boolean) => {
			if (goBackCallback) goBackCallback();
			if (disableRouting) {
				setId(null);
			} else {
				navigate(routeUrl);
			}
			if (forceRefresh) refreshGrid();
		},
		[goBackCallback, disableRouting, refreshGrid, navigate, routeUrl],
	);

	const openView = useCallback(
		(id: "import" | "devimport" | "new" | string, forceRefresh?: boolean) => {
			if (disableRouting) {
				setId(id);
			} else {
				navigate(routeUrl + "/" + id);
			}
			if (forceRefresh) refreshGrid();
		},
		[disableRouting, navigate, routeUrl, refreshGrid],
	);

	// a save resolves long after the render it started in: handleSubmit reads where the user
	// is then from these, as they may have left the create form while it saved
	const { history } = useHistoryRouterContext();
	const viewRef = useRef(id);
	viewRef.current = id;
	const mountedRef = useRef(false);
	useEffect(() => {
		mountedRef.current = true;
		return () => {
			mountedRef.current = false;
		};
	}, []);

	const handleSubmit = useCallback(
		async (
			data: ModelRecord<M>,
			submit: ModelRecord<M>,
			old: ModelRecord<M>,
		) => {
			// redirect to edit page, if the create form that was saved is still shown. A user
			// who left it while it saved (another record, the list, another page, a closed
			// view) stays where they went
			const { id } = data as Record<"id", string>;
			const { pathname } = history.location;
			if (!mountedRef.current) {
				// the CRUD is gone, and the create form with it
			} else if (disableRouting) {
				if (viewRef.current === "new") {
					skipNextFormIdReset.current = id;
					// a view switch that has not rendered yet keeps its view
					setId((view) => (view === "new" ? id : view));
				}
			} else if (
				pathname.startsWith(routeUrl + "/new") ||
				pathname.startsWith(routeUrl + "/new/")
			) {
				// the saved record opens where the create form is, e.g. on the same
				// tab: <url>/new/permissions becomes <url>/<id>/permissions
				const subPath = pathname
					.substring(routeUrl.length)
					.split("/")
					.filter((segment) => segment)
					.slice(1);
				skipNextFormIdReset.current = id;
				// the Form stays (skipNextFormIdReset), so this moves the form page rather than
				// leaving it, and its leave guard lets it pass: a control's own dirty state may
				// not have caught up with the saved record yet. The user stays where they are
				// on the page, so the scroll position stays too.
				navigate([`${routeUrl}/${id}`, ...subPath].join("/"), {
					replace: true,
					state: FORM_PAGE_MOVE_STATE,
					preventScrollReset: true,
				});
			}

			refreshGrid();

			if (props.formProps.onSubmit) {
				await props.formProps.onSubmit(data, submit, old);
			}
		},
		[props.formProps, disableRouting, history, navigate, routeUrl, refreshGrid],
	);

	const handleImportButton = useCallback(() => {
		if (disableRouting) {
			setId("import");
		} else {
			navigate(`${routeUrl}/import`);
		}
	}, [disableRouting, navigate, routeUrl]);

	const MyBackendDataGrid = props.gridComponent ?? BackendDataGrid;

	const grid = (globalScrollListener: boolean) => (
		<Suspense fallback={<Loader />}>
			<GridWrapper>
				<MyBackendDataGrid
					ref={gridRef}
					enableDelete={hasPermission(perms, props.deletePermission)}
					disableDeleteHint={props.deletePermissionHint}
					disableExport={!hasPermission(perms, props.exportPermission)}
					{...props.gridProps}
					model={props.model}
					forceRefreshToken={gridRefreshToken}
					onEdit={
						(hasPermission(perms, props.readPermission) ||
							hasPermission(perms, props.editPermission)) &&
						props.children
							? showEditPage
							: undefined
					}
					editIcon={
						hasPermission(perms, props.editPermission) ? undefined : ViewIcon
					}
					editLabel={
						hasPermission(perms, props.editPermission)
							? undefined
							: t("backend-components.crud.grid.view")
					}
					onAddNew={
						props.gridProps.forceAddNew ??
						(hasPermission(perms, props.newPermission)
							? props.gridProps.onAddNew == null
								? // the default New opens the create form, which needs a record page
									props.children
									? showNewPage
									: undefined
								: typeof props.gridProps.onAddNew === "string"
									? props.gridProps.onAddNew
									: typeof props.gridProps.onAddNew === "function"
										? () =>
												(
													props.gridProps.onAddNew as (
														showNew: () => void,
													) => void
												)(showNewPage)
										: Array.isArray(props.gridProps.onAddNew)
											? props.gridProps.onAddNew.map(
													(btn): IDataGridAddButton => ({
														...btn,
														onClick: btn.onClick
															? () => btn.onClick!(showNewPage)
															: undefined,
													}),
												)
											: throwError("invalid type")
							: props.newPermissionHint)
					}
					onImport={enableUserImport ? handleImportButton : undefined}
					globalScrollListener={globalScrollListener}
				/>
			</GridWrapper>
		</Suspense>
	);

	const importer = (guided: boolean) => {
		// an import view exists only where the app enables it, routed or not: otherwise its
		// id is still reserved (no record page for it), and it is forbidden or empty
		const enabled = guided ? requestEnableUserImport : enableDevImport;
		if (!enabled || (!hasImportPermission && ForbiddenPage)) {
			return ForbiddenPage ? <ForbiddenPage /> : <></>;
		}
		return (
			<ImportUI
				model={props.model}
				importConfig={importConfig}
				updateKey={importUpdateKey}
				updateKeyAdditionalFilters={importUpdateKeyAdditionalFilters}
				howTo={importHowTo}
				validate={importValidate}
				guided={guided}
			/>
		);
	};

	const lastFormId = useRef<string | null>(null);
	const formKey = useRef(Date.now().toString(16));
	const form = (
		id: string,
		formComponent: NonNullable<typeof props.children>,
	) => {
		// when we switch IDs (everything except from new -> id triggered by form submit) we reset form fully
		if (lastFormId.current == null) lastFormId.current = id;
		if (lastFormId.current !== id) {
			if (skipNextFormIdReset.current !== id) {
				formKey.current = Date.now().toString(16);
			}
			skipNextFormIdReset.current = null;
			lastFormId.current = id;
		}
		return (
			<DialogContextProvider>
				<Form
					id={id === "new" ? null : id}
					key={formKey.current}
					model={props.model}
					{...props.formProps}
					readOnlyReasons={{
						...props.formProps.readOnlyReasons,
						...(!hasPermission(
							perms,
							id === "new" ? props.newPermission : props.editPermission,
						) && { permissions: props.editPermissionHint ?? null }),
					}}
					onSubmit={handleSubmit}
					disableRouting={disableRouting}
					customProps={
						props.formProps.customProps ?? {
							goBack: showOverview,
							open: openView,
							hasCustomSubmitHandler: props.formProps.onSubmit != null,
						}
					}
				>
					{formComponent}
				</Form>
			</DialogContextProvider>
		);
	};

	const dispatch = useMemo(
		(): CrudDispatch => ({
			refreshGrid,
			openView,
			showOverview,
			getGridQuery,
		}),
		[refreshGrid, openView, showOverview, getGridQuery],
	);

	useImperativeHandle(ref, () => dispatch, [dispatch]);

	// null for the list, else the id of the record page or importer
	const shownView = disableRouting
		? id
		: toRoutedView(location.pathname, routeUrl);
	const showGrid = shownView === null;

	useEffect(() => {
		window.dispatchEvent(new UIEvent("resize", { bubbles: true })); // trigger size recalculations
	}, [showGrid]);

	// Keyboard focus on a view switch. Opening a view hides the list and with it the focused
	// Edit, New or Import; leaving a view removes the focused Back. Where the focus fell to
	// the page or into the hidden list, it moves on: back on the list to the control that had
	// it there last, else (and when a view opens) to the container of what is shown. Focus
	// the new view took itself (autoFocus) or that is outside the CRUD stays where it is.
	const gridWrapperRef = useRef<HTMLDivElement>(null);
	const viewWrapperRef = useRef<HTMLDivElement>(null);
	// the element in the list that had the focus last: the control that opened the view
	const gridFocusRef = useRef<HTMLElement | null>(null);
	const handleGridFocus = useCallback(
		(evt: React.FocusEvent<HTMLDivElement>) => {
			const target = evt.target as Element;
			// a popup of the list is in a portal, outside of it: the control that opened the
			// popup stays the one to return to
			if (target === evt.currentTarget || !evt.currentTarget.contains(target))
				return;
			if (target instanceof HTMLElement) gridFocusRef.current = target;
		},
		[],
	);
	const focusedView = useRef(shownView);
	const focusCheckPending = useRef(false);
	// a layout effect: back on the list, the opener gets the focus before a HistoryRouter
	// moves it to the page heading after the navigation
	useLayoutEffect(() => {
		if (focusedView.current === shownView) return;
		focusedView.current = shownView;
		focusCheckPending.current = true;
		const gridWrapper = gridWrapperRef.current;
		const opener = gridFocusRef.current;
		if (!gridWrapper || !opener || !gridWrapper.contains(opener)) {
			// no opener, or one whose list was unmounted (disableBackgroundGrid)
			gridFocusRef.current = null;
			return;
		}
		if (shownView === null && isFocusLost(gridWrapper, null)) opener.focus();
	}, [shownView]);
	// a passive effect, after the HistoryRouter's layout effect: a page heading it focused
	// keeps the focus. Then the container takes the focus if it still has no place: the
	// opener may be disabled or gone, and a view shows its content once it has loaded.
	useEffect(() => {
		if (!focusCheckPending.current) return;
		focusCheckPending.current = false;
		const gridWrapper = gridWrapperRef.current;
		const target = shownView === null ? gridWrapper : viewWrapperRef.current;
		if (!target) return;
		if (!isFocusLost(target, shownView === null ? null : gridWrapper)) return;
		focusContainer(target);
	}, [shownView]);

	return (
		<CrudDispatchContext.Provider value={dispatch}>
			{disableRouting ? (
				<>
					{(id === null || !disableBackgroundGrid) && (
						<GridVisibilityWrapper
							ref={gridWrapperRef}
							onFocus={handleGridFocus}
							className={!showGrid ? "Mui-hidden" : undefined}
						>
							{grid(id === null)}
						</GridVisibilityWrapper>
					)}
					{id !== null && (
						<ViewWrapper ref={viewWrapperRef}>
							{id === "import" && importer(true)}
							{id === "devimport" && importer(false)}
							{id !== "import" &&
								id !== "devimport" &&
								props.children &&
								form(id, props.children)}
						</ViewWrapper>
					)}
				</>
			) : (
				<>
					{(id === null || !disableBackgroundGrid) && (
						<GridVisibilityWrapper
							ref={gridWrapperRef}
							onFocus={handleGridFocus}
							className={!showGrid ? "Mui-hidden" : undefined}
						>
							{grid(showGrid)}
						</GridVisibilityWrapper>
					)}
					{!showGrid && (
						<ViewWrapper ref={viewWrapperRef}>
							{props.children && (
								<Routes>
									<RouteComponent path={`import/*`} element={importer(true)} />
									<RouteComponent
										path={`devimport/*`}
										element={importer(false)}
									/>
									<RouteComponent
										path={`:id/*`}
										element={
											hasPermission(perms, props.readPermission) ||
											hasPermission(perms, props.editPermission) ||
											hasPermission(perms, props.newPermission) ||
											!ForbiddenPage ? (
												<FormPageWrapper form={form}>
													{props.children}
												</FormPageWrapper>
											) : (
												<ForbiddenPage />
											)
										}
									/>
								</Routes>
							)}
						</ViewWrapper>
					)}
				</>
			)}
		</CrudDispatchContext.Provider>
	);
};

export type CrudType = <M extends ModelUnknown>(
	props: CrudProps<M> & React.RefAttributes<CrudDispatch>,
) => React.ReactElement | null;

/**
 * A model's list (BackendDataGrid) with a record page (a Form whose page component is
 * `children`) and an importer, each a view of its own: routed (the default) at the
 * Route's url and below it, with disableRouting in component state.
 *
 * The keyboard focus follows a view switch. When a record page (also "new") or the
 * importer opens and the focus was in the list, which is hidden then, or fell to the page,
 * the view's container (theme slot `view`) takes it, so the next Tab goes to the view's
 * first control. Back on the list, the control in it that had the focus last (the Edit,
 * View, New or Import that opened the view) gets it back; if that is gone or disabled, the
 * list's container (theme slot `gridWrapper`) takes it. Neither container is a tab stop.
 * Focus outside the CRUD (e.g. on a button that calls the ref's openView), focus the new
 * view moved itself (`autoFocus`), and the page heading a HistoryRouter focused after the
 * navigation stay where they are, and nothing moves on the first render.
 */
export default React.memo(React.forwardRef(CRUD)) as CrudType;
