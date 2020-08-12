import React from "react";
import {
	Grid,
	IconButton,
	MenuItem,
	Select,
	Tooltip,
	Typography,
} from "@material-ui/core";
import { VerticalDivider } from "../../index";
import {
	ChevronLeft as PreviousPageIcon,
	ChevronRight as NextPageIcon,
	FirstPage as FirstPageIcon,
	LastPage as LastPageIcon,
} from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
	text: {
		padding: "12px 0",
	},
	firstPageBtn: {
		paddingLeft: 0,
	},
});

export interface IDataGridPaginationViewProps {
	setPageSize: (
		evt: React.ChangeEvent<{ name?: string; value: unknown }>
	) => void;
	gotoFirstPage: () => void;
	gotoPrevPage: () => void;
	gotoNextPage: () => void;
	gotoLastPage: () => void;
	pageIndex: number;
	rowsPerPage: number;
	rowsTotal: number;
}

export default React.memo((props: IDataGridPaginationViewProps) => {
	const classes = useStyles();

	// calculate view indices
	const startRowIndex = props.pageIndex * props.rowsPerPage + 1;
	const endRowIndex = Math.min(
		(props.pageIndex + 1) * props.rowsPerPage,
		props.rowsTotal
	);
	const isFirstPage = props.pageIndex === 0;
	const isLastPage = endRowIndex === props.rowsTotal;

	return (
		<Grid container spacing={2}>
			<Grid item>
				<Typography className={classes.text}>Page size:</Typography>
			</Grid>
			<Grid item>
				<Select
					variant={"standard"}
					margin={"dense"}
					value={props.rowsPerPage}
					className={classes.text}
					onChange={props.setPageSize}
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
					{startRowIndex} - {endRowIndex} of {props.rowsTotal}
				</Typography>
			</Grid>
			<Grid item>
				<VerticalDivider />
			</Grid>
			<Grid item>
				<Grid container>
					<Grid item>
						<Tooltip title={"First page"} placement={"top"}>
							<span>
								<IconButton
									disabled={isFirstPage}
									onClick={props.gotoFirstPage}
									className={classes.firstPageBtn}
								>
									<FirstPageIcon />
								</IconButton>
							</span>
						</Tooltip>
					</Grid>
					<Grid item>
						<Tooltip title={"Previous page"} placement={"top"}>
							<span>
								<IconButton disabled={isFirstPage} onClick={props.gotoPrevPage}>
									<PreviousPageIcon />
								</IconButton>
							</span>
						</Tooltip>
					</Grid>
					<Grid item>
						<Tooltip title={"Next page"} placement={"top"}>
							<span>
								<IconButton disabled={isLastPage} onClick={props.gotoNextPage}>
									<NextPageIcon />
								</IconButton>
							</span>
						</Tooltip>
					</Grid>
					<Grid item>
						<Tooltip title={"Last page"} placement={"top"}>
							<span>
								<IconButton disabled={isLastPage} onClick={props.gotoLastPage}>
									<LastPageIcon />
								</IconButton>
							</span>
						</Tooltip>
					</Grid>
				</Grid>
			</Grid>
		</Grid>
	);
});
