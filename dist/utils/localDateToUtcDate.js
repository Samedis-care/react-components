var localDateToUtcDate = function (date) {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
};
export default localDateToUtcDate;
