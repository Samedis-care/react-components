/**
 * A form whose effects run again keeps what was entered. React runs the effects of a
 * mounted form again without a new load, with all state kept: StrictMode (19) does when a
 * Suspense boundary shows the form again, and Activity does when it shows a hidden
 * subtree. Neither the form's initialization nor its update from the server data may take
 * that re-run for new data.
 */
import { describe, it, expect } from "vitest";
import React, { Activity, StrictMode, Suspense, use, useState } from "react";
import { act, render } from "@testing-library/react";
import { Framework } from "../../../src/framework";
import Form, {
	PageProps,
	useFormContext,
} from "../../../src/backend-components/Form/Form";
import FormField from "../../../src/backend-components/Form/Field";
import DefaultErrorComponent from "../../../src/backend-components/Form/DefaultErrorComponent";
import FlowEngine, {
	FlowStageProps,
} from "../../../src/backend-components/Form/FlowEngine/FlowEngine";
import { ModelUnknown } from "../../../src/backend-integration";
import {
	loaded,
	makeModel,
	settle,
	setupFormTests,
	Sink,
	TestFormProps,
	TestPage,
} from "./formFixture";

setupFormTests();

/**
 * A component that suspends until resolve is called
 */
const makeSuspender = () => {
	let resolve: () => void = () => {};
	const promise = new Promise<void>((r) => {
		resolve = r;
	});
	const Suspend = () => {
		use(promise);
		return null;
	};
	return {
		Suspend,
		resolve: async () => {
			await act(async () => {
				resolve();
				await promise;
			});
			await settle();
		},
	};
};

/**
 * Mounts the form in StrictMode inside a Suspense boundary, so a page that suspends hides
 * the whole form, and StrictMode runs its effects again when the boundary shows it again
 */
const mountInSuspense = (
	model: ModelUnknown,
	Page: TestPage,
	props: TestFormProps = {},
) => {
	const el = (p: TestFormProps) => (
		<StrictMode>
			<Framework>
				<Suspense fallback={<div data-testid={"fallback"} />}>
					<Form
						model={model}
						id={"1"}
						errorComponent={DefaultErrorComponent}
						customProps={undefined}
						disableRouting
						{...p}
					>
						{Page}
					</Form>
				</Suspense>
			</Framework>
		</StrictMode>
	);
	const result = render(el(props));
	return {
		...result,
		rerenderWith: (p: TestFormProps) => result.rerender(el(p)),
	};
};

/**
 * Mounts the form inside an Activity, which disconnects the form's effects while it hides
 * it and runs them again when it shows it
 */
const mountInActivity = (
	model: ModelUnknown,
	Page: TestPage,
	props: TestFormProps = {},
) => {
	const el = (mode: "visible" | "hidden") => (
		<Framework>
			<Activity mode={mode}>
				<Form
					model={model}
					id={"1"}
					errorComponent={DefaultErrorComponent}
					customProps={undefined}
					disableRouting
					{...props}
				>
					{Page}
				</Form>
			</Activity>
		</Framework>
	);
	const result = render(el("visible"));
	return {
		...result,
		hideAndShow: async () => {
			result.rerender(el("hidden"));
			await settle();
			result.rerender(el("visible"));
			await settle();
		},
	};
};

