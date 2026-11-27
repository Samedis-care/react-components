/**
 * FormAutoSave: saves the form once the user stops changing values. Real timers with a
 * short debounce: react-query notifies through setTimeout(0), so fake timers stall the form.
 */
import { describe, expect, it, vi } from "vitest";
import React from "react";
import { act, screen, waitFor } from "@testing-library/react";
import FormAutoSave from "../../../src/backend-components/Form/FormAutoSave";
import MockConnector from "../../../src/stories/test-utils/MockConnector";
import {
	capture,
	loaded,
	makeModel,
	mountForm,
	mountNested,
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

	it("[ISSUE-3502-ITEM-14] a change made while the form is busy is auto-saved once it is idle again", async () => {
		const connector = new MockConnector(recordData());
		const update = vi.spyOn(connector, "update");
		const sink: Sink = {};
		mountForm(
			makeModel({}, connector),
			capture(sink, () => <FormAutoSave debounceTime={0} />),
		);
		await loaded(sink);
		act(() => sink.ctx!.addBusyReason("upload"));
		await settle();
		act(() => sink.ctx!.setFieldValue("title", "while busy"));
		await settle();
		act(() => sink.ctx!.removeBusyReason("upload"));
		await wait(50);
		await settle();
		expect({
			saves: update.mock.calls.map((call) => call[0].title),
			dirty: sink.ctx!.dirty,
		}).toEqual({ saves: ["while busy"], dirty: false });
	});

	it("[ISSUE-3502-ITEM-14] a form dirty only through a custom field is auto-saved", async () => {
		const connector = new MockConnector(recordData());
		const update = vi.spyOn(connector, "update");
		const sink: Sink = {};
		mountForm(
			makeModel({}, connector),
			capture(sink, () => <FormAutoSave debounceTime={0} />),
		);
		await loaded(sink);
		// a control with changes of its own, saved with the form (as a queued upload)
		const saveQueue = vi.fn(() =>
			sink.ctx!.setCustomFieldDirty("queue", false),
		);
		sink.ctx!.setPreSubmitHandler("queue", saveQueue);
		act(() => sink.ctx!.setCustomFieldDirty("queue", true));
		await wait(50);
		await settle();
		expect({
			queueSaves: saveQueue.mock.calls.length,
			recordSaves: update.mock.calls.length,
			dirty: sink.ctx!.dirty,
		}).toEqual({ queueSaves: 1, recordSaves: 1, dirty: false });
	});

	it("[ISSUE-3502-ITEM-14] a save that comes due while the form is busy waits until it is idle", async () => {
		const connector = new MockConnector(recordData());
		const update = vi.spyOn(connector, "update");
		const sink: Sink = {};
		mountForm(
			makeModel({}, connector),
			capture(sink, () => <FormAutoSave debounceTime={40} />),
		);
		await loaded(sink);
		act(() => sink.ctx!.setFieldValue("title", "edited"));
		await settle();
		act(() => sink.ctx!.addBusyReason("upload"));
		await wait(120);
		expect(update).not.toHaveBeenCalled();
		act(() => sink.ctx!.removeBusyReason("upload"));
		await waitFor(() => expect(update).toHaveBeenCalledTimes(1));
		expect(update.mock.calls[0][0].title).toBe("edited");
	});

	it("[ISSUE-3502-ITEM-14] a failed auto-save is not started again for the same values, the next change is saved", async () => {
		const connector = new MockConnector(recordData());
		const update = vi
			.spyOn(connector, "update")
			.mockRejectedValueOnce(new Error("offline"));
		const sink: Sink = {};
		mountForm(
			makeModel({}, connector),
			capture(sink, () => <FormAutoSave debounceTime={0} />),
		);
		await loaded(sink);
		act(() => sink.ctx!.setFieldValue("title", "first"));
		await wait(80);
		await settle();
		// the form is idle and still dirty: no second try for the same values
		expect({
			saves: update.mock.calls.map((call) => call[0].title),
			dirty: sink.ctx!.dirty,
		}).toEqual({ saves: ["first"], dirty: true });
		act(() => sink.ctx!.setFieldValue("title", "second"));
		await waitFor(() => expect(update).toHaveBeenCalledTimes(2));
		expect(update.mock.calls[1][0].title).toBe("second");
	});

	it("[ISSUE-3502-ITEM-19] the outcome of an auto-save is announced in a status region", async () => {
		const connector = new MockConnector(recordData());
		const update = vi.spyOn(connector, "update");
		const sink: Sink = {};
		mountForm(
			makeModel({}, connector),
			capture(sink, () => <FormAutoSave debounceTime={0} />),
		);
		await loaded(sink);
		act(() => sink.ctx!.setFieldValue("title", "x"));
		await waitFor(() => expect(update).toHaveBeenCalledTimes(1));
		await settle();
		expect(screen.queryByRole("status")?.textContent ?? "").not.toBe("");
	});

	it("[ISSUE-3502-ITEM-19] the status region says Saving… while the save runs and Saved once it is done, as the same element", async () => {
		const connector = new MockConnector(recordData());
		const original = connector.update.bind(connector);
		let release = () => {};
		// held until the test releases it
		vi.spyOn(connector, "update").mockImplementation(
			(data) =>
				new Promise((resolve) => {
					release = () => resolve(original(data));
				}) as never,
		);
		const sink: Sink = {};
		mountForm(
			makeModel({}, connector),
			capture(sink, () => <FormAutoSave debounceTime={0} />),
		);
		await loaded(sink);
		const status = screen.getByRole("status");
		expect(status.textContent).toBe("");
		act(() => sink.ctx!.setFieldValue("title", "x"));
		await waitFor(() => expect(status.textContent).toBe("Saving…"));
		// the form around it is busy while it saves, the region is not: a screen reader holds
		// back the messages of a busy area
		expect(status.closest("form")).toHaveAttribute("aria-busy", "true");
		expect(status).toHaveAttribute("aria-busy", "false");
		await act(async () => {
			release();
			await Promise.resolve();
		});
		await waitFor(() => expect(status.textContent).toBe("Saved"));
		expect(screen.getByRole("status")).toBe(status);
	});

	it("[ISSUE-3502-ITEM-19] a failed auto-save of a nested form says Could not save until the form has no changes left", async () => {
		const connector = new MockConnector(recordData());
		const update = vi
			.spyOn(connector, "update")
			.mockRejectedValueOnce(new Error("offline"));
		const { child } = mountNested(
			makeModel({}, connector),
			makeModel(),
			{},
			() => <FormAutoSave debounceTime={0} />,
		);
		await loaded(child, "T2");
		act(() => child.ctx!.setFieldValue("title", "x"));
		await waitFor(() => expect(update).toHaveBeenCalledTimes(1));
		await settle();
		const status = screen.getByRole("status");
		expect(status.textContent).toBe("Could not save");
		// the user discards the changes: nothing is left unsaved, nothing is wrong any more
		act(() => child.ctx!.resetForm());
		await settle();
		expect({ dirty: child.ctx!.dirty, status: status.textContent }).toEqual({
			dirty: false,
			status: "",
		});
	});

	it("[ISSUE-3502-ITEM-19] Saved is emptied once the form has changes again", async () => {
		const connector = new MockConnector(recordData());
		const update = vi.spyOn(connector, "update");
		const sink: Sink = {};
		mountForm(
			makeModel({}, connector),
			capture(sink, () => <FormAutoSave debounceTime={40} />),
		);
		await loaded(sink);
		act(() => sink.ctx!.setFieldValue("title", "x"));
		const status = screen.getByRole("status");
		await waitFor(() => expect(status.textContent).toBe("Saved"));
		act(() => sink.ctx!.setFieldValue("title", "y"));
		await settle();
		// not saved yet: the pause is not over
		expect({
			saves: update.mock.calls.length,
			status: status.textContent,
		}).toEqual({
			saves: 1,
			status: "",
		});
		await waitFor(() => expect(update).toHaveBeenCalledTimes(2));
		await waitFor(() => expect(status.textContent).toBe("Saved"));
	});

	it("[ISSUE-3502-ITEM-19] a save the form's preSubmit cancels tells nothing", async () => {
		const connector = new MockConnector(recordData());
		const update = vi.spyOn(connector, "update");
		const preSubmit = vi.fn(() => true);
		const sink: Sink = {};
		mountForm(
			makeModel({}, connector),
			capture(sink, () => <FormAutoSave debounceTime={0} />),
			{ preSubmit },
		);
		await loaded(sink);
		act(() => sink.ctx!.setFieldValue("title", "x"));
		await waitFor(() => expect(preSubmit).toHaveBeenCalledTimes(1));
		await settle();
		expect({
			saves: update.mock.calls.length,
			dirty: sink.ctx!.dirty,
			status: screen.getByRole("status").textContent,
		}).toEqual({ saves: 0, dirty: true, status: "" });
	});
});
