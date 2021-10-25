import React, { useEffect, useMemo } from "react";
import { CrudImporterStepProps, isFieldImportable } from "./index";
import GenericDataPreview from "./GenericDataPreview";
import { isObjectEmpty } from "../../../utils";

const Step3ValidateReview = (props: CrudImporterStepProps) => {
	const { model, state, setState } = props;

	const records: [
		Record<string, unknown>,
		Record<string, string>,
		Error | null
	][] = useMemo(
		() =>
			state.data.map((record) => {
				const modelRecord: Record<string, unknown> = {};
				let isModelRecordComplete = false;
				try {
					Object.entries(model.fields)
						.filter(([name, field]) => isFieldImportable(name, field))
						.forEach(([name]) => {
							modelRecord[name] =
								// eslint-disable-next-line no-eval
								eval(state.conversionScripts[name]?.script ?? "") ?? null;
						});
					// noinspection JSUnusedAssignment
					isModelRecordComplete = true;
					const validation = model.validate(record);
					return [modelRecord, validation, null];
				} catch (e) {
					return [isModelRecordComplete ? modelRecord : record, {}, e];
				}
			}),
		[model, state.conversionScripts, state.data]
	);

	const recordsNormalized = useMemo(
		() =>
			records.map((record) => ({
				valid: isObjectEmpty(record[1])
					? "true"
					: Object.entries(record[1])
							.map(([name, error]) => name + ": " + error)
							.join("; "),
				error: record[2]?.toString() ?? "none",
				...record[0],
			})),
		[records]
	);

	const everythingOkay = useMemo(
		() => !records.find((record) => !isObjectEmpty(record[1]) || record[2]),
		[records]
	);
	useEffect(() => {
		setState((prev) => ({
			...prev,
			validationPassed: everythingOkay,
		}));
	}, [setState, everythingOkay]);

	return (
		<GenericDataPreview
			data={recordsNormalized}
			existingDefinition={model
				.toDataGridColumnDefinition()
				.map((columnDef) => ({
					...columnDef,
					filterable: true,
					sortable: true,
					isLocked: false,
					hidden: false,
				}))}
		/>
	);
};

export default React.memo(Step3ValidateReview);