describe("Form whose effects run again without a new load", () => {
	it("keeps the values entered before a Suspense boundary hid it", async () => {
		const sink: Sink = {};
		const { Suspend, resolve } = makeSuspender();
		const control: { suspend?: (suspend: boolean) => void } = {};
		const Page = () => {
			sink.ctx = useFormContext<ModelUnknown>();
			const [suspend, setSuspend] = useState(false);
			control.suspend = setSuspend;
			return suspend ? <Suspend /> : null;
		};
		const { queryByTestId } = mountInSuspense(makeModel(), Page);
		await loaded(sink);

		act(() => sink.ctx!.setFieldValue("title", "Edited"));
		act(() => control.suspend!(true));
		expect(queryByTestId("fallback")).not.toBeNull();
		await resolve();

		expect(queryByTestId("fallback")).toBeNull();
		expect(sink.ctx!.getFieldValue("title")).toBe("Edited");
		expect(sink.ctx!.values.title).toBe("Edited");
		expect(sink.ctx!.dirty).toBe(true);
	});

	it("keeps the values a flow engine staged when the next stage suspends", async () => {
		const sink: Sink = {};
		const { Suspend, resolve } = makeSuspender();
		type Stage = "one" | "two";
		const stage: {
			goTo?: FlowStageProps<ModelUnknown, Stage, undefined>["goToStage"];
		} = {};
		const StageOne = (
			props: FlowStageProps<ModelUnknown, Stage, undefined>,
		) => {
			sink.ctx = useFormContext<ModelUnknown>();
			stage.goTo = props.goToStage;
			return <FormField name={"title"} />;
		};
		const StageTwo = () => {
			sink.ctx = useFormContext<ModelUnknown>();
			return <Suspend />;
		};
		const Page = (props: PageProps<ModelUnknown, undefined>) => (
			<FlowEngine<ModelUnknown, Stage, undefined>
				defaultStage={"one"}
				formProps={props}
			>
				{{ one: StageOne, two: StageTwo }}
			</FlowEngine>
		);
		const { queryByTestId } = mountInSuspense(makeModel(), Page, {
			flowEngine: true,
		});
		await loaded(sink);

		act(() => sink.ctx!.setFieldValue("title", "Edited"));
		await act(async () => {
			await stage.goTo!("two", false);
		});
		expect(queryByTestId("fallback")).not.toBeNull();
		await resolve();

		expect(queryByTestId("fallback")).toBeNull();
		expect(sink.ctx!.getFieldValue("title")).toBe("Edited");
	});

	it("keeps the values entered before Activity hid it", async () => {
		const sink: Sink = {};
		const Page = () => {
			sink.ctx = useFormContext<ModelUnknown>();
			return null;
		};
		const { hideAndShow } = mountInActivity(makeModel(), Page);
		await loaded(sink);

		act(() => sink.ctx!.setFieldValue("title", "Edited"));
		await hideAndShow();

		expect(sink.ctx!.getFieldValue("title")).toBe("Edited");
		expect(sink.ctx!.values.title).toBe("Edited");
	});

	it("keeps the values a flow engine staged on an earlier stage when Activity hid it", async () => {
		const sink: Sink = {};
		type Stage = "one" | "two";
		const stage: {
			goTo?: FlowStageProps<ModelUnknown, Stage, undefined>["goToStage"];
		} = {};
		const StageOne = (
			props: FlowStageProps<ModelUnknown, Stage, undefined>,
		) => {
			sink.ctx = useFormContext<ModelUnknown>();
			stage.goTo = props.goToStage;
			return <FormField name={"title"} />;
		};
		// title is only mounted on stage one, so on stage two only the staged values hold it
		const StageTwo = () => {
			sink.ctx = useFormContext<ModelUnknown>();
			return <FormField name={"note"} />;
		};
		const Page = (props: PageProps<ModelUnknown, undefined>) => (
			<FlowEngine<ModelUnknown, Stage, undefined>
				defaultStage={"one"}
				formProps={props}
			>
				{{ one: StageOne, two: StageTwo }}
			</FlowEngine>
		);
		const { hideAndShow } = mountInActivity(makeModel(), Page, {
			flowEngine: true,
		});
		await loaded(sink);

		act(() => sink.ctx!.setFieldValue("title", "Edited"));
		await act(async () => {
			await stage.goTo!("two", false);
		});
		await settle();
		await hideAndShow();

		expect(sink.ctx!.getFieldValue("title")).toBe("Edited");
	});

	it("still loads another record when the id changes", async () => {
		const sink: Sink = {};
		const Page = () => {
			sink.ctx = useFormContext<ModelUnknown>();
			return null;
		};
		const { rerenderWith } = mountInSuspense(makeModel(), Page);
		await loaded(sink);

		act(() => sink.ctx!.setFieldValue("note", "Edited"));
		rerenderWith({ id: "2" });
		await loaded(sink, "T2");

		expect(sink.ctx!.getFieldValue("note")).toBe("N2");
	});
});
