import type { ModelUnknown } from "../../backend-integration/Model/Model";
/**
 * The key of where a backend selector loads its selected records from: the react-query key
 * under which `modelFetch` caches them, and the selector's `refreshToken`. The selector loads
 * the shown records again when it changes.
 * @param modelFetch The model the selected records are loaded through
 * @param batch Whether those loads are batched (`!disableRequestBatching`)
 * @param refreshToken The selector's refresh token
 * @returns A string that changes with the model id or cache keys of `modelFetch`, with
 *          `batch` and with `refreshToken`, but not with a new instance of the same model
 *          (one rebuilt with `t` on a language switch, or on every render), which loads the
 *          same records from the same cache
 */
declare const getSelectedLoadKey: (modelFetch: ModelUnknown, batch: boolean, refreshToken: string | undefined) => string;
export default getSelectedLoadKey;
