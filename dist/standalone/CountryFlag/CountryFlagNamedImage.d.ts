import React from "react";
export interface CountryFlagNamedImageProps {
    /**
     * The country's code, which names the image
     */
    code: string;
    /**
     * The flag's URL
     */
    src: string;
    /**
     * Class name of the `image` slot
     */
    className?: string;
}
declare const _default: React.MemoExoticComponent<(props: CountryFlagNamedImageProps) => React.JSX.Element>;
export default _default;
