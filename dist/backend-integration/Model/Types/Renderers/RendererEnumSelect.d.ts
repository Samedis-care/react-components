import React from "react";
import ModelRenderParams from "../../RenderParams";
import TypeEnum, { EnumValue } from "../TypeEnum";
import { BaseSelectorData, BaseSelectorProps } from "../../../../standalone/Selector";
import { DistributiveOmit } from "../../../../utils/distributiveOmit";
/**
 * The params of ModelDataTypeEnumSelectRenderer: the props of the SingleSelect
 * it renders while the field is editable (placeholder, enableIcons, grouped,
 * noOptionsText and the like). It sets label, required, dirty, error, warning
 * and autocompleteId from the field, over the ones given here.
 * disableClearable defaults to true unless the enum starts empty (its default
 * value is `""`).
 */
export type RendererEnumSelectProps = DistributiveOmit<BaseSelectorProps<BaseSelectorData, false>, "selected" | "onLoad" | "onSelect" | "disabled" | "autoFocus">;
/**
 * One value of ModelDataTypeEnumSelectRenderer: the enum value's value,
 * getLabel, invisible and invisibleInGridFilter, plus the fields of a selector
 * entry other than label and value (icon, group, isDisabled, isDivider and the
 * like). An invisible value is left out of the options unless it is the
 * field's value, which then shows disabled.
 * @typeParam T The enum's values
 */
export type AdvancedEnumValue<T extends string = string> = Omit<BaseSelectorData, "label" | "value"> & Pick<EnumValue<T>, "value" | "getLabel" | "invisible" | "invisibleInGridFilter">;
/**
 * Renders TypeEnum as drop-down selector (with search)
 */
declare class RendererEnumSelect<T extends string = string> extends TypeEnum<T> {
    private props?;
    constructor(values: AdvancedEnumValue<T>[], defaultValue: NoInfer<T>, props?: RendererEnumSelectProps, numericMode?: boolean);
    render(params: ModelRenderParams<T>): React.ReactElement;
}
export default RendererEnumSelect;
