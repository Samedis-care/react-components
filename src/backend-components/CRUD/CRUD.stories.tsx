import React, { useEffect, useMemo } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Grid } from "@mui/material";
import { Framework, usePermissionContext } from "../../framework";
import CRUD, { CrudFormProps } from "./index";
import FormField from "../Form/Field";
import DefaultErrorComponent from "../Form/DefaultErrorComponent";
import createTestModel from "../../stories/test-utils/TestModel";
import { ModelFieldName } from "../../backend-integration";
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
const CrudFormContent = (_props: PageProps<ModelFieldName, CrudFormProps>) => (
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
