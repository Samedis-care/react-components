import React, { Dispatch, SetStateAction, useCallback } from "react";
import { IDataGridColumnProps, IDataGridColumnState } from "../index";
import { TableHead, TableRow } from "@material-ui/core";
import ColumnHeader from "./ColumnHeader";
import { IFilterDef } from "./FilterEntry";
import SelectAll from "./SelectAll";

export type IDataGridColumnsState = { [field: string]: IDataGridColumnState };

export interface IDataGridColumnStateProps {
	columnState: IDataGridColumnsState;
	setColumnState: Dispatch<SetStateAction<IDataGridColumnsState>>;
}

export default React.memo(
	(props: IDataGridColumnProps & IDataGridColumnStateProps) => {
		const { columnState, setColumnState } = props;
		const onFilterChange = useCallback(
			(field: string, newFilter: IFilterDef) => {
				setColumnState((prevState) => ({
					...prevState,
					[field]: {
						...prevState[field],
						filter: newFilter,
					},
				}));
			},
			[setColumnState]
		);
		const onSortChange = useCallback(
			(field: string, newSort: -1 | 0 | 1) => {
				setColumnState((prevState) => {
					let newColumnState = {
						...prevState,
						[field]: {
							...prevState[field],
							sort: newSort,
						},
					};

					if (newSort === 0) {
						// if disable sorting, adjust sort priority for others
						Object.keys(prevState)
							.filter(
								(otherField) =>
									prevState[otherField].sort !== 0 &&
									prevState[field].sortOrder! < prevState[otherField].sortOrder!
							)
							.forEach((otherField) => {
								newColumnState = {
									...newColumnState,
									[otherField]: {
										...newColumnState[otherField],
										sortOrder: newColumnState[otherField].sortOrder! - 1,
									},
								};
							});
					} else if (newSort === 1) {
						// if enable sorting, set to highest order
						const order =
							Object.keys(prevState).filter(
								(otherField) => prevState[otherField].sort !== 0
							).length + 1;
						newColumnState = {
							...newColumnState,
							[field]: {
								...newColumnState[field],
								sortOrder: order,
							},
						};
					}

					return newColumnState;
				});
			},
			[setColumnState]
		);

		return (
			<TableHead>
				<TableRow>
					<SelectAll />
					{props.columns.map((column) => (
						<ColumnHeader
							key={column.field}
							column={column}
							sort={columnState[column.field]?.sort || 0}
							sortOrder={columnState[column.field]?.sortOrder}
							filter={columnState[column.field]?.filter}
							onFilterChange={onFilterChange}
							onSortChange={onSortChange}
						/>
					))}
				</TableRow>
			</TableHead>
		);
	}
);
