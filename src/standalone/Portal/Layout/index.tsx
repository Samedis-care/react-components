import React, { Component } from "react";
import Header from "../Header";
import Menu from "../Menu";

interface IProps {
	headerContent: Component;
	content: Component;
}

export default (props: IProps) => {
	return (
		<>
			<Header contents={props.headerContent}/>
			<Menu/>
			<PageMargin>
				{props.content}
			</PageMargin>
		</>
	)
}