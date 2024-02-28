import React, { useCallback, useEffect, useState } from "react";
import { MultiImageNewIdPrefix, } from "../../standalone/FileUpload/MultiImage/MultiImage";
import { Loader, MultiImage } from "../../standalone";
const CrudMultiImage = (props) => {
    const { connector, errorComponent: ErrorComponent, serialize, deserialize, onChange, additionalImages, additionalImagesLoading, ...otherProps } = props;
    const { name, primary, onPrimaryChange } = otherProps;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loadError, setLoadError] = useState(null);
    const [images, setImages] = useState([]);
    const handleChange = useCallback(async (_, newImages) => {
        if (additionalImages)
            newImages = newImages.filter((img) => !additionalImages.includes(img));
        newImages = newImages.map((img, n) => ({
            ...img,
            index: n,
            primary: primary === img.id,
        }));
        // upload new/changed files
        const uploadPromise = Promise.all(newImages
            .filter((img) => img.id.startsWith(MultiImageNewIdPrefix) || !images.includes(img))
            .map(async (img) => {
            // check if we have to replace a file (update)
            const oldImg = !img.id.startsWith(MultiImageNewIdPrefix) &&
                images.find((oldImg) => oldImg.id === img.id);
            if (oldImg) {
                if (oldImg.image === img.image && oldImg.name === img.name) {
                    // no changes to image or file name, so we don't cause a PUT here
                    return {
                        response: [await serialize(img, oldImg.id)],
                        index: img.index,
                        primary: img.primary,
                    };
                }
                return {
                    response: await connector.update(await serialize(img, oldImg.id)),
                    index: img.index,
                    primary: img.primary,
                };
            }
            // or create new
            return {
                response: await connector.create(await serialize(img, null)),
                index: img.index,
                primary: img.primary,
            };
        })
            .map(async (request) => {
            const result = await request;
            return {
                ...(await deserialize(result.response[0])),
                index: result.index,
                primary: result.primary,
            };
        }));
        // delete deleted files
        const deletePromise = connector.deleteMultiple(images
            .filter((img) => !newImages.find((other) => !other.id.startsWith(MultiImageNewIdPrefix) &&
            other.id === img.id))
            .map((img) => img.id));
        try {
            // wait for response
            // deletePromise may be undefined or a promise
            // eslint-disable-next-line @typescript-eslint/await-thenable
            await deletePromise;
            const uploadedImages = await uploadPromise;
            const finalImages = [];
            newImages.filter((img) => !img.id.startsWith(MultiImageNewIdPrefix) && images.includes(img)).forEach((img) => {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                finalImages[img.index] = img;
            });
            uploadedImages.forEach(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            (img) => (finalImages[img.index] = img));
            // update state
            setImages(finalImages);
            if (onPrimaryChange)
                onPrimaryChange(name, finalImages.find((img) => img.primary)?.id ?? "");
        }
        catch (e) {
            setError(e);
        }
    }, [
        additionalImages,
        connector,
        deserialize,
        images,
        primary,
        onPrimaryChange,
        name,
        serialize,
    ]);
    useEffect(() => {
        void (async () => {
            try {
                const initialData = await connector.index({
                    page: 1,
                    rows: Number.MAX_SAFE_INTEGER,
                });
                const initialFiles = await Promise.all(initialData[0].map(deserialize));
                setImages(initialFiles);
            }
            catch (e) {
                setLoadError(e);
            }
            finally {
                setLoading(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    useEffect(() => {
        if (onChange)
            onChange(name, images);
    }, [images, name, onChange]);
    if (loading || additionalImagesLoading)
        return React.createElement(Loader, null);
    if (loadError)
        return React.createElement("span", null, loadError.message);
    return (React.createElement(React.Fragment, null,
        error && React.createElement(ErrorComponent, { error: error }),
        React.createElement(MultiImage, { ...otherProps, images: additionalImages ? additionalImages.concat(images) : images, onChange: handleChange })));
};
export default React.memo(CrudMultiImage);
