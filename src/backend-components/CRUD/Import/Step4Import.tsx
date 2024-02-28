import React, { useEffect, useState } from "react";
import { CrudImporterStepProps, isFieldImportable } from "./index";
import { Grid, TextField, Typography } from "@mui/material";
import {
	Model,
	ModelVisibilityHidden,
	PageVisibility,
	useModelMutation,
} from "../../../backend-integration";
import { deepAssign, dotToObject, getValueByDot, sleep } from "../../../utils";
import useCCTranslations from "../../../utils/useCCTranslations";

interface ImportCounters {
	todo: number;
	success: number;
	failed: number;
}

export const useImportStep4Logic = (props: CrudImporterStepProps) => {
	const { model, state, setState, updateKey, additionalUpdateKeyFilters } =
		props;

	// model which can write to all fields
	const customModel = new Model<string, PageVisibility, unknown>(
		model.modelId,
		Object.fromEntries(
			Object.entries(model.fields).map(([key, field]) => [
				key,
				{
					...field,
					visibility: {
						...field.visibility,
						create: ModelVisibilityHidden,
					},
				},
			]),
		),
		model.connector,
		model.cacheKeys,
		model.options,
	);
	const { mutateAsync: createOrUpdateRecord } = useModelMutation(customModel);

	const [importDone, setImportDone] = useState(false);
	useEffect(() => {
		setState((prev) => ({
			...prev,
			importDone,
		}));
	}, [setState, importDone]);
	const [counters, setCounters] = useState<ImportCounters>({
		todo: 0,
		success: 0,
		failed: 0,
	});
	const [lastError, setLastError] = useState("");

	useEffect(() => {
		void (async () => {
			setCounters({
				todo: state.data.length,
				success: 0,
				failed: 0,
			});

			let activeRequests = 0;

			await Promise.all(
				state.data.map(async (record) => {
					// limit to 10 concurrent requests
					while (activeRequests >= 10) await sleep(50);
					activeRequests++;

					const modelRecord: Record<string, unknown> = {};
					try {
						Object.entries(model.fields)
							.filter(([name, field]) => isFieldImportable(name, field))
							.forEach(([name]) => {
								deepAssign(
									modelRecord,
									dotToObject(
										name,
										// eslint-disable-next-line no-eval
										eval(state.conversionScripts[name]?.script ?? "") ?? null,
									),
								);
							});

						if (updateKey) {
							const filterKey = model.fields[updateKey].type.stringify(
								getValueByDot(updateKey, modelRecord),
							);
							if (filterKey) {
								const [records, meta] = await model.index({
									rows: 2,
									page: 1,
									fieldFilter: {
										[updateKey]: {
											type: "equals",
											value1: filterKey,
											value2: "",
										},
									},
									additionalFilters: additionalUpdateKeyFilters,
								});
								const rows = meta.filteredRows ?? meta.totalRows;
								if (rows == 1) {
									modelRecord.id = records[0].id;
								} else if (rows >= 2) {
									throw new Error("Update key not unique: " + filterKey);
								}
							}
						}

						await createOrUpdateRecord(modelRecord);

						setCounters((prev) => ({
							...prev,
							success: prev.success + 1,
						}));
					} catch (e) {
						// eslint-disable-next-line no-console
						console.error(e);
						setCounters((prev) => ({
							...prev,
							failed: prev.failed + 1,
						}));
						// only single entry in error log for readability and performance (error spam => massive slowdown)
						setLastError(
							JSON.stringify(
								{
									error: (e as Error).toString(),
									destRecord: modelRecord,
									sourceRecord: record,
								},
								undefined,
								4,
							),
						);
					} finally {
						setCounters((prev) => ({
							...prev,
							todo: prev.todo - 1,
						}));
						activeRequests--;
					}
				}),
			);

			setImportDone(true);
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return { counters, lastError };
};

const Step4Import = (props: CrudImporterStepProps) => {
	const { counters, lastError } = useImportStep4Logic(props);
	const { t } = useCCTranslations();

	return (
		<Grid container spacing={2}>
			<Grid item xs={12}>
				<Typography>
					{t("backend-components.crud.import.queue", { COUNT: counters.todo })}
				</Typography>
			</Grid>
			<Grid item xs={12}>
				<Typography>
					{t("backend-components.crud.import.success", {
						COUNT: counters.success,
					})}
				</Typography>
			</Grid>
			<Grid item xs={12}>
				<Typography>
					{t("backend-components.crud.import.failed", {
						COUNT: counters.failed,
					})}
				</Typography>
			</Grid>
			<Grid item xs={12}>
				<TextField
					multiline
					fullWidth
					label={t("backend-components.crud.import.last_error")}
					value={lastError}
				/>
			</Grid>
		</Grid>
	);
};

export default React.memo(Step4Import);
