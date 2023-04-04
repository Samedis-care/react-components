import React from "react";
import "../../../i18n";
import FileUpload from "../../../standalone/FileUpload/Generic";
import { boolean, files, number, select, text } from "@storybook/addon-knobs";
import { action } from "@storybook/addon-actions";
export var FileUploadStory = function () {
    var handleErrorAction = action("handleError");
    var handleChangeAction = action("onChange");
    var acceptedType = select("Accepted Filetypes", {
        Everything: "",
        Images: "image/*",
        Custom: "custom",
    }, "");
    if (acceptedType === "custom") {
        acceptedType = text("Accepted Filetypes (comma-separated)", ".pdf,.docx,.xlsx,.pptx");
    }
    return (React.createElement(FileUpload, { label: text("Upload Control Label", "Label"), maxFiles: number("Max files", 3, {
            range: true,
            min: 1,
            max: 100,
            step: 1,
        }), previewSize: number("Preview size (in px)", 128, {
            range: true,
            min: 16,
            max: 4096,
            step: 16,
        }), smallLabel: boolean("small label", true), onChange: handleChangeAction, handleError: handleErrorAction, previewImages: boolean("Preview images", true), accept: acceptedType, convertImagesTo: select("Convert Images to", {
            "Don't convert": "",
            ".png": "image/png",
            ".jpg": "image/jpg",
        }, ""), allowDuplicates: boolean("Allow duplicate files", false), imageDownscaleOptions: boolean("Enable downscaling?", false)
            ? {
                width: number("Max width", 1920, {
                    range: true,
                    min: 16,
                    max: 4096,
                    step: 16,
                }),
                height: number("Max height", 1080, {
                    range: true,
                    min: 16,
                    max: 4096,
                    step: 16,
                }),
                keepRatio: boolean("Keep aspect ratio when scaling", true),
            }
            : undefined, defaultFiles: files("Preset files", "*").map(function (fileData) { return ({
            file: {
                name: Math.random().toString(),
                type: fileData.split(";", 2)[0].split(":")[1],
            },
            preview: fileData,
        }); }), readOnly: boolean("Read-only", false), variant: select("Variant", { Classic: "classic", Modern: "modern" }, "classic") }));
};
FileUploadStory.storyName = "FileUpload";
