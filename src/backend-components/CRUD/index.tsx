import React, {
	Suspense,
	useCallback,
	useContext,
	useMemo,
	useRef,
	useState,
} from "react";
import Model, {
	ModelFieldName,
	PageVisibility,
} from "../../backend-integration/Model/Model";
import { Route, useLocation, useNavigate, useParams } from "react-router-dom";
import BackendDataGrid, { BackendDataGridProps } from "../DataGrid";
import { Form, FormProps } from "../Form";
import {
	hasPermission,
	Permission,
	usePermissionContext,
} from "../../framework";
import makeStyles from "@mui/styles/makeStyles";
import { CrudImportProps, CrudImportType } from "./Import";
import Loader from "../../standalone/Loader";
import { useRouteInfo } from "../../utils";
import { SentryRoutes } from "../../standalone/SentryRoute";

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
	 * @see CrudSpecialIds
	 */
	open: (id: "import" | "devimport" | "new" | string) => void;
	/**
	 * Does the Form have a custom submit handler?
	 */
	hasCustomSubmitHandler: boolean;
}

export interface GridWrapperProps {
	children: React.ReactNode;
}

export interface CrudProps<
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT
> {
	/**
	 * The model to use
	 */
	model: Model<KeyT, VisibilityT, CustomT>;
	/**
	 * The properties to pass to form
	 */
	formProps: Omit<
		FormProps<KeyT, VisibilityT, CustomT, CrudFormProps>,
		"id" | "model" | "children" | "customProps" | "disableRouting"
	> & {
		/**
		 * override for default form custom props passed in by CRUD component
		 */
		customProps?: FormProps<
			KeyT,
			VisibilityT,
			CustomT,
			CrudFormProps
		>["customProps"];
	};
	/**
	 * The renderer function which returns the form component
	 * @remarks Can be set to undefined to only render the Grid
	 */
	children:
		| FormProps<KeyT, VisibilityT, CustomT, CrudFormProps>["children"]
		| undefined;
	/**
	 * The properties to pass to grid
	 * @remarks onAddNew can be used to overCrudImportTypewrite the new button action
	 */
	gridProps: Omit<
		BackendDataGridProps<KeyT, VisibilityT, CustomT>,
		| "model"
		| "enableDelete"
		| "disableExport"
		| "onEdit"
		| "forceRefreshToken"
		| "onAddNew"
	> &
		Pick<Partial<BackendDataGridProps<KeyT, VisibilityT, CustomT>>, "onAddNew">;
	/**
	 * Component wrapping the DataGrid
	 */
	gridWrapper?: React.ComponentType<GridWrapperProps>;
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
	 * The record create permission
	 */
	newPermission: Permission;
	/**
	 * Hint as to why create new permissions are not granted
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
	 * If routing is disabled: set the initial view (id, "new", "import" or null), defaults to null
	 */
	initialView?: string | null;
	/**
	 * Forbidden page to show if the user navigated to a URL he has no permissions for
	 * If not set: Shows edit form in read-only mode
	 */
	forbiddenPage?: React.ComponentType;
	/**
	 * Route component to use
	 */
	routeComponent?: typeof Route;
	/**
	 * Enable Import button in Grid
	 */
	enableUserImport?: boolean;
	/**
	 * Import config (should be set if enableUserImport set)
	 */
	importConfig?: CrudImportProps<KeyT, VisibilityT, CustomT>["importConfig"];
	/**
	 * Import update key (primary key substitute)
	 */
	importUpdateKey?: CrudImportProps<KeyT, VisibilityT, CustomT>["updateKey"];
	/**
	 * Additional filters to be sent when doing update key index requests
	 */
	importUpdateKeyAdditionalFilters?: CrudImportProps<
		KeyT,
		VisibilityT,
		CustomT
	>["updateKeyAdditionalFilters"];
	/**
	 * How-to information for the import
	 */
	importHowTo?: CrudImportProps<KeyT, VisibilityT, CustomT>["howTo"];
	/**
	 * Additional record validation for imported records
	 */
	importValidate?: CrudImportProps<KeyT, VisibilityT, CustomT>["validate"];
	/**
	 * Custom Import UI
	 */
	importUI?: React.ComponentType<CrudImportProps<KeyT, VisibilityT, CustomT>>;
}

const useStyles = makeStyles(
	{
		hide: {
			display: "none",
			width: "100%",
			height: "100%",
		},
		show: {
			width: "100%",
			height: "100%",
		},
	},
	{ name: "CcCrud" }
);

export interface CrudDispatch {
	/**
	 * Force-refreshes the grid
	 */
	refreshGrid: () => void;
}

const CrudDispatchContext = React.createContext<CrudDispatch | undefined>(
	undefined
);
export const useCrudDispatchContext = (): CrudDispatch => {
	const ctx = useContext(CrudDispatchContext);
	if (!ctx) throw new Error("CrudDispatchContext not set");
	return ctx;
};

export const CrudSpecialIds = ["import", "devimport", "new"];

interface FormPageWrapperProps {
	children: CrudProps<ModelFieldName, PageVisibility, unknown>["children"];
	form: (
		id: string,
		children: NonNullable<
			CrudProps<ModelFieldName, PageVisibility, unknown>["children"]
		>
	) => React.ReactElement;
}
const FormPageWrapper = (props: FormPageWrapperProps) => {
	const params = useParams();
	if (!props.children) return <></>;
	return props.form(params.id ?? "", props.children);
};

