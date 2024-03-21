import React, { useCallback } from "react";
import { Tabs, TabsProps } from "@mui/material";
import useLocation from "../../standalone/Routes/useLocation";
import { useRouteInfo } from "../../standalone";
import useNavigate from "../../standalone/Routes/useNavigate";

export interface RoutedTabsProps extends Omit<TabsProps, "value" | "onChange"> {
	children: React.ReactNode;
}

const RoutedTabs = (props: RoutedTabsProps) => {
	const { pathname, search, hash } = useLocation();
	let { url } = useRouteInfo();
	if (url.endsWith("/")) url = url.substring(0, url.length - 1);
	const navigate = useNavigate();
	const handleChange = useCallback(
		(_evt: React.ChangeEvent<unknown>, value: string) => {
			navigate({
				pathname: url + "/" + value,
				search,
				hash,
			});
		},
		[navigate, url, search, hash],
	);
	const current =
		pathname
			.substring(url.length)
			.split("/")
			.filter((entry) => entry)[0] ?? "";
	return (
		<Tabs {...props} value={current} onChange={handleChange}>
			{props.children}
		</Tabs>
	);
};

export default React.memo(RoutedTabs);
