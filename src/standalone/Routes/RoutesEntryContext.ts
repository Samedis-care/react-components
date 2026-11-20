import React from "react";

/**
 * Set by Routes around the entry it renders: would that Routes still render the same entry
 * at pathname? Route builds the rendersAt of its RouteContext with it. A Route deeper down
 * in the entry's element, without a Routes of its own in between, sees it as well, which
 * holds for it too: it is rendered only while that entry is.
 * Stays the same function while the Routes renders the same entry, and answers for the
 * entries of the Routes' latest render.
 */
const RoutesEntryContext = React.createContext<
	((pathname: string) => boolean) | null
>(null);

export default RoutesEntryContext;
