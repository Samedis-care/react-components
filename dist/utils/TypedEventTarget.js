/**
 * A minimal, strongly typed event emitter with a DOM-like API
 * @remarks Unlike the DOM EventTarget there is no bubbling, capturing or cancellation,
 *          an event is just a payload handed to every registered listener.
 *          All methods are bound, so they can be handed out (e.g. through a React context)
 *          without losing their receiver and without changing identity between renders.
 */
class TypedEventTarget {
    listeners = {};
    /**
     * Registers an event listener
     * @param type The event type
     * @param listener The listener to call when the event is dispatched
     */
    addEventListener = (type, listener) => {
        const listeners = this.listeners[type] ?? new Set();
        listeners.add(listener);
        this.listeners[type] = listeners;
    };
    /**
     * Unregisters an event listener
     * @param type The event type
     * @param listener The listener previously passed to addEventListener
     */
    removeEventListener = (type, listener) => {
        this.listeners[type]?.delete(listener);
    };
    /**
     * Dispatches an event to all registered listeners
     * @param type The event type
     * @param event The event payload
     * @remarks A throwing listener is reported, but doesn't stop the remaining listeners
     *          from being called and doesn't propagate to the dispatching code
     */
    dispatchEvent = (type, event) => {
        const listeners = this.listeners[type];
        if (!listeners)
            return;
        // iterate a copy: a listener may add or remove listeners while being called
        for (const listener of [...listeners]) {
            try {
                listener(event);
            }
            catch (e) {
                // eslint-disable-next-line no-console
                console.error("[Components-Care] [TypedEventTarget] Event listener threw exception", type, e);
            }
        }
    };
}
export default TypedEventTarget;
