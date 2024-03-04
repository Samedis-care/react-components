import React, { PureComponent } from "react";
import debounce from "../../utils/debounce";
/**
 * Provides infinite scrolling to whatever is inside it
 */
class InfiniteScroll extends PureComponent {
    wrapper = null;
    resizeObserver;
    constructor(props) {
        super(props);
        const debounceWait = this.props.callBackDebounce ?? 100;
        this.resizeObserver = window.ResizeObserver
            ? new ResizeObserver(this.handleResize)
            : null;
        this.state = {
            initScroll: !this.props.loadMoreTop, // we don't need to set an initial scroll if we don't need up-scrolling
            loadMoreTop: debounceWait === 0
                ? this.props.loadMoreTop
                    ? debounce(this.props.loadMoreTop, debounceWait)
                    : undefined
                : this.props.loadMoreTop,
            loadMoreBottom: debounceWait === 0
                ? this.props.loadMoreBottom
                : debounce(this.props.loadMoreBottom, debounceWait),
        };
    }
    componentDidMount() {
        if (!this.wrapper)
            throw new Error("Ref is null");
        this.wrapper.addEventListener("scroll", this.handleScroll);
        this.handleResize();
        if (this.props.dynamicallySized) {
            if (this.resizeObserver) {
                this.resizeObserver.observe(this.wrapper);
            }
            else {
                window.addEventListener("resize", this.handleResize);
            }
        }
    }
    componentDidUpdate(prevProps) {
        if (prevProps.children !== this.props.children) {
            this.handleResize();
        }
        const debounceWait = this.props.callBackDebounce ?? 100;
        const prevDebounceWait = prevProps.callBackDebounce ?? 100;
        if (prevProps.loadMoreTop !== this.props.loadMoreTop ||
            debounceWait !== prevDebounceWait) {
            this.setState({
                loadMoreTop: debounceWait === 0
                    ? this.props.loadMoreTop
                        ? debounce(this.props.loadMoreTop, debounceWait)
                        : undefined
                    : this.props.loadMoreTop,
            });
        }
        if (prevProps.loadMoreBottom !== this.props.loadMoreBottom ||
            debounceWait !== prevDebounceWait) {
            this.setState({
                loadMoreBottom: debounceWait === 0
                    ? debounce(this.props.loadMoreBottom, debounceWait)
                    : this.props.loadMoreBottom,
            });
        }
        if (!!prevProps.dynamicallySized !== !!this.props.dynamicallySized) {
            if (!this.wrapper)
                return;
            if (prevProps.dynamicallySized) {
                if (this.resizeObserver) {
                    this.resizeObserver.unobserve(this.wrapper);
                }
                else {
                    window.removeEventListener("resize", this.handleResize);
                }
            }
            else {
                if (this.resizeObserver) {
                    this.resizeObserver.observe(this.wrapper);
                }
                else {
                    window.addEventListener("resize", this.handleResize);
                }
            }
        }
    }
    componentWillUnmount() {
        if (!this.wrapper)
            throw new Error("Ref is null");
        this.wrapper.removeEventListener("scroll", this.handleScroll);
        if (this.props.dynamicallySized) {
            if (this.resizeObserver) {
                this.resizeObserver.unobserve(this.wrapper);
            }
            else {
                window.removeEventListener("resize", this.handleResize);
            }
        }
    }
    render() {
        return (React.createElement("div", { className: this.props.className, ref: this.setScrollerRef }, this.props.children));
    }
    setScrollerRef = (ref) => {
        this.wrapper = ref;
    };
    handleResize = () => {
        if (!this.wrapper)
            return;
        if (this.wrapper.scrollHeight > this.wrapper.clientHeight + 24) {
            if (!this.state.initScroll) {
                this.wrapper.scrollTop = 24;
                this.setState({
                    initScroll: true,
                });
            }
        }
        else {
            this.state.loadMoreBottom();
        }
    };
    handleScroll = () => {
        if (!this.wrapper)
            return;
        if (this.wrapper.scrollTop === 0 && this.state.loadMoreTop) {
            this.wrapper.scrollTop = 1;
            this.state.loadMoreTop();
        }
        else if (this.wrapper.scrollTop ===
            this.wrapper.scrollHeight - this.wrapper.clientHeight) {
            this.state.loadMoreBottom();
        }
    };
}
export default InfiniteScroll;
