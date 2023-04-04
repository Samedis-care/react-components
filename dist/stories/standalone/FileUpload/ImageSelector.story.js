import React, { useState } from "react";
import "../../../i18n";
import { boolean, number, select, text } from "@storybook/addon-knobs";
import { action } from "@storybook/addon-actions";
import ImageSelector from "../../../standalone/FileUpload/Image/ImageSelector";
export var ImageSelectorStory = function () {
    var _a = useState("https://via.placeholder.com/128"), image = _a[0], setImage = _a[1];
    var previewSize = number("Preview size (in px)", 256, {
        range: true,
        min: 16,
        max: 4096,
        step: 16,
    });
    var handleChangeAction = function (name, value) {
        setImage(value);
        action("onChange")(name, value);
    };
    var capture = select("Capture mode", {
        Disabled: "false",
        User: "user",
        Environment: "environment",
    }, "false");
    return (React.createElement("div", { style: { height: previewSize, width: previewSize } },
        React.createElement(ImageSelector, { name: "story-input", label: text("Label", "Image Upload Label"), alt: text("Alt Text", "Alt Description"), smallLabel: boolean("small label", true), value: image, capture: capture, onChange: handleChangeAction, convertImagesTo: select("Convert Images to", {
                "Don't convert": "",
                ".png": "image/png",
                ".jpg": "image/jpg",
            }, ""), downscale: boolean("Enable downscaling?", false)
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
                : undefined, readOnly: boolean("Read-only", false) })));
};
ImageSelectorStory.storyName = "ImageSelector";
