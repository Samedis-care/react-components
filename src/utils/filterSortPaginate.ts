import type { IFilterDef } from "../standalone/DataGrid/Content/FilterEntry";
import type {
	DataGridRowData,
	IDataGridColumnDef,
	IDataGridLoadDataParameters,
} from "../standalone/DataGrid/DataGrid";

/**
 * Applies the given filters, sort and offset-based pagination settings to the given data.
 * @param rowData The data to filter, sort and paginate
 * @param params The filter, sort and pagination settings
 * @param columnDef Metadata about the columns
 * @returns An array containing the filtered, sorted and paginated data in the first slot
 *          and the total amount of filtered rows before pagination in the second slot
 */
export const filterSortPaginate2 = (
	rowData: DataGridRowData[],
	params: Omit<IDataGridLoadDataParameters, "page" | "rows"> & {
		offset: number;
		rows: number;
	},
	columnDef: IDataGridColumnDef[],
): [DataGridRowData[], number] => {
	const { offset, rows: amountRows, quickFilter, fieldFilter, sort } = params;
	// quickfilter
	if (quickFilter) {
		rowData = rowData.filter((row) => {
			for (const key in row) {
				if (!Object.prototype.hasOwnProperty.call(row, key)) continue;
				const value = row[key];
				if (
					value != null &&
					// eslint-disable-next-line @typescript-eslint/no-base-to-string
					value.toString().toLowerCase().includes(quickFilter.toLowerCase())
				) {
					return true;
				}
			}
			return false;
		});
	}

	// field filter
	for (const filterField in fieldFilter) {
		if (!Object.prototype.hasOwnProperty.call(fieldFilter, filterField)) {
			continue;
		}
		let filter: IFilterDef | undefined = fieldFilter[filterField];
		const column = columnDef.find((e) => e.field === filterField);
		if (!column) throw new Error("Non-null assertion failed");

		const filterCache: Record<string, IFilterDef> = {};
		let filterIndex = 0;

		let expr = "";
		while (filter) {
			filter.value1 = filter.value1.toLowerCase();
			filter.value2 = filter.value2.toLowerCase();
			filterIndex++;
			const filterKey = filterIndex.toString();
			filterCache[filterKey] = filter;
			switch (filter.type) {
				case "contains":
					expr += 'value.includes(filterCache["' + filterKey + '"].value1)';
					break;
				case "notContains":
					expr += '!value.includes(filterCache["' + filterKey + '"].value1)';
					break;
				case "equals":
					if (column.type === "number") {
						expr +=
							'parseInt(value) === parseInt(filterCache["' +
							filterKey +
							'"].value1)';
					} else {
						expr += 'value === filterCache["' + filterKey + '"].value1';
					}
					break;
				case "notEqual":
					if (column.type === "number") {
						expr +=
							'parseInt(value) !== parseInt(filterCache["' +
							filterKey +
							'"].value1)';
					} else {
						expr += 'value !== filterCache["' + filterKey + '"].value1';
					}
					break;
				case "notEmpty":
					expr += "value !== ''";
					break;
				case "empty":
					expr += "value === ''";
					break;
				case "startsWith":
					expr += 'value.startsWith(filterCache["' + filterKey + '"].value1)';
					break;
				case "endsWith":
					expr += 'value.endsWith(filterCache["' + filterKey + '"].value1)';
					break;
				case "lessThan":
					expr +=
						'parseInt(value) < parseInt(filterCache["' +
						filterKey +
						'"].value1)';
					break;
				case "lessThanOrEqual":
					expr +=
						'parseInt(value) <= parseInt(filterCache["' +
						filterKey +
						'"].value1)';
					break;
				case "greaterThan":
					expr +=
						'parseInt(value) > parseInt(filterCache["' +
						filterKey +
						'"].value1)';
					break;
				case "greaterThanOrEqual":
					expr +=
						'parseInt(value) >= parseInt(filterCache["' +
						filterKey +
						'"].value1)';
					break;
				case "inRange":
					expr +=
						'parseInt(value) >= parseInt(filterCache["' +
						filterKey +
						'"].value1) && parseInt(value) <= parseInt(filterCache["' +
						filterKey +
						'"].value2)';
					break;
				case "inSet":
					expr +=
						'filterCache["' +
						filterKey +
						'"].value1.split(",").includes(value)';
					break;
				case "notInSet":
					expr +=
						'!filterCache["' +
						filterKey +
						'"].value1.split(",").includes(value)';
					break;
			}

			filter = filter.nextFilter;
			if (filter && filter.value1)
				expr += filter.nextFilterType === "and" ? " && " : " || ";
			else break;
		}

		rowData = rowData.filter((row) => {
			let rawValue = row[filterField];
			if (!rawValue) rawValue = "";
			// eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-base-to-string
			const value = rawValue.toString().toLowerCase();
			try {
				// eslint-disable-next-line no-eval
				return !expr || eval(expr);
			} catch (e) {
				// eslint-disable-next-line no-console
				console.error("[Components-Care] [DataGrid] Filter error:", e);
				return false;
			}
		});
	}

	// sort
	rowData.sort((a, b) => {
		for (const sorter of sort) {
			const valA = a[sorter.field];
			const valB = b[sorter.field];
			let res = 0;
			if (typeof valA === "number" && typeof valB === "number") {
				res = valA - valB;
			} else if (valA && valB) {
				// eslint-disable-next-line @typescript-eslint/no-base-to-string
				const av = valA.toString();
				// eslint-disable-next-line @typescript-eslint/no-base-to-string
				const bv = valB.toString();
				res = av.localeCompare(bv);
			} else {
				if (!valA && !valB) res = 0;
				else if (!valA) res = -1;
				else if (!valB) res = 1;
			}
			res *= sorter.direction;
			if (res) return res;
		}
		return 0;
	});

	// pagination
	const filteredRows = rowData.length;
	return [[...rowData].splice(offset, amountRows), filteredRows];
};

/**
 * Applies the given filters, sort and pagination settings to the given data
 * @param rowData The data to filter, sort and paginate
 * @param params The filter, sort and pagination settings
 * @param columnDef Metadata about the columns
 * @returns An array containing the filtered, sorted and paginated data in the first slot
 *          and the total amount of filtered rows before pagination in the second slot
 */
const filterSortPaginate = (
	rowData: DataGridRowData[],
	params: IDataGridLoadDataParameters,
	columnDef: IDataGridColumnDef[],
): [DataGridRowData[], number] => {
	const offset = (params.page - 1) * params.rows;
	return filterSortPaginate2(rowData, { ...params, offset }, columnDef);
};

export default filterSortPaginate;
