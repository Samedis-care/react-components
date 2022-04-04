const localDateToUtcDate = (date: Date): Date =>
	new Date(date.getTime() - date.getTimezoneOffset() * 60000);

export default localDateToUtcDate;
