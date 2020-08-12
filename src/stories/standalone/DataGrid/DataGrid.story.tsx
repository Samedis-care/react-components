import React from "react";
import "../../../i18n";
import { boolean, text, withKnobs } from "@storybook/addon-knobs";
import { DataGrid } from "../../../standalone";
import { makeStyles } from "@material-ui/core/styles";
import {
	DataGridRowData,
	IDataGridColumnDef,
} from "../../../standalone/DataGrid";
import { action } from "@storybook/addon-actions";

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

const generateRow = (id: number): DataGridRowData => {
	const ret: DataGridRowData = { id: id.toString() };
	columnDef.forEach((column, colIndex) => {
		ret[column.field] = `Y ${id} X ${colIndex}`;
	});
	return ret;
};

export const DataGridStory = () => {
	const classes = useStyles();

	return (
		<div className={classes.wrapper}>
			<DataGrid
				columns={columnDef}
				searchPlaceholder={text("Search placeholder", "")}
				onAddNew={
					boolean("Enable add new", true) ? action("onAddNew") : undefined
				}
				onEdit={boolean("Enable edit", true) ? action("onEdit") : undefined}
				onDelete={
					boolean("Enable delete", true) ? action("onDelete") : undefined
				}
				loadData={async (
					page,
					rowsPerPage,
					quickFilter,
					additionalFilters,
					fieldFilter,
					sort
				): Promise<DataGridRowData[]> => {
					console.log("loadData", {
						page,
						rowsPerPage,
						quickFilter,
						additionalFilters,
						fieldFilter,
						sort,
					});

					return new Array(rowsPerPage)
						.fill(undefined)
						.map((_, index) => generateRow((page - 1) * rowsPerPage + index));
				}}
			/>
		</div>
	);
};

DataGridStory.story = {
	name: "Basic",
};
