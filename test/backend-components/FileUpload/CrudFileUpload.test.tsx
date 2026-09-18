import { describe, it, expect, afterEach, beforeAll, vi } from "vitest";
import React from "react";
import {
	act,
	cleanup,
	fireEvent,
	render,
	waitFor,
} from "@testing-library/react";
import { Framework } from "../../../src/framework";
import CrudFileUpload, {
	BackendFileMeta,
	CrudFileUploadProps,
} from "../../../src/backend-components/FileUpload/CrudFileUpload";
import type { ErrorComponentProps } from "../../../src/backend-components/Form";
import LazyConnector from "../../../src/backend-integration/Connector/LazyConnector";
import MockConnector from "../../../src/stories/test-utils/MockConnector";
import type ApiConnector from "../../../src/backend-integration/Connector/ApiConnector";
import type { PageVisibility } from "../../../src/backend-integration";
import type {
	FileData,
	FileMeta,
	FileUploadDispatch,
} from "../../../src/standalone/FileUpload/Generic";

// jsdom does not implement matchMedia, which the Framework's ThemeProvider needs.
beforeAll(() => {
	if (!window.matchMedia) {
		window.matchMedia = (query: string) => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: () => {},
			removeListener: () => {},
			addEventListener: () => {},
			removeEventListener: () => {},
			dispatchEvent: () => false,
		});
	}
});

afterEach(cleanup);

const SERVER_FILES = [
	{
		id: "1",
		name: "document.pdf",
		type: "application/pdf",
		downloadLink: "#document",
	},
	{
		id: "2",
		name: "image.png",
		type: "image/png",
		downloadLink: "#image",
	},
];

const serialize = (
	data: FileData<File>,
	id: string | null,
): Record<string, unknown> => ({
	...(id ? { id } : {}),
	name: data.file.name,
	type: data.file.type,
	// what makes it an existing file to the standalone control, which only marks a file
	// for removal if it has one — a picked file it just drops
	downloadLink: `#${data.file.name}`,
});

const deserialize = (
	data: Record<string, unknown>,
): FileData<BackendFileMeta> => ({
	file: {
		name: data.name as string,
		type: data.type as string,
		downloadLink: data.downloadLink as string,
		id: data.id as string,
	},
	canBeUploaded: false,
	delete: false,
});

const pick = (name: string, type = "text/plain") =>
	new File(["content"], name, { type });

/**
 * What the control could not write, where a test can read it
 * @remarks DefaultErrorComponent pushes a dialog and renders nothing.
 */
const ErrorSink = (props: ErrorComponentProps) => (
	<span data-testid={"error"}>{props.error.message}</span>
);

/**
 * A backend which remembers what it was actually asked to do
 * @remarks The whole point of a LazyConnector is that a queued write has not happened
 *          yet, which the control's own state cannot show — only the backend can.
 */
class RecordingConnector extends MockConnector {
	public creates: Record<string, unknown>[] = [];
	public deletes: string[] = [];

	create(data: Record<string, unknown>) {
		this.creates.push(data);
		return super.create(data);
	}

	delete(id: string) {
		this.deletes.push(id);
		super.delete(id);
	}
}

/**
 * A backend which refuses the writes it is told to refuse
 * @remarks It records only what it did, so `creates` and `deletes` are what actually
 *          reached the server.
 */
class RejectingConnector extends RecordingConnector {
	public rejectCreates = new Set<string>();
	public rejectDeletes = new Set<string>();

	create(data: Record<string, unknown>) {
		const name = data.name as string;
		if (this.rejectCreates.has(name))
			throw new Error(`upload of ${name} refused`);
		return super.create(data);
	}

	delete(id: string) {
		if (this.rejectDeletes.has(id)) throw new Error(`delete of ${id} refused`);
		super.delete(id);
	}
}

/**
 * A backend whose uploads only finish when the test says so, to hold open the window in
 * which a picked file has been handed over but not yet heard back about
 */
class GatedConnector extends MockConnector {
	public creates = 0;
	private release: (() => void) | null = null;
	private readonly gate = new Promise<void>((resolve) => {
		this.release = resolve;
	});

