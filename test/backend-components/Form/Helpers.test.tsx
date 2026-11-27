import { describe, expect, it, vi } from "vitest";
import React, { useState } from "react";
import { act, fireEvent, screen } from "@testing-library/react";
import { useFormContext } from "../../../src/backend-components/Form/Form";
import FormField from "../../../src/backend-components/Form/Field";
import useFormState from "../../../src/backend-components/Form/useFormState";
import { ModelUnknown } from "../../../src/backend-integration";
import {
	inputOf,
	loaded,
	makeModel,
	mountForm,
	settle,
	setupFormTests,
	Sink,
} from "./formFixture";

setupFormTests();

describe("useFormState", () => {
	/**
	 * A page that shows a useFormState value in a child it can unmount and remount
	 */
	const statefulPage = <S,>(name: string, initial: S | (() => S)) => {
		const control: {
			sink: Sink;
			setShown: (shown: boolean) => void;
			setValue: (value: S) => void;
		} = { sink: {}, setShown: () => {}, setValue: () => {} };
		const Stateful = () => {
			const [value, setValue] = useFormState<S>(name, initial);
			control.setValue = setValue;
			return <span data-testid={"state"}>{JSON.stringify(value)}</span>;
		};
		const Page = () => {
			control.sink.ctx = useFormContext<ModelUnknown>();
			const [shown, setShown] = useState(true);
			control.setShown = setShown;
			return shown ? <Stateful /> : null;
		};
		return { control, Page };
	};

	it("[ISSUE-3501-ITEM-29] keeps a stored null across a remount", async () => {
		const { control, Page } = statefulPage<string | null>("choice", "default");
		mountForm(makeModel(), Page);
		await loaded(control.sink);
		act(() => control.setValue(null));
		await settle();
		act(() => control.setShown(false));
		act(() => control.setShown(true));
		expect(screen.getByTestId("state").textContent).toBe("null");
	});

	it("[ISSUE-3501-ITEM-29] keeps a stored undefined across a remount, and says that something is stored", async () => {
		const { control, Page } = statefulPage<string | undefined>(
			"choice",
			"default",
		);
		mountForm(makeModel(), Page);
		await loaded(control.sink);
		expect(control.sink.ctx!.hasCustomState("choice")).toBe(true);
		expect(control.sink.ctx!.hasCustomState("never-set")).toBe(false);
		act(() => control.setValue(undefined));
		await settle();
		act(() => control.setShown(false));
		act(() => control.setShown(true));
		expect(screen.getByTestId("state").textContent).toBe("");
		expect(control.sink.ctx!.hasCustomState("choice")).toBe(true);
	});

	it("[ISSUE-3501-ITEM-29] a changed name brings the state stored under the new name, and the old name keeps its own", async () => {
		const sink: Sink = {};
		const control = {
			setName: (() => {}) as (name: string) => void,
			setValue: (() => {}) as (value: string) => void,
		};
		const setters = new Set<unknown>();
		const Named = (props: { name: string }) => {
			const [value, setValue] = useFormState(props.name, "initial");
			control.setValue = setValue;
			setters.add(setValue);
			return <span data-testid={"state"}>{value}</span>;
		};
		const Page = () => {
			sink.ctx = useFormContext<ModelUnknown>();
			const [name, setName] = useState("a");
			control.setName = setName;
			return <Named name={name} />;
		};
		mountForm(makeModel(), Page);
		await loaded(sink);
		act(() => sink.ctx!.setCustomState("b", () => "stored b"));
		act(() => control.setValue("changed a"));
		await settle();

		act(() => control.setName("b"));
		await settle();
		expect(screen.getByTestId("state").textContent).toBe("stored b");
		expect(sink.ctx!.getCustomState("a")).toBe("changed a");

		// nothing is stored under c: its initial state, and edits go to c only
		act(() => control.setName("c"));
		await settle();
		expect(screen.getByTestId("state").textContent).toBe("initial");
		act(() => control.setValue("changed c"));
		await settle();
		expect(sink.ctx!.getCustomState("c")).toBe("changed c");
		expect(sink.ctx!.getCustomState("b")).toBe("stored b");

		act(() => control.setName("a"));
		await settle();
		expect(screen.getByTestId("state").textContent).toBe("changed a");
		// one setter for the life of the component, like useState's
		expect(setters.size).toBe(1);
	});

	it("[ISSUE-3501-ITEM-56] a component that keeps state with it does not render again while the user types into another field", async () => {
		const sink: Sink = {};
		const onRender = vi.fn();
		const control = { setValue: (() => {}) as (value: string) => void };
		const Stateful = () => {
			const [value, setValue] = useFormState("kept", "initial");
			control.setValue = setValue;
			return <span data-testid={"state"}>{value}</span>;
		};
		// made once: a render of it while the user types can only come from a context it reads
		const stateful = <Stateful />;
		const Capture = () => {
			sink.ctx = useFormContext<ModelUnknown>();
			return null;
		};
		// reads nothing of the form, so the form does not render it again either
		const Page = () => (
			<>
				<Capture />
				<FormField name={"note"} />
				<React.Profiler id={"stateful"} onRender={onRender}>
					{stateful}
				</React.Profiler>
			</>
		);
		const { container } = mountForm(makeModel(), Page);
		await loaded(sink);
		const type = async (value: string) => {
			fireEvent.change(inputOf(container, "note"), { target: { value } });
			await settle();
		};
		// the first keystroke makes the form dirty, which the lite context carries
		await type("a");
		expect(sink.ctx!.dirty).toBe(true);
		onRender.mockClear();

		await type("ab");
		await type("abc");
		await type("abcd");
		expect(sink.ctx!.values.note).toBe("abcd");
		expect(onRender).not.toHaveBeenCalled();

		// the state still works and is still kept in the form
		act(() => control.setValue("changed"));
		await settle();
		expect(screen.getByTestId("state").textContent).toBe("changed");
		expect(sink.ctx!.getCustomState("kept")).toBe("changed");
	});
});
