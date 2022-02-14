import React, { useCallback } from "react";
import { Grid } from "@material-ui/core";
import XLSX from "xlsx";
import GenericDataPreview from "./GenericDataPreview";
import { CrudImporterStepProps } from "./index";
import { useDialogContext } from "../../../framework";
import { FileData } from "../../../standalone/FileUpload/Generic";
import { FileUploadGeneric, HowToBox } from "../../../standalone";
import { showInfoDialog } from "../../../non-standalone";
import useCCTranslations from "../../../utils/useCCTranslations";

const Step1LoadData = (
	props: CrudImporterStepProps & { howTo?: (string | React.ReactNode)[] }
) => {
	const { state, setState, howTo } = props;
	const [pushDialog] = useDialogContext();
	const { t } = useCCTranslations();

	const handleChange = useCallback(
		async (files: FileData[]) => {
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
								reject(e);
							}
						});
						reader.addEventListener("error", reject);
						reader.readAsArrayBuffer(file.file as File);
					});
				})
			);
			const json = workbooks
				.map((book) =>
					Object.values(book.Sheets)
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
											])
										)
									)
							);
						})
						.flat()
				)
				.flat();
			setState((prev) => ({
				...prev,
				files,
				data: json,
			}));
		},
		[setState]
	);

	return (
		<Grid
			container
			direction={"column"}
			justify={"space-between"}
			alignItems={"stretch"}
			wrap={"nowrap"}
			style={{ height: "100%" }}
			spacing={2}
		>
			{howTo && (
				<Grid item>
					<HowToBox labels={howTo} />
				</Grid>
			)}
			<Grid item>
				<FileUploadGeneric
					previewSize={64}
					handleError={(_, err) =>
						showInfoDialog(pushDialog, {
							title: t("backend-components.crud.import.errors.file_select"),
							message: err,
							buttons: [
								{
									text: t("common.buttons.ok"),
									autoFocus: true,
								},
							],
						})
					}
					files={state.files}
					accept={".xlsx"}
					maxFiles={1}
					onChange={handleChange}
				/>
			</Grid>
			{state.data.length > 0 && !howTo && (
				<Grid item xs style={{ minHeight: 500 }}>
					<GenericDataPreview data={state.data} />
				</Grid>
			)}
		</Grid>
	);
};

export default React.memo(Step1LoadData);
