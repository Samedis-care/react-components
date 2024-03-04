import { useHistoryRouterContext } from "./HistoryRouter";
import type { Location } from "history";
import { useEffect, useState } from "react";

/**
 * Use the current location
 */
const useLocation = (): Location => {
	const ctx = useHistoryRouterContext();
	const [location, setLocation] = useState(ctx.history.location);
	useEffect(() => {
		return ctx.history.listen((update) => {
			setLocation(update.location);
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return location;
};

export default useLocation;
