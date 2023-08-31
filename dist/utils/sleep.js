const sleep = (ms) => {
    return new Promise((resolve) => {
        window.setTimeout(resolve, ms);
    });
};
export default sleep;
