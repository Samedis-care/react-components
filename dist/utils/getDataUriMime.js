const getDataUriMime = (data) => {
    if (data === "data:")
        return null;
    const arr = data.split(",");
    if (arr.length < 2)
        return null;
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch || mimeMatch.length < 2)
        return null;
    return mimeMatch[1];
};
export default getDataUriMime;
