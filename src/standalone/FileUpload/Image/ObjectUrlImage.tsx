import React from "react";
import useObjectUrl from "../../../utils/useObjectUrl";

export interface ObjectUrlImageProps extends Omit<
	React.ImgHTMLAttributes<HTMLImageElement>,
	"src"
> {
	/**
	 * The image: its URL, or a Blob (e.g. an image the user picked)
	 */
	src: string | Blob | null | undefined;
	/**
	 * The alt text of the image
	 */
	alt: string;
}

/**
 * An image element which also shows a Blob
 * @remarks The Blob is shown through an object URL, revoked once src changes or the
 *          image unmounts
 */
const ObjectUrlImage = (props: ObjectUrlImageProps) => {
	const { src, alt, ...imgProps } = props;
	const url = useObjectUrl(src);
	return <img src={url} alt={alt} {...imgProps} />;
};

export default React.memo(ObjectUrlImage);
