import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback, useState } from "react";
import { Grid } from "@mui/material";
import XLSX from "xlsx";
import GenericDataPreview from "./GenericDataPreview";
import { useDialogContext } from "../../../framework";
import { FileUploadGeneric } from "../../../standalone/FileUpload";
import HowToBox from "../../../standalone/HowToBox";
import { showInfoDialog } from "../../../non-standalone/Dialog";
import useCCTranslations from "../../../utils/useCCTranslations";
/**
 * Reads the rows of an .xlsx file's first worksheet: one record per row, keyed by the
 * header row's text, every value a string
 * @param file The picked file
 * @returns The rows; rejects when the file cannot be read or SheetJS cannot open it as a
 *          workbook (damaged, password-protected, another format)
 */
const readRows = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
        try {
            const data = reader.result;
            const workbook = XLSX.read(data, {
                type: "array",
                cellDates: true,
            });
            resolve(workbook);
        }
        catch (e) {
            // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- XLSX.read only throws Errors
            reject(e);
        }
    });
    reader.addEventListener("error", () => reject(reader.error ?? new Error("The file cannot be read")));
    reader.readAsArrayBuffer(file);
}).then((book) => Object.values(book.Sheets)
    .slice(0, 1) // only first
    .map((sheet) => {
    //remove prerendered values, otherwise dateNF is ignored
    for (const cellref in sheet) {
        const c = sheet[cellref];
        if (c.t === "d") {
            delete c.w;
            delete c.z;
        }
    }
    return (XLSX.utils
        .sheet_to_json(sheet, {
        dateNF: 'YYYY-MM-DD"T"hh:mm:ss',
        raw: false,
        rawNumbers: true, // output dates as numbers and numbers as raw numbers
        defval: undefined,
        blankrows: false,
    })
        // convert numbers to string, so import always works with strings
        .map((record) => Object.fromEntries(Object.entries(record).map(([k, v]) => [
        k,
        typeof v === "number" ? v.toString() : v,
    ]))));
})
    .flat());
/**
 * The title of the dialog that reports a refused selection, by the reason the upload gives
 * @param err The reason
 * @returns The translation key: a selection of more than one file is refused for its count,
 *          any other for the file
 */
const getRefusalTitle = (err) => err === "files.selector.too-many" || err === "files.selector.limit-reached"
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
export const useImportStep1FileUploadProps = (props) => {
    const { state, setState } = props;
    const [pushDialog] = useDialogContext();
    const { t } = useCCTranslations();
    // the picked file while it is read: listed in the upload until its rows are in state
    const [reading, setReading] = useState(null);
    const handleChange = useCallback((changed) => {
        // one file: a new pick is listed after the file it replaces. The listed file
        // never counts towards maxFiles, so a pick is never refused for it.
        const files = changed
            .slice(-1)
            .map((file) => ({ ...file, excludeFromLimits: true }));
        setReading(files);
        // the replaced or removed file and its rows go now, not when the new one is read
        setState((prev) => prev.files.length === 0 && prev.data.length === 0
            ? prev
            : { ...prev, files: [], data: [] });
        void (async () => {
            // a file that cannot be read is dropped and named in a dialog
            const results = await Promise.allSettled(files.map((file) => file.canBeUploaded
                ? readRows(file.file)
                : Promise.resolve([])));
            const unreadable = files.filter((_, index) => results[index].status === "rejected");
            setState((prev) => ({
                ...prev,
                files: files.filter((file) => !unreadable.includes(file)),
                data: results.flatMap((result) => result.status === "fulfilled" ? result.value : []),
            }));
            setReading(null);
            if (unreadable.length === 0)
                return;
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
    }, [pushDialog, setState, t]);
    const handleError = useCallback((reason, err) => {
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
    }, [pushDialog, t]);
    return {
        handleError,
        files: reading ?? state.files,
        accept: ".xlsx",
        maxFiles: 1,
        onChange: handleChange,
    };
};
const Step1LoadData = (props) => {
    const { state, howTo } = props;
    const fileUploadProps = useImportStep1FileUploadProps(props);
    return (_jsxs(Grid, { container: true, sx: {
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "stretch",
        }, wrap: "nowrap", style: { height: "100%" }, spacing: 2, children: [howTo && (_jsx(Grid, { children: _jsx(HowToBox, { labels: howTo }) })), _jsx(Grid, { children: _jsx(FileUploadGeneric, { ...fileUploadProps, previewSize: 64 }) }), state.data.length > 0 && !howTo && (_jsx(Grid, { style: { minHeight: 500 }, size: "grow", children: _jsx(GenericDataPreview, { data: state.data }) }))] }));
};
export default React.memo(Step1LoadData);
