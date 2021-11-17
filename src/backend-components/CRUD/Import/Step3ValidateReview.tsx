import React, { useEffect, useMemo } from "react";
import { CrudImporterStepProps, isFieldImportable } from "./index";
import GenericDataPreview from "./GenericDataPreview";
import { deepAssign, dotToObject, isObjectEmpty } from "../../../utils";
import useAsyncMemo from "../../../utils/useAsyncMemo";
import useCCTranslations from "../../../utils/useCCTranslations";
import { Loader } from "../../../standalone";

type RecordT = [Record<string, unknown>, Record<string, string>, Error | null];

const Step3ValidateReview = (props: CrudImporterStepProps) => {
	const { model, state, setState } = props;

	const { t } = useCCTranslations();

	const records: RecordT[] | null = useAsyncMemo(
		() =>
			Promise.all(
				state.data.map(
					async (record): Promise<RecordT> => {
						const modelRecord: Record<string, unknown> = {};
						let isModelRecordComplete = false;
						try {
							Object.entries(model.fields)
								.filter(([name, field]) => isFieldImportable(name, field))
								.forEach(([name]) => {
									deepAssign(
										modelRecord,
										dotToObject(
											name,
											// eslint-disable-next-line no-eval
											eval(state.conversionScripts[name]?.script ?? "") ?? null
										)
									);
								});
							// noinspection JSUnusedAssignment
							isModelRecordComplete = true;
							const validation = await model.validate(modelRecord);
							return [modelRecord, validation, null];
						} catch (e) {
							return [isModelRecordComplete ? modelRecord : record, {}, e];
						}
					}
				)
			),
		[model, state.conversionScripts, state.data]
	);

	const recordsNormalized = useMemo(
		() =>
			(records ?? []).map((record) => ({
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
		() =>
			records
				? !records.find((record) => !isObjectEmpty(record[1]) || record[2])
				: false,
		[records]
	);
	useEffect(() => {
		setState((prev) => ({
			...prev,
			validationPassed: everythingOkay,
		}));
	}, [setState, everythingOkay]);

	if (!records) return <Loader />;

	return (
		<GenericDataPreview
			data={recordsNormalized}
			existingDefinition={[
				...model.toDataGridColumnDefinition().map((columnDef) => ({
					...columnDef,
					filterable: true,
					sortable: true,
					isLocked: false,
					hidden: false,
				})),
				{
					field: "valid",
					type: "boolean",
					headerName: t("backend-components.crud.import.valid"),
					filterable: true,
					sortable: true,
					isLocked: false,
					hidden: false,
				},
				{
					field: "error",
					type: "string",
					headerName: t("backend-components.crud.import.error"),
					filterable: true,
					sortable: true,
					isLocked: false,
					hidden: false,
				},
			]}
		/>
	);
};

export default React.memo(Step3ValidateReview);
