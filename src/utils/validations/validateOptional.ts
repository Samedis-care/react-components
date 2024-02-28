import {
	ModelFieldDefinition,
	ModelFieldName,
	PageVisibility,
} from "../../backend-integration";

const validateOptional =
	<
		TypeT,
		KeyT extends ModelFieldName,
		VisibilityT extends PageVisibility,
		CustomT,
	>(
		callback: (
			value: TypeT,
			values: Record<string, unknown>,
			fieldDef: Pick<
				ModelFieldDefinition<TypeT, KeyT, VisibilityT, CustomT>,
				"getLabel"
			>,
		) => string | null,
	) =>
	(
		value: TypeT,
		values: Record<string, unknown>,
		fieldDef: Pick<
			ModelFieldDefinition<TypeT, KeyT, VisibilityT, CustomT>,
			"getLabel"
		>,
	): string | null => {
		if (!value) return null;
		return callback(value, values, fieldDef);
	};

export default validateOptional;
