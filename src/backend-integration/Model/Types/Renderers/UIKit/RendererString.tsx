import React from "react";
import TypeString from "../../TypeString";
import { TextFieldProps } from "@mui/material";
import ModelRenderParams from "../../../RenderParams";
import { TextFieldWithHelpProps } from "../../../../../standalone/UIKit/TextFieldWithHelp";
import RendererStringNullable from "./RendererStringNullable";

export type ModelDataTypeStringRendererCCParams = Omit<
	TextFieldProps,
	| "name"
	| "value"
	| "label"
	| "disabled"
	| "required"
	| "onChange"
	| "onBlur"
	| "error"
	| "autoFocus"
> &
	Omit<TextFieldWithHelpProps, "warning">;

/**
 * Renders a text field
 */
class RendererString extends TypeString {
	props?: ModelDataTypeStringRendererCCParams;
	// renders the same text field, a string is never null
	protected nullableRenderer: RendererStringNullable;

	constructor(props?: ModelDataTypeStringRendererCCParams) {
		super(props?.multiline);

		this.props = props;
		this.nullableRenderer = new RendererStringNullable(props);
	}

	render(params: ModelRenderParams<string>): React.ReactElement {
		return this.nullableRenderer.render(params);
	}
}

export default RendererString;
