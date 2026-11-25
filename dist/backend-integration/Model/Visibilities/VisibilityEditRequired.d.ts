import Visibility from "../Visibility";
/**
 * An editable field, marked as required (an asterisk after its label)
 * @remarks The mark doesn't validate (see Visibility.required): give the field a `validate`
 *          that refuses an empty value, e.g. `validatePresence`.
 */
declare const VisibilityEditRequired: Visibility;
export default VisibilityEditRequired;
