/**
 * Use route params
 * The params of the nearest Route, whose path includes the paths of the Routes
 * around it: under "/t/:tenantId/*" > ":id", "/t/T1/R9" gives
 * `{ tenantId: "T1", id: "R9" }`.
 * The nearest Route wins: a param named like a param of a Route around it hides
 * that Route's value. Under "/t/:id/*" > ":id", "/t/T1/R9" gives `{ id: "R9" }`
 * inside the nested Route and `{ id: "T1" }` in the parent's element outside of
 * it. To read both inside, give the params different names, or read the
 * parent's value in its element and pass it down. CRUD shows a record through
 * a nested Route ":id/*": name the param of a Route around a CRUD otherwise
 * (`:tenantId`) to read it in the record page.
 * Each value is percent-decoded: "foo bar" at "foo%20bar", see
 * `PathMatch.params`.
 */
declare const useParams: <T extends string = string>() => Partial<Record<T, string>>;
export default useParams;
