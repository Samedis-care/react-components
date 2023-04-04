declare enum AuthMode {
    /**
     * Enable Authentication
     */
    On = 0,
    /**
     * Disable Authentication
     */
    Off = 1,
    /**
     * Try with authentication, don't perform automatic retry on failure
     */
    Try = 2
}
export default AuthMode;
