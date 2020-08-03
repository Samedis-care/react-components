import React from "react";
import { Table, TableBody, makeStyles } from "@material-ui/core";
import { IDataGridColumnProps } from "../index";
import Header from "./Header";
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
}

export default React.memo((props: IDataGridContentProps) => {
	const classes = useStyles();

	return (
		<div className={classes.contentWrapper}>
			<Table className={classes.table}>
				<Header columns={props.columns} />
				<TableBody>
					{new Array(props.rowsPerPage).fill(undefined).map((_, index) => (
						<Row columns={props.columns} key={index} />
					))}
				</TableBody>
			</Table>
		</div>
	);
});
