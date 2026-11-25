import { useCallback, useLayoutEffect, useMemo, useRef, useState, } from "react";
const MIN_ZOOM = 1;
const MAX_ZOOM = 10;
/** The factor of one step of zoomIn and zoomOut (and of the + and - keys) */
const ZOOM_STEP = 1.5;
/** The share of the view's width or height one arrow key press pans by */
const PAN_STEP = 0.1;
/** The direction an arrow key moves the view in, as [x, y] */
const ARROW_KEYS = new Map([
    ["ArrowLeft", [-1, 0]],
    ["ArrowRight", [1, 0]],
    ["ArrowUp", [0, -1]],
    ["ArrowDown", [0, 1]],
]);
/**
 * The scale that fits the image back into its box after a quarter turn.
 * Expects the image to fill its box with `object-fit: contain`.
 */
const getQuarterTurnFit = (img) => {
    // the layout size, which the transform does not change
    const boxWidth = img.offsetWidth;
    const boxHeight = img.offsetHeight;
    const { naturalWidth, naturalHeight } = img;
    if (!boxWidth || !boxHeight || !naturalWidth || !naturalHeight)
        return 1;
    const contain = Math.min(boxWidth / naturalWidth, boxHeight / naturalHeight);
    // turned, the picture's width runs along the box's height and vice versa
    return Math.min(boxWidth / (naturalHeight * contain), boxHeight / (naturalWidth * contain));
};
const getFit = (img, rotation) => img && rotation % 180 !== 0 ? getQuarterTurnFit(img) : 1;
const applyTransform = (img, zoom, panX, panY, rotation) => {
    if (!img)
        return;
    const scale = zoom * getFit(img, rotation);
    img.style.transform = `translate(${panX}px, ${panY}px) scale(${scale}) rotate(${rotation}deg)`;
};
/**
 * Hook providing zoom (mouse wheel / pinch / keys / buttons), pan (drag / arrow
 * keys) and rotation (quarter turns) for an image element inside a container.
 * Updates are imperative (ref-based) so no React re-renders occur during
 * interaction; only `zoomed` re-renders, when the image goes from fitted to
 * zoomed in and back.
 *
 * At zoom 1x, single-finger touch and single-pointer drag events are not
 * intercepted, allowing parent scroll-based interactions (e.g. swipe
 * navigation) to work normally. Pinch gestures and mouse wheel zoom always
 * work regardless of zoom level.
 *
 * Keyboard and buttons: attach `handleKeyDown` to the element that holds the
 * focus (the dialog), and offer `zoomIn`, `zoomOut` and `resetZoom` as buttons,
 * so the view can be zoomed and panned without a pointer.
 *
 * A turned image is scaled to fit its box again, so the image is expected to
 * fill its box with `object-fit: contain`.
 *
 * @param open Whether the zoomable view is currently active. Resets zoom, pan and rotation when transitioning to true.
 * @param src The image shown. Resets zoom, pan and rotation when it changes while open, so the next image starts unzoomed and upright.
 */
