import React from "react";
import { Framework } from "../src";

export const decorators = [
	(Story: React.ComponentType) => (
		<Framework>
			<Story />
		</Framework>
	),
];
