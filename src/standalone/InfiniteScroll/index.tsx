import React, { PureComponent } from "react";
import { debounce } from "../../utils";

export interface IProps {
	/**
	 * The children to render, must not change their size though internal state updates.
	 * Should update if loadMoreTop or loadMoreBottom is called.
	 * This means the component which manages state needs to be a parent of the infinite scroll component
	 */
	children: React.ReactNode;
	/**
	 * The CSS class to apply, must set a fixed height value
	 */
	className: string;
	/**
	 * Callback to load more elements on top. Optional, do not specify to disable up-scrolling
	 */
	loadMoreTop?: () => void;
	/**
	 * Callback to load more elements at the bottom.
	 */
	loadMoreBottom: () => void;
	/**
	 * Debounce wait (in ms) for loadMoreTop and loadMoreBottom. Defaults to 100ms
	 */
	callBackDebounce?: number;
}

interface IState {
	/**
	 * Initial scroll set? Used for infinite up-scrolling
	 */
	initScroll: boolean;
	/**
	 * Debounced version of IProps.loadMoreTop
	 */
	loadMoreTop?: () => void;
	/**
	 * Debounced version of IProps.loadMoreBottom
	 */
	loadMoreBottom: () => void;
}

/**
 * Provides infinite scrolling to whatever is inside it
 */
class InfiniteScroll extends PureComponent<IProps, IState> {
	public wrapper: HTMLElement | null = null;

	constructor(props: IProps) {
		super(props);

		const debounceWait =
			this.props.callBackDebounce !== undefined
				? this.props.callBackDebounce
				: 100;

		this.state = {
			initScroll: !this.props.loadMoreTop, // we don't need to set an initial scroll if we don't need up-scrolling
			loadMoreTop:
				debounceWait === 0
					? this.props.loadMoreTop
						? debounce(this.props.loadMoreTop, debounceWait)
						: undefined
					: this.props.loadMoreTop,
			loadMoreBottom:
				debounceWait === 0
					? this.props.loadMoreBottom
					: debounce(this.props.loadMoreBottom, debounceWait),
		};
	}

	componentDidMount() {
		this.wrapper?.addEventListener("scroll", this.handleScroll);
		this.handleResize();
	}

	componentDidUpdate(
		prevProps: Readonly<IProps>,
		prevState: Readonly<IState>,
		snapshot?: any
	) {
		if (prevProps.children !== this.props.children) {
			this.handleResize();
		}
	}

	componentWillUnmount() {
		this.wrapper?.removeEventListener("scroll", this.handleScroll);
	}

	render() {
		return (
			<div className={this.props.className} ref={this.setScrollerRef}>
				{this.props.children}
			</div>
		);
	}

	setScrollerRef = (ref: HTMLElement | null) => (this.wrapper = ref);

	handleResize = () => {
		if (!this.wrapper) return;

		if (this.wrapper.scrollHeight > this.wrapper.clientHeight + 24) {
			if (!this.state.initScroll) {
				this.wrapper.scrollTop = 24;
				this.setState({
					initScroll: true,
				});
			}
		} else {
			this.state.loadMoreBottom();
		}
	};

	handleScroll = () => {
		if (!this.wrapper) return;

		if (this.wrapper.scrollTop === 0 && this.state.loadMoreTop) {
			this.wrapper.scrollTop = 1;
			this.state.loadMoreTop();
		} else if (
			this.wrapper.scrollTop ===
			this.wrapper.scrollHeight - this.wrapper.clientHeight
		) {
			this.state.loadMoreBottom();
		}
	};
}

export default InfiniteScroll;
