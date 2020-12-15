import React from "react";
import { Framework } from "../src";
import { StylesProvider } from "@material-ui/core";
import { Rule, StyleSheet } from "jss";
import { StoryContext } from "@storybook/addons";

// so jest won't complain about mismatching numbers anymore
const classIds: Record<string, number> = {};
const getClassId = (name: string | undefined): number => {
	const filledName = name === undefined ? "undefined-displayName" : name;

	if (!(filledName in classIds)) {
		classIds[filledName] = 0;
	} else {
		classIds[filledName]++;
	}
	return classIds[filledName];
};

const CssClassNameGenerator = (storyName: string | undefined) => (
	rule: Rule,
	sheet?: StyleSheet<string>
) => `${sheet?.options?.classNamePrefix}-${rule.key}-${getClassId(storyName)}`;

export const decorators = [
	(Story: React.ComponentType, context: StoryContext) => (
		<Framework>
			<StylesProvider
				generateClassName={CssClassNameGenerator(context.id)}
			>
				<Story />
			</StylesProvider>
		</Framework>
	),
];
