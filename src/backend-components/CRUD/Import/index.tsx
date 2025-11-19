import React, { Dispatch, SetStateAction, useCallback, useState } from "react";
import { Button, Grid, Step, StepLabel, Stepper, styled } from "@mui/material";
import Step1LoadData from "./Step1LoadData";
import Step2ConnectData from "./Step2ConnectData";
import Step3ValidateReview from "./Step3ValidateReview";
import Step4Import from "./Step4Import";
import {
	Model,
	ModelFieldDefinition,
	ModelFieldName,
	PageVisibility,
} from "../../../backend-integration";
import { FileData } from "../../../standalone/FileUpload/Generic";
import useCCTranslations from "../../../utils/useCCTranslations";
import { ValidationResult } from "../../Form";
import { useCrudDispatchContext } from "../index";

export type ConversionScriptFn = (record: Record<string, unknown>) => unknown;
export interface CrudImportProps<
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT,
> {
	/**
	 * The model to import for
	 */
	model: Model<KeyT, VisibilityT, CustomT>;
	/**
	 * The importer config
	 * Record<Field, JavaScript>
	 * @remarks Disables step 2
	 */
	importConfig?: Partial<Record<KeyT, ConversionScriptFn>>;
	/**
	 * The field used to determine an ID of an existing record for purpose of updating that existing record
	 * instead of creating a new record.
	 */
	updateKey?: KeyT;
	/**
	 * Additional filter parameter for backend index calls
	 */
	updateKeyAdditionalFilters?: Record<string, unknown>;
	/**
	 * How-to information
	 */
	howTo?: (string | React.ReactNode)[];
	/**
	 * Additional validation callback for imported records
	 * @param record The record to validate
	 * @returns Validation errors
	 */
	validate?: (
		record: Record<string, unknown>,
	) => Promise<ValidationResult> | ValidationResult;
	/**
	 * Guided version
	 */
	guided: boolean;
}

export const IMPORT_STEPS = [
	"backend-components.crud.import.step1",
	"backend-components.crud.import.step2",
	"backend-components.crud.import.step3",
	"backend-components.crud.import.step4",
];

const Wrapper = styled(Grid, { name: "CcCrudImport", slot: "wrapper" })({
	width: "100%",
	height: "100%",
});

interface ConversionScript {
	script?: string; // optional string version of scriptFn for eval. stored for text field
	scriptFn: ConversionScriptFn;
	status: "pending" | "okay" | "error";
	error: Error | null;
}

export interface CrudImporterState {
	files: FileData[];
	data: Record<string, unknown>[];
	conversionScripts: Record<string, ConversionScript>;
	validationPassed: boolean;
	importDone: boolean;
}

export interface CrudImporterStepProps {
	model: Model<ModelFieldName, PageVisibility, unknown>;
	updateKey: string | undefined;
	additionalUpdateKeyFilters: Record<string, unknown> | undefined;
	hasImportConfig: boolean;
	validate:
		| undefined
		| ((
				record: Record<string, unknown>,
		  ) => Promise<ValidationResult> | ValidationResult);
	state: CrudImporterState;
	setState: Dispatch<SetStateAction<CrudImporterState>>;
}

export const isFieldImportable = (
	name: string,
	field: ModelFieldDefinition<unknown, string, PageVisibility, unknown>,
): boolean => {
	const createVisibility = field.visibility.create;
	const editVisibility = field.visibility.edit;
	const visibilityOkay =
		typeof createVisibility === "function" ||
		typeof editVisibility === "function" ||
		(!createVisibility.disabled && !createVisibility.readOnly) ||
		(!editVisibility.disabled && !editVisibility.readOnly);
	// no images
	const typeOkay = field.type.getFilterType() !== null;
	return name !== "id" && visibilityOkay && typeOkay;
};

