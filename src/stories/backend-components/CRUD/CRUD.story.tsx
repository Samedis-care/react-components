import React, { useEffect } from "react";
import ErrorComponent from "../Form/ErrorComponent";
import CRUD, { CrudFormProps } from "../../../backend-components/CRUD";
import TestModelInstance from "../DataGrid/TestModel";
import { usePermissionContext } from "../../../framework";
import { boolean } from "@storybook/addon-knobs";
import { Button, Grid } from "@material-ui/core";
import Field from "../../../backend-components/Form/Field";
import { PageProps } from "../../../backend-components";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(
	{
		wrapper: {
			width: "95vw",
			height: "95vh",
		},
	},
	{ name: "CcCRUDStory" }
);

export const CrudStory = (): React.ReactElement => {
	const classes = useStyles();
	const [, setPerms] = usePermissionContext();
	const allowDelete = boolean("Allow delete", true);
	const allowRead = boolean("Allow read", true);
	const allowEdit = boolean("Allow edit", true);
	const allowNew = boolean("Allow create new", true);
	const allowExport = boolean("Allow export", true);

	useEffect(() => {
		const perms = [];
		if (allowDelete) perms.push("crud.delete");
		if (allowRead) perms.push("crud.read");
		if (allowEdit) perms.push("crud.edit");
		if (allowNew) perms.push("crud.new");
		if (allowExport) perms.push("crud.export");
		setPerms(perms);
	}, [allowDelete, allowEdit, allowNew, allowExport, setPerms, allowRead]);

	return (
		<div className={classes.wrapper}>
			<CRUD
				model={TestModelInstance}
				formProps={{ errorComponent: ErrorComponent }}
				gridProps={{}}
				deletePermission={"crud.delete"}
				readPermission={"crud.read"}
				editPermission={"crud.edit"}
				newPermission={"crud.new"}
				exportPermission={"crud.export"}
				disableRouting
			>
				{(
					formProps: PageProps<
						keyof typeof TestModelInstance.fields,
						CrudFormProps
					>
				) => (
					<Grid container spacing={2}>
						<Grid item xs={6} style={{ height: 120 }}>
							<Field name={"avatar"} />
						</Grid>
						<Grid item xs={6} container spacing={2}>
							<Grid item xs={12}>
								<Field name={"first_name"} />
							</Grid>
							<Grid item xs={12}>
								<Field name={"last_name"} />
							</Grid>
						</Grid>
						<Grid item xs={3}>
							<Field name={"employee_no"} />
						</Grid>
						<Grid item xs={9}>
							<Field name={"account"} />
						</Grid>
						<Grid item xs={6}>
							<Field name={"joined"} />
						</Grid>
						<Grid item xs={6}>
							<Field name={"left"} />
						</Grid>
						<Grid item xs={4}>
							<Field name={"email"} />
						</Grid>
						<Grid item xs={4}>
							<Field name={"mobile_number"} />
						</Grid>
						<Grid item xs={4}>
							<Field name={"title"} />
						</Grid>
						<Grid item xs={12}>
							<Field name={"notes"} />
						</Grid>
						<Grid item xs={6}>
							<Button
								type={"submit"}
								disabled={formProps.isSubmitting}
								variant={"outlined"}
								onClick={async () => {
									try {
										await formProps.submit();
									} catch (e) {
										alert(e);
									}
								}}
								fullWidth
							>
								Save
							</Button>
						</Grid>
						<Grid item xs={6}>
							<Button
								disabled={formProps.isSubmitting}
								variant={"outlined"}
								fullWidth
								onClick={formProps.customProps.goBack}
							>
								Back
							</Button>
						</Grid>
					</Grid>
				)}
			</CRUD>
		</div>
	);
};

CrudStory.storyName = "CRUD";
