enum AuthMode {
	/**
	 * Enable Authentication
	 */
	On,
	/**
	 * Disable Authentication
	 */
	Off,
	/**
	 * Try with authentication, don't perform automatic retry on failure
	 */
	Try,
}

export default AuthMode;
