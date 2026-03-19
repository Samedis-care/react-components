import { useCallback, useEffect, useMemo, useRef } from "react";
const MIN_ZOOM = 1;
const MAX_ZOOM = 10;
const applyTransform = (img, zoom, panX, panY) => {
    if (!img)
        return;
    img.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
};
/**
 * Hook providing zoom (mouse wheel / pinch) and pan (drag) behavior
 * for an image element inside a container. Updates are imperative (ref-based)
 * so no React re-renders occur during interaction.
 *
 * At zoom 1x, single-finger touch and single-pointer drag events are not
 * intercepted, allowing parent scroll-based interactions (e.g. swipe
 * navigation) to work normally. Pinch gestures and mouse wheel zoom always
 * work regardless of zoom level.
 *
 * @param open Whether the zoomable view is currently active. Resets zoom/pan when transitioning to true.
 */
const useImageZoomPan = (open) => {
    const imgElRef = useRef(null);
    const containerElRef = useRef(null);
    const wheelCleanupRef = useRef(null);
    const zoomRef = useRef(1);
    const panRef = useRef({ x: 0, y: 0 });
    const isPanning = useRef(false);
    const lastPointer = useRef({ x: 0, y: 0 });
    const lastPinchDist = useRef(null);
    const lastTouchCenter = useRef({ x: 0, y: 0 });
    const syncContainerStyle = useCallback(() => {
        const el = containerElRef.current;
        if (!el)
            return;
        el.style.touchAction = zoomRef.current > 1 ? "none" : "";
    }, []);
    const imgRef = useCallback((node) => {
        imgElRef.current = node;
        if (node) {
            applyTransform(node, zoomRef.current, panRef.current.x, panRef.current.y);
        }
    }, []);
    useEffect(() => {
        if (open) {
            zoomRef.current = 1;
            panRef.current = { x: 0, y: 0 };
            applyTransform(imgElRef.current, 1, 0, 0);
            syncContainerStyle();
        }
    }, [open, syncContainerStyle]);
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
        applyTransform(imgElRef.current, nextZoom, clamped.x, clamped.y);
        syncContainerStyle();
    }, [clampPan, syncContainerStyle]);
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
    return { imgRef, containerRef, containerProps };
};
export default useImageZoomPan;
