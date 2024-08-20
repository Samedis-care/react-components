import { AdvancedEnumValue } from "../backend-integration/Model/Types/Renderers/RendererEnumSelect";
import { BaseSelectorData } from "../standalone";

const advancedEnumValueToBaseSelectorData = (
	data: AdvancedEnumValue,
): BaseSelectorData => {
	const { getLabel, ...other } = data;
	return {
		label: getLabel(),
		...other,
	};
};

export default advancedEnumValueToBaseSelectorData;
