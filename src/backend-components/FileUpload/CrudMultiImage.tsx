import React, { useCallback, useEffect, useState } from "react";
import {
	MultiImageImage,
	MultiImageProps,
} from "../../standalone/FileUpload/MultiImage/MultiImage";
import { Connector, PageVisibility } from "../../backend-integration";
import { ErrorComponentProps } from "../Form";
import { Loader, MultiImage } from "../../standalone";

export interface CrudMultiImageProps extends Omit<MultiImageProps, "images"> {
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
		id: string | null
	) => Promise<Record<string, unknown>> | Record<string, unknown>;
	/**
	 * Callback for deserializing data after getting it from the backend connector
	 * @param data The data from the backend connector (index function)
	 * @returns The image data which can be used by the control
	 */
	deserialize: (
		data: Record<string, unknown>
	) => Promise<BackendMultiImageImage> | BackendMultiImageImage;
}

export interface BackendMultiImageImage extends MultiImageImage {
	id: string;
	index?: number;
}

const CrudMultiImage = (props: CrudMultiImageProps) => {
	const {
		connector,
		errorComponent: ErrorComponent,
		serialize,
		deserialize,
		onChange,
		...otherProps
	} = props;
	const { name } = otherProps;

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	const [loadError, setLoadError] = useState<Error | null>(null);
	const [images, setImages] = useState<BackendMultiImageImage[]>([]);

	const handleChange = useCallback(
		async (_, newImages: (MultiImageImage | BackendMultiImageImage)[]) => {
			newImages = newImages.map((img, n) => ({ ...img, index: n }));
			// upload new/changed files
			const uploadPromise = Promise.all(
				newImages
					.filter((img) => !("id" in img) || !images.includes(img))
					.map(async (img) => {
						// check if we have to replace a file (update)
						const oldImg =
							"id" in img && images.find((oldImg) => oldImg.id === img.id);
						if (oldImg) {
							return {
								response: await connector.update(
									await serialize(img, oldImg.id)
								),
								index: (img as BackendMultiImageImage).index,
							};
						}
						// or create new
						return {
							response: await connector.create(await serialize(img, null)),
							index: (img as BackendMultiImageImage).index,
						};
					})
					.map(async (request) => {
						const result = await request;
						return {
							...deserialize(result.response[0]),
							index: result.index,
						};
					})
			);
			// delete deleted files
			const deletePromise = connector.deleteMultiple(
				images
					.filter(
						(img) =>
							!newImages.find((other) => "id" in other && other.id === img.id)
					)
					.map((img) => img.id)
			);

			try {
				// wait for response

				// deletePromise may be undefined or a promise
				// eslint-disable-next-line @typescript-eslint/await-thenable
				await deletePromise;
				const uploadedImages = await uploadPromise;

				const finalImages: BackendMultiImageImage[] = [];
				(newImages.filter(
					(img) => "id" in img && images.includes(img)
				) as BackendMultiImageImage[]).forEach(
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					(img) => (finalImages[img.index!] = img)
				);
				uploadedImages.forEach(
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					(img) => (finalImages[(img as BackendMultiImageImage).index!] = img)
				);

				// update state
				setImages(finalImages);
			} catch (e) {
				setError(e as Error);
			}
		},
		[connector, deserialize, images, serialize]
	);

	useEffect(() => {
		void (async () => {
			try {
				const initialData = await connector.index({
					page: 1,
					rows: Number.MAX_SAFE_INTEGER,
				});
				const initialFiles = await Promise.all(initialData[0].map(deserialize));
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

	if (loading) return <Loader />;
	if (loadError) return <span>{loadError.message}</span>;

	return (
		<>
			{error && <ErrorComponent error={error} />}
			<MultiImage {...otherProps} images={images} onChange={handleChange} />
		</>
	);
};

export default React.memo(CrudMultiImage);
