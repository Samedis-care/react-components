import React from "react";
import { TextFieldProps } from "@mui/material";
import ModelRenderParams from "../../../RenderParams";
import TypeNumber from "../../TypeNumber";
import { CurrencyInputProps } from "../../../../../standalone/UIKit/InputControls/CurrencyInput";
import { TypeSettings } from "../../../Type";
export interface ModelDataTypeDecimalCurrencyRendererCCParams extends Omit<CurrencyInputProps, "currency" | "value" | "onChange" | "warning">, Omit<TextFieldProps, "name" | "value" | "label" | "disabled" | "required" | "onChange" | "onBlur" | "error" | "multiline"> {
    /**
     * The currency or callback to derive currency from other record values
     */
    currency: string | ((values: Record<string, unknown>) => string);
    /**
     * The currency update fields (use when using get currency callback)
     * List the fields used in the callback (dependencies) in here using dot notation
     */
    currencyUpdateFields?: string[];
}
/**
 * Renders a text field
 */
declare class RendererDecimalCurrency extends TypeNumber {
    props: ModelDataTypeDecimalCurrencyRendererCCParams;
    settings: TypeSettings;
    constructor(props: ModelDataTypeDecimalCurrencyRendererCCParams);
    render(params: ModelRenderParams<number | null>): React.ReactElement;
    getCurrency: (params: Record<string, unknown>) => string;
}
export default RendererDecimalCurrency;
