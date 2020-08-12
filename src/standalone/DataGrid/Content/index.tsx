import React from "react";
import { Table, TableBody, makeStyles } from "@material-ui/core";
import { DataGridRowData, IDataGridColumnProps } from "../index";
import Header, { IDataGridColumnStateProps } from "./Header";
import Row from "./Row";

const useStyles = makeStyles({
	contentWrapper: {
		position: "absolute",
		maxHeight: "100%",
		width: "100%",
		overflow: "auto",
	},
	table: {
		borderCollapse: "separate",
	},
});

export interface IDataGridContentProps
	extends IDataGridColumnProps,
		IDataGridColumnStateProps {
	rowsPerPage: number;
	rows: DataGridRowData[];
}

export default React.memo((props: IDataGridContentProps) => {
	const classes = useStyles();

	return (
		<div className={classes.contentWrapper}>
			<Table className={classes.table}>
				<Header
					columns={props.columns}
					columnState={props.columnState}
					setColumnState={props.setColumnState}
				/>
				<TableBody>
					{props.rows.map((rowData, index) => (
						<Row columns={props.columns} key={index} data={rowData} />
					))}
				</TableBody>
			</Table>
		</div>
	);
});
