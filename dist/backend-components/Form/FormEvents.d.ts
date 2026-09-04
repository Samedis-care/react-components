import TypedEventTarget from "../../utils/TypedEventTarget";
/**
 * Payload of the "dirty" form event
 */
export interface FormDirtyEvent {
    /**
     * The new dirty state of the form
     * @see FormContextData.dirty
     */
    dirty: boolean;
}
/**
 * The events dispatched by the form engine
 */
export interface FormEvents extends Record<string, unknown> {
    /**
     * The form's dirty state changed
     */
    dirty: FormDirtyEvent;
}
/**
 * The event target the form engine dispatches its events on
 * @see FormContextData.addEventListener
 */
export type FormEventTarget = TypedEventTarget<FormEvents>;
