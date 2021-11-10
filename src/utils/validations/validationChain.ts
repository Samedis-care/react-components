import {
	ModelFieldDefinition,
	ModelFieldName,
	PageVisibility,
} from "../../backend-integration";

const validationChain = <
	TypeT,
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT
>(
	...callback: ((
		value: TypeT,
		values: Record<string, unknown>,
		fieldDef: Pick<
			ModelFieldDefinition<TypeT, KeyT, VisibilityT, CustomT>,
			"getLabel"
		>
	) => string | null)[]
) => (
	value: TypeT,
	values: Record<string, unknown>,
	fieldDef: Pick<
		ModelFieldDefinition<TypeT, KeyT, VisibilityT, CustomT>,
		"getLabel"
	>
): string | null => {
	const result = callback
		.map((cb) => cb(value, values, fieldDef))
		.filter((entry) => entry != null);
	if (result.length === 0) return null;
	return result[0];
};

export default validationChain;
