import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, userEvent } from "storybook/test";
import { Button, Grid } from "@mui/material";
import { Framework, usePermissionContext } from "../../framework";
import CRUD, { CrudFormProps, useCrudDispatchContext } from "./index";
import FormField from "../Form/Field";
import DefaultErrorComponent from "../Form/DefaultErrorComponent";
import createTestModel from "../../stories/test-utils/TestModel";
import { ModelUnknown } from "../../backend-integration";
import type { PageProps } from "../Form/Form";

const FrameworkDecorator = (Story: React.ComponentType) => (
	<Framework>
		<div style={{ width: "100vw", height: "100vh" }}>
			<Story />
		</div>
	</Framework>
);

const meta: Meta = {
	title: "Backend-Components/CRUD",
	decorators: [FrameworkDecorator],
	parameters: { layout: "fullscreen" },
};

export default meta;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CrudFormContent = (_props: PageProps<ModelUnknown, CrudFormProps>) => (
	<Grid container spacing={2}>
		<Grid size={{ xs: 6 }}>
			<FormField name="first_name" />
		</Grid>
		<Grid size={{ xs: 6 }}>
			<FormField name="last_name" />
		</Grid>
		<Grid size={{ xs: 6 }}>
			<FormField name="email" />
		</Grid>
		<Grid size={{ xs: 6 }}>
			<FormField name="department" />
		</Grid>
	</Grid>
);

const PermissionSetter = (props: { children: React.ReactNode }) => {
	const [, setPerms] = usePermissionContext();
	useEffect(() => {
		setPerms([
			"crud.delete",
			"crud.read",
			"crud.edit",
			"crud.new",
			"crud.export",
		]);
	}, [setPerms]);
	return <>{props.children}</>;
};

const CrudStoryContent = () => {
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
			>
				{CrudFormContent}
			</CRUD>
		</PermissionSetter>
	);
};

export const FullCrud: StoryObj = {
	render: () => <CrudStoryContent />,
};

const ReadOnlyCrudContent = () => {
	const model = useMemo(createTestModel, []);
	return (
		<PermissionSetter>
			<CRUD
				model={model}
				formProps={{ errorComponent: DefaultErrorComponent }}
				gridProps={{}}
				deletePermission="no-permission"
				readPermission="crud.read"
				editPermission="no-permission"
				newPermission="no-permission"
				exportPermission="crud.export"
				disableRouting
			>
				{CrudFormContent}
			</CRUD>
		</PermissionSetter>
	);
};

export const ReadOnly: StoryObj = {
	render: () => <ReadOnlyCrudContent />,
};

/**
 * Reads the query of the grid behind the form, the way a "next record" button
 * would to stay within the rows the user sees
 */
const GridQueryProbe = () => {
	const { getGridQuery } = useCrudDispatchContext();
	const [query, setQuery] = useState("");
	const showQuery = useCallback(
		() => setQuery(JSON.stringify(getGridQuery() ?? null)),
		[getGridQuery],
	);
	return (
		<>
			<Button onClick={showQuery} variant={"contained"}>
				Show grid query
			</Button>
			<pre data-testid={"grid-query"}>{query}</pre>
		</>
	);
};

const GridQueryFormContent = () => (
	<Grid container spacing={2}>
		<Grid size={{ xs: 6 }}>
			<FormField name="first_name" />
		</Grid>
		<Grid size={{ xs: 12 }}>
			<GridQueryProbe />
		</Grid>
	</Grid>
);

// what the link opening the CRUD sets
const GRID_QUERY_GRID_PROPS = {
	overrideCustomData: { department: "Engineering" },
};

const GridQueryCrudContent = () => {
	const model = useMemo(createTestModel, []);
	return (
		<PermissionSetter>
			<CRUD
				model={model}
				formProps={{ errorComponent: DefaultErrorComponent }}
				gridProps={GRID_QUERY_GRID_PROPS}
				deletePermission="crud.delete"
				readPermission="crud.read"
				editPermission="crud.edit"
				newPermission="crud.new"
				exportPermission="crud.export"
				disableRouting
			>
				{GridQueryFormContent}
			</CRUD>
		</PermissionSetter>
	);
};

/**
 * The form gets the query of the grid behind it from the CRUD dispatch,
 * including what an override set - without any persistence provider
 */
export const GridQueryFromForm: StoryObj = {
	render: () => <GridQueryCrudContent />,
	play: async ({ canvas }) => {
		await userEvent.dblClick(await canvas.findByText("Alice"));
		await userEvent.click(
			await canvas.findByRole("button", { name: "Show grid query" }),
		);
		await expect(
			JSON.parse(canvas.getByTestId("grid-query").textContent ?? "") as unknown,
		).toEqual({
			quickFilter: "",
			additionalFilters: { department: "Engineering" },
			fieldFilter: {},
			sort: [],
		});
	},
};
