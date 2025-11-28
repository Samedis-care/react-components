import React, { useCallback, useEffect, useState } from "react";
import {
	MultiImageImage,
	MultiImageNewIdPrefix,
	MultiImageProps,
} from "../../standalone/FileUpload/MultiImage/MultiImage";
import { Connector, PageVisibility } from "../../backend-integration";
import { ErrorComponentProps } from "../Form";
import { Loader, MultiImage } from "../../standalone";

export interface CrudMultiImageProps extends Omit<
	MultiImageProps,
	"images" | "onChange"
> {
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
	serialize: (
		data: MultiImageImage,
		id: string | null,
	) => Promise<Record<string, unknown>> | Record<string, unknown>;
	/**
	 * Callback for deserializing data after getting it from the backend connector
	 * @param data The data from the backend connector (index function)
	 * @returns The image data which can be used by the control
	 */
	deserialize: (
		data: Record<string, unknown>,
	) => Promise<BackendMultiImageImage> | BackendMultiImageImage;
	/**
	 * @see MultiImageProps.onChange
	 */
	onChange?: (
		name: string | undefined,
		newImages: BackendMultiImageImage[],
	) => void;
}

export interface BackendMultiImageImage extends MultiImageImage {
	primary?: boolean;
	index?: number;
}

const CrudMultiImage = (props: CrudMultiImageProps) => {
	const {
		connector,
		errorComponent: ErrorComponent,
		serialize,
		deserialize,
		onChange,
		additionalImages,
		additionalImagesLoading,
		...otherProps
	} = props;
	const { name, primary, onPrimaryChange } = otherProps;

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	const [loadError, setLoadError] = useState<Error | null>(null);
	const [images, setImages] = useState<BackendMultiImageImage[]>([]);

	const handleChange = useCallback(
		async (
			_name: string | undefined,
			newImages: (MultiImageImage | BackendMultiImageImage)[],
		) => {
			if (additionalImages)
				newImages = newImages.filter((img) => !additionalImages.includes(img));

			newImages = newImages.map((img, n) => ({
				...img,
				index: n,
				primary: primary === img.id,
			}));
			// upload new/changed files
			const uploadPromise = Promise.all(
				newImages
					.filter(
						(img) =>
							img.id.startsWith(MultiImageNewIdPrefix) || !images.includes(img),
					)
					.map(async (img) => {
						// check if we have to replace a file (update)
						const oldImg =
							!img.id.startsWith(MultiImageNewIdPrefix) &&
							images.find((oldImg) => oldImg.id === img.id);
						if (oldImg) {
							if (oldImg.image === img.image && oldImg.name === img.name) {
								// no changes to image or file name, so we don't cause a PUT here
								return {
									response: [await serialize(img, oldImg.id)],
									index: (img as BackendMultiImageImage).index,
									primary: (img as BackendMultiImageImage).primary,
								};
							}
							return {
								response: await connector.update(
									await serialize(img, oldImg.id),
								),
								index: (img as BackendMultiImageImage).index,
								primary: (img as BackendMultiImageImage).primary,
							};
						}
						// or create new
						return {
							response: await connector.create(await serialize(img, null)),
							index: (img as BackendMultiImageImage).index,
							primary: (img as BackendMultiImageImage).primary,
						};
					})
					.map(async (request) => {
						const result = await request;
						return {
							...(await deserialize(result.response[0])),
							index: result.index,
							primary: result.primary,
						};
					}),
			);
			// delete deleted files
			const deletePromise = connector.deleteMultiple(
				images
					.filter(
						(img) =>
							!newImages.find(
								(other) =>
									!other.id.startsWith(MultiImageNewIdPrefix) &&
									other.id === img.id,
							),
					)
					.map((img) => img.id),
			);

			try {
				// wait for response

				// deletePromise may be undefined or a promise

				await deletePromise;
				const uploadedImages = await uploadPromise;

				const finalImages: BackendMultiImageImage[] = [];
				(
					newImages.filter(
						(img) =>
							!img.id.startsWith(MultiImageNewIdPrefix) && images.includes(img),
					) as BackendMultiImageImage[]
				).forEach((img) => {
					finalImages[img.index!] = img;
				});
				uploadedImages.forEach(
					(img) => (finalImages[(img as BackendMultiImageImage).index!] = img),
				);

				// update state
				setImages(finalImages);
				if (onPrimaryChange)
					onPrimaryChange(
						name,
						finalImages.find((img) => img.primary)?.id ?? "",
					);
			} catch (e) {
				setError(e as Error);
			}
		},
		[
			additionalImages,
			connector,
			deserialize,
			images,
			primary,
			onPrimaryChange,
			name,
			serialize,
		],
	);

	useEffect(() => {
		void (async () => {
			try {
				const initialData = await connector.index({
					page: 1,
					rows: Number.MAX_SAFE_INTEGER,
				});
				const initialFiles = await Promise.all(
					initialData[0].map((value) => Promise.resolve(deserialize(value))),
				);
				setImages(initialFiles);
			} catch (e) {
				setLoadError(e as Error);
			} finally {
				setLoading(false);
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (onChange) onChange(name, images);
	}, [images, name, onChange]);

	if (loading || additionalImagesLoading) return <Loader />;
	if (loadError) return <span>{loadError.message}</span>;

	return (
		<>
			{error && <ErrorComponent error={error} />}
			<MultiImage
				{...otherProps}
				images={additionalImages ? additionalImages.concat(images) : images}
				onChange={handleChange}
			/>
		</>
	);
};

export default React.memo(CrudMultiImage);
