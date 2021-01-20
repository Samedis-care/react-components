import { IFilterDef } from "../standalone/DataGrid/Content/FilterEntry";
import {
	DataGridRowData,
	IDataGridColumnDef,
	IDataGridLoadDataParameters,
} from "../standalone/DataGrid";

/**
 * Applies the given filters, sort and pagination settings to the given data
 * @param rowData The data to filter, sort and paginate
 * @param params The filter, sort and pagination settings
 * @param columnDef Metadata about the columns
 * @returns An array containing the filtered, sorted and paginated data in slot 0
 *          and the total amount of filtered rows before pagination in slot 2
 */
const filterSortPaginate = (
	rowData: DataGridRowData[],
	params: IDataGridLoadDataParameters,
	columnDef: IDataGridColumnDef[]
): [DataGridRowData[], number] => {
	const { page, rows: rowsPerPage, quickFilter, fieldFilter, sort } = params;
	// quickfilter
	if (quickFilter) {
		rowData = rowData.filter((row) => {
			for (const key in row) {
				if (!Object.prototype.hasOwnProperty.call(row, key)) continue;
				const value = row[key];
				if (
					value !== null &&
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
			}

			filter = filter.nextFilter;
			if (filter) expr += filter.nextFilterType === "and" ? " && " : " || ";
		}

		rowData = rowData.filter((row) => {
			const rawValue = row[filterField];
			if (!rawValue) return false;
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
				const av = valA.toString();
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
	const pageIndex = page - 1;
	const filteredRows = rowData.length;
	return [rowData.splice(pageIndex * rowsPerPage, rowsPerPage), filteredRows];
};

export default filterSortPaginate;
