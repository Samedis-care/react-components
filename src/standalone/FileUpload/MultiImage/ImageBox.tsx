import React, {
	CSSProperties,
	MutableRefObject,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import useDropZone, { UseDropZoneParams } from "../../../utils/useDropZone";
import {
	Dialog,
	DialogContent,
	IconButton,
	styled,
	Tooltip,
	useThemeProps,
} from "@mui/material";
import {
	ArrowBack as PrevIcon,
	ArrowForward as NextIcon,
	Close as CloseIcon,
	Delete as DeleteIcon,
} from "@mui/icons-material";
import combineClassNames from "../../../utils/combineClassNames";
import { useDebounce } from "../../../utils/useDebounce";
import ImageDots, { ImageDotsProps } from "./ImageDots";

export interface ImageBoxProps {
	/**
	 * The Image to display (URL/Data-URI)
	 */
	image: string;
	/**
	 * The image file name
	 */
	fileName?: string | null;
	/**
	 * The width of the preview
	 */
	width?: CSSProperties["width"];
	/**
	 * The height of the preview
	 */
	height?: CSSProperties["height"];
	/**
	 * The custom onClick handler.
	 * If not set a fullscreen preview will be opened
	 * If set the onClick handler will be called
	 * If set to null explicitly no action will be performed and the cursor won't show clickable
	 */
	onClick?: React.MouseEventHandler | null;
	/**
	 * File drop handler
	 */
	onFilesDropped?: UseDropZoneParams;
	/**
	 * Remove handler. Optional, will show remove icon if set
	 */
	onRemove?: () => void;
	/**
	 * Goto next image. Optional, will show next arrow if set
	 */
	onNextImage?: () => void;
	/**
	 * Goto prev image. Optional, will show go back arrow if set
	 */
	onPrevImage?: () => void;
	/**
	 * Disable background color?
	 */
	disableBackground?: boolean;
	/**
	 * Custom CSS styles to apply to root
	 */
	className?: string;
	/**
	 * Custom CSS styles
	 */
	classes?: Partial<Record<ImageBoxClassKey, string>>;
	/**
	 * Image dots props (set to enable image props)
	 */
	imageDots?: ImageDotsProps;
}

const swipeWidth = 30;

export interface ImageBoxRootOwnerState {
	background: boolean;
	dragging: boolean;
	clickable: boolean;
}
const Root = styled("div", { name: "CcImageBox", slot: "root" })<{
	ownerState: ImageBoxRootOwnerState;
}>(({ theme, ownerState: { background, dragging, clickable } }) => ({
	borderRadius: theme.shape.borderRadius,
	position: "relative",
	height: "100%",
	"& button": {
		visibility: "hidden",
		opacity: 0,
		transition: "visibility 0s linear 300ms, opacity 300ms",
	},
	"&:hover button": {
		visibility: "visible",
		opacity: 1,
		transition: "visibility 0s linear 0s, opacity 300ms",
	},
	...(background && {
		backgroundColor: theme.palette.secondary.light,
	}),
	...(dragging && {
		border: `1px solid ${theme.palette.primary.main}`,
	}),
	...(clickable && {
		cursor: "pointer",
	}),
}));

const RemoveButton = styled(IconButton, {
	name: "CcImageBox",
	slot: "removeBtn",
})(({ theme }) => ({
	padding: theme.spacing(1),
	position: "absolute",
	top: 0,
	right: 0,
}));

const PrevButton = styled(IconButton, { name: "CcImageBox", slot: "prevBtn" })({
	position: "absolute",
	top: "50%",
	left: 0,
	transform: "translateY(-50%)",
});

const NextButton = styled(IconButton, { name: "CcImageBox", slot: "nextBtn" })({
	position: "absolute",
	top: "50%",
	right: 0,
	transform: "translateY(-50%)",
});

const SwipeListener = styled("div", {
	name: "CcImageBox",
	slot: "swipeListener",
})({
	height: "100%",
	width: "100%",
	overflowX: "auto",
	overflowY: "hidden",
	scrollbarWidth: "none",
	msOverflowStyle: "none",
	"&::-webkit-scrollbar": {
		display: "none",
	},
});

export interface ImageBoxStyledImageOwnerState {
	swipeLeft: boolean;
	swipeRight: boolean;
	imageDots: boolean;
}
const StyledImage = styled("img", { name: "CcImageBox", slot: "image" })<{
	ownerState: ImageBoxStyledImageOwnerState;
}>(({ theme, ownerState: { swipeLeft, swipeRight, imageDots } }) => ({
	width: "100%",
	left: swipeWidth,
	marginLeft: swipeWidth,
	marginRight: swipeWidth,
	height: "100%",
	objectFit: "contain",
	borderRadius: theme.shape.borderRadius,
	...(swipeLeft &&
		!swipeRight && {
			marginLeft: swipeWidth,
		}),
	...(swipeRight &&
		!swipeLeft && {
			marginLeft: 0,
			marginRight: swipeWidth,
		}),
	...(!swipeRight &&
		!swipeLeft && {
			marginLeft: 0,
			marginRight: 0,
		}),
	...(imageDots && {
		height: "calc(100% - 48px)",
	}),
}));

const StyledDialog = styled(Dialog, {
	name: "CcImageBox",
	slot: "fullScreenDialog",
})({});

const FullScreenImageWrapper = styled("div", {
	name: "CcImageBox",
	slot: "fullScreenImageWrapper",
})({
	width: "100%",
	height: "100%",
	position: "relative",
});

const ImageDotsWrapper = styled("div", {
	name: "CcImageBox",
	slot: "imageDotsWrapper",
})({
	position: "absolute",
	bottom: 16,
	left: "50%",
	height: 16,
	transform: "translateX(-50%)",
});

const StyledImageDots = styled(ImageDots, {
	name: "CcImageBox",
	slot: "imageDots",
})({
	position: "unset",
	overflow: "unset",
	"& .CcImageDots-container": {
		position: "unset",
		overflow: "unset",
	},
});

export type ImageBoxClassKey =
	| "root"
	| "removeBtn"
	| "prevBtn"
	| "nextBtn"
	| "swipeListener"
	| "image"
	| "fullScreenDialog"
	| "fullScreenImageWrapper"
	| "imageDotsWrapper"
	| "imageDots";

const useScrollSwipe = (
	params: Pick<ImageBoxProps, "onPrevImage" | "onNextImage">,
): {
	containerRef: MutableRefObject<HTMLDivElement | null>;
	handleScroll: React.UIEventHandler<HTMLDivElement>;
	handleTouchEnd: React.TouchEventHandler<HTMLDivElement>;
} => {
	const { onPrevImage, onNextImage } = params;

	const handleResetScroll = useCallback(() => {
		const ref = containerRef.current;
		if (!ref) return;
		const scrollBase = onPrevImage ? swipeWidth : 0;
		ref.scrollTo(scrollBase, 0);
		scrolled.current = false;
	}, [onPrevImage]);
	const [debouncedHandleResetScroll, cancelResetScroll] = useDebounce(
		handleResetScroll,
		200,
	);
	const handleScroll = useCallback(
		(evt: React.UIEvent<HTMLDivElement>) => {
			const x = evt.currentTarget.scrollLeft;
			const scrollTarget = onPrevImage ? swipeWidth * 2 : swipeWidth;
			let resetScroll = false;
			if (scrolled.current) {
				resetScroll = true;
			} else {
				if (x <= 1 && onPrevImage) {
					onPrevImage();
					resetScroll = true;
				}
				if (x >= scrollTarget - 1 && onNextImage) {
					onNextImage();
					resetScroll = true;
				}
			}
			if (resetScroll) {
				scrolled.current = true;
				cancelResetScroll();
			} else {
				debouncedHandleResetScroll();
			}
		},
		[cancelResetScroll, debouncedHandleResetScroll, onNextImage, onPrevImage],
	);
	useEffect(() => {
		handleResetScroll();
	}, [onPrevImage, onNextImage, handleResetScroll]);
	const scrolled = useRef(false);
	const containerRef = useRef<HTMLDivElement | null>(null);
	useEffect(() => {
		handleResetScroll();
		cancelResetScroll();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [handleResetScroll]);

	return { containerRef, handleScroll, handleTouchEnd: handleResetScroll };
};

const ImageBox = (inProps: ImageBoxProps) => {
	const props = useThemeProps({ props: inProps, name: "CcImageBox" });
	const {
		image,
		width,
		height,
		onClick,
		onFilesDropped,
		onRemove,
		onNextImage,
		onPrevImage,
		disableBackground,
		fileName,
		imageDots,
		className,
		classes,
	} = props;
	const { handleDragOver, handleDrop, dragging } = useDropZone(onFilesDropped);
	const [dialogOpen, setDialogOpen] = useState(false);

	const openDialog = useCallback(() => {
		setDialogOpen(true);
	}, []);
	const closeDialog = useCallback(() => {
		setDialogOpen(false);
	}, []);
	const handleRemove = useCallback(
		(evt: React.MouseEvent) => {
			evt.stopPropagation();
			if (onRemove) onRemove();
		},
		[onRemove],
	);
	const handlePrevImage = useCallback(
		(evt: React.MouseEvent) => {
			evt.stopPropagation();
			if (onPrevImage) onPrevImage();
		},
		[onPrevImage],
	);
	const handleNextImage = useCallback(
		(evt: React.MouseEvent) => {
			evt.stopPropagation();
			if (onNextImage) onNextImage();
		},
		[onNextImage],
	);

	const {
		containerRef: containerRefImage,
		handleScroll: handleScrollImage,
		handleTouchEnd: handleTouchEndImage,
	} = useScrollSwipe(props);
	const {
		containerRef: containerRefFS,
		handleScroll: handleScrollFS,
		handleTouchEnd: handleTouchEndFS,
	} = useScrollSwipe(props);

	return (
		<>
			<Root
				onClick={onClick === null ? undefined : (onClick ?? openDialog)}
				onDragOver={handleDragOver}
				onDrop={handleDrop}
				style={{ width, height }}
				ownerState={{
					clickable: !!onClick,
					dragging,
					background: !disableBackground,
				}}
				className={combineClassNames([className, classes?.root])}
			>
				{onRemove && (
					<RemoveButton
						onClick={handleRemove}
						className={classes?.removeBtn}
						size="large"
					>
						<DeleteIcon />
					</RemoveButton>
				)}
				{onPrevImage && (
					<PrevButton
						onClick={handlePrevImage}
						className={classes?.prevBtn}
						size="large"
					>
						<PrevIcon />
					</PrevButton>
				)}
				{onNextImage && (
					<NextButton
						onClick={handleNextImage}
						className={classes?.nextBtn}
						size="large"
					>
						<NextIcon />
					</NextButton>
				)}
				<SwipeListener
					className={classes?.swipeListener}
					onScroll={handleScrollImage}
					ref={containerRefImage}
					onTouchEnd={handleTouchEndImage}
				>
					<Tooltip
						title={fileName ?? ""}
						disableTouchListener={!fileName}
						disableHoverListener={!fileName}
						disableFocusListener={!fileName}
					>
						<StyledImage
							src={image}
							alt={""}
							ownerState={{
								swipeLeft: !!onPrevImage,
								swipeRight: !!onNextImage,
								imageDots: false,
							}}
							className={classes?.image}
						/>
					</Tooltip>
				</SwipeListener>
			</Root>
			{!onClick && (
				<StyledDialog open={dialogOpen} fullScreen onClose={closeDialog}>
					<DialogContent>
						<FullScreenImageWrapper className={classes?.fullScreenImageWrapper}>
							<SwipeListener
								className={classes?.swipeListener}
								onScroll={handleScrollFS}
								ref={containerRefFS}
								onTouchEnd={handleTouchEndFS}
							>
								<StyledImage
									src={image}
									alt={""}
									ownerState={{
										swipeLeft: !!onPrevImage,
										swipeRight: !!onNextImage,
										imageDots: !imageDots,
									}}
									className={classes?.image}
								/>
							</SwipeListener>
							<RemoveButton
								onClick={closeDialog}
								className={classes?.removeBtn}
								size="large"
							>
								<CloseIcon />
							</RemoveButton>
							{onPrevImage && (
								<PrevButton
									onClick={handlePrevImage}
									className={classes?.prevBtn}
									size="large"
								>
									<PrevIcon />
								</PrevButton>
							)}
							{onNextImage && (
								<NextButton
									onClick={handleNextImage}
									className={classes?.nextBtn}
									size="large"
								>
									<NextIcon />
								</NextButton>
							)}
							{imageDots && (
								<ImageDotsWrapper className={classes?.imageDotsWrapper}>
									<StyledImageDots
										{...imageDots}
										className={combineClassNames([
											classes?.imageDots,
											imageDots.className,
										])}
									/>
								</ImageDotsWrapper>
							)}
						</FullScreenImageWrapper>
					</DialogContent>
				</StyledDialog>
			)}
		</>
	);
};

export default React.memo(ImageBox);
