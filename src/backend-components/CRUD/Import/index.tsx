import React, { Dispatch, SetStateAction, useCallback, useState } from "react";
import {
	Button,
	Grid,
	makeStyles,
	Step,
	StepLabel,
	Stepper,
} from "@material-ui/core";
import Step1LoadData from "./Step1LoadData";
import Step2ConnectData from "./Step2ConnectData";
import Step3ValidateReview from "./Step3ValidateReview";
import Step4Import from "./Step4Import";
import { useLocation } from "react-router";
import {
	Model,
	ModelFieldDefinition,
	ModelFieldName,
	PageVisibility,
} from "../../../backend-integration";
import { FileData } from "../../../standalone/FileUpload/Generic";
import { FrameworkHistory } from "../../../framework";

export interface CrudImportProps<
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT
> {
	/**
	 * The model to import for
	 */
	model: Model<KeyT, VisibilityT, CustomT>;
}

const IMPORT_STEPS = [
	"Load data",
	"Connect data",
	"Validation & Review",
	"Import data",
];

const useStyles = makeStyles(
	{
		wrapper: {
			width: "100%",
			height: "100%",
		},
	},
	{ name: "CcCrudImport" }
);

export interface CrudImporterState {
	files: FileData[];
	data: Record<string, unknown>[];
	conversionScripts: Record<
		string,
		{
			script: string;
			status: "pending" | "okay" | "error";
			error: Error | null;
		}
	>;
	validationPassed: boolean;
	importDone: boolean;
}

export interface CrudImporterStepProps {
	model: Model<ModelFieldName, PageVisibility, unknown>;
	state: CrudImporterState;
	setState: Dispatch<SetStateAction<CrudImporterState>>;
}

export const isFieldImportable = (
	name: string,
	field: ModelFieldDefinition<unknown, string, PageVisibility, unknown>
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

const CrudImport = <
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT
>(
	props: CrudImportProps<KeyT, VisibilityT, CustomT>
) => {
	const { model } = props;
	const classes = useStyles();
	const { pathname } = useLocation();

	const [activeStep, setActiveStep] = useState(0);
	const [state, setState] = useState<CrudImporterState>({
		files: [],
		data: [],
		conversionScripts: {},
		validationPassed: false,
		importDone: false,
	});
	const next = useCallback(() => setActiveStep((prev) => prev + 1), []);
	const prev = useCallback(() => setActiveStep((prev) => prev - 1), []);
	const finish = useCallback(() => {
		// remove /import from url
		FrameworkHistory.push(pathname.substr(0, pathname.lastIndexOf("/")));
	}, [pathname]);

	return (
		<Grid
			container
			direction={"column"}
			justify={"space-between"}
			alignItems={"stretch"}
			spacing={2}
			wrap={"nowrap"}
			className={classes.wrapper}
		>
			<Grid item>
				<Stepper activeStep={activeStep}>
					{IMPORT_STEPS.map((label, index) => (
						<Step key={index.toString(16)}>
							<StepLabel>{label}</StepLabel>
						</Step>
					))}
				</Stepper>
			</Grid>
			<Grid item xs>
				{activeStep === 0 && (
					<Step1LoadData
						model={
							(model as unknown) as Model<
								ModelFieldName,
								PageVisibility,
								unknown
							>
						}
						state={state}
						setState={setState}
					/>
				)}
				{activeStep === 1 && (
					<Step2ConnectData
						model={
							(model as unknown) as Model<
								ModelFieldName,
								PageVisibility,
								unknown
							>
						}
						state={state}
						setState={setState}
					/>
				)}
				{activeStep === 2 && (
					<Step3ValidateReview
						model={
							(model as unknown) as Model<
								ModelFieldName,
								PageVisibility,
								unknown
							>
						}
						state={state}
						setState={setState}
					/>
				)}
				{activeStep === 3 && (
					<Step4Import
						model={
							(model as unknown) as Model<
								ModelFieldName,
								PageVisibility,
								unknown
							>
						}
						state={state}
						setState={setState}
					/>
				)}
			</Grid>
			<Grid item>
				<Grid container spacing={2}>
					<Grid item>
						<Button
							variant={"contained"}
							disabled={activeStep === 0 || activeStep >= 3}
							onClick={prev}
						>
							Back
						</Button>
					</Grid>
					<Grid item>
						<Button
							variant={"contained"}
							disabled={
								(activeStep === 2 && !state.validationPassed) ||
								(activeStep === 3 && !state.importDone)
							}
							onClick={activeStep === 3 ? finish : next}
						>
							{activeStep === 3 ? "Finish" : "Next"}
						</Button>
					</Grid>
				</Grid>
			</Grid>
		</Grid>
	);
};

export default React.memo(CrudImport) as typeof CrudImport;
export type CrudImportType = typeof CrudImport;
