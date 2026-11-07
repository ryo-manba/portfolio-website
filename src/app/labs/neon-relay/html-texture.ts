import * as THREE from "three";
import type { NativeMode } from "./terminal";

export type DrawableCanvas = HTMLCanvasElement & {
  content?: string;
  layoutSubtree?: boolean;
  requestPaint?: () => void;
  getElementImageDefaultSize?: (element: HTMLElement) => { width: number; height: number };
  updateElementGeometry?: (element: HTMLElement, options: { canvasTransform: DOMMatrix }) => void;
  clearElementGeometry?: (element: HTMLElement) => void;
};

export type ElementGL = WebGL2RenderingContext & {
  texElementImage2D?: (target: number, format: number, element: HTMLElement) => void;
  texElementSubImage2D?: (target: number, level: number, x: number, y: number, element: HTMLElement) => void;
};

/** Bridge Three r187's legacy upload call to the newer, storage-first API. */
export function installElementUpload(gl: ElementGL, canvas: DrawableCanvas) {
  if (gl.texElementImage2D || !gl.texElementSubImage2D) return () => {};
  const allocations = new WeakMap<WebGLTexture, string>();
  gl.texElementImage2D = (target, _format, element) => {
    const size = canvas.getElementImageDefaultSize?.(element) || {
      width: element.offsetWidth * window.devicePixelRatio,
      height: element.offsetHeight * window.devicePixelRatio,
    };
    const width = Math.max(1, Math.ceil(size.width));
    const height = Math.max(1, Math.ceil(size.height));
    const texture = gl.getParameter(gl.TEXTURE_BINDING_2D) as WebGLTexture | null;
    const key = `${width}:${height}`;
    if (texture && allocations.get(texture) !== key) {
      gl.texImage2D(target, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      allocations.set(texture, key);
    }
    gl.texElementSubImage2D?.(target, 0, 0, 0, element);
  };
  return () => {
    Reflect.deleteProperty(gl, "texElementImage2D");
  };
}

/** Element border-box CSS pixels -> the exact projected Three plane. */
export function terminalProjection(
  board: THREE.Mesh,
  camera: THREE.PerspectiveCamera,
  viewport: { width: number; height: number },
  element: { width: number; height: number },
) {
  board.updateWorldMatrix(true, false);
  camera.updateWorldMatrix(true, false);
  const pixelToLocal = new THREE.Matrix4().set(
    12 / element.width,
    0,
    0,
    -6,
    0,
    -15.5 / element.height,
    0,
    7.75,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1,
  );
  const cssViewport = new THREE.Matrix4().set(
    viewport.width / 2,
    0,
    0,
    viewport.width / 2,
    0,
    -viewport.height / 2,
    0,
    viewport.height / 2,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1,
  );
  return cssViewport
    .multiply(camera.projectionMatrix)
    .multiply(camera.matrixWorldInverse)
    .multiply(board.matrixWorld)
    .multiply(pixelToLocal);
}

export function createHtmlSurface(canvas: DrawableCanvas, gl: ElementGL, element: HTMLElement) {
  const available =
    typeof canvas.requestPaint === "function" &&
    (canvas.content === "drawable" || canvas.layoutSubtree === true) &&
    (typeof gl.texElementImage2D === "function" || typeof gl.texElementSubImage2D === "function") &&
    (typeof canvas.updateElementGeometry === "function" || canvas.layoutSubtree === true);
  const mode: NativeMode = available
    ? typeof canvas.updateElementGeometry === "function"
      ? "native"
      : "legacy"
    : "fallback";
  const restore = available ? installElementUpload(gl, canvas) : () => {};
  const texture = available ? new THREE.HTMLTexture(element) : null;
  if (texture) {
    // RGBA8 DOM snapshots are explicitly decoded in the terminal material.
    texture.colorSpace = THREE.NoColorSpace;
    texture.minFilter = THREE.LinearFilter;
  }
  let previous = "";
  const clearGeometry = () => {
    if (!previous) return;
    canvas.clearElementGeometry?.(element);
    // In the legacy API CSS transforms are also the hit-test geometry.
    if (mode === "legacy") element.style.transform = "scale(0)";
    previous = "";
  };
  return {
    mode,
    texture,
    sync(matrix: THREE.Matrix4) {
      const css = `matrix3d(${matrix.elements.join(",")})`;
      if (previous === css) return;
      if (mode === "native") {
        canvas.updateElementGeometry?.(element, { canvasTransform: new DOMMatrix(matrix.elements) });
      } else if (mode === "legacy") {
        element.style.transformOrigin = "0 0";
        element.style.transform = css;
      }
      previous = css;
    },
    clearGeometry,
    dispose() {
      clearGeometry();
      texture?.dispose();
      restore();
    },
  };
}
