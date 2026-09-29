import React from "react";
export interface ObjectUrlImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
    /**
     * The image: its URL, or a Blob (e.g. an image the user picked)
     */
    src: string | Blob | null | undefined;
    /**
     * The alt text of the image
     */
    alt: string;
}
declare const _default: React.MemoExoticComponent<(props: ObjectUrlImageProps) => React.JSX.Element>;
export default _default;
