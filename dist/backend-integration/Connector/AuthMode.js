var AuthMode;
(function (AuthMode) {
    /**
     * Enable Authentication
     */
    AuthMode[AuthMode["On"] = 0] = "On";
    /**
     * Disable Authentication
     */
    AuthMode[AuthMode["Off"] = 1] = "Off";
    /**
     * Try with authentication, don't perform automatic retry on failure
     */
    AuthMode[AuthMode["Try"] = 2] = "Try";
})(AuthMode || (AuthMode = {}));
export default AuthMode;