export const useCrudImportLogic = <
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT,
>(
	props: CrudImportProps<KeyT, VisibilityT, CustomT>,
) => {
	const { model, importConfig, updateKey } = props;
	const guided = props.guided && importConfig;
	const crudCtx = useCrudDispatchContext();

	if (updateKey && !model.fields[updateKey]?.filterable) {
		throw new Error("Update key not in model or not filterable");
	}

	const [activeStep, setActiveStep] = useState(0);
	const [state, setState] = useState<CrudImporterState>({
		files: [],
		data: [],
		conversionScripts: importConfig
			? Object.fromEntries(
					Object.entries(importConfig).map(([field, scriptFn]) => [
						field,
						{
							scriptFn,
							status: "pending",
							error: null,
						} as ConversionScript,
					]),
				)
			: {},
		validationPassed: false,
		importDone: false,
	});
	const hasImportConfig = !!importConfig;
	const next = useCallback(
		() => setActiveStep((prev) => prev + (prev == 0 && guided ? 2 : 1)),
		[guided],
	);
	const prev = useCallback(
		() => setActiveStep((prev) => prev - (prev == 2 && guided ? 2 : 1)),
		[guided],
	);
	const finish = useCallback(() => {
		crudCtx.showOverview(true);
	}, [crudCtx]);

	return {
		guided,
		activeStep,
		state,
		setState,
		hasImportConfig,
		next,
		prev,
		finish,
	};
};

const CrudImport = <
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT,
>(
	props: CrudImportProps<KeyT, VisibilityT, CustomT>,
) => {
	const { t } = useCCTranslations();
	const { updateKeyAdditionalFilters, howTo, model, updateKey, validate } =
		props;
	const {
		guided,
		activeStep,
		state,
		setState,
		hasImportConfig,
		next,
		prev,
		finish,
	} = useCrudImportLogic(props);

	return (
		<Wrapper
			container
			direction={"column"}
			justifyContent={"space-between"}
			alignItems={"stretch"}
			spacing={2}
			wrap={"nowrap"}
		>
			<Grid>
				<Stepper
					activeStep={guided && activeStep > 1 ? activeStep - 1 : activeStep}
				>
					{IMPORT_STEPS.filter((label, index) => !(guided && index === 1)).map(
						(label: string, index: number) => (
							<Step key={index.toString(16)}>
								<StepLabel>{t(label)}</StepLabel>
							</Step>
						),
					)}
				</Stepper>
			</Grid>
			<Grid size="grow">
				{activeStep === 0 && (
					<Step1LoadData
						model={
							model as unknown as Model<ModelFieldName, PageVisibility, unknown>
						}
						howTo={guided ? howTo : undefined}
						updateKey={updateKey}
						additionalUpdateKeyFilters={updateKeyAdditionalFilters}
						hasImportConfig={hasImportConfig}
						validate={validate}
						state={state}
						setState={setState}
					/>
				)}
				{activeStep === 1 && (
					<Step2ConnectData
						model={
							model as unknown as Model<ModelFieldName, PageVisibility, unknown>
						}
						updateKey={updateKey}
						additionalUpdateKeyFilters={updateKeyAdditionalFilters}
						hasImportConfig={hasImportConfig}
						validate={validate}
						state={state}
						setState={setState}
					/>
				)}
				{activeStep === 2 && (
					<Step3ValidateReview
						model={
							model as unknown as Model<ModelFieldName, PageVisibility, unknown>
						}
						updateKey={updateKey}
						additionalUpdateKeyFilters={updateKeyAdditionalFilters}
						hasImportConfig={hasImportConfig}
						validate={validate}
						state={state}
						setState={setState}
					/>
				)}
				{activeStep === 3 && (
					<Step4Import
						model={
							model as unknown as Model<ModelFieldName, PageVisibility, unknown>
						}
						updateKey={updateKey}
						additionalUpdateKeyFilters={updateKeyAdditionalFilters}
						hasImportConfig={hasImportConfig}
						validate={validate}
						state={state}
						setState={setState}
					/>
				)}
			</Grid>
			<Grid>
				<Grid container spacing={2}>
					{activeStep !== 3 && (
						<Grid>
							<Button
								variant={"contained"}
								disabled={activeStep === 0 || activeStep >= 3}
								onClick={prev}
							>
								{t("common.buttons.back")}
							</Button>
						</Grid>
					)}
					<Grid>
						<Button
							variant={"contained"}
							disabled={
								(activeStep === 0 && state.files.length === 0) ||
								(activeStep === 2 && !state.validationPassed) ||
								(activeStep === 3 && !state.importDone)
							}
							onClick={activeStep === 3 ? finish : next}
						>
							{activeStep === 3
								? t("common.buttons.finish")
								: t("common.buttons.next")}
						</Button>
					</Grid>
				</Grid>
			</Grid>
		</Wrapper>
	);
};

export default React.memo(CrudImport) as typeof CrudImport;
export type CrudImportType = typeof CrudImport;
