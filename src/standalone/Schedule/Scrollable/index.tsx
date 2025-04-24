import React, { useCallback, useEffect, useRef, useState } from "react";
import {
	Box,
	Button,
	Divider,
	Grid2 as Grid,
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
 * @param weekOffset The week relative to the current week of year
 * 					 Example: -1 for last week, 0 for this week, 1 for next week
 * @param filter The filter selected by the user
 * @returns A promise containing the data for the days of the week, may throw an
 * 			error. Format: IDayData[weekday starting Monday][n]
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
	 * The callback to load data for a week
	 */
	loadWeekCallback: LoadWeekCallback;

	/**
	 * Optional filter
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
	 * Array of ScrollableScheduleWeek components
	 */
	items: React.ReactNode[];
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
	filterValues: {
		[FilterName in keyof Filters]: Filters[FilterName]["defaultValue"];
	};
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
	| "today"
	| "todayBtn"
	| "scroller"
	| "filterSettingsBtn"
	| "filterWrapper";

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
	const { i18n } = useCCTranslations();
	const todayElem = useRef<HTMLElement | null>(null);
	const scrollElem = useRef<InfiniteScroll | null>(null);

	const getDefaultState = useCallback(
		(): ScrollableScheduleState<typeof filters> => ({
			items: [],
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
		}),
		[filters],
	);

	const [state, setState] =
		useState<ScrollableScheduleState<typeof filters>>(getDefaultState);

	useEffect(() => {
		const onLanguageChanged = () => {
			setState((prev) => ({
				...getDefaultState(),
				filterValues: prev.filterValues,
			}));
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
			const mkItem = (state: ScrollableScheduleState<typeof filters>) => {
				const page = top ? state.dataOffsetTop : state.dataOffsetBottom;
				return (
					<ScrollableScheduleWeek
						key={page.toString()}
						loadData={() => loadWeekCallback(page, state.filterValues)}
						setTodayElement={(elem: HTMLElement | null) =>
							(todayElem.current = elem)
						}
						moment={state.today.clone().add(page, "weeks")}
					/>
				);
			};
			if (top) {
				setState((prevState) => ({
					...prevState,
					items: [mkItem(prevState), ...prevState.items],
					dataOffsetTop: prevState.dataOffsetTop - 1,
				}));
			} else {
				setState((prevState) => ({
					...prevState,
					items: [...prevState.items, mkItem(prevState)],
					dataOffsetBottom: prevState.dataOffsetBottom + 1,
				}));
			}
		},
		[loadWeekCallback],
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

	const handleFilterChange = useCallback(
		(evt: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
			const value =
				evt.target.type === "checkbox"
					? (evt.target as HTMLInputElement).checked
					: evt.target.value;
			setState((prev) => ({
				...getDefaultState(),
				filterValues: {
					...prev.filterValues,
					[evt.target.name]: value,
				},
			}));
			if (!props.filters) return;
			const changeHandler = props.filters[evt.target.name].onChange as (
				newFilter: string | boolean,
			) => void;
			if (changeHandler) changeHandler(value);
		},
		[getDefaultState, props.filters],
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

	return (
		<Grid container className={className}>
			<TodayButtonWrapper
				size={12}
				className={classes?.today}
				onClick={jumpToToday}
			>
				<Grid container justifyContent={"space-between"}>
					<Grid>
						<TodayButton
							className={classes?.todayBtn}
							onClick={jumpToToday}
							fullWidth
						>
							<Box m={2}>{state.today.format("ddd DD MMMM")}</Box>
						</TodayButton>
					</Grid>
					<Grid>
						{filterCount + actions.length > 0 && (
							<FilterWrapper
								px={2}
								className={classes?.filterWrapper}
								onClick={preventAction}
							>
								{filterCount + actions.length > 1 ? (
									<>
										<IconButton onClick={openFilterSettings}>
											<FilterSettingsIcon
												className={classes?.filterSettingsBtn}
											/>
										</IconButton>
										<Menu
											open={filterSettingsAnchorEl != null}
											anchorEl={filterSettingsAnchorEl}
											onClose={closeFiltersMenu}
										>
											<Box p={1}>
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
					className={combineClassNames([wrapperClass, classes?.scroller])}
					loadMoreTop={loadMoreTop}
					loadMoreBottom={loadMoreBottom}
					ref={scrollElem}
				>
					<Box m={2}>
						<Grid container spacing={2}>
							{state.items}
						</Grid>
					</Box>
				</StyledInfiniteScroll>
			</Grid>
		</Grid>
	);
};

export default React.memo(ScrollableSchedule);
