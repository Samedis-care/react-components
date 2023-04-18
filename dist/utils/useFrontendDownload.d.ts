/**
 * React hook to provide easy frontend generated file downloads
 * @returns a function which accepts a file to download
 */
declare const useFrontendDownload: () => (file: File) => void;
export default useFrontendDownload;
