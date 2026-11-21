import React, {
	Dispatch,
	SetStateAction,
	useCallback,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { Button, Grid, Step, StepLabel, Stepper, styled } from "@mui/material";
import Step1LoadData from "./Step1LoadData";
import Step2ConnectData from "./Step2ConnectData";
import Step3ValidateReview from "./Step3ValidateReview";
import Step4Import from "./Step4Import";
import {
	ModelFieldDefinitionUnknown,
	ModelFieldNames,
	ModelUnknown,
} from "../../../backend-integration";
import { FileData } from "../../../standalone/FileUpload/Generic";
import useCCTranslations from "../../../utils/useCCTranslations";
import { ValidationResult } from "../../Form";
import { useCrudDispatchContext } from "../index";

/**
 * Converts one row of the uploaded worksheet into the value of one model field: an entry
 * of CrudImportProps.importConfig, or the script typed in step 2 of the unguided importer.
 *
 * For a date-only field (ModelDataTypeDate, ModelDataTypeDateNullable) return a Date: the
 * importer validates and writes the calendar day it names, at 12:00 UTC as the date
 * pickers do. A Date at exactly 00:00 or 12:00 UTC names its UTC date
 * (`new Date("2024-03-31")`, `toDateOnly(…)`), any other its local date
 * (`new Date(record.Born)` of a date cell, which arrives as local time without an offset,
 * `"2024-03-31T00:00:00"`). In UTC+12 local midnight is 12:00 UTC, so there use
 * `new Date(record.Born.slice(0, 10))`, which names the cell's day in every timezone.
 *
 * `undefined` leaves the field out of the record. Every other result, `null`, `""`, `0` and
 * `false` included, is validated in step 3 (Validation & Review) and written in step 4
 * (Import data). Each of the two steps calls the function once per row.
 */
export type ConversionScriptFn = (record: Record<string, unknown>) => unknown;
export interface CrudImportProps<M extends ModelUnknown> {
	/**
	 * The model to import for
	 */
	model: M;
	/**
	 * The importer config
	 * Record<Field, JavaScript>
	 * @remarks Disables step 2
	 */
	importConfig?: Partial<Record<ModelFieldNames<M>, ConversionScriptFn>>;
	/**
	 * The field used to determine an ID of an existing record for purpose of updating that existing record
	 * instead of creating a new record.
	 */
	updateKey?: ModelFieldNames<M>;
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
	 * @param record The model record the row is written as: every conversion result
	 *        except `undefined` (see ConversionScriptFn), dotted fields nested
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

const StepContainer = styled(Grid, { name: "CcCrudImport", slot: "step" })({
	// takes the focus on a step change only (tabIndex -1, not a tab stop): no focus ring
	outline: "none",
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
	model: ModelUnknown;
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
	field: ModelFieldDefinitionUnknown,
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

/**
 * Whether the element can keep the keyboard focus: it is in the document and not disabled
 * @param el The element
 */
const canHoldFocus = (el: HTMLElement): boolean =>
	el.isConnected && !el.matches(":disabled");

export const useCrudImportLogic = <M extends ModelUnknown>(
	props: CrudImportProps<M>,
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

	// Keyboard focus on a step change. A step change can disable the Back or Next that
	// was pressed (Back on the first step, Next until the review passed, Finish until the
	// import is done), and a disabled button loses the focus to the page. Then the step
	// takes the focus, and the button gets it back once it is enabled again in the same step,
	// unless the focus has moved on.
	const stepRef = useRef<HTMLDivElement>(null);
	// the element that had the focus when the step was changed (the pressed Back or Next)
	const pressedRef = useRef<HTMLElement | null>(null);
	// the button whose focus the step took
	const restoreRef = useRef<HTMLElement | null>(null);
	const rememberFocus = useCallback(() => {
		const doc = stepRef.current?.ownerDocument ?? document;
		const active = doc.activeElement;
		pressedRef.current =
			active instanceof HTMLElement && active !== doc.body ? active : null;
		restoreRef.current = null;
	}, []);
	// every commit: a button can be disabled after the step change (a review run again)
	useLayoutEffect(() => {
		const step = stepRef.current;
		if (!step) return;
		const active = step.ownerDocument.activeElement;
		const pressed = pressedRef.current;
		if (pressed && !canHoldFocus(pressed)) {
			pressedRef.current = null;
			// the focus is still on the button (the browser moves it later) or fell to the page
			// or to a container around the wizard; focus the user moved elsewhere stays there
			if (!active || active === pressed || active.contains(step)) {
				step.focus({ preventScroll: true });
				restoreRef.current = pressed.isConnected ? pressed : null;
			}
			return;
		}
		const restore = restoreRef.current;
		if (restore && canHoldFocus(restore)) {
			restoreRef.current = null;
			if (active === step) restore.focus();
		}
	});

	const next = useCallback(() => {
		rememberFocus();
		setActiveStep((prev) => prev + (prev == 0 && guided ? 2 : 1));
	}, [guided, rememberFocus]);
	const prev = useCallback(() => {
		rememberFocus();
		setActiveStep((prev) => prev - (prev == 2 && guided ? 2 : 1));
	}, [guided, rememberFocus]);
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
		/**
		 * For the element that holds the current step, which takes the keyboard focus when a
		 * step change disables the focused Back or Next (Back on the first step, Next until the
		 * review passed, Finish until the import is done). Give it `tabIndex={-1}`,
		 * `role="group"` and the step's label as `aria-label`, so screen readers announce the
		 * step. Once that Next or Finish is enabled again, and the focus is still on the step,
		 * it gets the focus back. A focused button that stays enabled keeps the focus.
		 * Without the ref, focus is left to the browser.
		 */
		stepRef,
	};
};

const CrudImport = <M extends ModelUnknown>(props: CrudImportProps<M>) => {
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
		stepRef,
	} = useCrudImportLogic(props);

	return (
		<Wrapper
			container
			sx={{
				flexDirection: "column",
				justifyContent: "space-between",
				alignItems: "stretch",
			}}
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
			<StepContainer
				size="grow"
				ref={stepRef}
				tabIndex={-1}
				role="group"
				aria-label={t(IMPORT_STEPS[activeStep])}
			>
				{activeStep === 0 && (
					<Step1LoadData
						model={model}
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
						model={model}
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
						model={model}
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
						model={model}
						updateKey={updateKey}
						additionalUpdateKeyFilters={updateKeyAdditionalFilters}
						hasImportConfig={hasImportConfig}
						validate={validate}
						state={state}
						setState={setState}
					/>
				)}
			</StepContainer>
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