	async create(data: Record<string, unknown>) {
		this.creates++;
		await this.gate;
		return super.create(data);
	}

	finish() {
		this.release?.();
	}
}

const lazyOver = (connector: MockConnector) =>
	// fakeReads false is what a form uses for an existing record: reads go to the
	// backend, writes are queued
	new LazyConnector<string, PageVisibility, unknown>(
		connector as unknown as ApiConnector<string, PageVisibility, unknown>,
		false,
	);

type Harness = ReturnType<typeof renderUpload>;

const renderUpload = (
	props: Partial<CrudFileUploadProps> & Pick<CrudFileUploadProps, "connector">,
) => {
	const ref = React.createRef<FileUploadDispatch>();
	const { container, unmount } = render(
		<Framework>
			<CrudFileUpload
				ref={ref}
				errorComponent={ErrorSink}
				serialize={serialize}
				deserialize={deserialize}
				previewSize={24}
				label={"Attachments"}
				{...props}
			/>
		</Framework>,
	);

	const labels = () =>
		// emotion folds the slot into one generated class ("css-hash-CcFile-label")
		Array.from(
			container.querySelectorAll<HTMLElement>('[class*="CcFile-label"]'),
		);
	const names = () => labels().map((label) => label.textContent ?? "");
	const labelOf = (name: string) => {
		const label = labels().find((label) => label.textContent === name);
		if (!label)
			throw new Error(`no file named ${name} in [${names().join(", ")}]`);
		return label;
	};
	/**
	 * The entry a file is rendered in: the widest ancestor that still holds only this
	 * one file, so that a lookup inside it cannot reach another file's buttons
	 */
	const rowOf = (name: string) => {
		let el: HTMLElement = labelOf(name);
		while (
			el.parentElement &&
			el.parentElement.querySelectorAll('[class*="CcFile-label"]').length === 1
		)
			el = el.parentElement;
		return el;
	};
	const iconOf = (name: string, testId: string) =>
		rowOf(name).querySelector(`[data-testid="${testId}"]`);
	const click = async (icon: Element | null, what: string) => {
		if (!icon) throw new Error(`no ${what} to click`);
		await act(async () => {
			fireEvent.click(icon);
			// let the change the click started reach the connector: the control applies
			// changes one after the other, so it takes a turn of the microtask queue
			await Promise.resolve();
		});
	};

	return {
		ref,
		container,
		unmount,
		names,
		/** What the file is shown as, relative to the server: added, removed or nothing */
		changeOf: (name: string) => labelOf(name).getAttribute("data-cc-change"),
		hasRestore: (name: string) => !!iconOf(name, "RestoreFromTrashIcon"),
		hasRemove: (name: string) => !!iconOf(name, "CancelOutlinedIcon"),
		remove: (name: string) =>
			click(iconOf(name, "CancelOutlinedIcon"), `remove button for ${name}`),
		restore: (name: string) =>
			click(iconOf(name, "RestoreFromTrashIcon"), `restore button for ${name}`),
		addFile: async (file: File) => {
			await act(async () => {
				await ref.current?.addFile(file);
			});
		},
		/** What the control reports it could not write, if anything */
		errorText: () =>
			container.querySelector('[data-testid="error"]')?.textContent ?? null,
		/** The dot the label carries while the field is marked as modified */
		dirtyMarker: () =>
			!!container.querySelector('[class*="CcDirtyMarker-root"]'),
	};
};

const loaded = async (ui: Harness) => {
	await waitFor(() => expect(ui.names()).toContain("document.pdf"));
};