const useImageZoomPan = (open, src) => {
    const imgElRef = useRef(null);
    const imgCleanupRef = useRef(null);
    const containerElRef = useRef(null);
    const wheelCleanupRef = useRef(null);
    const zoomRef = useRef(1);
    const panRef = useRef({ x: 0, y: 0 });
    // clockwise, in degrees: 0, 90, 180 or 270
    const rotationRef = useRef(0);
    const isPanning = useRef(false);
    const lastPointer = useRef({ x: 0, y: 0 });
    const lastPinchDist = useRef(null);
    const lastTouchCenter = useRef({ x: 0, y: 0 });
    const [zoomed, setZoomed] = useState(false);
    const syncContainerStyle = useCallback(() => {
        const isZoomed = zoomRef.current > 1;
        // the same value again does not re-render
        setZoomed(isZoomed);
        const el = containerElRef.current;
        if (!el)
            return;
        el.style.touchAction = isZoomed ? "none" : "";
    }, []);
    const render = useCallback(() => {
        applyTransform(imgElRef.current, zoomRef.current, panRef.current.x, panRef.current.y, rotationRef.current);
    }, []);
    // Callback ref for the image. The fit of a turned image depends on the
    // image's size and on its box, so it is recomputed once the image has
    // loaded and whenever the box resizes.
    const imgRef = useCallback((node) => {
        if (imgCleanupRef.current) {
            imgCleanupRef.current();
            imgCleanupRef.current = null;
        }
        imgElRef.current = node;
        if (!node)
            return;
        render();
        node.addEventListener("load", render);
        const resizeObserver = typeof ResizeObserver === "undefined"
            ? null
            : new ResizeObserver(render);
        resizeObserver?.observe(node);
        imgCleanupRef.current = () => {
            node.removeEventListener("load", render);
            resizeObserver?.disconnect();
        };
    }, [render]);
    // before paint, so a new image never shows with the previous one's zoom
    useLayoutEffect(() => {
        if (open) {
            zoomRef.current = 1;
            panRef.current = { x: 0, y: 0 };
            rotationRef.current = 0;
            render();
            syncContainerStyle();
        }
    }, [open, src, render, syncContainerStyle]);
    const clampPan = useCallback((x, y, currentZoom) => {
        if (currentZoom <= 1)
            return { x: 0, y: 0 };
        const container = containerElRef.current;
        if (!container)
            return { x, y };
        const rect = container.getBoundingClientRect();
        const maxPanX = ((currentZoom - 1) * rect.width) / 2;
        const maxPanY = ((currentZoom - 1) * rect.height) / 2;
        return {
            x: Math.max(-maxPanX, Math.min(maxPanX, x)),
            y: Math.max(-maxPanY, Math.min(maxPanY, y)),
        };
    }, []);
    const update = useCallback((nextZoom, nextPanX, nextPanY) => {
        const clamped = clampPan(nextPanX, nextPanY, nextZoom);
        zoomRef.current = nextZoom;
        panRef.current = clamped;
        render();
        syncContainerStyle();
    }, [clampPan, render, syncContainerStyle]);
    const rotate = useCallback((quarterTurns) => {
        const img = imgElRef.current;
        const prevFit = getFit(img, rotationRef.current);
        rotationRef.current =
            (rotationRef.current + quarterTurns * 90 + 360) % 360;
        const ratio = getFit(img, rotationRef.current) / prevFit;
        // turn the pan with the image, so the part in view stays in view
        const { x, y } = panRef.current;
        update(zoomRef.current, -y * quarterTurns * ratio, x * quarterTurns * ratio);
    }, [update]);
    const rotateLeft = useCallback(() => rotate(-1), [rotate]);
    const rotateRight = useCallback(() => rotate(1), [rotate]);
    const zoomBy = useCallback((factor) => {
        const zoom = zoomRef.current;
        const next = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom * factor));
        // the pan grows with the zoom, so the point in the view's centre stays there
        const ratio = next / zoom;
        update(next, panRef.current.x * ratio, panRef.current.y * ratio);
    }, [update]);
    const zoomIn = useCallback(() => zoomBy(ZOOM_STEP), [zoomBy]);
    const zoomOut = useCallback(() => zoomBy(1 / ZOOM_STEP), [zoomBy]);
    const resetZoom = useCallback(() => update(MIN_ZOOM, 0, 0), [update]);
    const handleKeyDown = useCallback((evt) => {
        if (evt.defaultPrevented || evt.ctrlKey || evt.altKey || evt.metaKey)
            return;
        switch (evt.key) {
            case "+":
            case "=":
                zoomIn();
                break;
            case "-":
                zoomOut();
                break;
            case "0":
                resetZoom();
                break;
            default: {
                const direction = ARROW_KEYS.get(evt.key);
                // at 1× there is nothing to pan to
                if (!direction || zoomRef.current <= 1)
                    return;
                const container = containerElRef.current;
                if (!container)
                    return;
                const { width, height } = container.getBoundingClientRect();
                // the view moves the given way, so the image moves the other
                update(zoomRef.current, panRef.current.x - direction[0] * width * PAN_STEP, panRef.current.y - direction[1] * height * PAN_STEP);
            }
        }
        evt.preventDefault();
    }, [zoomIn, zoomOut, resetZoom, update]);
    // Callback ref for the container — attaches a native wheel listener with
    // { passive: false } so preventDefault actually stops the parent
    // ScrollListener from scrolling. React registers onWheel as passive,
    // making preventDefault a no-op, so we must use a native listener.
    const containerRef = useCallback((node) => {
        // clean up previous listener
        if (wheelCleanupRef.current) {
            wheelCleanupRef.current();
            wheelCleanupRef.current = null;
        }
        containerElRef.current = node;
        if (!node)
            return;
        const onWheel = (evt) => {
            evt.preventDefault();
            evt.stopPropagation();
            const delta = evt.deltaY > 0 ? 0.9 : 1.1;
            const next = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoomRef.current * delta));
            update(next, panRef.current.x, panRef.current.y);
        };
        node.addEventListener("wheel", onWheel, { passive: false });
        wheelCleanupRef.current = () => node.removeEventListener("wheel", onWheel);
    }, [update]);
    const handlePointerDown = useCallback((evt) => {
        if (evt.pointerType === "touch")
            return;
        if (zoomRef.current <= 1)
            return;
        isPanning.current = true;
        lastPointer.current = { x: evt.clientX, y: evt.clientY };
    }, []);
    const handlePointerMove = useCallback((evt) => {
        if (!isPanning.current || evt.pointerType === "touch")
            return;
        const dx = evt.clientX - lastPointer.current.x;
        const dy = evt.clientY - lastPointer.current.y;
        lastPointer.current = { x: evt.clientX, y: evt.clientY };
        update(zoomRef.current, panRef.current.x + dx, panRef.current.y + dy);
    }, [update]);
    const handlePointerUp = useCallback(() => {
        isPanning.current = false;
    }, []);
    const getPinchDistance = useCallback((touches) => {
        if (touches.length < 2)
            throw new Error("getPinchDistance requires at least 2 touches");
        const t0 = touches[0];
        const t1 = touches[1];
        return Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
    }, []);
    const getTouchCenter = useCallback((touches) => {
        if (touches.length < 2)
            throw new Error("getTouchCenter requires at least 2 touches");
        const t0 = touches[0];
        const t1 = touches[1];
        return {
            x: (t0.clientX + t1.clientX) / 2,
            y: (t0.clientY + t1.clientY) / 2,
        };
    }, []);
    const handleTouchStart = useCallback((evt) => {
        if (evt.touches.length === 2) {
            lastPinchDist.current = getPinchDistance(evt.touches);
            lastTouchCenter.current = getTouchCenter(evt.touches);
        }
        else if (evt.touches.length === 1) {
            lastPointer.current = {
                x: evt.touches[0].clientX,
                y: evt.touches[0].clientY,
            };
        }
    }, [getPinchDistance, getTouchCenter]);
    const handleTouchMove = useCallback((evt) => {
        if (evt.touches.length === 2 && lastPinchDist.current !== null) {
            // always intercept pinch
            evt.preventDefault();
            const dist = getPinchDistance(evt.touches);
            const scale = dist / lastPinchDist.current;
            lastPinchDist.current = dist;
            const center = getTouchCenter(evt.touches);
            const dx = center.x - lastTouchCenter.current.x;
            const dy = center.y - lastTouchCenter.current.y;
            lastTouchCenter.current = center;
            const next = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoomRef.current * scale));
            update(next, panRef.current.x + dx, panRef.current.y + dy);
        }
        else if (evt.touches.length === 1 && zoomRef.current > 1) {
            // only intercept single-finger drag when zoomed in
            evt.preventDefault();
            const dx = evt.touches[0].clientX - lastPointer.current.x;
            const dy = evt.touches[0].clientY - lastPointer.current.y;
            lastPointer.current = {
                x: evt.touches[0].clientX,
                y: evt.touches[0].clientY,
            };
            update(zoomRef.current, panRef.current.x + dx, panRef.current.y + dy);
        }
        // at zoom 1x with single finger: don't preventDefault, let parent scroll
    }, [update, getPinchDistance, getTouchCenter]);
    const handleTouchEnd = useCallback((evt) => {
        if (evt.touches.length < 2) {
            lastPinchDist.current = null;
        }
        if (evt.touches.length === 1) {
            lastPointer.current = {
                x: evt.touches[0].clientX,
                y: evt.touches[0].clientY,
            };
        }
    }, []);
    const handleDoubleClick = useCallback(() => {
        if (zoomRef.current > 1) {
            update(1, 0, 0);
        }
        else {
            update(2, 0, 0);
        }
    }, [update]);
    const containerProps = useMemo(() => ({
        onPointerDown: handlePointerDown,
        onPointerMove: handlePointerMove,
        onPointerUp: handlePointerUp,
        onPointerLeave: handlePointerUp,
        onTouchStart: handleTouchStart,
        onTouchMove: handleTouchMove,
        onTouchEnd: handleTouchEnd,
        onDoubleClick: handleDoubleClick,
    }), [
        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd,
        handleDoubleClick,
    ]);
    return {
        imgRef,
        containerRef,
        containerProps,
        rotateLeft,
        rotateRight,
        zoomIn,
        zoomOut,
        resetZoom,
        zoomed,
        handleKeyDown,
    };
};
export default useImageZoomPan;
