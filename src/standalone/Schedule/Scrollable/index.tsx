import React, { useCallback, useEffect, useRef, useState } from "react";
import {
	Box,
	Button,
	Divider,
	Grid,
	IconButton,
	Menu,
	styled,
	useThemeProps,
} from "@mui/material";
import { Settings as SettingsIcon } from "@mui/icons-material";
import moment, { Moment } from "moment";
import ScrollableScheduleWeek from "./ScrollableScheduleWeek";
import InfiniteScroll from "../../InfiniteScroll";
import {
	IDayData,
	ScheduleAction,
	ScheduleFilterDefinition,
} from "../Common/DayContents";
import combineClassNames from "../../../utils/combineClassNames";
import useCCTranslations from "../../../utils/useCCTranslations";
import ScrollableFilterRenderer from "../Common/ScheduleFilterRenderers";
import throwError from "../../../utils/throwError";

/**
 * Callback to load week data from a data source
 *
 * ScrollableSchedule calls it for each week it adds to the list. A filter
 * change and a components-care language change start the list over as on
 * mount: it is emptied and filled again from the current week (offset 0) on.
 * When it is passed a new function, it calls the new one for every week in
 * the list; each week keeps its rows until the new result arrives, and a
 * result or error of an earlier call that arrives later is ignored. Pass a
 * function that changes only when the data source does (`useCallback`): a new
 * function on every render reloads the list on every render.
 * @param weekOffset The week relative to the current week of year
 * 					 Example: -1 for last week, 0 for this week, 1 for next week
 * @param filter The filter selected by the user
 * @returns A promise containing the data for the days of the week, may reject
 * 			or throw. Format: IDayData[weekday starting Monday][n]. A failed week
 * 			shows an alert "Week N could not be loaded" with a Retry button, and
 * 			below its title the `message` of the Error (or of any other object
 * 			with a string `message`) or the string it rejected with; any other
 * 			value (`undefined`, a fetch Response, …) shows the title only.
 */
export type LoadWeekCallback = (
	weekOffset: number,
	filters: Record<string, string | boolean>,
) => IDayData[][] | Promise<IDayData[][]>;

export interface ScrollableScheduleProps {
	/**
	 * CSS Class which specifies the infinite scroll height
	 */
	wrapperClass: string;
	/**
	 * The callback to load data for a week. A new function reloads the weeks in
	 * the list (see LoadWeekCallback).
	 */
	loadWeekCallback: LoadWeekCallback;

	/**
	 * Optional filter. A change calls the filter's `onChange` and starts the
	 * list over at the current week, as on mount (see LoadWeekCallback).
	 */
	filters?: Record<string, ScheduleFilterDefinition>;
	/**
	 * Optional actions
	 */
	actions?: ScheduleAction[];

	/**
	 * CSS class to apply to root
	 */
	className?: string;
	/**
	 * Custom CSS classes
	 */
	classes?: Partial<Record<ScrollableScheduleClassKey, string>>;
}

/**
 * Outdated alias
 * @deprecated use ScrollableScheduleProps
 */
export type IProps = ScrollableScheduleProps;

interface ScrollableScheduleState<
	Filters extends Record<string, ScheduleFilterDefinition>,
> {
	/**
	 * Week offset of the next week to add at the top. The list shows the weeks
	 * between dataOffsetTop and dataOffsetBottom, both exclusive.
	 */
	dataOffsetTop: number;
	/**
	 * Week offset of the next week to add at the bottom
	 */
	dataOffsetBottom: number;
	/**
	 * Today as moment.js object
	 */
	today: Moment;
	/**
	 * The selected filter value
	 */
	filterValues: {
		[FilterName in keyof Filters]: Filters[FilterName]["defaultValue"];
	};
	/**
	 * Key of the scroll container. Starting the list over gives it a new key,
	 * so the new container is filled as on mount, at its top. Emptying the old
	 * one instead would make the browser clamp its scroll position to 0 and
	 * fire a scroll event, which counts as reaching the top and loads last week
	 * first.
	 */
	listKey: number;
}

const TodayButtonWrapper = styled(Grid, {
	name: "CcScrollableSchedule",
	slot: "today",
})(({ theme }) => ({
	backgroundColor: theme.palette.primary.main,
	color: theme.palette.primary.contrastText,
	borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
}));

const TodayButton = styled(Button, {
	name: "CcScrollableSchedule",
	slot: "todayBtn",
})({
	textTransform: "none",
	textAlign: "left",
	color: "inherit",
	display: "block",
});

