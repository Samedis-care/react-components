import { Transaction, TransactionContext } from "@sentry/types";
import React from "react";
export declare function reactRouterV6Instrumentation(): (customStartTransaction: (context: TransactionContext) => Transaction | undefined, startTransactionOnPageLoad?: boolean, startTransactionOnLocationChange?: boolean) => void;
export interface SentryRoutesTracingProps {
    children: NonNullable<React.ReactElement>;
}
export declare const SentryRoutesTracing: (props: SentryRoutesTracingProps) => JSX.Element;
export declare function withSentryReactRouterV6Routing<P extends Record<string, unknown>, R extends React.FC<P>>(Routes: R): R;
