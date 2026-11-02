import React from "react";
import { MultiImageImage, MultiImageProps } from "../../standalone/FileUpload/MultiImage/MultiImage";
import { Connector } from "../../backend-integration";
import { ErrorComponentProps } from "../Form";
/**
 * Props of CrudMultiImage: those of MultiImage, with the images loaded from `connector`
 */
export interface CrudMultiImageProps extends Omit<MultiImageProps, "images" | "onChange" | "dialogMessage" | "onDialogOpenChange" | "busy"> {
    /**
     * Images of someone else, listed before this control's own
     * @remarks Read-only whatever their `readOnly` says: never removed, replaced or
     *          written through `connector`. They are told apart from the own images by
     *          identity, so pass a stable array (module level or useMemo).
     */
    additionalImages?: MultiImageImage[];
    /**
     * Set while `additionalImages` is still loading
     * @remarks Until they have arrived once, the field shows that it is loading. A later
     *          reload leaves the field as it is: it keeps listing the additional images
     *          passed last, and is marked busy until the new ones arrive. Listed without
     *          them, a primary that is one of them would fall back to the first own image.
     */
    additionalImagesLoading?: boolean;
    /**
     * The backend connector used as CRUD interface
     * @remarks A LazyConnector queues every write until its queue is written, which a Form
     *          does after saving. Any other connector is written at once. The field looks
     *          the same either way.
     *
     *          Null renders a read-only control that lists `additionalImages`. Read once:
     *          the first connector passed (after null, if any) is listed and written for
     *          as long as the control is mounted, and a later one is ignored. To show
     *          another collection, remount the control, e.g. with a `key` per record.
     */
    connector: Connector | null;
    /**
     * Renders the error of a refused create, update or delete, where the user is when it
     * arrives: at the top of the edit dialog while that is open, above the field otherwise
     * @remarks An error shown in the dialog is dismissed when the dialog closes. One shown
     *          above the field stays there while the dialog is open.
     */
    errorComponent: React.ComponentType<ErrorComponentProps>;
    /**
     * Callback for delete confirmation, asked before an image is removed
     * @remarks The field has no undo for a removal: without a LazyConnector it deletes the
     *          image on the server at once, with one it is queued until the queue is written.
     * @see MultiImageProps.onDelete
     */
    onDelete?: MultiImageProps["onDelete"];
    /**
     * Callback for serializing data before passing it to the backend connector
     * @param data The image to write: `data.image` is what the user picked or dropped for
     *             an added or replaced image, the stored URL otherwise. `index` and
     *             `primary` are set.
     * @param id The id of the image to update, or null to create one
     * @returns Data to be passed to the backend connector's create or update
     * @remarks Called only for an image that is created or replaced.
     */
    serialize: (data: MultiImageImage, id: string | null) => Promise<Record<string, unknown>> | Record<string, unknown>;
    /**
     * Callback for deserializing data after getting it from the backend connector
     * @param data A record from the connector: a row of `index`, or what `create` or
     *             `update` returned. From a LazyConnector, a queued write is what
     *             `serialize` returned, a new image with a client-side `id`
     *             (`fake-id-N`). It is listed that way by `index` too, until the queue is
     *             written.
     * @returns The image data which can be used by the control
     */
    deserialize: (data: Record<string, unknown>) => Promise<BackendMultiImageImage> | BackendMultiImageImage;
    /**
     * Called with this control's own images whenever they change: once they are loaded,
     * and after each change was written or queued
     * @param name The name of this field
     * @param newImages Without `additionalImages`. With a LazyConnector, an image created
     *                  through it keeps its client-side id, also after the queue was
     *                  written: `LazyConnector.mapId` gives the server's.
     * @remarks Not called before the images are loaded, after a failed load, or for a new
     *          handler alone.
     */
    onChange?: (name: string | undefined, newImages: BackendMultiImageImage[]) => void;
    /**
     * Called with the new primary image's id, which the owner stores, e.g. with the parent
     * record
     * @remarks Called when the user makes an image primary or drops images on the page
     *          preview, when the primary is not listed (with the first image, or null when
     *          there is none), and with null when a change removed the primary image. With
     *          a LazyConnector, a new image's id is client-side, also after the queue was
     *          written: `LazyConnector.mapId` gives the server's.
     */
    onPrimaryChange?: MultiImageProps["onPrimaryChange"];
}
/**
 * An image stored behind CrudMultiImage's connector
 */
export interface BackendMultiImageImage extends MultiImageImage {
    /**
     * Was the image the primary one when it was last written?
     * @remarks Set for `serialize` when the image is created or replaced, so a change of
     *          the primary alone writes nothing. The primary itself is the owner's
     *          (`primary`, `onPrimaryChange`).
     */
    primary?: boolean;
    /**
     * The image's position in the list, set for `serialize` when it is created or replaced
     * @remarks An untouched image is not written, so its new position after a removal
     *          before it is not sent.
     */
    index?: number;
}
declare const _default: React.MemoExoticComponent<(props: CrudMultiImageProps) => React.JSX.Element>;
export default _default;
