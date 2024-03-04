import type { To } from "history";
export interface NavigateOptions {
    replace?: boolean;
    state?: unknown;
}
export interface NavigateFunction {
    (to: To, options?: NavigateOptions): void;
}
/**
 * Navigate using History API
 */
declare const useNavigate: () => NavigateFunction;
export default useNavigate;
