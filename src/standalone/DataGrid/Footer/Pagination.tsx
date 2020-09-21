import React, { useCallback, useContext } from "react";
import { DataGridStateContext } from "../index";
import PaginationView from "./PaginationView";

const calcLastPage = (rowsTotal: number, rowsPerPage: number) => {
	let lastPage = rowsTotal / rowsPerPage;
	if ((lastPage | 0) !== lastPage) {
		lastPage = (lastPage | 0) + 1;
	}
	if (lastPage < 1) lastPage = 1;
	return lastPage;
};

const Pagination = () => {
	const stateCtx = useContext(DataGridStateContext);
	if (!stateCtx) throw new Error("State Context not set");
	const [state, setState] = stateCtx;

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

	return (
		<PaginationView
			setPageSize={setPageSize}
			gotoFirstPage={gotoFirstPage}
			gotoPrevPage={gotoPrevPage}
			gotoNextPage={gotoNextPage}
			gotoLastPage={gotoLastPage}
			pageIndex={state.pageIndex}
			rowsPerPage={state.rowsPerPage}
			rowsTotal={state.rowsTotal}
		/>
	);
};

export default React.memo(Pagination);