describe("CrudFileUpload", () => {
	describe("without a LazyConnector", () => {
		it("lists what the connector has, with nothing marked", async () => {
			const connector = new RecordingConnector(SERVER_FILES);
			const ui = renderUpload({ connector });
			await loaded(ui);

			expect(ui.names()).toEqual(["document.pdf", "image.png"]);
			expect(ui.changeOf("document.pdf")).toBe(null);
			expect(ui.hasRestore("document.pdf")).toBe(false);
		});

		it("uploads a picked file right away and lists it unmarked", async () => {
			const connector = new RecordingConnector(SERVER_FILES);
			const ui = renderUpload({ connector });
			await loaded(ui);

			await ui.addFile(pick("notes.txt"));

			await waitFor(() => expect(ui.names()).toContain("notes.txt"));
			// the two it started with, plus the picked one, each listed once
			expect(ui.names()).toEqual(["document.pdf", "image.png", "notes.txt"]);
			// it is on the server, so there is no pending change to show
			expect(connector.creates).toHaveLength(1);
			expect(ui.changeOf("notes.txt")).toBe(null);
		});

		it("deletes a removed file right away and drops it from the list", async () => {
			const connector = new RecordingConnector(SERVER_FILES);
			const ui = renderUpload({ connector });
			await loaded(ui);

			await ui.remove("document.pdf");

			await waitFor(() => expect(ui.names()).toEqual(["image.png"]));
			// nothing to undo: the file is gone from the server
			expect(connector.deletes).toEqual(["1"]);
		});

		it("shows no marker for showDirtyState, since nothing is ever pending", async () => {
			const connector = new RecordingConnector(SERVER_FILES);
			const onDirtyChange = vi.fn();
			const ui = renderUpload({
				connector,
				showDirtyState: true,
				onDirtyChange,
			});
			await loaded(ui);

			await ui.addFile(pick("notes.txt"));
			await waitFor(() => expect(ui.names()).toContain("notes.txt"));
			await ui.remove("document.pdf");
			await waitFor(() => expect(ui.names()).not.toContain("document.pdf"));

			expect(ui.dirtyMarker()).toBe(false);
			expect(onDirtyChange.mock.calls.flat()).not.toContain(true);
		});

		it("shows the marker when the application sets dirty itself", async () => {
			const connector = new RecordingConnector(SERVER_FILES);
			const ui = renderUpload({ connector, dirty: true });
			await loaded(ui);

			expect(ui.dirtyMarker()).toBe(true);
		});
	});

	describe("with a LazyConnector", () => {
		it("queues a picked file and marks it as added", async () => {
			const backend = new RecordingConnector(SERVER_FILES);
			const lazy = lazyOver(backend);
			const onDirtyChange = vi.fn();
			const ui = renderUpload({ connector: lazy, onDirtyChange });
			await loaded(ui);

			await ui.addFile(pick("notes.txt"));

			await waitFor(() => expect(ui.changeOf("notes.txt")).toBe("added"));
			// the two it started with, plus the picked one, each listed once
			expect(ui.names()).toEqual(["document.pdf", "image.png", "notes.txt"]);
			// queued, not sent
			expect(backend.creates).toHaveLength(0);
			expect(lazy.isQueueEmpty()).toBe(false);
			await waitFor(() => expect(onDirtyChange).toHaveBeenLastCalledWith(true));
		});

		it("removing a queued upload cancels it and takes it off the list", async () => {
			const backend = new RecordingConnector(SERVER_FILES);
			const lazy = lazyOver(backend);
			const onDirtyChange = vi.fn();
			const ui = renderUpload({ connector: lazy, onDirtyChange });
			await loaded(ui);
			await ui.addFile(pick("notes.txt"));
			await waitFor(() => expect(ui.changeOf("notes.txt")).toBe("added"));

			await ui.remove("notes.txt");

			// nothing on the server to restore it from, so it leaves rather than being
			// shown as removed
			await waitFor(() => expect(ui.names()).not.toContain("notes.txt"));
			expect(lazy.isQueueEmpty()).toBe(true);
			expect(backend.creates).toHaveLength(0);
			expect(backend.deletes).toHaveLength(0);
			await waitFor(() =>
				expect(onDirtyChange).toHaveBeenLastCalledWith(false),
			);
		});

		it("queues a removal, keeps the file listed and offers a restore", async () => {
			const backend = new RecordingConnector(SERVER_FILES);
			const lazy = lazyOver(backend);
			const ui = renderUpload({ connector: lazy });
			await loaded(ui);

			await ui.remove("document.pdf");

			await waitFor(() => expect(ui.changeOf("document.pdf")).toBe("removed"));
			expect(ui.hasRestore("document.pdf")).toBe(true);
			expect(backend.deletes).toHaveLength(0);
			expect(lazy.getQueuedOperation("1")).toBe("delete");
		});

		it("restoring drops the queued delete", async () => {
			const backend = new RecordingConnector(SERVER_FILES);
			const lazy = lazyOver(backend);
			const onDirtyChange = vi.fn();
			const ui = renderUpload({ connector: lazy, onDirtyChange });
			await loaded(ui);
			await ui.remove("document.pdf");
			await waitFor(() => expect(ui.changeOf("document.pdf")).toBe("removed"));

			await ui.restore("document.pdf");

			await waitFor(() => expect(ui.changeOf("document.pdf")).toBe(null));
			expect(ui.hasRestore("document.pdf")).toBe(false);
			expect(lazy.isQueueEmpty()).toBe(true);
			expect(lazy.getQueuedOperation("1")).toBe(null);
			await waitFor(() =>
				expect(onDirtyChange).toHaveBeenLastCalledWith(false),
			);
		});

		it("keeps the other removal when one of two is restored", async () => {
			const backend = new RecordingConnector(SERVER_FILES);
			const lazy = lazyOver(backend);
			const ui = renderUpload({ connector: lazy });
			await loaded(ui);

			await ui.remove("document.pdf");
			await waitFor(() => expect(ui.changeOf("document.pdf")).toBe("removed"));
			await ui.remove("image.png");
			await waitFor(() => expect(ui.changeOf("image.png")).toBe("removed"));

			await ui.restore("document.pdf");

			await waitFor(() => expect(ui.changeOf("document.pdf")).toBe(null));
			expect(ui.changeOf("image.png")).toBe("removed");
			expect(lazy.getQueuedOperation("1")).toBe(null);
			expect(lazy.getQueuedOperation("2")).toBe("delete");
		});

		it("takes an upload and a removal at the same time", async () => {
			const backend = new RecordingConnector(SERVER_FILES);
			const lazy = lazyOver(backend);
			const ui = renderUpload({ connector: lazy });
			await loaded(ui);

			await ui.addFile(pick("notes.txt"));
			await waitFor(() => expect(ui.changeOf("notes.txt")).toBe("added"));
			await ui.remove("document.pdf");

			await waitFor(() => expect(ui.changeOf("document.pdf")).toBe("removed"));
			// the queued upload keeps its own mark, and nothing has left the list: the
			// removal is pending, not done
			expect(ui.changeOf("notes.txt")).toBe("added");
			expect(ui.names()).toHaveLength(3);
			expect(ui.names().filter((name) => name === "notes.txt")).toHaveLength(1);
		});

		describe("dirty state", () => {
			it("marks the field while changes are queued, when asked to", async () => {
				const backend = new RecordingConnector(SERVER_FILES);
				const ui = renderUpload({
					connector: lazyOver(backend),
					showDirtyState: true,
				});
				await loaded(ui);
				expect(ui.dirtyMarker()).toBe(false);

				await ui.remove("document.pdf");
				await waitFor(() => expect(ui.dirtyMarker()).toBe(true));

				await ui.restore("document.pdf");
				await waitFor(() => expect(ui.dirtyMarker()).toBe(false));
			});

			it("reports pending changes even when they are not shown", async () => {
				const backend = new RecordingConnector(SERVER_FILES);
				const onDirtyChange = vi.fn();
				const ui = renderUpload({
					connector: lazyOver(backend),
					onDirtyChange,
				});
				await loaded(ui);
				expect(onDirtyChange).toHaveBeenLastCalledWith(false);

				await ui.remove("document.pdf");

				await waitFor(() =>
					expect(onDirtyChange).toHaveBeenLastCalledWith(true),
				);
				// state, not display: the field itself stays unmarked...
				expect(ui.dirtyMarker()).toBe(false);
				// ...while the file still shows what is pending for it, which is the only
				// way to offer the restore
				expect(ui.changeOf("document.pdf")).toBe("removed");
			});

			it("lets an explicit dirty prop win over the queue", async () => {
				const backend = new RecordingConnector(SERVER_FILES);
				const ui = renderUpload({
					connector: lazyOver(backend),
					showDirtyState: true,
					dirty: false,
				});
				await loaded(ui);

				await ui.remove("document.pdf");

				await waitFor(() =>
					expect(ui.changeOf("document.pdf")).toBe("removed"),
				);
				expect(ui.dirtyMarker()).toBe(false);
			});
		});

		it("reads its pending marks back off the connector after a remount", async () => {
			const backend = new RecordingConnector(SERVER_FILES);
			const lazy = lazyOver(backend);
			const first = renderUpload({ connector: lazy });
			await loaded(first);
			await first.addFile(pick("notes.txt"));
			await waitFor(() => expect(first.changeOf("notes.txt")).toBe("added"));
			await first.remove("document.pdf");
			await waitFor(() =>
				expect(first.changeOf("document.pdf")).toBe("removed"),
			);

			first.unmount();
			const second = renderUpload({ connector: lazy });
			await loaded(second);

			// the queue outlives the control, so the marks do too — and so does the
			// file count: one existing, one queued upload, one queued removal
			expect(second.names()).toHaveLength(3);
			expect(second.changeOf("document.pdf")).toBe("removed");
			expect(second.hasRestore("document.pdf")).toBe(true);
			expect(second.changeOf("notes.txt")).toBe("added");
			expect(
				second.names().filter((name) => name === "notes.txt"),
			).toHaveLength(1);
			expect(
				second.names().filter((name) => name === "document.pdf"),
			).toHaveLength(1);
		});

		it("restores after a remount, against the connector rather than the copy it lost", async () => {
			const backend = new RecordingConnector(SERVER_FILES);
			const lazy = lazyOver(backend);
			const first = renderUpload({ connector: lazy });
			await loaded(first);
			await first.remove("document.pdf");
			await waitFor(() =>
				expect(first.changeOf("document.pdf")).toBe("removed"),
			);

			first.unmount();
			const second = renderUpload({ connector: lazy });
			await loaded(second);
			await second.restore("document.pdf");

			await waitFor(() => expect(second.changeOf("document.pdf")).toBe(null));
			expect(lazy.isQueueEmpty()).toBe(true);
		});

		it("clears the marks and drops removed files once the queue is worked", async () => {
			const backend = new RecordingConnector(SERVER_FILES);
			const lazy = lazyOver(backend);
			const onDirtyChange = vi.fn();
			const ui = renderUpload({
				connector: lazy,
				showDirtyState: true,
				onDirtyChange,
			});
			await loaded(ui);
			await ui.addFile(pick("notes.txt"));
			await waitFor(() => expect(ui.changeOf("notes.txt")).toBe("added"));
			await ui.remove("document.pdf");
			await waitFor(() => expect(ui.changeOf("document.pdf")).toBe("removed"));

			await act(async () => {
				await lazy.workQueue();
			});

			// what was pending has happened: the upload is a file like any other, and the
			// removed one is gone from the server, so it goes from the list as well
			await waitFor(() => expect(ui.changeOf("notes.txt")).toBe(null));
			expect(ui.names()).not.toContain("document.pdf");
			expect(ui.dirtyMarker()).toBe(false);
			expect(backend.creates).toHaveLength(1);
			expect(backend.deletes).toEqual(["1"]);
			await waitFor(() =>
				expect(onDirtyChange).toHaveBeenLastCalledWith(false),
			);
		});

		it("does not send a delete twice when more files are removed after a submit", async () => {
			const backend = new RecordingConnector(SERVER_FILES);
			const lazy = lazyOver(backend);
			const ui = renderUpload({ connector: lazy });
			await loaded(ui);

			await ui.remove("document.pdf");
			await waitFor(() => expect(ui.changeOf("document.pdf")).toBe("removed"));
			await act(async () => {
				await lazy.workQueue();
			});
			await waitFor(() => expect(ui.names()).toEqual(["image.png"]));

			await ui.remove("image.png");
			await waitFor(() => expect(ui.changeOf("image.png")).toBe("removed"));
			await act(async () => {
				await lazy.workQueue();
			});

			// the first file left the list when it was written, so the second removal
			// cannot hand its id back and delete it against a backend that has forgotten it
			await waitFor(() => expect(ui.names()).toEqual([]));
			expect(backend.deletes).toEqual(["1", "2"]);
		});

		it("survives a remount after the submit without bringing the file back", async () => {
			const backend = new RecordingConnector(SERVER_FILES);
			const lazy = lazyOver(backend);
			const first = renderUpload({ connector: lazy });
			await loaded(first);
			await first.remove("document.pdf");
			await waitFor(() =>
				expect(first.changeOf("document.pdf")).toBe("removed"),
			);
			await act(async () => {
				await lazy.workQueue();
			});

			first.unmount();
			const second = renderUpload({ connector: lazy });

			await waitFor(() => expect(second.names()).toEqual(["image.png"]));
			expect(lazy.getQueuedDeleteRecords()).toEqual([]);
		});
	});

	it("uploads a picked file once when another is removed while it is in flight", async () => {
		const connector = new GatedConnector(SERVER_FILES);
		const ui = renderUpload({ connector });
		await loaded(ui);

		// the upload starts and hangs
		let uploading: Promise<void> | undefined;
		await act(async () => {
			// deliberately not awaited: the upload is meant to still be in flight
			uploading = ui.ref.current?.addFile(pick("race.txt"));
			await Promise.resolve();
		});
		await waitFor(() => expect(ui.names()).toContain("race.txt"));

		// removing another file in the meantime hands the picked file back untouched
		await ui.remove("document.pdf");

		await act(async () => {
			connector.finish();
			await uploading;
		});

		await waitFor(() => expect(ui.names()).not.toContain("document.pdf"));
		// one upload, one row: the list cannot show a second copy on the server, so the
		// count has to come from the backend
		expect(ui.names().filter((name) => name === "race.txt")).toHaveLength(1);
		expect(connector.creates).toBe(1);
	});

	describe("when the server refuses a write", () => {
		const namesCreated = (backend: RejectingConnector) =>
			backend.creates.map((data) => data.name as string);

		it("reports a refused upload and drops the file", async () => {
			const connector = new RejectingConnector(SERVER_FILES);
			connector.rejectCreates.add("bad.txt");
			const ui = renderUpload({ connector });
			await loaded(ui);

			await ui.addFile(pick("bad.txt"));

			await waitFor(() => expect(ui.errorText()).toContain("refused"));
			// the list is what the server has: a file it would not take is not in it,
			// and a file left in it would be uploaded again by the next change
			expect(namesCreated(connector)).toEqual([]);
			await waitFor(() =>
				expect(ui.names()).toEqual(["document.pdf", "image.png"]),
			);
		});

		it("does not upload a file twice when another upload in the same change is refused", async () => {
			const connector = new RejectingConnector(SERVER_FILES);
			connector.rejectCreates.add("bad.txt");
			const ui = renderUpload({ connector });
			await loaded(ui);

			// the refused file is still in the list the control is handed back, so the
			// next pick is sent together with it — and goes through although it does not
			await ui.addFile(pick("bad.txt"));
			await waitFor(() => expect(ui.errorText()).toContain("refused"));
			await ui.addFile(pick("good.txt"));
			await waitFor(() =>
				expect(namesCreated(connector)).toContain("good.txt"),
			);

			await ui.addFile(pick("third.txt"));

			// a file the server already has must not be sent again because something
			// else in the same change was refused
			await waitFor(() =>
				expect(namesCreated(connector)).toContain("third.txt"),
			);
			expect(
				namesCreated(connector).filter((name) => name === "good.txt"),
			).toHaveLength(1);
			expect(ui.names()).toEqual([
				"document.pdf",
				"image.png",
				"good.txt",
				"third.txt",
			]);
		});

		it("keeps a file the server refused to delete, listed once", async () => {
			const connector = new RejectingConnector(SERVER_FILES);
			connector.rejectDeletes.add("1");
			const ui = renderUpload({ connector });
			await loaded(ui);

			await ui.remove("document.pdf");

			await waitFor(() => expect(ui.errorText()).toContain("refused"));
			// it is still on the server, so it is still in the list — once
			expect(connector.deletes).toEqual([]);
			expect(ui.names()).toEqual(["document.pdf", "image.png"]);
		});

		it("does not upload a file twice when the delete alongside it is refused", async () => {
			const connector = new RejectingConnector(SERVER_FILES);
			connector.rejectDeletes.add("1");
			const ui = renderUpload({ connector });
			await loaded(ui);
			await ui.remove("document.pdf");
			await waitFor(() => expect(ui.errorText()).toContain("refused"));

			// the file is still marked for deletion, so this change carries the retry of
			// that delete as well as the upload
			await ui.addFile(pick("notes.txt"));
			await waitFor(() =>
				expect(namesCreated(connector)).toContain("notes.txt"),
			);

			await ui.addFile(pick("second.txt"));

			await waitFor(() =>
				expect(namesCreated(connector)).toContain("second.txt"),
			);
			expect(
				namesCreated(connector).filter((name) => name === "notes.txt"),
			).toHaveLength(1);
			expect(ui.names().filter((name) => name === "notes.txt")).toHaveLength(1);
		});

		it("does not create a file twice when a later write in the same submit is refused", async () => {
			const backend = new RejectingConnector(SERVER_FILES);
			backend.rejectCreates.add("bad.txt");
			const lazy = lazyOver(backend);
			const ui = renderUpload({ connector: lazy, showDirtyState: true });
			await loaded(ui);
			await ui.addFile(pick("good.txt"));
			await waitFor(() => expect(ui.changeOf("good.txt")).toBe("added"));
			await ui.addFile(pick("bad.txt"));
			await waitFor(() => expect(ui.changeOf("bad.txt")).toBe("added"));

			// the submit stops at the write the server refuses
			await act(async () => {
				await expect(lazy.workQueue()).rejects.toThrow("refused");
			});
			expect(namesCreated(backend)).toEqual(["good.txt"]);
			// what is left is still pending, and still marked as such
			expect(lazy.isQueueEmpty()).toBe(false);
			expect(ui.changeOf("bad.txt")).toBe("added");
			expect(ui.dirtyMarker()).toBe(true);

			// submitting again sends what is left, not what already went through
			backend.rejectCreates.clear();
			await act(async () => {
				await lazy.workQueue();
			});

			expect(namesCreated(backend)).toEqual(["good.txt", "bad.txt"]);
			await waitFor(() => expect(ui.changeOf("good.txt")).toBe(null));
			expect(ui.names()).toEqual([
				"document.pdf",
				"image.png",
				"good.txt",
				"bad.txt",
			]);
		});

		it("lets the user correct a refused upload and submit again", async () => {
			const backend = new RejectingConnector(SERVER_FILES);
			backend.rejectCreates.add("bad.txt");
			const lazy = lazyOver(backend);
			const ui = renderUpload({ connector: lazy, showDirtyState: true });
			await loaded(ui);
			await ui.addFile(pick("good.txt"));
			await waitFor(() => expect(ui.changeOf("good.txt")).toBe("added"));
			await ui.addFile(pick("bad.txt"));
			await waitFor(() => expect(ui.changeOf("bad.txt")).toBe("added"));

			await act(async () => {
				await expect(lazy.workQueue()).rejects.toThrow("refused");
			});

			// the submit stopped where it failed, and the control still shows what is
			// left for the user to put right
			expect(ui.changeOf("bad.txt")).toBe("added");
			expect(ui.dirtyMarker()).toBe(true);

			// which they do by dropping the file the server would not take
			await ui.remove("bad.txt");

			// nothing is pending any more: what went through is on the server and is
			// shown as an ordinary file, and the rest was never sent
			await waitFor(() => expect(ui.names()).not.toContain("bad.txt"));
			expect(lazy.isQueueEmpty()).toBe(true);
			await waitFor(() => expect(ui.changeOf("good.txt")).toBe(null));
			expect(ui.dirtyMarker()).toBe(false);

			// so submitting again sends nothing at all
			const sentSoFar = namesCreated(backend);
			await act(async () => {
				await lazy.workQueue();
			});

			expect(namesCreated(backend)).toEqual(sentSoFar);
			expect(ui.names()).toEqual(["document.pdf", "image.png", "good.txt"]);
		});

		it("carries on with the submit when a delete is refused", async () => {
			const backend = new RejectingConnector(SERVER_FILES);
			backend.rejectDeletes.add("1");
			const lazy = lazyOver(backend);
			const ui = renderUpload({ connector: lazy });
			await loaded(ui);
			await ui.remove("document.pdf");
			await waitFor(() => expect(ui.changeOf("document.pdf")).toBe("removed"));
			await ui.addFile(pick("notes.txt"));
			await waitFor(() => expect(ui.changeOf("notes.txt")).toBe("added"));

			await act(async () => {
				await lazy.workQueue();
			});

			// a refused delete is not retried — the form is done with that record — and
			// does not stop the upload queued behind it, which happens once
			expect(namesCreated(backend)).toEqual(["notes.txt"]);
			expect(lazy.isQueueEmpty()).toBe(true);
			await waitFor(() =>
				expect(ui.names()).toEqual(["image.png", "notes.txt"]),
			);
		});
	});

	describe("additional files", () => {
		// an extra built by hand, which is all FileData<FileMeta> promises
		const PLAIN_EXTRA: FileData<FileMeta>[] = [
			{
				file: {
					name: "terms.txt",
					type: "text/plain",
					downloadLink: "#terms",
				},
				canBeUploaded: false,
				delete: false,
			},
		];
		// ...and one loaded from another model's backend and put through the same
		// deserializer, so it carries an id and is shaped exactly like one of ours.
		// FileData<BackendFileMeta> is assignable to FileData<FileMeta>, so nothing
		// warns about it.
		const BACKEND_EXTRA: FileData<BackendFileMeta>[] = [
			{
				file: {
					name: "manual.pdf",
					type: "application/pdf",
					downloadLink: "#manual",
					id: "99",
				},
				canBeUploaded: false,
				delete: false,
			},
		];

		it("leaves them alone when a real file changes", async () => {
			const backend = new RecordingConnector(SERVER_FILES);
			const ui = renderUpload({
				connector: lazyOver(backend),
				additionalFiles: PLAIN_EXTRA,
			});
			await loaded(ui);
			expect(ui.names()).toContain("terms.txt");

			await ui.remove("document.pdf");

			// they belong to whoever passed them, so a change to the real files neither
			// drops nor duplicates them
			await waitFor(() => expect(ui.changeOf("document.pdf")).toBe("removed"));
			expect(ui.names().filter((name) => name === "terms.txt")).toHaveLength(1);
		});

		it("keeps one that carries an id out of its own files", async () => {
			const backend = new RecordingConnector(SERVER_FILES);
			const ui = renderUpload({
				connector: lazyOver(backend),
				additionalFiles: BACKEND_EXTRA,
			});
			await loaded(ui);
			expect(ui.names()).toEqual(["document.pdf", "image.png", "manual.pdf"]);

			await ui.addFile(pick("notes.txt"));

			// the control is handed back its own list with the extras in it, and has to
			// hand them back out again: an extra taken into state is listed twice, once
			// from each
			await waitFor(() => expect(ui.names()).toContain("notes.txt"));
			expect(ui.names()).toEqual([
				"document.pdf",
				"image.png",
				"notes.txt",
				"manual.pdf",
			]);

			// ...and every further change folds the list into itself again
			await ui.addFile(pick("second.txt"));
			await waitFor(() => expect(ui.names()).toContain("second.txt"));
			expect(ui.names()).toHaveLength(5);
			expect(ui.names().filter((name) => name === "manual.pdf")).toHaveLength(
				1,
			);
		});

		it("offers no remove button for them", async () => {
			const backend = new RecordingConnector(SERVER_FILES);
			const ui = renderUpload({
				connector: lazyOver(backend),
				additionalFiles: BACKEND_EXTRA,
			});
			await loaded(ui);

			// read-only, and not this control's records: removing one would send a
			// delete for id 99 against a backend where 99 is something else entirely
			expect(ui.hasRemove("manual.pdf")).toBe(false);
			expect(ui.hasRemove("document.pdf")).toBe(true);
		});
	});
});
