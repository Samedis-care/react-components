/**
 * Is this a touch-only device? True on phones and tablets, false on a
 * touchscreen laptop — its trackpad still reports hover.
 * @returns boolean Coarse pointer and nothing that can hover?
 * @remarks Reactive (useMediaQuery), so rotating or resizing re-renders, and no
 * user-agent sniffing: an iPad reports a macOS UA in Safari by default and
 * navigator.userAgentData does not exist on iOS at all. Use this over
 * isTouchDevice when the question is "can this user hover?" rather than "is a
 * touch screen present?".
 */
declare const useIsTouchOnly: () => boolean;
export default useIsTouchOnly;
