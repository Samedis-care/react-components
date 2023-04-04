var sleep = function (ms) {
    return new Promise(function (resolve) {
        window.setTimeout(resolve, ms);
    });
};
export default sleep;
