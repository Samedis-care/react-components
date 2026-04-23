import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import ccI18n from "../../../../i18n";
import TypeFiles from "../TypeFiles";
import FileUpload from "../../../../standalone/FileUpload/Generic";
import GroupBox from "../../../../standalone/GroupBox";
import { FormHelperTextCC } from "../../../../standalone/UIKit/MuiWarning";
/**
 * Renders a file selector
 */
class RendererFiles extends TypeFiles {
    render(params) {
        const { visibility, field, value, label, handleChange, handleBlur, errorMsg, warningMsg, setError, } = params;
        if (visibility.disabled)
            return _jsx(_Fragment, {});
        if (visibility.hidden) {
            return (_jsx("input", { type: "hidden", name: field, value: value.map((entry) => entry.file.name).join(","), readOnly: true, "aria-hidden": "true" }));
        }
        if (visibility.editable) {
            if (visibility.grid)
                throw new Error("Not supported");
            return (_jsxs(_Fragment, { children: [_jsx("div", { children: _jsx(FileUpload, { name: field, label: label, files: value, readOnly: visibility.readOnly, onChange: (files) => {
                                handleChange(field, files);
                            }, onBlur: handleBlur, handleError: (_, msg) => setError(new Error(msg)), maxFiles: this.params?.maxFiles, accept: this.params?.accept, acceptLabel: this.params?.acceptLabel, imageDownscaleOptions: this.params?.imageDownscaleOptions, convertImagesTo: this.params?.convertImagesTo, previewSize: this.params?.previewSize || 96, previewImages: this.params?.previewImages, allowDuplicates: this.params?.allowDuplicates, smallLabel: this.params?.smallLabel }) }), _jsx(FormHelperTextCC, { error: !!errorMsg, warning: !!warningMsg, children: errorMsg || warningMsg })] }));
        }
        const content = (_jsxs(_Fragment, { children: [_jsx("ul", { children: value.map((entry, index) => (_jsxs("li", { children: [entry.preview && (_jsx("img", { src: entry.preview, alt: entry.file.name })), !entry.preview && "downloadLink" in entry.file && (_jsx("a", { href: entry.file.downloadLink, children: entry.file.name }))] }, index))) }), value.length === 0 &&
                    ccI18n.t("backend-integration.model.types.renderers.files.no-file")] }));
        return visibility.grid ? (content) : (_jsx(GroupBox, { label: label, children: content }));
    }
}
export default RendererFiles;
