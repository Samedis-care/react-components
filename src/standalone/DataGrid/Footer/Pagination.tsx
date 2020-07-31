import React, { useCallback, useContext } from "react";
import {
	Grid,
	IconButton,
	MenuItem,
	Select,
	Tooltip,
	Typography,
} from "@material-ui/core";
import {
	FirstPage as FirstPageIcon,
	ChevronLeft as PreviousPageIcon,
	ChevronRight as NextPageIcon,
	LastPage as LastPageIcon,
} from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import { VerticalDivider } from "../../index";
import { DataGridStateContext } from "../index";

const useStyles = makeStyles({
	text: {
		padding: "12px 0",
	},
	firstPageBtn: {
		paddingLeft: 0,
	},
});

const calcLastPage = (rowsTotal: number, rowsPerPage: number) => {
	let lastPage = rowsTotal / rowsPerPage;
	if ((lastPage | 0) !== lastPage) {
		lastPage = (lastPage | 0) + 1;
	}
	if (lastPage < 1) lastPage = 1;
	return lastPage;
};

export default React.memo(() => {
	const classes = useStyles();
	const [state, setState] = useContext(DataGridStateContext)!;

	// event handlers
	const setPageSize = useCallback(
		(evt: React.ChangeEvent<{ name?: string; value: unknown }>) => {
			const newValue = evt.target.value as number;
			setState((prevState) => ({
				...prevState,
				rowsPerPage: newValue,
			}));
		},
		[setState]
	);
	const gotoFirstPage = useCallback(() => {
		setState((prevState) => ({
			...prevState,
			pageIndex: 0,
		}));
	}, [setState]);
	const gotoPrevPage = useCallback(() => {
		setState((prevState) => ({
			...prevState,
			pageIndex: Math.max(prevState.pageIndex - 1, 0),
		}));
	}, [setState]);
	const gotoNextPage = useCallback(() => {
		setState((prevState) => {
			const lastPage = calcLastPage(prevState.rowsTotal, prevState.rowsPerPage);
			return {
				...prevState,
				pageIndex: Math.min(prevState.pageIndex + 1, lastPage - 1),
			};
		});
	}, [setState]);
	const gotoLastPage = useCallback(() => {
		setState((prevState) => {
			const lastPage = calcLastPage(prevState.rowsTotal, prevState.rowsPerPage);
			return {
				...prevState,
				pageIndex: lastPage - 1,
			};
		});
	}, [setState]);

	// calculate view indices
	const startRowIndex = state.pageIndex * state.rowsPerPage + 1;
	const endRowIndex = Math.min(
		(state.pageIndex + 1) * state.rowsPerPage,
		state.rowsTotal
	);
	const isFirstPage = state.pageIndex === 0;
	const isLastPage = endRowIndex === state.rowsTotal;

	return (
		<Grid container spacing={2}>
			<Grid item>
				<Typography className={classes.text}>Page size:</Typography>
			</Grid>
			<Grid item>
				<Select
					variant={"standard"}
					margin={"dense"}
					value={state.rowsPerPage}
					className={classes.text}
					onChange={setPageSize}
					disableUnderline
				>
					<MenuItem value={10}>10</MenuItem>
					<MenuItem value={25}>25</MenuItem>
					<MenuItem value={50}>50</MenuItem>
					<MenuItem value={100}>100</MenuItem>
				</Select>
			</Grid>
			<Grid item>
				<VerticalDivider />
			</Grid>
			<Grid item>
				<Typography className={classes.text}>
					{startRowIndex} - {endRowIndex} of {state.rowsTotal}
				</Typography>
			</Grid>
			<Grid item>
				<VerticalDivider />
			</Grid>
			<Grid item>
				<Grid container>
					<Grid item>
						<Tooltip title={"First page"} placement={"top"}>
							<IconButton
								disabled={isFirstPage}
								onClick={gotoFirstPage}
								className={classes.firstPageBtn}
							>
								<FirstPageIcon />
							</IconButton>
						</Tooltip>
					</Grid>
					<Grid item>
						<Tooltip title={"Previous page"} placement={"top"}>
							<IconButton disabled={isFirstPage} onClick={gotoPrevPage}>
								<PreviousPageIcon />
							</IconButton>
						</Tooltip>
					</Grid>
					<Grid item>
						<Tooltip title={"Next page"} placement={"top"}>
							<IconButton disabled={isLastPage} onClick={gotoNextPage}>
								<NextPageIcon />
							</IconButton>
						</Tooltip>
					</Grid>
					<Grid item>
						<Tooltip title={"Last page"} placement={"top"}>
							<IconButton disabled={isLastPage} onClick={gotoLastPage}>
								<LastPageIcon />
							</IconButton>
						</Tooltip>
					</Grid>
				</Grid>
			</Grid>
		</Grid>
	);
});
