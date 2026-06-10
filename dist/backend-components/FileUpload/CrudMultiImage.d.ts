import React from "react";
import { MultiImageImage, MultiImageProps } from "../../standalone/FileUpload/MultiImage/MultiImage";
import { Connector, PageVisibility } from "../../backend-integration";
import { ErrorComponentProps } from "../Form";
export interface CrudMultiImageProps extends Omit<MultiImageProps, "images" | "onChange"> {
    /**
     * Optional additional images to display
     */
    additionalImages?: MultiImageImage[];
    /**
     * Optional additional images loading flag
     * Should be set to true while additionalImages is null to prevent
     * it loosing primary status
     */
    additionalImagesLoading?: boolean;
    /**
     * The backend connector used as CRUD interface
     */
    connector: Connector<string, PageVisibility, unknown>;
    /**
     * The error component that is used to display errors
     */
    errorComponent: React.ComponentType<ErrorComponentProps>;
    /**
     * Callback for serializing data before passing it to the backend connector
     * @param data The image data to serialize
     * @param id The id of the image data or null for new
     * @returns Data to be passed to the backend connector
     */
    serialize: (data: MultiImageImage, id: string | null) => Promise<Record<string, unknown>> | Record<string, unknown>;
    /**
     * Callback for deserializing data after getting it from the backend connector
     * @param data The data from the backend connector (index function)
     * @returns The image data which can be used by the control
     */
    deserialize: (data: Record<string, unknown>) => Promise<BackendMultiImageImage> | BackendMultiImageImage;
    /**
     * @see MultiImageProps.onChange
     */
    onChange?: (name: string | undefined, newImages: BackendMultiImageImage[]) => void;
}
export interface BackendMultiImageImage extends MultiImageImage {
    primary?: boolean;
    index?: number;
}
declare const _default: React.MemoExoticComponent<(props: CrudMultiImageProps) => React.JSX.Element>;
export default _default;
