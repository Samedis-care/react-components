import React from "react";
/**
 * Set by HistoryRouter around its children: true when that HistoryRouter is
 * rendered inside another one, e.g. a wizard on a memory history inside a
 * page, false in the outermost one and outside of every HistoryRouter.
 * Only the outermost HistoryRouter reports to Sentry (see
 * SentryRoutingInstrumentation): Route reads this to leave the transaction
 * name to the routes of that one, so it names the page, not a step of the
 * wizard.
 * Internal to HistoryRouter and Route, not exported from the package root.
 */
declare const NestedHistoryRouterContext: React.Context<boolean>;
export default NestedHistoryRouterContext;