const CRUD = <
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT
>(
	props: CrudProps<KeyT, VisibilityT, CustomT>
) => {
	const navigate = useNavigate();
	const { url: routeUrl } = useRouteInfo(props.disableRouting);
	const location = useLocation();
	const [perms] = usePermissionContext();
	const {
		disableRouting,
		disableBackgroundGrid,
		forbiddenPage: ForbiddenPage,
		enableUserImport: requestEnableUserImport,
		importConfig,
		importUpdateKey,
		importHowTo,
		importUpdateKeyAdditionalFilters,
		importValidate,
	} = props;
	const hasImportPermission =
		!importUpdateKey ||
		(hasPermission(perms, props.editPermission) &&
			hasPermission(perms, props.newPermission));
	const enableUserImport = requestEnableUserImport && hasImportPermission;
	const GridWrapper = props.gridWrapper ?? React.Fragment;
	const RouteComponent = props.routeComponent ?? Route;
	const ImportUI = props.importUI ?? CrudImport;
	const [id, setId] = useState<string | null>(props.initialView ?? null);
	const [gridRefreshToken, setGridRefreshToken] = useState<string>(
		new Date().getTime().toString()
	);
	const classes = useStyles();

	const showEditPage = useCallback(
		(id: string) => {
			if (disableRouting) {
				setId(id);
			} else {
				navigate(`${routeUrl}/${id}`);
			}
		},
		[navigate, routeUrl, disableRouting]
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

	const showOverview = useCallback(
		(forceRefresh?: boolean) => {
			if (disableRouting) {
				setId(null);
			} else {
				navigate(routeUrl);
			}
			if (forceRefresh) refreshGrid();
		},
		[disableRouting, refreshGrid, navigate, routeUrl]
	);

	const openView = useCallback(
		(id: "import" | "devimport" | "new" | string) => {
			if (disableRouting) {
				setId(id);
			} else {
				navigate(routeUrl + "/" + id);
			}
		},
		[disableRouting, navigate, routeUrl]
	);

	const handleSubmit = useCallback(
		async (
			data: Record<string, unknown>,
			submit: Record<string, unknown>,
			old: Record<string, unknown>
		) => {
			// redirect to edit page
			const { id } = data as Record<"id", string>;
			if (disableRouting) {
				setId((oldId) => (oldId === null ? null : id));
			} else if (
				location.pathname.startsWith(routeUrl + "/new") ||
				location.pathname.startsWith(routeUrl + "/new/")
			) {
				navigate(`${routeUrl}/${id}`, { replace: true });
			}

			refreshGrid();

			if (props.formProps.onSubmit) {
				await props.formProps.onSubmit(data, submit, old);
			}
		},
		[
			props.formProps,
			disableRouting,
			location.pathname,
			navigate,
			routeUrl,
			refreshGrid,
		]
	);

	const handleImportButton = useCallback(() => {
		if (disableRouting) {
			setId("import");
		} else {
			navigate(`${routeUrl}/import`);
		}
	}, [disableRouting, navigate, routeUrl]);

	const grid = (globalScrollListener: boolean) => (
		<Suspense fallback={<Loader />}>
			<GridWrapper>
				<BackendDataGrid
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
					onAddNew={
						hasPermission(perms, props.newPermission) && props.children
							? props.gridProps.onAddNew ?? showNewPage
							: props.newPermissionHint
					}
					onImport={enableUserImport ? handleImportButton : undefined}
					globalScrollListener={globalScrollListener}
				/>
			</GridWrapper>
		</Suspense>
	);

	const importer = (guided: boolean) => (
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

	const lastFormId = useRef<string | null>(null);
	const formKey = useRef(Date.now().toString(16));
	const form = (
		id: string,
		formComponent: NonNullable<typeof props.children>
	) => {
		// when we switch IDs (everything except from new -> id) we reset form fully
		if (lastFormId.current == null) lastFormId.current = id;
		if (lastFormId.current !== id) {
			if (lastFormId.current !== "new") {
				formKey.current = Date.now().toString(16);
			}
			lastFormId.current = id;
		}
		return (
			<Form
				id={id === "new" ? null : id}
				key={formKey.current}
				model={props.model}
				{...props.formProps}
				readOnly={
					!hasPermission(
						perms,
						id === "new" ? props.newPermission : props.editPermission
					) || props.formProps.readOnly
				}
				readOnlyReason={props.editPermissionHint}
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
		);
	};

	const dispatch = useMemo(
		() => ({
			refreshGrid,
		}),
		[refreshGrid]
	);

	return (
		<CrudDispatchContext.Provider value={dispatch}>
			{disableRouting ? (
				<>
					{(id === null || !disableBackgroundGrid) && (
						<div className={id !== null ? classes.hide : classes.show}>
							{grid(id === null)}
						</div>
					)}
					{id === "import" && importer(true)}
					{id === "devimport" && importer(false)}
					{id !== null &&
						id !== "import" &&
						id !== "devimport" &&
						props.children &&
						form(id, props.children)}
				</>
			) : (
				<>
					{(id === null || !disableBackgroundGrid) && (
						<div
							className={
								location.pathname === routeUrl ? classes.show : classes.hide
							}
						>
							{grid(location.pathname === routeUrl)}
						</div>
					)}
					{props.children && (
						<SentryRoutes>
							<RouteComponent
								path={`import/*`}
								element={
									hasImportPermission || !ForbiddenPage ? (
										importer(true)
									) : (
										<ForbiddenPage />
									)
								}
							/>
							<RouteComponent
								path={`devimport/*`}
								element={
									hasImportPermission || !ForbiddenPage ? (
										importer(false)
									) : (
										<ForbiddenPage />
									)
								}
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
						</SentryRoutes>
					)}
				</>
			)}
		</CrudDispatchContext.Provider>
	);
};

export default React.memo(CRUD) as typeof CRUD;
