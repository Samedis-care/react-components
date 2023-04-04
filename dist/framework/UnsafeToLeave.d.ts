import React from "react";
export interface UnsafeToLeaveDispatchT {
    /**
     * Marks the current site unsafe to leave
     * @param reason A reason identifier, useful for debugging
     * @returns A callback to mark the site safe to leave again
     */
    lock: (reason?: string) => () => void;
}
export declare const UnsafeToLeaveDispatch: UnsafeToLeaveDispatchT;
export declare const useIsUnsafeToLeave: () => boolean;
declare const _default: React.MemoExoticComponent<(props: React.PropsWithChildren<{
    disable?: boolean | undefined;
}>) => React.ReactElement<any, string | React.JSXElementConstructor<any>>>;
export default _default;
