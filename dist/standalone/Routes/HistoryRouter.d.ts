import React from "react";
import { History } from "history";
export interface HistoryRouterProps {
    history: History;
    children: React.ReactNode;
}
export interface HistoryRouterContextType {
    history: History;
}
export declare const HistoryRouterContext: React.Context<HistoryRouterContextType | null>;
export declare const useHistoryRouterContext: () => HistoryRouterContextType;
declare const _default: React.MemoExoticComponent<(props: HistoryRouterProps) => React.JSX.Element>;
export default _default;
