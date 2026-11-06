/**
 * FormAutoSave: saves the form once the user stops changing values. Real timers with a
 * short debounce: react-query notifies through setTimeout(0), so fake timers stall the form.
 */
import { describe, expect, it, vi } from "vitest";
import React from "react";
import { act, waitFor } from "@testing-library/react";
import FormAutoSave from "../../../src/backend-components/Form/FormAutoSave";
import MockConnector from "../../../src/stories/test-utils/MockConnector";
import {
	capture,
	loaded,
	makeModel,
	mountForm,
	recordData,
	settle,
	setupFormTests,
	Sink,
	wait,
} from "./formFixture";

setupFormTests();

describe("FormAutoSave: bugs", () => {
	it("[ISSUE-3502-ITEM-3] a pending auto-save does not run after the form unmounts", async () => {
		const connector = new MockConnector(recordData());
		const update = vi.spyOn(connector, "update");
		const sink: Sink = {};
		const { unmount } = mountForm(
			makeModel({}, connector),
			capture(sink, () => <FormAutoSave debounceTime={50} />),
		);
		await loaded(sink);
		act(() => sink.ctx!.setFieldValue("title", "discard me"));
		await settle();
		// the user leaves and discards the change before the pause is over
		unmount();
		await wait(150);
		expect(update.mock.calls.map((call) => call[0].title)).toEqual([]);
	});

	it("[ISSUE-3502-ITEM-3] a pending auto-save waits for a new debounceTime instead of its old timer", async () => {
		const connector = new MockConnector(recordData());
		const update = vi.spyOn(connector, "update");
		const sink: Sink = {};
		const control: { setDebounceTime: (time: number) => void } = {
			setDebounceTime: () => {},
		};
		const AutoSave = () => {
			const [debounceTime, setDebounceTime] = React.useState(200);
			control.setDebounceTime = setDebounceTime;
			return <FormAutoSave debounceTime={debounceTime} />;
		};
		mountForm(
			makeModel({}, connector),
			capture(sink, () => <AutoSave />),
		);
		await loaded(sink);
		act(() => sink.ctx!.setFieldValue("title", "edited"));
		await settle();
		// a longer time: the save does not run when the old 200 ms are over
		act(() => control.setDebounceTime(2000));
		await wait(400);
		expect(update).not.toHaveBeenCalled();
		// a shorter time: the change is still saved, after the new time
		act(() => control.setDebounceTime(30));
		await waitFor(() => expect(update).toHaveBeenCalledTimes(1));
		expect(update.mock.calls[0][0].title).toBe("edited");
	});
});
