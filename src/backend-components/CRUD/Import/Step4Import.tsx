import React, { useEffect, useState } from "react";
import { CrudImporterStepProps, isFieldImportable } from "./index";
import { Grid, TextField, Typography } from "@material-ui/core";
import {
	Model,
	ModelVisibilityHidden,
	PageVisibility,
} from "../../../backend-integration";
import { sleep } from "../../../utils";

interface ImportCounters {
	todo: number;
	success: number;
	failed: number;
}

const Step4Import = (props: CrudImporterStepProps) => {
	const { model, state, setState } = props;

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
			])
		),
		model.connector,
		model.cacheKeys,
		model.cacheOptions
	);
	const { mutateAsync: createRecord } = customModel.createOrUpdate();

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
								modelRecord[name] =
									// eslint-disable-next-line no-eval
									eval(state.conversionScripts[name]?.script ?? "") ?? null;
							});

						await createRecord(modelRecord);

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
								4
							)
						);
					} finally {
						setCounters((prev) => ({
							...prev,
							todo: prev.todo - 1,
						}));
						activeRequests--;
					}
				})
			);

			setImportDone(true);
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<Grid container spacing={2}>
			<Grid item xs={12}>
				<Typography>In queue: {counters.todo}</Typography>
			</Grid>
			<Grid item xs={12}>
				<Typography>Success: {counters.success}</Typography>
			</Grid>
			<Grid item xs={12}>
				<Typography>Failed: {counters.failed}</Typography>
			</Grid>
			<Grid item xs={12}>
				<TextField multiline fullWidth label={"Last error"} value={lastError} />
			</Grid>
		</Grid>
	);
};

export default React.memo(Step4Import);
