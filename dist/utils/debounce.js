/**
 * Debounces a function: calls within the timeout invoke it once, with the arguments of the
 * last call
 * @param func The function to debounce
 * @param timeout The time in ms to wait after the last call
 */
export default function debounce(func, timeout) {
    let debounceState = 0;
    const debounced = (...args) => {
        if (debounceState !== 0) {
            window.clearTimeout(debounceState);
        }
        debounceState = window.setTimeout(() => {
            debounceState = 0;
            func(...args);
        }, timeout);
    };
    debounced.cancel = () => {
        if (debounceState === 0)
            return;
        window.clearTimeout(debounceState);
        debounceState = 0;
    };
    return debounced;
}
