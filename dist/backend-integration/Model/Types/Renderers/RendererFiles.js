import React from "react";
import ccI18n from "../../../../i18n";
import TypeFiles from "../TypeFiles";
import FileUpload from "../../../../standalone/FileUpload/Generic";
import GroupBox from "../../../../standalone/GroupBox";
import { FormHelperTextCC } from "../../../../standalone";
/**
 * Renders a file selector
 */
class RendererFiles extends TypeFiles {
    render(params) {
        const { visibility, field, value, label, handleChange, handleBlur, errorMsg, warningMsg, setError, } = params;
        if (visibility.disabled)
            return React.createElement(React.Fragment, null);
        if (visibility.hidden) {
            return (React.createElement("input", { type: "hidden", name: field, value: value.map((entry) => entry.file.name).join(","), readOnly: true, "aria-hidden": "true" }));
        }
        if (visibility.editable) {
            if (visibility.grid)
                throw new Error("Not supported");
            return (React.createElement(React.Fragment, null,
                React.createElement("div", null,
                    React.createElement(FileUpload, { name: field, label: label, files: value, readOnly: visibility.readOnly, onChange: (files) => {
                            handleChange(field, files);
                        }, onBlur: handleBlur, handleError: (_, msg) => setError(new Error(msg)), maxFiles: this.params?.maxFiles, accept: this.params?.accept, acceptLabel: this.params?.acceptLabel, imageDownscaleOptions: this.params?.imageDownscaleOptions, convertImagesTo: this.params?.convertImagesTo, previewSize: this.params?.previewSize || 96, previewImages: this.params?.previewImages, allowDuplicates: this.params?.allowDuplicates, smallLabel: this.params?.smallLabel })),
                React.createElement(FormHelperTextCC, { error: !!errorMsg, warning: !!warningMsg }, errorMsg || warningMsg)));
        }
        const content = (React.createElement(React.Fragment, null,
            React.createElement("ul", null, value.map((entry, index) => (React.createElement("li", { key: index },
                entry.preview && (React.createElement("img", { src: entry.preview, alt: entry.file.name })),
                !entry.preview && "downloadLink" in entry.file && (React.createElement("a", { href: entry.file.downloadLink }, entry.file.name)))))),
            value.length === 0 &&
                ccI18n.t("backend-integration.model.types.renderers.files.no-file")));
        return visibility.grid ? (content) : (React.createElement(GroupBox, { label: label }, content));
    }
}
export default RendererFiles;
