import * as THREE from "three";
import { describe, expect, it, vi } from "vitest";
import {
  type DrawableCanvas,
  type ElementGL,
  createHtmlSurface,
  installElementUpload,
  terminalProjection,
} from "./html-texture";
import { ownsTextInput, wrapTerminalText } from "./terminal";

describe("3D terminal interaction", () => {
  it("maps DOM corners to the same perspective-projected plane, including resize and rotation", () => {
    const board = new THREE.Mesh(new THREE.PlaneGeometry(12, 15.5));
    board.position.set(-2, 10, -18);
    const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 180);
    camera.position.set(6, 14, 10);
    camera.lookAt(board.position);
    for (const viewport of [
      { width: 1100, height: 680 },
      { width: 390, height: 560 },
    ]) {
      camera.aspect = viewport.width / viewport.height;
      camera.updateProjectionMatrix();
      for (const angle of [-0.32, 0, 0.22]) {
        board.rotation.set(-0.08, angle, -0.025);
        const matrix = terminalProjection(board, camera, viewport, { width: 480, height: 620 });
        for (const [x, y] of [
          [0, 0],
          [480, 0],
          [0, 620],
          [480, 620],
          [240, 310],
        ]) {
          const mapped = new THREE.Vector3(x, y, 0).applyMatrix4(matrix);
          const expected = new THREE.Vector3(x / 40 - 6, 7.75 - y / 40, 0)
            .applyMatrix4(board.matrixWorld)
            .project(camera);
          expect(mapped.x).toBeCloseTo(((expected.x + 1) * viewport.width) / 2, 7);
          expect(mapped.y).toBeCloseTo(((1 - expected.y) * viewport.height) / 2, 7);
        }
      }
    }
    board.geometry.dispose();
    (board.material as THREE.Material).dispose();
  });

  it("leaves IME confirmation, textarea shortcuts, log selection and editable content to the browser", () => {
    const base = { isComposing: false, keyCode: 87, target: { tagName: "DIV" } };
    expect(ownsTextInput(base)).toBe(false);
    expect(ownsTextInput({ ...base, isComposing: true })).toBe(true);
    expect(ownsTextInput({ ...base, keyCode: 229 })).toBe(true);
    expect(ownsTextInput({ ...base, target: { tagName: "TEXTAREA" } })).toBe(true);
    expect(ownsTextInput({ ...base, target: { isContentEditable: true } })).toBe(true);
    expect(ownsTextInput({ ...base, target: { closest: () => ({}) } })).toBe(true);
  });

  it("wraps Japanese notes without breaking emoji or losing explicit line breaks", () => {
    const measure = (value: string) => Array.from(value).length;
    expect(wrapTerminalText("日本語🚀入力\n次の行", 4, measure)).toEqual(["日本語🚀", "入力", "次の行"]);
    expect(wrapTerminalText("\n", 4, measure)).toEqual(["", ""]);
  });
});

describe("HTML texture API compatibility", () => {
  it("keeps the ordinary renderer usable when the native API is unavailable", () => {
    const surface = createHtmlSurface({} as DrawableCanvas, {} as ElementGL, {} as HTMLElement);
    expect(surface.mode).toBe("fallback");
    expect(surface.texture).toBeNull();
    expect(() => surface.dispose()).not.toThrow();
  });
  it("allocates modern texture storage once per size and restores the context on disposal", () => {
    const texture = {};
    const image = {} as HTMLElement;
    const texImage2D = vi.fn();
    const texElementSubImage2D = vi.fn();
    const size = { width: 960, height: 1240 };
    const canvas = { getElementImageDefaultSize: () => size } as unknown as DrawableCanvas;
    const gl = {
      texImage2D,
      texElementSubImage2D,
      getParameter: () => texture,
      RGBA8: 1,
      RGBA: 2,
      UNSIGNED_BYTE: 3,
    } as unknown as ElementGL;
    const dispose = installElementUpload(gl, canvas);
    gl.texElementImage2D?.(10, 1, image);
    gl.texElementImage2D?.(10, 1, image);
    expect(texImage2D).toHaveBeenCalledTimes(1);
    expect(texImage2D).toHaveBeenCalledWith(10, 0, 1, 960, 1240, 0, 2, 3, null);
    expect(texElementSubImage2D).toHaveBeenCalledTimes(2);
    size.width = 480;
    gl.texElementImage2D?.(10, 1, image);
    expect(texImage2D).toHaveBeenCalledTimes(2);
    dispose();
    expect("texElementImage2D" in gl).toBe(false);
  });

  it("keeps an existing legacy upload method intact", () => {
    const legacy = vi.fn();
    const gl = { texElementImage2D: legacy } as unknown as ElementGL;
    installElementUpload(gl, {} as DrawableCanvas)();
    expect(gl.texElementImage2D).toBe(legacy);
  });
});
