import { PureComponent } from "react";
/**
 * The content of InfiniteScroll's scroll container: renders `children`, and
 * calls `onBeforeChange` before a commit changes them in the DOM.
 *
 * It is a class component because only a class can run code at that moment,
 * in `getSnapshotBeforeUpdate`: function components have no equivalent.
 */
class ScrollContent extends PureComponent {
    getSnapshotBeforeUpdate(prevProps) {
        if (prevProps.children !== this.props.children &&
            (prevProps.loadsOnTop || this.props.loadsOnTop)) {
            this.props.onBeforeChange();
        }
        return null;
    }
    /**
     * Does nothing: React expects `getSnapshotBeforeUpdate` to come with
     * `componentDidUpdate`, and warns without it
     */
    componentDidUpdate() {
        // the work is done in getSnapshotBeforeUpdate
    }
    render() {
        return this.props.children;
    }
}
export default ScrollContent;
