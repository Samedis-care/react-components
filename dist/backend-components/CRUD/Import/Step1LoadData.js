import React, { useCallback } from "react";
import { Grid } from "@mui/material";
import XLSX from "xlsx";
import GenericDataPreview from "./GenericDataPreview";
import { useDialogContext } from "../../../framework";
import { FileUploadGeneric, HowToBox } from "../../../standalone";
import { showInfoDialog } from "../../../non-standalone";
import useCCTranslations from "../../../utils/useCCTranslations";
export const useImportStep1FileUploadProps = (props) => {
    const { state, setState } = props;
    const [pushDialog] = useDialogContext();
    const { t } = useCCTranslations();
    const handleChange = useCallback((files) => {
        void (async () => {
            const importableFiles = files.filter((file) => file.canBeUploaded);
            const workbooks = await Promise.all(importableFiles.map((file) => {
                return new Promise((resolve, reject) => {
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
                            reject(e);
                        }
                    });
                    reader.addEventListener("error", reject);
                    reader.readAsArrayBuffer(file.file);
                });
            }));
            const json = workbooks
                .map((book) => Object.values(book.Sheets)
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
                    rawNumbers: true,
                    defval: undefined,
                    blankrows: false,
                })
                    // convert numbers to string, so import always works with strings
                    .map((record) => Object.fromEntries(Object.entries(record).map(([k, v]) => [
                    k,
                    typeof v === "number" ? v.toString() : v,
                ]))));
            })
                .flat())
                .flat();
            setState((prev) => ({
                ...prev,
                files,
                data: json,
            }));
        })();
    }, [setState]);
    const handleError = useCallback((_, err) => {
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
    }, [pushDialog, t]);
    return {
        handleError,
        files: state.files,
        accept: ".xlsx",
        maxFiles: 1,
        onChange: handleChange,
    };
};
const Step1LoadData = (props) => {
    const { state, howTo } = props;
    const fileUploadProps = useImportStep1FileUploadProps(props);
    return (React.createElement(Grid, { container: true, direction: "column", justifyContent: "space-between", alignItems: "stretch", wrap: "nowrap", style: { height: "100%" }, spacing: 2 },
        howTo && (React.createElement(Grid, { item: true },
            React.createElement(HowToBox, { labels: howTo }))),
        React.createElement(Grid, { item: true },
            React.createElement(FileUploadGeneric, { ...fileUploadProps, previewSize: 64 })),
        state.data.length > 0 && !howTo && (React.createElement(Grid, { item: true, xs: true, style: { minHeight: 500 } },
            React.createElement(GenericDataPreview, { data: state.data })))));
};
export default React.memo(Step1LoadData);
