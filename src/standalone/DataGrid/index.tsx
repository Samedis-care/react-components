import React, { Dispatch, SetStateAction, useState } from "react";
import { Grid, Theme } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Header, { IDataGridHeaderProps } from "./Header";
import Footer, { IDataGridFooterProps } from "./Footer";
import Settings from "./Settings";
import Content from "./Content";

export type IDataGridProps = IDataGridHeaderProps &
	IDataGridFooterProps &
	IDataGridColumnProps;

export interface IDataGridColumnProps {
	columns: IDataGridColumnDef[];
}

export interface IDataGridColumnDef {
	field: string;
	headerName: string;
}

export interface IDataGridState {
	search: string;
	rowsPerPage: number;
	rowsTotal: number;
	pageIndex: number;
	showSettings: boolean;
	hiddenColumns: string[];
	lockedColumns: string[];
}

export const DataGridStateContext = React.createContext<
	[IDataGridState, Dispatch<SetStateAction<IDataGridState>>] | undefined
>(undefined);

const useStyles = makeStyles((theme: Theme) => ({
	wrapper: {
		width: "100%",
		height: "100%",
		border: `1px solid ${theme.palette.divider}`,
		borderRadius: 8,
	},
	middle: {
		borderTop: `1px solid ${theme.palette.divider}`,
		borderBottom: `1px solid ${theme.palette.divider}`,
		position: "relative",
	},
}));

export default React.memo((props: IDataGridProps) => {
	const { columns } = props;

	const classes = useStyles();
	const statePack = useState<IDataGridState>(() => ({
		search: "",
		rowsPerPage: 25,
		rowsTotal: 100,
		pageIndex: 0,
		showSettings: false,
		hiddenColumns: [],
		lockedColumns: [],
	}));

	return (
		<Grid
			container
			direction={"column"}
			justify={"space-between"}
			alignItems={"stretch"}
			className={classes.wrapper}
		>
			<DataGridStateContext.Provider value={statePack}>
				<Grid item>
					<Header />
				</Grid>
				<Grid item xs className={classes.middle}>
					<Settings columns={columns} />
					<Content columns={columns} />
				</Grid>
				<Grid item>
					<Footer />
				</Grid>
			</DataGridStateContext.Provider>
		</Grid>
	);
});
