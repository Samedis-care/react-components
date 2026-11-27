import React from "react";
import { TextFieldProps } from "@mui/material";
import ModelRenderParams from "../../../RenderParams";
import { TextFieldWithHelpProps } from "../../../../../standalone/UIKit/TextFieldWithHelp";
import TypeStringArray from "../../TypeStringArray";
export type ModelDataTypeStringArrayRendererCCParams = Omit<TextFieldProps, "name" | "value" | "label" | "multiline" | "placeholder" | "disabled" | "required" | "onChange" | "onBlur" | "error" | "autoFocus"> & Omit<TextFieldWithHelpProps, "warning">;
/**
 * Renders text fields inside a group box
 *
 * A required field needs at least one entry: while the list is empty, its only
 * input, the one for a new entry, is required; once it has entries, no input is.
 * Its frame shows that it is required, with or without entries (GroupBox's
 * `required`): an asterisk after the label, and "Required" before the message in
 * the group's description.
 */
declare class RendererStringArray extends TypeStringArray {
    props?: ModelDataTypeStringArrayRendererCCParams;
    constructor(props?: ModelDataTypeStringArrayRendererCCParams);
    render(params: ModelRenderParams<string[]>): React.ReactElement;
}
export default RendererStringArray;
