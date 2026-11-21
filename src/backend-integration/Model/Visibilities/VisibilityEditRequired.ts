import Visibility from "../Visibility";

/**
 * An editable field, marked as required (an asterisk after its label)
 * @remarks The mark doesn't validate (see Visibility.required): give the field a `validate`
 *          that refuses an empty value, e.g. `validatePresence`.
 */
const VisibilityEditRequired: Visibility = {
	disabled: false,
	hidden: false,
	editable: true,
	readOnly: false,
	required: true,
	grid: false,
};

export default VisibilityEditRequired;
