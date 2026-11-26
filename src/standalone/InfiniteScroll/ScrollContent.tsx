import React, { PureComponent } from "react";

export interface ScrollContentProps {
	/**
	 * The content of the scroll container: InfiniteScroll's `children`
	 */
	children: React.ReactNode;
	/**
	 * Does the list load on top (has InfiniteScroll a `loadMoreTop`)?
	 */
	loadsOnTop: boolean;
	/**
	 * Called in a commit that changes `children` while the list loads on top
	 * (before or after the change), once React has rendered the new children
	 * and before it changes the DOM, so the rows in view can still be measured
	 * where they are
	 */
	onBeforeChange: () => void;
}

/**
 * The content of InfiniteScroll's scroll container: renders `children`, and
 * calls `onBeforeChange` before a commit changes them in the DOM.
 *
 * It is a class component because only a class can run code at that moment,
 * in `getSnapshotBeforeUpdate`: function components have no equivalent.
 */
class ScrollContent extends PureComponent<ScrollContentProps> {
	getSnapshotBeforeUpdate(prevProps: Readonly<ScrollContentProps>): null {
		if (
			prevProps.children !== this.props.children &&
			(prevProps.loadsOnTop || this.props.loadsOnTop)
		) {
			this.props.onBeforeChange();
		}
		return null;
	}

	/**
	 * Does nothing: React expects `getSnapshotBeforeUpdate` to come with
	 * `componentDidUpdate`, and warns without it
	 */
	componentDidUpdate(): void {
		// the work is done in getSnapshotBeforeUpdate
	}

	render(): React.ReactNode {
		return this.props.children;
	}
}

export default ScrollContent;
