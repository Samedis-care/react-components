import React from "react";

/**
 * The name of the moment locale `CCI18nProvider` applied last, e.g. "en-za"
 * or "de"; null before the first one applies, and outside a `CCI18nProvider`
 */
const MomentLocaleContext = React.createContext<string | null>(null);

export default MomentLocaleContext;
