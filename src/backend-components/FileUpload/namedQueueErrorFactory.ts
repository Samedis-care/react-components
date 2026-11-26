import type { QueueErrorFactory } from "../../backend-integration/Connector/LazyConnector";
import PartialApplyError, {
	PartialApplyFailure,
} from "../Form/PartialApplyError";
import describeWriteFailures from "./describeWriteFailures";

/**
 * The error factory CrudFileUpload and CrudMultiImage set on their LazyConnector: a write
 * of the queue the backend refuses (a Form's save) is named like a write through any
 * other connector, by the name of its file or image, in a PartialApplyError
 * @param entryOf The file or image the control lists for a record id, as the queue hands
 *                it out (the client-side id of a queued upload); undefined if none is
 *                listed
 * @param nameOf The name of a file or image, as the user knows it
 * @returns The factory, for LazyConnector.setQueueErrorFactory. If a refused write's file
 *          or image is not listed, it makes no error, and the queue rejects with the
 *          connector's own.
 */
const namedQueueErrorFactory =
	<EntryT>(
		entryOf: (id: string) => EntryT | undefined,
		nameOf: (entry: EntryT) => string,
	): QueueErrorFactory =>
	(refused) => {
		const failures: PartialApplyFailure<EntryT>[] = [];
		for (const failure of refused) {
			const entry = entryOf(failure.id);
			if (entry === undefined) return undefined;
			failures.push({ entry, action: failure.operation, error: failure.error });
		}
		return new PartialApplyError(
			describeWriteFailures(failures, nameOf),
			failures,
		);
	};

export default namedQueueErrorFactory;
