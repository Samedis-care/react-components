import React, { useCallback } from "react";
import { Grid2 as Grid } from "@mui/material";
import XLSX from "xlsx";
import GenericDataPreview from "./GenericDataPreview";
import { CrudImporterStepProps } from "./index";
import { useDialogContext } from "../../../framework";
import {
	FileData,
	FileUploadProps,
} from "../../../standalone/FileUpload/Generic";
import { FileUploadGeneric } from "../../../standalone/FileUpload";
import HowToBox from "../../../standalone/HowToBox";
import { showInfoDialog } from "../../../non-standalone/Dialog";
import useCCTranslations from "../../../utils/useCCTranslations";
import { FileSelectorError } from "../../../standalone/FileUpload/Generic/Errors";

export type ImportStep1Props = CrudImporterStepProps & {
	howTo?: (string | React.ReactNode)[];
};

export const useImportStep1FileUploadProps = (props: ImportStep1Props) => {
	const { state, setState } = props;
	const [pushDialog] = useDialogContext();
	const { t } = useCCTranslations();

	const handleChange = useCallback(
		(files: FileData[]) => {
			void (async () => {
				const importableFiles = files.filter((file) => file.canBeUploaded);
				const workbooks = await Promise.all(
					importableFiles.map((file) => {
						return new Promise<XLSX.WorkBook>((resolve, reject) => {
							const reader = new FileReader();
							reader.addEventListener("load", () => {
								try {
									const data = reader.result as ArrayBuffer;
									const workbook = XLSX.read(data, {
										type: "array",
										cellDates: true,
									});

									resolve(workbook);
								} catch (e) {
									reject(e as Error);
								}
							});
							reader.addEventListener("error", reject);
							reader.readAsArrayBuffer(file.file as File);
						});
					}),
				);
				const json = workbooks
					.map((book) =>
						Object.values(book.Sheets)
							.slice(0, 1) // only first
							.map((sheet) => {
								//remove prerendered values, otherwise dateNF is ignored
								for (const cellref in sheet) {
									const c = sheet[cellref] as Record<string, unknown>;
									if (c.t === "d") {
										delete c.w;
										delete c.z;
									}
								}
								return (
									XLSX.utils
										.sheet_to_json<Record<string, unknown>>(sheet, {
											dateNF: 'YYYY-MM-DD"T"hh:mm:ss',
											raw: false,
											rawNumbers: true, // output dates as numbers and numbers as raw numbers
											defval: undefined,
											blankrows: false,
										})
										// convert numbers to string, so import always works with strings
										.map((record) =>
											Object.fromEntries(
												Object.entries(record).map(([k, v]) => [
													k,
													typeof v === "number" ? v.toString() : v,
												]),
											),
										)
								);
							})
							.flat(),
					)
					.flat();
				setState((prev) => ({
					...prev,
					files,
					data: json,
				}));
			})();
		},
		[setState],
	);

	const handleError = useCallback(
		(_: FileSelectorError, err: string) => {
			void showInfoDialog(pushDialog, {
				title: t("backend-components.crud.import.errors.file_select"),
				message: err,
				buttons: [
					{
						text: t("common.buttons.ok"),
						autoFocus: true,
					},
				],
			});
		},
		[pushDialog, t],
	);

	return {
		handleError,
		files: state.files,
		accept: ".xlsx",
		maxFiles: 1,
		onChange: handleChange,
	} as Pick<
		FileUploadProps,
		"handleError" | "files" | "accept" | "maxFiles" | "onChange"
	>;
};

const Step1LoadData = (props: ImportStep1Props) => {
	const { state, howTo } = props;
	const fileUploadProps = useImportStep1FileUploadProps(props);

	return (
		<Grid
			container
			direction={"column"}
			justifyContent={"space-between"}
			alignItems={"stretch"}
			wrap={"nowrap"}
			style={{ height: "100%" }}
			spacing={2}
		>
			{howTo && (
				<Grid>
					<HowToBox labels={howTo} />
				</Grid>
			)}
			<Grid>
				<FileUploadGeneric {...fileUploadProps} previewSize={64} />
			</Grid>
			{state.data.length > 0 && !howTo && (
				<Grid style={{ minHeight: 500 }} size="grow">
					<GenericDataPreview data={state.data} />
				</Grid>
			)}
		</Grid>
	);
};

export default React.memo(Step1LoadData);
