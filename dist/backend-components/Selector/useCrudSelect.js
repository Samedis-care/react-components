import { useCallback, useContext, useEffect, useImperativeHandle, useRef, useState, } from "react";
import { shallowCompare } from "../../utils";
import { FormContext } from "../Form";
let ticketCounter = 0;
const nextTicket = () => {
    ticketCounter = (ticketCounter + 1) % Number.MAX_SAFE_INTEGER;
    return ticketCounter;
};
const useCrudSelect = (params, ref) => {
    const { connector, serialize, deserialize, deserializeModel, onChange, initialSelected, validate, field, getIdOfData, } = params;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loadError, setLoadError] = useState(null);
    const [selected, setSelected] = useState([]);
    const currentSelected = useRef([]); // current state of selected, always set this and then use setSelected(currentSelected.current)
    const [initialRawData, setInitialRawData] = useState([]);
    // async processing of add to selection
    const addToSelectionResults = useRef({});
    const addToSelectionInputs = useRef({});
    const [addToSelectionQueue, setAddToSelectionQueue] = useState([]);
    useImperativeHandle(ref, () => ({
        addToSelection: async (entry) => {
            // create ticket and add for async processing
            const ticket = nextTicket().toString(16) + ":" + Date.now().toString();
            const result = new Promise((resolve, reject) => {
                addToSelectionResults.current[ticket] = [resolve, reject];
            });
            addToSelectionInputs.current[ticket] = entry;
            setAddToSelectionQueue((prev) => [...prev, ticket]);
            return result;
        },
    }));
    // async processing of add to selection
    const fetchingAddSelection = useRef(false);
    useEffect(() => {
        if (loading)
            return;
        if (addToSelectionQueue.length === 0)
            return;
        if (fetchingAddSelection.current)
            return; // don't run this code twice
        fetchingAddSelection.current = true;
        const ticket = addToSelectionQueue[0];
        let entry = addToSelectionInputs.current[ticket];
        // if entry is undefined here we already started working on this, thus just wait and keep retrying
        if (entry === undefined) {
            // this happens when fetchingAddSelection is set to false before selection queue is updated (removed first entry) in finally handler of async code
            // this usually happens when addToSelection keeps getting called
            fetchingAddSelection.current = false; // allow retry
            return;
        }
        delete addToSelectionInputs.current[ticket];
        const [resolve, reject] = addToSelectionResults.current[ticket];
        delete addToSelectionResults.current[ticket];
        (async () => {
            if (loadError)
                throw new Error("CrudSelect loading failed");
            const existing = currentSelected.current.find((selEntry) => getIdOfData(selEntry) === getIdOfData(entry));
            if (existing)
                return;
            const modelRecord = (await connector.create(await serialize(entry)))[0];
            entry = {
                ...(await deserialize(modelRecord)),
            };
            // store record in cache
            setInitialRawData((oldRawData) => [...oldRawData, modelRecord]);
            currentSelected.current = [...currentSelected.current, entry];
            setSelected(currentSelected.current);
        })()
            .then(resolve)
            .catch(reject)
            .finally(() => {
            fetchingAddSelection.current = false;
            // state update re-triggers useEffect
            setAddToSelectionQueue((prev) => prev.filter((queueTicket) => queueTicket !== ticket));
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, addToSelectionQueue]);
    const handleSelect = useCallback(async (_, newSelected) => {
        // find new entries
        const newEntries = newSelected.filter((entry) => !selected.find((selEntry) => selEntry.value === entry.value));
        // remove new entries from array
        newSelected = newSelected.filter((entry) => selected.find((selEntry) => selEntry.value === entry.value));
        const changedEntries = newSelected.filter((entry) => {
            const oldEntry = selected.find((selEntry) => selEntry.value === entry.value);
            if (!oldEntry)
                return false;
            // remove all base selector data and multi selector data render options
            // this way we only update when the data actually changed
            const normalize = (record) => Object.assign({}, record, {
                label: null,
                icon: null,
                onClick: null,
                canUnselect: null,
                noDelete: null,
                isDisabled: null,
                selected: null,
                hidden: null,
                ignore: null,
                group: null,
                isAddNewButton: null,
                isDivider: null,
                isSmallLabel: null,
                className: null,
            });
            return !shallowCompare(normalize(entry), normalize(oldEntry));
        });
        const deletedEntries = selected.filter((entry) => !newSelected.find((selEntry) => selEntry.value === entry.value));
        // call backend
        const createPromise = Promise.all(newEntries
            .map((entry) => serialize(entry))
            .map(async (serializedEntry) => connector.create(await serializedEntry)));
        const updatePromise = Promise.all(changedEntries
            .map((entry) => serialize(entry))
            .map(async (serializedEntry) => connector.update(await serializedEntry)));
        const deletePromise = Promise.all(deletedEntries
            .map((entry) => serialize(entry))
            .map(async (serializedEntry) => connector.delete((await serializedEntry).id)));
        try {
            // wait for response
            const created = (await createPromise).map((e) => e[0]);
            await updatePromise;
            await deletePromise;
            // create final values
            const finalSelected = [
                ...newSelected,
                ...(await Promise.all(created.map((entry) => deserialize(entry)))),
            ];
            // reflect changes
            setInitialRawData((oldRawData) => [...oldRawData, ...created]);
            currentSelected.current = finalSelected;
            setSelected(currentSelected.current);
        }
        catch (e) {
            setError(e);
        }
    }, [connector, deserialize, selected, serialize]);
    const modelToSelectorData = useCallback(async (data) => initialRawData.includes(data)
        ? deserialize(data)
        : {
            ...(await deserializeModel(data)),
            value: "to-create-" + Math.random().toString(),
        }, [deserialize, deserializeModel, initialRawData]);
    // initial load
    useEffect(() => {
        void (async () => {
            setLoading(true);
            if (initialSelected) {
                await handleSelect(undefined, initialSelected);
                setLoading(false);
                return;
            }
            try {
                const currentlySelected = await connector.index({
                    page: 1,
                    rows: Number.MAX_SAFE_INTEGER,
                });
                const initialSelected = await Promise.all(currentlySelected[0].map((record) => deserialize(record)));
                setInitialRawData(currentlySelected[0]);
                currentSelected.current = initialSelected;
                setSelected(currentSelected.current);
            }
            catch (e) {
                setLoadError(e);
            }
            finally {
                setLoading(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // on change event
    useEffect(() => {
        if (onChange)
            onChange(selected);
    }, [onChange, selected]);
    // validations
    const formCtx = useContext(FormContext);
    useEffect(() => {
        if (!formCtx || !validate || !field) {
            if (validate && process.env.NODE_ENV === "development") {
                const reasons = [];
                if (!formCtx)
                    reasons.push("Form context not present, validate only works inside of Components-Care Form Engine");
                if (!field)
                    reasons.push("Field prop not passed. This is required to register the validation handler with the Form Engine. This value has to be unique to the form");
                // eslint-disable-next-line no-console
                console.error("[Components-Care] [useCrudSelect] Crud Select has been given validate function, but can't be activated due to the following reasons", reasons);
            }
            return;
        }
        const { setCustomValidationHandler, removeCustomValidationHandler, onlyValidateMounted, } = formCtx;
        setCustomValidationHandler(field, () => validate(selected));
        return () => {
            if (onlyValidateMounted)
                removeCustomValidationHandler(field);
        };
    });
    return {
        loading,
        error,
        loadError,
        selected,
        initialRawData,
        handleSelect,
        modelToSelectorData,
    };
};
export default useCrudSelect;
