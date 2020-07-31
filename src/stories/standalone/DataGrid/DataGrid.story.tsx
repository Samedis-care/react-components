import React from "react";
import "../../../i18n";
import { withKnobs } from "@storybook/addon-knobs";
import { DataGrid } from "../../../standalone";
import { makeStyles } from "@material-ui/core/styles";
import { IDataGridColumnDef } from "../../../standalone/DataGrid";

export default {
	title: "Standalone/DataGrid",
	component: DataGrid,
	decorators: [withKnobs],
};

const useStyles = makeStyles({
	wrapper: {
		width: "75vw",
		height: "90vh",
	},
});

const columnDef: IDataGridColumnDef[] = new Array(30)
	.fill(undefined)
	.map((_, index) => ({
		field: "field_" + index,
		headerName: "Field number " + index,
	}));

export const DataGridStory = () => {
	const classes = useStyles();

	return (
		<div className={classes.wrapper}>
			<DataGrid columns={columnDef} />
		</div>
	);
};

DataGridStory.story = {
	name: "Basic",
};
