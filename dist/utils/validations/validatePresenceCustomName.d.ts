/**
 * validatePresence, but with a custom label (instead of the field label)
 * @param name The i18n key for getting the custom label
 */
declare const validatePresenceCustomName: <TypeT>(name: string) => (value: TypeT) => string | null;
export default validatePresenceCustomName;
