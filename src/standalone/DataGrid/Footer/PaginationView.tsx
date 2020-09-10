import React from "react";
import {
	Box,
	Grid,
	Hidden,
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
import i18n from "../../../i18n";

const useStyles = makeStyles((theme) => ({
	text: {
		padding: "12px 0",
	},
	firstPageBtn: {
		paddingLeft: 0,
	},
	paginationBtn: {
		[theme.breakpoints.down("sm")]: {
			paddingLeft: 4,
			paddingRight: 4,
		},
	},
	vertDivWrapper: {
		height: "100%",
	},
}));

export interface IDataGridPaginationViewProps {
	/**
	 * Set page size callback
	 * @param evt The change event
	 */
	setPageSize: (
		evt: React.ChangeEvent<{ name?: string; value: unknown }>
	) => void;
	/**
	 * Go to first page callback
	 */
	gotoFirstPage: () => void;
	/**
	 * Go to previous page callback
	 */
	gotoPrevPage: () => void;
	/**
	 * Go to next page callback
	 */
	gotoNextPage: () => void;
	/**
	 * Go to last page callback
	 */
	gotoLastPage: () => void;
	/**
	 * The current page (zero based index)
	 */
	pageIndex: number;
	/**
	 * The amount of rows per page (max)
	 */
	rowsPerPage: number;
	/**
	 * The total amount of rows
	 */
	rowsTotal: number;
}

const PaginationView = (props: IDataGridPaginationViewProps) => {
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
		<Grid container wrap={"nowrap"}>
			<Hidden xsDown implementation={"css"}>
				<Grid item key={"page-size-label"}>
					<Box ml={2}>
						<Typography className={classes.text}>
							{i18n.t("standalone.data-grid.footer.page-size")!}
						</Typography>
					</Box>
				</Grid>
			</Hidden>
			<Grid item key={"page-size-select"}>
				<Box ml={2}>
					<Tooltip
						disableHoverListener
						title={i18n.t("standalone.data-grid.footer.page-size-tooltip")!}
					>
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
					</Tooltip>
				</Box>
			</Grid>
			<Grid item key={"page-size-stats-divider"}>
				<Box mx={2} className={classes.vertDivWrapper}>
					<VerticalDivider />
				</Box>
			</Grid>
			<Grid item key={"page-stats"}>
				<Typography className={classes.text}>
					{startRowIndex} - {endRowIndex}{" "}
					{i18n.t("standalone.data-grid.footer.page-of")!} {props.rowsTotal}
				</Typography>
			</Grid>
			<Grid item key={"page-stats-controls-divider"}>
				<Box mx={2} className={classes.vertDivWrapper}>
					<VerticalDivider />
				</Box>
			</Grid>
			<Grid item key={"page-controls"}>
				<Grid container>
					<Grid item xs={6} sm={3}>
						<Tooltip
							title={i18n.t("standalone.data-grid.footer.first-page")!}
							placement={"top"}
						>
							<span>
								<IconButton
									disabled={isFirstPage}
									onClick={props.gotoFirstPage}
									className={`${classes.paginationBtn} ${classes.firstPageBtn}`}
								>
									<FirstPageIcon />
								</IconButton>
							</span>
						</Tooltip>
					</Grid>
					<Grid item xs={6} sm={3}>
						<Tooltip
							title={i18n.t("standalone.data-grid.footer.prev-page")!}
							placement={"top"}
						>
							<span>
								<IconButton
									disabled={isFirstPage}
									onClick={props.gotoPrevPage}
									className={classes.paginationBtn}
								>
									<PreviousPageIcon />
								</IconButton>
							</span>
						</Tooltip>
					</Grid>
					<Grid item xs={6} sm={3}>
						<Tooltip
							title={i18n.t("standalone.data-grid.footer.next-page")!}
							placement={"top"}
						>
							<span>
								<IconButton
									disabled={isLastPage}
									onClick={props.gotoNextPage}
									className={classes.paginationBtn}
								>
									<NextPageIcon />
								</IconButton>
							</span>
						</Tooltip>
					</Grid>
					<Grid item xs={6} sm={3}>
						<Tooltip
							title={i18n.t("standalone.data-grid.footer.last-page")!}
							placement={"top"}
						>
							<span>
								<IconButton
									disabled={isLastPage}
									onClick={props.gotoLastPage}
									className={classes.paginationBtn}
								>
									<LastPageIcon />
								</IconButton>
							</span>
						</Tooltip>
					</Grid>
				</Grid>
			</Grid>
		</Grid>
	);
};

export default React.memo(PaginationView);
