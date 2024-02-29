import ComponentsCareI18n from "../i18n";

const timestampToAge = (timestamp: Date): string => {
	const delta = new Date().getTime() - timestamp.getTime();

	if (delta < 5000 /* 5s */)
		return ComponentsCareI18n.t("utils.timestampToAge.just-now");
	if (delta < 60000 /* 1m */)
		return ComponentsCareI18n.t("utils.timestampToAge.less-minute");
	let amount: number;
	let unit: "minute" | "minutes" | "hour" | "hours" | "day" | "days";
	if (delta < 3600000 /* 1h */) {
		const minutes = Math.floor(delta / 60000);
		amount = minutes;
		unit = minutes > 1 ? "minutes" : "minute";
	} else if (delta < 86400000 /* 1d */) {
		const hours = Math.floor(delta / 3600000);
		amount = hours;
		unit = hours > 1 ? "hours" : "hour";
	} else {
		const days = Math.floor(delta / 86400000);
		amount = days;
		unit = days > 1 ? "days" : "day";
	}
	return ComponentsCareI18n.t("utils.timestampToAge.str", {
		AMOUNT: amount.toFixed(0),
		UNIT: ComponentsCareI18n.t("utils.timestampToAge." + unit),
	});
};

export default timestampToAge;
