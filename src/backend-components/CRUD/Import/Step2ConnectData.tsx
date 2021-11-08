import React, { useCallback, useMemo, useRef } from "react";
import { CrudImporterStepProps, isFieldImportable } from "./index";
import {
	Box,
	Card,
	CardContent,
	CircularProgress,
	Grid,
	makeStyles,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	TextField,
	Tooltip,
	Typography,
} from "@material-ui/core";
import {
	Check as CheckIcon,
	ErrorOutline as ErrorIcon,
	HelpOutline as UnknownIcon,
} from "@material-ui/icons";
import {
	ModelFieldDefinition,
	PageVisibility,
} from "../../../backend-integration";
import { debouncePromise, uniqueArray } from "../../../utils";

type ConversionScriptRunnerFunc = (
	data: Record<string, unknown>[],
	field: ModelFieldDefinition<unknown, string, PageVisibility, unknown>,
	script: string
) => Promise<void>;

const useStyles = makeStyles(
	{
		scriptInput: {
			"& textarea": {
				fontFamily: "monospace",
			},
		},
		monospace: {
			fontFamily: "monospace",
		},
		cardContent: {
			paddingBottom: 4,
			"&:last-child": {
				paddingBottom: 4,
			},
		},
	},
	{ name: "CcCrudImportStep2" }
);

const Step2ConnectData = (props: CrudImporterStepProps) => {
	const { model, state, setState } = props;
	const classes = useStyles();

	const columns = useMemo(
		() => uniqueArray(state.data.map(Object.keys).flat()),
		[state.data]
	);

	const conversionScriptUpdates = useRef<
		Record<string, ConversionScriptRunnerFunc>
	>(
		Object.fromEntries(
			Object.keys(model.fields).map((key) => [
				key,
				debouncePromise(async (
					data: Record<string, unknown>[],
					field: ModelFieldDefinition<unknown, string, PageVisibility, unknown>,
					script: string
					// eslint-disable-next-line @typescript-eslint/require-await
				): Promise<void> => {
					for (const record of data) {
						// eslint-disable-next-line no-eval
						const result: unknown = eval(script) ?? null; // ensure this is never undefined
						let validation: string | null = null;
						switch (field.type.getFilterType()) {
							case "enum":
							case "string":
								if (result != null && typeof result !== "string") {
									validation = "Result must be a string or null";
								}
								break;
							case "number":
								if (result != null && typeof result !== "number") {
									validation = "Result must be a number or null";
								}
								break;
							case "currency":
								if (result !== null)
									validation = "Currency cannot be imported yet";
								break;
							case "date":
								if (result !== null && !(result instanceof Date)) {
									validation = "Result must be a Date or null";
								}
								break;
							case "boolean":
								if (result !== true && result !== false && result !== null) {
									validation = "Result must be a boolean or null";
								}
								break;
						}
						if (!validation) {
							// if type checks have passed, call field type validator
							validation = field.type.validate(result);
						}
						if (validation) {
							// eslint-disable-next-line no-console
							console.error(
								"Validation failed:",
								validation,
								"; Result =",
								result,
								"; Record =",
								record
							);
							throw new Error(
								"Validation failed: " +
									validation +
									". For details see browser console."
							);
						}
					}
				}, 1000),
			])
		)
	);

	const handleConversionScriptChange = useCallback(
		async (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
			setState((prev) => ({
				...prev,
				conversionScripts: {
					...prev.conversionScripts,
					[evt.target.name]: {
						script: evt.target.value,
						status: "pending",
						error: null,
					},
				},
			}));

			try {
				await conversionScriptUpdates.current[evt.target.name](
					state.data,
					model.fields[evt.target.name],
					evt.target.value
				);
				setState((prev) => ({
					...prev,
					conversionScripts: {
						...prev.conversionScripts,
						[evt.target.name]: {
							...prev.conversionScripts[evt.target.name],
							status: "okay",
							error: null,
						},
					},
				}));
			} catch (e) {
				setState((prev) => ({
					...prev,
					conversionScripts: {
						...prev.conversionScripts,
						[evt.target.name]: {
							...prev.conversionScripts[evt.target.name],
							status: "error",
							error: e as Error,
						},
					},
				}));
			}
		},
		[model.fields, setState, state.data]
	);

	return (
		<Grid container spacing={2}>
			<Grid item xs={6}>
				<Box mb={2}>
					<Typography variant={"h5"}>Source fields</Typography>
				</Box>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Field</TableCell>
							<TableCell>Data Types</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{columns.map((column) => {
							const dataTypes = uniqueArray(
								state.data.map((record) => typeof record[column])
							).sort();

							return (
								<TableRow key={column}>
									<TableCell className={classes.monospace}>
										{`record["${column}"]`}
									</TableCell>
									<TableCell>{dataTypes.join(", ")}</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</Grid>
			<Grid item xs={6}>
				<Box mb={2}>
					<Typography variant={"h5"}>Destination fields</Typography>
				</Box>
				<Grid container spacing={2}>
					{Object.entries(model.fields)
						.filter(([name, field]) => isFieldImportable(name, field))
						.map(([name, field]) => {
							const convScript = state.conversionScripts[name];
							return (
								<Grid item xs={12} key={name}>
									<Card>
										<CardContent className={classes.cardContent}>
											<Grid container justify={"space-between"}>
												<Grid item>
													<Typography>
														{field.getLabel()
															? `${field.getLabel()} (${name})`
															: name}
													</Typography>
													<Typography color={"textSecondary"}>
														{field.type.getFilterType()}
													</Typography>
												</Grid>
												<Grid item>
													<Tooltip
														title={
															convScript
																? convScript.error?.toString() ?? ""
																: "Unknown (didn't run)"
														}
													>
														{convScript ? (
															convScript.status === "okay" ? (
																<CheckIcon />
															) : convScript.status === "pending" ? (
																<CircularProgress />
															) : convScript.status === "error" ? (
																<ErrorIcon />
															) : (
																<UnknownIcon />
															)
														) : (
															// unknown status
															<UnknownIcon />
														)}
													</Tooltip>
												</Grid>
											</Grid>
											<Grid item xs={12}>
												<Box mt={2}>
													{convScript?.error && (
														<Typography>
															{convScript.error.toString()}
														</Typography>
													)}
													<TextField
														multiline
														label={"Conversion Script (JavaScript)"}
														name={name}
														value={convScript?.script ?? ""}
														onChange={handleConversionScriptChange}
														placeholder={`${name} = `}
														className={classes.scriptInput}
														fullWidth
													/>
												</Box>
											</Grid>
										</CardContent>
									</Card>
								</Grid>
							);
						})}
				</Grid>
			</Grid>
		</Grid>
	);
};

export default React.memo(Step2ConnectData);
