import React from "react";
import Routes, { RoutesProps } from "../../standalone/Routes/Routes";

export interface RoutedTabPanelWrapperProps {
	children: RoutesProps["children"];
}

const RoutedTabPanelWrapper = (props: RoutedTabPanelWrapperProps) => {
	return <Routes>{props.children}</Routes>;
};

export default React.memo(RoutedTabPanelWrapper);
