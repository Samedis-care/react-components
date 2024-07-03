import React from "react";
import { FormContext, FormContextLite } from "./Form";

export interface UnsetFormContextProps {
	children: React.ReactNode;
}

const UnsetFormContext = (props: UnsetFormContextProps) => {
	return (
		<FormContext.Provider value={null}>
			<FormContextLite.Provider value={null}>
				{props.children}
			</FormContextLite.Provider>
		</FormContext.Provider>
	);
};

export default UnsetFormContext;