const StyledInfiniteScroll = styled(InfiniteScroll, {
	name: "CcScrollableSchedule",
	slot: "scroller",
})(({ theme }) => ({
	overflow: "auto",
	borderRadius: `0 0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px`,
	position: "relative",
}));

const FilterSettingsIcon = styled(SettingsIcon, {
	name: "CcScrollableSchedule",
	slot: "filterSettingsBtn",
})(({ theme }) => ({
	color: theme.palette.primary.contrastText,
}));

const FilterWrapper = styled(Box, {
	name: "CcScrollableSchedule",
	slot: "filterWrapper",
})({
	top: "50%",
	position: "relative",
	transform: "translateY(-50%)",
});

export type ScrollableScheduleClassKey =
	"today" | "todayBtn" | "scroller" | "filterSettingsBtn" | "filterWrapper";

const preventAction = (evt: React.MouseEvent) => {
	evt.stopPropagation();
};

const EMPTY_FILTERS: Record<string, ScheduleFilterDefinition> = {};
const NO_ACTIONS: ScheduleAction[] = [];
const ScrollableSchedule = (inProps: ScrollableScheduleProps) => {
	const props = useThemeProps({ props: inProps, name: "CcScrollableSchedule" });
	const { loadWeekCallback, wrapperClass, className, classes } = props;
	const filters = props.filters ?? EMPTY_FILTERS;
	const actions = props.actions ?? NO_ACTIONS;
	const { t, i18n } = useCCTranslations();
	const todayElem = useRef<HTMLElement | null>(null);
	const scrollElem = useRef<HTMLDivElement | null>(null);
	/**
	 * Set when the list is started over while focus is inside it, so that the
	 * new scroll container takes the focus instead of the page
	 */
	const refocusList = useRef(false);

	const getDefaultState = useCallback(
		(): ScrollableScheduleState<typeof filters> => ({
			dataOffsetTop: -1,
			dataOffsetBottom: 0,
			today: moment(),
			filterValues: filters
				? Object.fromEntries(
						Object.entries(filters).map(([key, filter]) => [
							key,
							filter.defaultValue,
						]),
					)
				: {},
			listKey: 0,
		}),
		[filters],
	);

	const [state, setState] =
		useState<ScrollableScheduleState<typeof filters>>(getDefaultState);

	/**
	 * Starts the list over as on mount: from the current week, in a new scroll
	 * container (see `listKey`)
	 * @param changedFilters The filter values to change; the others are kept
	 */
	const startOver = useCallback(
		(changedFilters?: Record<string, string | boolean>) => {
			const list = scrollElem.current;
			refocusList.current =
				!!list && list.contains(list.ownerDocument.activeElement);
			setState((prev) => ({
				...getDefaultState(),
				filterValues: { ...prev.filterValues, ...changedFilters },
				listKey: prev.listKey + 1,
			}));
		},
		[getDefaultState],
	);

	useEffect(() => {
		if (!refocusList.current) return;
		refocusList.current = false;
		scrollElem.current?.focus();
	}, [state.listKey]);

	useEffect(() => {
		// not startOver itself: i18next passes the language, not filter values
		const onLanguageChanged = () => {
			startOver();
		};
		i18n.on("languageChanged", onLanguageChanged);
		return () => {
			i18n.off("languageChanged", onLanguageChanged);
		};
	}, [startOver, i18n]);

	/**
	 * Loads more data in the infinite scroll
	 * @param top load more data on top? (if false loads more data at bottom)
	 */
	const loadMore = useCallback((top: boolean) => {
		if (top) {
			setState((prevState) => ({
				...prevState,
				dataOffsetTop: prevState.dataOffsetTop - 1,
			}));
		} else {
			setState((prevState) => ({
				...prevState,
				dataOffsetBottom: prevState.dataOffsetBottom + 1,
			}));
		}
	}, []);

	/**
	 * Loads more data on top of the scroller
	 */
	const loadMoreTop = useCallback(() => loadMore(true), [loadMore]);
	/**
	 * Loads more data at the bottom of the scroller
	 */
	const loadMoreBottom = useCallback(() => loadMore(false), [loadMore]);

	const setTodayElement = useCallback((elem: HTMLElement | null) => {
		todayElem.current = elem;
	}, []);

	const jumpToToday = useCallback(() => {
		if (!todayElem.current || !scrollElem.current) return;

		scrollElem.current.scrollTop = todayElem.current.offsetTop;
	}, []);

	const handleFilterChange = useCallback(
		(evt: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
			const value =
				evt.target.type === "checkbox" ? evt.target.checked : evt.target.value;
			startOver({ [evt.target.name]: value });
			if (!props.filters) return;
			const changeHandler = props.filters[evt.target.name].onChange as (
				newFilter: string | boolean,
			) => void;
			if (changeHandler) changeHandler(value);
		},
		[startOver, props.filters],
	);

	const [filterSettingsAnchorEl, setFilterSettingsAnchorEl] =
		useState<HTMLElement | null>(null);
	const openFilterSettings = useCallback(
		(evt: React.MouseEvent<HTMLElement>) => {
			setFilterSettingsAnchorEl(evt.currentTarget);
		},
		[],
	);
	const closeFiltersMenu = useCallback(() => {
		setFilterSettingsAnchorEl(null);
	}, []);

	const filterCount = filters ? Object.keys(filters).length : 0;

	// the weeks are rendered from their offsets, so they always get the current
	// loadWeekCallback and reload when it changes
	const weeks: React.ReactElement[] = [];
	for (
		let page = state.dataOffsetTop + 1;
		page < state.dataOffsetBottom;
		++page
	) {
		weeks.push(
			<ScrollableScheduleWeek
				key={page}
				weekOffset={page}
				today={state.today}
				loadWeekCallback={loadWeekCallback}
				filterValues={state.filterValues}
				setTodayElement={setTodayElement}
			/>,
		);
	}

	return (
		<Grid container className={className}>
			<TodayButtonWrapper
				size={12}
				className={classes?.today}
				onClick={jumpToToday}
			>
				<Grid container sx={{ justifyContent: "space-between" }}>
					<Grid>
						<TodayButton
							className={classes?.todayBtn}
							onClick={jumpToToday}
							fullWidth
						>
							<Box sx={{ m: 2 }}>{state.today.format("ddd DD MMMM")}</Box>
						</TodayButton>
					</Grid>
					<Grid>
						{filterCount + actions.length > 0 && (
							<FilterWrapper
								sx={{ px: 2 }}
								className={classes?.filterWrapper}
								onClick={preventAction}
							>
								{filterCount + actions.length > 1 ? (
									<>
										<IconButton
											onClick={openFilterSettings}
											aria-label={t("standalone.schedule.filter-settings")}
										>
											<FilterSettingsIcon
												className={classes?.filterSettingsBtn}
											/>
										</IconButton>
										<Menu
											open={filterSettingsAnchorEl != null}
											anchorEl={filterSettingsAnchorEl}
											onClose={closeFiltersMenu}
										>
											<Box sx={{ p: 1 }}>
												<Grid container spacing={1}>
													{Object.entries(filters).map(([name, filter]) => (
														<Grid key={"filter-" + name} size={12}>
															<ScrollableFilterRenderer
																{...filter}
																name={name}
																value={
																	filter.type === "select"
																		? (state.filterValues[name] as string)
																		: (state.filterValues[name] as boolean)
																}
																onChange={handleFilterChange}
															/>
														</Grid>
													))}
													{filterCount > 0 && (
														<Grid key={"divider"} size={12}>
															<Divider />
														</Grid>
													)}
													{actions.map((action) => (
														<Grid key={"action-" + action.id} size={12}>
															<Button
																onClick={action.onClick}
																disabled={action.disabled}
																fullWidth
															>
																{action.label}
															</Button>
														</Grid>
													))}
												</Grid>
											</Box>
										</Menu>
									</>
								) : filterCount > 0 ? (
									(() => {
										const [name, filter] = Object.entries(filters)[0];
										return (
											<ScrollableFilterRenderer
												key={"filter-" + name}
												{...filter}
												name={name}
												value={state.filterValues[name]}
												onChange={handleFilterChange}
												inline={"scrollable"}
											/>
										);
									})()
								) : actions.length > 0 ? (
									(() => {
										const action = actions[0];
										return (
											<Button
												key={"action-" + action.id}
												onClick={action.onClick}
												disabled={action.disabled}
											>
												{action.label}
											</Button>
										);
									})()
								) : (
									throwError("code should be unreachable")
								)}
							</FilterWrapper>
						)}
					</Grid>
				</Grid>
			</TodayButtonWrapper>
			<Grid size={12}>
				<StyledInfiniteScroll
					key={state.listKey}
					className={combineClassNames([wrapperClass, classes?.scroller])}
					loadMoreTop={loadMoreTop}
					loadMoreBottom={loadMoreBottom}
					ref={scrollElem}
				>
					<Box sx={{ m: 2 }}>
						<Grid container spacing={2}>
							{weeks}
						</Grid>
					</Box>
				</StyledInfiniteScroll>
			</Grid>
		</Grid>
	);
};

export default React.memo(ScrollableSchedule);
