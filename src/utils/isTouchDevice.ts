/**
 * Check if the current device has a touch screen
 * @returns boolean Does this device have a touch screen?
 */
const isTouchDevice = (): boolean => {
	return (
		"ontouchstart" in window ||
		navigator.maxTouchPoints > 0 ||
		navigator.msMaxTouchPoints > 0
	);
};

export default isTouchDevice;
