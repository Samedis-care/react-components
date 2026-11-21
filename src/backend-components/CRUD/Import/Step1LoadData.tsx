import React, { useCallback, useState } from "react";
import { Grid } from "@mui/material";
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

/**
 * Reads the rows of an .xlsx file's first worksheet: one record per row, keyed by the
 * header row's text, every value a string
 * @param file The picked file
 * @returns The rows; rejects when the file cannot be read or SheetJS cannot open it as a
 *          workbook (damaged, password-protected, another format)
 */
const readRows = (file: File): Promise<Record<string, unknown>[]> =>
	new Promise<XLSX.WorkBook>((resolve, reject) => {
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
				// eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- XLSX.read only throws Errors
				reject(e);
			}
		});
		reader.addEventListener("error", () =>
			reject(reader.error ?? new Error("The file cannot be read")),
		);
		reader.readAsArrayBuffer(file);
	}).then((book) =>
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
	);

/**
 * The title of the dialog that reports a refused selection, by the reason the upload gives
 * @param err The reason
 * @returns The translation key: a selection of more than one file is refused for its count,
 *          any other for the file
 */
const getRefusalTitle = (err: FileSelectorError) =>
	err === "files.selector.too-many" || err === "files.selector.limit-reached"
		? "backend-components.crud.import.errors.file_count"
		: "backend-components.crud.import.errors.file_select";

/**
 * The upload of step 1 (Upload data): the props for a FileUploadGeneric that reads one .xlsx
 * file into `state.files` and `state.data`
 * @param props The step's props: the wizard's state and its setter
 * @returns The upload's `handleError`, `files`, `accept`, `maxFiles` and `onChange`
 * @remarks One file: a new pick or drop replaces the listed file (the listed file is
 *          passed with `excludeFromLimits`, so `maxFiles` 1 refuses only a selection of
 *          several files). The replaced file and its rows leave `state` at once, so Next
 *          waits for the new file's rows; the new file is listed meanwhile.
 */
export const useImportStep1FileUploadProps = (props: ImportStep1Props) => {
	const { state, setState } = props;
	const [pushDialog] = useDialogContext();
	const { t } = useCCTranslations();
	// the picked file while it is read: listed in the upload until its rows are in state
	const [reading, setReading] = useState<FileData[] | null>(null);

	const handleChange = useCallback(
		(changed: FileData[]) => {
			// one file: a new pick is listed after the file it replaces. The listed file
			// never counts towards maxFiles, so a pick is never refused for it.
			const files = changed
				.slice(-1)
				.map((file) => ({ ...file, excludeFromLimits: true }));
			setReading(files);
			// the replaced or removed file and its rows go now, not when the new one is read
			setState((prev) =>
				prev.files.length === 0 && prev.data.length === 0
					? prev
					: { ...prev, files: [], data: [] },
			);
			void (async () => {
				// a file that cannot be read is dropped and named in a dialog
				const results = await Promise.allSettled(
					files.map((file) =>
						file.canBeUploaded
							? readRows(file.file as File)
							: Promise.resolve([]),
					),
				);
				const unreadable = files.filter(
					(_, index) => results[index].status === "rejected",
				);
				setState((prev) => ({
					...prev,
					files: files.filter((file) => !unreadable.includes(file)),
					data: results.flatMap((result) =>
						result.status === "fulfilled" ? result.value : [],
					),
				}));
				setReading(null);
				if (unreadable.length === 0) return;
				void showInfoDialog(pushDialog, {
					title: t("backend-components.crud.import.errors.file_select"),
					message: t("backend-components.crud.import.errors.file_read", {
						FILE_NAME: unreadable.map((file) => file.file.name).join(", "),
					}),
					buttons: [
						{
							text: t("common.buttons.ok"),
							autoFocus: true,
						},
					],
				});
			})();
		},
		[pushDialog, setState, t],
	);

	const handleError = useCallback(
		(reason: FileSelectorError, err: string) => {
			void showInfoDialog(pushDialog, {
				title: t(getRefusalTitle(reason)),
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
		files: reading ?? state.files,
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
			sx={{
				flexDirection: "column",
				justifyContent: "space-between",
				alignItems: "stretch",
			}}
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
