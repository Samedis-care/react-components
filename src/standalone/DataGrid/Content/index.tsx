import React from "react";
import { makeStyles, Table, TableBody } from "@material-ui/core";
import { DataGridRowData, IDataGridColumnProps } from "../index";
import Header from "./ContentHeader";
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

export interface IDataGridContentProps extends IDataGridColumnProps {
	rowsPerPage: number;
	rows: DataGridRowData[];
}

const Content = (props: IDataGridContentProps) => {
	const classes = useStyles();

	return (
		<div className={classes.contentWrapper}>
			<Table className={classes.table}>
				<Header columns={props.columns} />
				<TableBody>
					{props.rows.map((rowData, index) => (
						<Row columns={props.columns} key={index} data={rowData} />
					))}
				</TableBody>
			</Table>
		</div>
	);
};

export default React.memo(Content);
