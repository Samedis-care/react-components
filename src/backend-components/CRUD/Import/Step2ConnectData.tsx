import React, { useCallback, useMemo, useRef } from "react";
import { CrudImporterStepProps, isFieldImportable } from "./index";
import {
	Box,
	Card,
	CardContent,
	CircularProgress,
	Grid,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	TextField,
	Tooltip,
	Typography,
	styled,
} from "@mui/material";
import {
	Check as CheckIcon,
	ErrorOutline as ErrorIcon,
	HelpOutline as UnknownIcon,
} from "@mui/icons-material";
import {
	ModelFieldDefinition,
	PageVisibility,
} from "../../../backend-integration";
import uniqueArray from "../../../utils/uniqueArray";
import debouncePromise from "../../../utils/debouncePromise";

import useCCTranslations from "../../../utils/useCCTranslations";

type ConversionScriptRunnerFunc = (
	data: Record<string, unknown>[],
	field: ModelFieldDefinition<unknown, string, PageVisibility, unknown>,
	script: string,
) => Promise<void>;

const ScriptInput = styled(TextField, {
	name: "CcCrudImportStep2",
	slot: "scriptInput",
})({
	"& textarea": {
		fontFamily: "monospace",
	},
});

const MonoTableCell = styled(TableCell, {
	name: "CcCrudImportStep2",
	slot: "monoTableCell",
})({
	fontFamily: "monospace",
});

const StyledCardContent = styled(CardContent, {
	name: "CcCrudImportStep2",
	slot: "cardContent",
})({
	paddingBottom: 4,
	"&:last-child": {
		paddingBottom: 4,
	},
});

export const useImportStep2Logic = (props: CrudImporterStepProps) => {
	const { model, state, setState } = props;
	const { t } = useCCTranslations();

	const columns = useMemo(
		() => uniqueArray(state.data.map(Object.keys).flat()),
		[state.data],
	);

	const conversionScriptUpdates = useRef<
		Record<string, ConversionScriptRunnerFunc>
	>(
		Object.fromEntries(
			Object.keys(model.fields).map((key) => [
				key,
				debouncePromise(
					async (
						data: Record<string, unknown>[],
						field: ModelFieldDefinition<
							unknown,
							string,
							PageVisibility,
							unknown
						>,
						script: string,
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
										validation = t(
											"backend-components.crud.import.validations.string",
										);
									}
									break;
								case "number":
									if (result != null && typeof result !== "number") {
										validation = t(
											"backend-components.crud.import.validations.number",
										);
									}
									break;
								case "currency":
									if (result !== null)
										validation = t(
											"backend-components.crud.import.validations.currency_unsupported",
										);
									break;
								case "date":
									if (result !== null && !(result instanceof Date)) {
										validation = t(
											"backend-components.crud.import.validations.date",
										);
									}
									break;
								case "boolean":
									if (result !== true && result !== false && result !== null) {
										validation = t(
											"backend-components.crud.import.validations.boolean",
										);
									}
									break;
							}
							if (!validation) {
								// if type checks have passed, call field type validator
								validation = await field.type.validate(result);
							}
							if (validation) {
								// eslint-disable-next-line no-console
								console.error(
									"Validation failed:",
									validation,
									"; Result =",
									result,
									"; Record =",
									record,
								);
								throw new Error(
									t("backend-components.crud.import.validations.fail", {
										REASON: validation,
									}),
								);
							}
						}
					},
					1000,
				),
			]),
		),
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
					evt.target.value,
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
		[model.fields, setState, state.data],
	);

	return { columns, conversionScriptUpdates, handleConversionScriptChange };
};

const Step2ConnectData = (props: CrudImporterStepProps) => {
	const { model, state } = props;
	const { t } = useCCTranslations();
	const { columns, handleConversionScriptChange } = useImportStep2Logic(props);

	return (
		<Grid container spacing={2}>
			<Grid item xs={6}>
				<Box mb={2}>
					<Typography variant={"h5"}>
						{t("backend-components.crud.import.source_fields")}
					</Typography>
				</Box>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>
								{t("backend-components.crud.import.source_field")}
							</TableCell>
							<TableCell>
								{t("backend-components.crud.import.source_field_type")}
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{columns.map((column) => {
							const dataTypes = uniqueArray(
								state.data.map((record) => typeof record[column]),
							).sort();

							return (
								<TableRow key={column}>
									<MonoTableCell>{`record["${column}"]`}</MonoTableCell>
									<TableCell>{dataTypes.join(", ")}</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</Grid>
			<Grid item xs={6}>
				<Box mb={2}>
					<Typography variant={"h5"}>
						{t("backend-components.crud.import.destination_fields")}
					</Typography>
				</Box>
				<Grid container spacing={2}>
					{Object.entries(model.fields)
						.filter(([name, field]) => isFieldImportable(name, field))
						.map(([name, field]) => {
							const convScript = state.conversionScripts[name];
							return (
								<Grid item xs={12} key={name}>
									<Card>
										<StyledCardContent>
											<Grid container justifyContent={"space-between"}>
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
																: t(
																		"backend-components.crud.import.validations.unknown",
																	) ?? ""
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
													<ScriptInput
														multiline
														label={t(
															"backend-components.crud.import.conv_script",
														)}
														name={name}
														value={convScript?.script ?? ""}
														onChange={handleConversionScriptChange}
														placeholder={`${name} = `}
														fullWidth
													/>
												</Box>
											</Grid>
										</StyledCardContent>
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
