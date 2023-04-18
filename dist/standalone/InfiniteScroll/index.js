var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import React, { PureComponent } from "react";
import { debounce } from "../../utils";
/**
 * Provides infinite scrolling to whatever is inside it
 */
var InfiniteScroll = /** @class */ (function (_super) {
    __extends(InfiniteScroll, _super);
    function InfiniteScroll(props) {
        var _this = this;
        var _a;
        _this = _super.call(this, props) || this;
        _this.wrapper = null;
        _this.setScrollerRef = function (ref) {
            _this.wrapper = ref;
        };
        _this.handleResize = function () {
            if (!_this.wrapper)
                return;
            if (_this.wrapper.scrollHeight > _this.wrapper.clientHeight + 24) {
                if (!_this.state.initScroll) {
                    _this.wrapper.scrollTop = 24;
                    _this.setState({
                        initScroll: true,
                    });
                }
            }
            else {
                _this.state.loadMoreBottom();
            }
        };
        _this.handleScroll = function () {
            if (!_this.wrapper)
                return;
            if (_this.wrapper.scrollTop === 0 && _this.state.loadMoreTop) {
                _this.wrapper.scrollTop = 1;
                _this.state.loadMoreTop();
            }
            else if (_this.wrapper.scrollTop ===
                _this.wrapper.scrollHeight - _this.wrapper.clientHeight) {
                _this.state.loadMoreBottom();
            }
        };
        var debounceWait = (_a = _this.props.callBackDebounce) !== null && _a !== void 0 ? _a : 100;
        _this.resizeObserver = window.ResizeObserver
            ? new ResizeObserver(_this.handleResize)
            : null;
        _this.state = {
            initScroll: !_this.props.loadMoreTop,
            loadMoreTop: debounceWait === 0
                ? _this.props.loadMoreTop
                    ? debounce(_this.props.loadMoreTop, debounceWait)
                    : undefined
                : _this.props.loadMoreTop,
            loadMoreBottom: debounceWait === 0
                ? _this.props.loadMoreBottom
                : debounce(_this.props.loadMoreBottom, debounceWait),
        };
        return _this;
    }
    InfiniteScroll.prototype.componentDidMount = function () {
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
    };
    InfiniteScroll.prototype.componentDidUpdate = function (prevProps) {
        var _a, _b;
        if (prevProps.children !== this.props.children) {
            this.handleResize();
        }
        var debounceWait = (_a = this.props.callBackDebounce) !== null && _a !== void 0 ? _a : 100;
        var prevDebounceWait = (_b = prevProps.callBackDebounce) !== null && _b !== void 0 ? _b : 100;
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
    };
    InfiniteScroll.prototype.componentWillUnmount = function () {
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
    };
    InfiniteScroll.prototype.render = function () {
        return (React.createElement("div", { className: this.props.className, ref: this.setScrollerRef }, this.props.children));
    };
    return InfiniteScroll;
}(PureComponent));
export default InfiniteScroll;
