import React, { useCallback } from "react";
import { Tabs, TabsProps } from "@mui/material";
import useLocation from "../../standalone/Routes/useLocation";
import { useRouteInfo } from "../../standalone";
import useNavigate from "../../standalone/Routes/useNavigate";

export interface RoutedTabsProps extends Omit<TabsProps, "value" | "onChange"> {
	/**
	 * The MUI `Tab` elements. The selected Tab is the one whose `value` is the
	 * first path segment after the enclosing Route's url. The Tab with
	 * `value=""` is the default tab: it is selected at the route's own url,
	 * and also when no Tab has the segment (a stale link, a Tab that is not
	 * rendered, a path inside the default panel). Without a default tab, no
	 * tab is selected then.
	 */
	children: React.ReactNode;
}

/**
 * The values MUI's `Tabs` gives its children: each element's `value`, or its
 * index among the elements when it has none
 * @param children The Tabs' children
 * @returns The values, in order
 */
const getTabValues = (children: React.ReactNode): unknown[] =>
	React.Children.toArray(children)
		.filter(React.isValidElement)
		.map((child, index) => {
			const value = (child.props as { value?: unknown }).value;
			return value === undefined ? index : value;
		});

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
	const segment =
		pathname
			.substring(url.length)
			.split("/")
			.filter((entry) => entry)[0] ?? "";
	const values = getTabValues(props.children);
	// MUI logs an error for a value no Tab has. With such a segment the default
	// panel (the catch-all) is the one shown, so its Tab is the selected one.
	const current = values.includes(segment)
		? segment
		: values.includes("")
			? ""
			: false;
	return (
		<Tabs {...props} value={current} onChange={handleChange}>
			{props.children}
		</Tabs>
	);
};

export default React.memo(RoutedTabs);
