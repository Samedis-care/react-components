export default function debounce(func, timeout) {
    let debounceState = 0;
    return (...args) => {
        if (debounceState !== 0) {
            window.clearTimeout(debounceState);
        }
        debounceState = window.setTimeout(() => func(...args), timeout);
    };
}
