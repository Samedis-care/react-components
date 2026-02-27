const useDocumentBody = () => {
    const documentBody = document.body;
    if (!documentBody)
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw new Promise((resolve) => {
            window.addEventListener("load", () => resolve(document.body));
        });
    return documentBody;
};
export default useDocumentBody;
