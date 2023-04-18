import React, { useCallback, useEffect, useRef, useState } from "react";
import { Grid, Box, Button, Theme } from "@mui/material";
import moment, { Moment } from "moment";
import ScrollableScheduleWeek from "./ScrollableScheduleWeek";
import InfiniteScroll from "../../InfiniteScroll";
import { IDayData, ScheduleFilterDefinition } from "../Common/DayContents";
import { combineClassNames } from "../../../utils";
import useCCTranslations from "../../../utils/useCCTranslations";
import makeStyles from "@mui/styles/makeStyles";

/**
 * Callback to load week data from a data source
 * @param weekOffset The week relative to the current week of year
 * 					 Example: -1 for last week, 0 for this week, 1 for next week
 * @param filter The filter selected by the user
 * @returns A promise containing the data for the days of the week, may throw an
 * 			error. Format: IDayData[weekday starting Monday][n]
 */
export type LoadWeekCallback = (
	weekOffset: number,
	filter: string | null
) => IDayData[][] | Promise<IDayData[][]>;

export interface ScrollableScheduleProps {
	/**
	 * CSS Class which specifies the infinite scroll height
	 */
	wrapperClass: string;
	/**
	 * The callback to load data for a week
	 */
	loadWeekCallback: LoadWeekCallback;

	/**
	 * Optional filter
	 */
	filter?: ScheduleFilterDefinition;
}

/**
 * Outdated alias
 * @deprecated use ScrollableScheduleProps
 */
export type IProps = ScrollableScheduleProps;

interface ScrollableScheduleState {
	/**
	 * Array of ScrollableScheduleWeek components
	 */
	items: JSX.Element[];
	/**
	 * Infinite scroll top most week offset
	 */
	dataOffsetTop: number;
	/**
	 * Infinite scroll bottom most week offset
	 */
	dataOffsetBottom: number;
	/**
	 * Today as moment.js object
	 */
	today: Moment;
	/**
	 * The selected filter value
	 */
	filterValue: string | null;
}

const useStyles = makeStyles(
	(theme: Theme) => ({
		today: {
			backgroundColor: theme.palette.primary.main,
			color: theme.palette.getContrastText(theme.palette.primary.main),
			borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
		},
		todayBtn: {
			textTransform: "none",
			textAlign: "left",
			color: "inherit",
			display: "block",
		},
		scroller: {
			overflow: "auto",
			borderRadius: `0 0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px`,
			position: "relative",
		},
		filterWrapper: {
			top: "50%",
			position: "relative",
			transform: "translateY(-50%)",
		},
		filterSelect: {
			backgroundColor: "transparent",
			border: "none",
			color: theme.palette.getContrastText(theme.palette.primary.main),
			cursor: "pointer",
		},
	}),
	{ name: "CcScrollableSchedule" }
);

const preventAction = (evt: React.MouseEvent) => {
	evt.stopPropagation();
};

const ScrollableSchedule = (props: ScrollableScheduleProps) => {
	const { loadWeekCallback, filter, wrapperClass } = props;
	const { i18n } = useCCTranslations();
	const classes = useStyles();
	const todayElem = useRef<HTMLElement | null>(null);
	const scrollElem = useRef<InfiniteScroll | null>(null);

	const getDefaultState = useCallback(
		() => ({
			items: [],
			dataOffsetTop: -1,
			dataOffsetBottom: 0,
			today: moment(),
			filterValue: filter?.defaultValue ?? null,
		}),
		[filter]
	);

	const [state, setState] = useState<ScrollableScheduleState>(getDefaultState);

	useEffect(() => {
		const onLanguageChanged = () => {
			setState(getDefaultState);
		};
		i18n.on("languageChanged", onLanguageChanged);
		return () => {
			i18n.off("languageChanged", onLanguageChanged);
		};
	}, [getDefaultState, i18n]);

	/**
	 * Loads more data in the infinite scroll
	 * @param top load more data on top? (if false loads more data at bottom)
	 */
	const loadMore = useCallback(
		(top: boolean) => {
			const page = top ? state.dataOffsetTop : state.dataOffsetBottom;
			const item = (
				<ScrollableScheduleWeek
					key={page.toString()}
					loadData={() => loadWeekCallback(page, state.filterValue)}
					setTodayElement={(elem: HTMLElement | null) =>
						(todayElem.current = elem)
					}
					moment={state.today.clone().add(page - 1, "weeks")}
				/>
			);
			if (top) {
				setState((prevState) => ({
					...prevState,
					items: [item, ...prevState.items],
					dataOffsetTop: prevState.dataOffsetTop - 1,
				}));
			} else {
				setState((prevState) => ({
					...prevState,
					items: [...prevState.items, item],
					dataOffsetBottom: prevState.dataOffsetBottom + 1,
				}));
			}
		},
		[
			loadWeekCallback,
			state.dataOffsetBottom,
			state.dataOffsetTop,
			state.filterValue,
			state.today,
		]
	);

	/**
	 * Loads more data on top of the scroller
	 */
	const loadMoreTop = useCallback(() => loadMore(true), [loadMore]);
	/**
	 * Loads more data at the bottom of the scroller
	 */
	const loadMoreBottom = useCallback(() => loadMore(false), [loadMore]);

	const jumpToToday = useCallback(() => {
		if (
			!todayElem.current ||
			!scrollElem.current ||
			!scrollElem.current.wrapper
		) {
			return;
		}

		scrollElem.current.wrapper.scrollTop = todayElem.current.offsetTop;
	}, []);

	const handleFilterSelect = useCallback(
		(evt: React.ChangeEvent<HTMLSelectElement>) => {
			setState({
				...getDefaultState(),
				filterValue: evt.target.value,
			});
		},
		[getDefaultState]
	);

	return (
		<Grid container>
			<Grid item xs={12} className={classes.today} onClick={jumpToToday}>
				<Grid container justifyContent={"space-between"}>
					<Grid item>
						<Button
							className={classes.todayBtn}
							onClick={jumpToToday}
							fullWidth
						>
							<Box m={2}>{state.today.format("ddd DD MMMM")}</Box>
						</Button>
					</Grid>
					<Grid item>
						{filter && (
							<Box px={2} className={classes.filterWrapper}>
								<select
									onClick={preventAction}
									className={classes.filterSelect}
									value={state.filterValue ?? ""}
									onChange={handleFilterSelect}
								>
									{Object.entries(filter.options).map(([value, label]) => (
										<option value={value} key={value}>
											{label}
										</option>
									))}
								</select>
							</Box>
						)}
					</Grid>
				</Grid>
			</Grid>
			<Grid item xs={12}>
				<InfiniteScroll
					className={combineClassNames([wrapperClass, classes.scroller])}
					loadMoreTop={loadMoreTop}
					loadMoreBottom={loadMoreBottom}
					ref={scrollElem}
				>
					<Box m={2}>
						<Grid container spacing={2}>
							{state.items}
						</Grid>
					</Box>
				</InfiniteScroll>
			</Grid>
		</Grid>
	);
};

export default React.memo(ScrollableSchedule);
