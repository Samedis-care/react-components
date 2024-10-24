import {
	DataGridSortSetting,
	IDataGridColumnsState,
	IDataGridColumnState,
	IDataGridFieldFilter,
} from "./DataGrid";

interface IDataGridColumnsStateArrayEntry extends IDataGridColumnState {
	field: string;
}

export const dataGridPrepareFiltersAndSorts = (
	columnsState: IDataGridColumnsState,
): [DataGridSortSetting[], IDataGridFieldFilter] => {
	const baseSorts: IDataGridColumnsStateArrayEntry[] = [];
	const fieldFilter: IDataGridFieldFilter = {};

	Object.keys(columnsState).forEach((field) => {
		if (!Object.prototype.hasOwnProperty.call(columnsState, field)) return;

		if (columnsState[field].sort !== 0) {
			baseSorts.push({
				field,
				...columnsState[field],
			});
		}

		const filter = columnsState[field].filter;
		if (filter && filter.value1) {
			fieldFilter[field] = filter;
		}
	});

	const sorts: DataGridSortSetting[] = baseSorts

		.sort((a, b) => a.sortOrder! - b.sortOrder!)
		.map((col) => ({ field: col.field, direction: col.sort as -1 | 1 }));

	return [sorts, fieldFilter];
};
