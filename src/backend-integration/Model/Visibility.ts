interface Visibility {
	/**
	 * Is the field disabled? (won't be rendered and won't be included in requests)
	 */
	disabled: boolean;

	/**
	 * Should the field not be rendered? (will still be included in requests)
	 */
	hidden: boolean;

	/**
	 * Is the field editable?
	 */
	editable: boolean;

	/**
	 * Is the field read-only? (only applies if editable)
	 */
	readOnly: boolean;

	/**
	 * Is required field?
	 */
	required: boolean;
}

export default Visibility;
