import React, {
	useCallback,
	useContext,
	useId,
	useLayoutEffect,
	useMemo,
	useRef,
} from "react";
import { styled } from "@mui/material";
import Loader from "../Loader";
import type { DataGridDispatch, DataGridProps } from "./DataGrid";
import {
	DataGridFocusHandoff,
	DataGridFocusHandoffContext,
	DataGridFocusHandoffContextType,
} from "./FocusHandoff";

/**
 * What a persistence provider tells the grids inside it
 */
export interface DataGridPersistMountContextType {
	/**
	 * Whether the provider is still loading the stored state for its current
	 * storage keys. The grids inside show a Loader in their place meanwhile,
	 * and open with the stored state once it is loaded.
	 */
	loading: boolean;
	/**
	 * The provider's current storage keys, as one string. When it changes,
	 * the grids inside are mounted again, so they open with the state stored
	 * under the new keys.
	 */
	mount: string;
}

/**
 * Lets a persistence provider (DataGridLocalStoragePersist,
 * DataGridStorageManagerPersist) hold back the grids inside it, and only
 * them, while it loads the stored state, and mount them again when its
 * storage keys change: a grid reads the persisted state when it mounts only.
 * null outside of a provider and below DataGridNoPersist.
 */
export const DataGridPersistMountContext =
	React.createContext<DataGridPersistMountContextType | null>(null);

/**
 * The grid the gate wraps
 */
type GridComponent = React.ForwardRefExoticComponent<
	React.PropsWithoutRef<DataGridProps> & React.RefAttributes<DataGridDispatch>
>;

/**
 * The Loader shown in the grid's place while the stored state loads. It
 * grows like the grid's root does. It takes keyboard focus from a grid that
 * it replaces, and shows the library's focus ring then, inside its edge
 * because an ancestor may clip it.
 */
const FocusableLoader = styled(Loader)(({ theme }) => ({
	flexGrow: 1,
	"&:focus-visible": {
		outline: `2px solid ${theme.palette.primary.main}`,
		outlineOffset: -2,
	},
}));

/**
 * Wraps the grid in the gate of its persistence provider
 * (DataGridPersistMountContext). Outside of a provider the grid renders as
 * it is.
 *
 * Inside one, a Loader takes the grid's place while the provider loads the
 * stored state, and the grid is mounted anew for each of the provider's
 * storage keys. Keyboard focus in the grid moves to the Loader meanwhile,
 * and then to the same control of the grid mounted again (to its first
 * control, if that one is not there), unless focus was moved elsewhere in
 * between (see useDataGridFocusHandoff).
 * @param Grid The grid
 * @returns The grid in its gate
 */
export const withDataGridPersistGate = (Grid: GridComponent) => {
	const DataGridPersistGate = (
		props: React.PropsWithoutRef<DataGridProps>,
		ref: React.ForwardedRef<DataGridDispatch>,
	) => {
		const persistMount = useContext(DataGridPersistMountContext);
		const inProvider = persistMount != null;
		const loading = persistMount?.loading ?? false;
		const mount = persistMount?.mount;

		// where focus was in the grid when it unmounted for other storage keys,
		// until the grid mounted again takes it over
		const focusHandoff = useRef<DataGridFocusHandoff | null>(null);
		const focusCtx = useMemo(
			(): DataGridFocusHandoffContextType | null =>
				inProvider ? { handoff: focusHandoff, mount } : null,
			[inProvider, mount],
		);
		const loaderId = useId();
		// layout effects of the grid run first: a grid that unmounted for the
		// Loader has handed focus over, a grid that mounted in place of the
		// Loader has taken it
		useLayoutEffect(() => {
			if (!focusHandoff.current) return;
			// the grid is mounted: what is left is for no later grid
			if (!loading) {
				focusHandoff.current = null;
				return;
			}
			const loader = document.getElementById(loaderId);
			const active = document.activeElement;
			// the Loader keeps it while the keys change again
			if (loader && active === loader) return;
			// focus that is elsewhere already stays there
			if (loader && (!active || active === document.body)) loader.focus();
			else focusHandoff.current = null;
		}, [loading, mount, loaderId]);
		const handleLoaderBlur = useCallback(
			(evt: React.FocusEvent<HTMLDivElement>) => {
				const loader = evt.currentTarget;
				// once the update is done: the Loader is removed when the state is
				// loaded, and the grid takes focus. Focus moved elsewhere (not the
				// window losing focus) stays there.
				queueMicrotask(() => {
					if (
						loader.isConnected &&
						loader.ownerDocument.activeElement !== loader
					)
						focusHandoff.current = null;
				});
			},
			[],
		);

		return (
			<DataGridFocusHandoffContext.Provider value={focusCtx}>
				{loading ? (
					<FocusableLoader
						id={loaderId}
						tabIndex={-1}
						onBlur={handleLoaderBlur}
					/>
				) : ref ? (
					<Grid key={mount} {...props} ref={ref} />
				) : (
					// without a ref prop at all: React 19 hands a forwardRef
					// component whose element has one a new props object on every
					// render, which would re-render every reader of the grid's props
					<Grid key={mount} {...props} />
				)}
			</DataGridFocusHandoffContext.Provider>
		);
	};
	return React.forwardRef(DataGridPersistGate);
};
