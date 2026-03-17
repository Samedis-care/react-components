import React, { lazy, Suspense, useCallback, useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Framework } from "../../framework";
import createTestModel from "../../stories/test-utils/TestModel";
import type { BaseSelectorData, MultiSelectorData } from "../../standalone";

// Lazy-import to avoid circular dependency at module evaluation time
const BackendSingleSelect = lazy(() => import("./BackendSingleSelect"));
const BackendMultiSelect = lazy(() => import("./BackendMultiSelect"));

const FrameworkDecorator = (Story: React.ComponentType) => (
	<Framework>
		<Suspense fallback={<div>Loading…</div>}>
			<div style={{ padding: 24, maxWidth: 400 }}>
				<Story />
			</div>
		</Suspense>
	</Framework>
);

const meta: Meta = {
	title: "Backend-Components/Selector",
	decorators: [FrameworkDecorator],
};

export default meta;

const modelToSelectorData = (
	data: Record<string, unknown>,
): BaseSelectorData => ({
	value: data.id as string,
	label: `${data.first_name as string} ${data.last_name as string}`,
});

const modelToMultiSelectorData = (
	data: Record<string, unknown>,
): MultiSelectorData => ({
	value: data.id as string,
	label: `${data.first_name as string} ${data.last_name as string}`,
});

const SingleSelectStory = () => {
	const model = useMemo(createTestModel, []);
	const [selected, setSelected] = useState<string | null>(null);
	const handleSelect = useCallback((value: string | null) => {
		setSelected(value);
	}, []);
	return (
		<BackendSingleSelect
			model={model}
			modelToSelectorData={modelToSelectorData}
			selected={selected}
			onSelect={handleSelect}
			label="Select a person"
		/>
	);
};

export const SingleSelect: StoryObj = {
	render: () => <SingleSelectStory />,
};

const MultiSelectStory = () => {
	const model = useMemo(createTestModel, []);
	const [selected, setSelected] = useState<string[]>([]);
	const handleSelect = useCallback((values: string[]) => {
		setSelected(values);
	}, []);
	return (
		<BackendMultiSelect
			model={model}
			modelToSelectorData={modelToMultiSelectorData}
			selected={selected}
			onSelect={handleSelect}
			label="Select people"
		/>
	);
};

export const MultiSelect: StoryObj = {
	render: () => <MultiSelectStory />,
};
