import * as THREE from "three";
import { type DrawableCanvas, type ElementGL, createHtmlSurface, terminalProjection } from "./html-texture";
import { COVER, Simulation, type Snapshot } from "./simulation";
import {
  LOG_HEIGHT,
  LOG_TOP,
  type NativeMode,
  TERMINAL_HEIGHT,
  TERMINAL_WIDTH,
  type TerminalView,
  ownsTextInput,
} from "./terminal";

export type Controller = {
  start: () => void;
  togglePause: () => void;
  repair: () => void;
  hold: (key: string, held: boolean) => void;
  dash: () => void;
  pulse: () => void;
  refreshTexture: () => void;
  dispose: () => void;
  rotateView: () => void;
  capture: () => string;
  setTerminal: (open: boolean, view: TerminalView) => void;
};

type Options = {
  canvas: DrawableCanvas;
  source: HTMLCanvasElement;
  terminal: HTMLElement;
  region: HTMLElement;
  onChange: (snapshot: Snapshot) => void;
  onError: (message: string) => void;
  onNativeMode: (mode: NativeMode, reason?: string) => void;
  onCanvasScroll: (delta: number) => void;
  onCanvasClear: () => void;
  onCanvasInput: () => void;
};

export function createArena({
  canvas,
  source,
  terminal,
  region,
  onChange,
  onError,
  onNativeMode,
  onCanvasScroll,
  onCanvasClear,
  onCanvasInput,
}: Options): Controller {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x07101b);
  scene.fog = new THREE.FogExp2(0x07101b, 0.007);
  const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 180);
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const geometry = <T extends THREE.BufferGeometry>(value: T): T => {
    geometries.add(value);
    return value;
  };
  const material = <T extends THREE.Material>(value: T): T => {
    materials.add(value);
    return value;
  };
  const metal = (color: number, emissive = 0x000000, intensity = 0) =>
    material(
      new THREE.MeshStandardMaterial({
        color,
        emissive,
        emissiveIntensity: intensity,
        roughness: 0.48,
        metalness: 0.55,
      }),
    );
  const glow = (color: number, opacity = 1) =>
    material(new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity, depthWrite: opacity === 1 }));
  const mesh = (shape: THREE.BufferGeometry, surface: THREE.Material, parent: THREE.Object3D = scene) => {
    const object = new THREE.Mesh(shape, surface);
    parent.add(object);
    return object;
  };
  const cyan = glow(0x64e9ef);
  const amber = glow(0xffce72);
  const dark = metal(0x233f54);
  const pink = metal(0xa24569, 0xff335d, 0.8);
  const purple = metal(0x574c8b, 0xa180ff, 0.7);
  scene.add(new THREE.HemisphereLight(0x9aceed, 0x102130, 2.2));
  const sun = new THREE.DirectionalLight(0xc7e5ff, 3.2);
  sun.position.set(8, 25, 12);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26 });
  sun.shadow.bias = -0.0008;
  scene.add(sun);
  const reactorLight = new THREE.PointLight(0x57eee6, 45, 18, 2);
  reactorLight.position.set(0, 3, 0);
  scene.add(reactorLight);

  const floor = mesh(geometry(new THREE.CylinderGeometry(23, 23.6, 1.2, 80)), dark);
  floor.position.y = -0.65;
  floor.receiveShadow = true;
  const ringShape = geometry(new THREE.TorusGeometry(22.4, 0.09, 6, 100));
  const boundary = mesh(ringShape, cyan);
  boundary.rotation.x = Math.PI / 2;
  boundary.position.y = 0.05;
  const innerRing = mesh(geometry(new THREE.TorusGeometry(18.2, 0.025, 4, 100)), glow(0x3b7183, 0.55));
  innerRing.rotation.x = Math.PI / 2;
  innerRing.position.y = 0.02;
  const lineMaterial = material(new THREE.LineBasicMaterial({ color: 0x285164, transparent: true, opacity: 0.65 }));
  const points: number[] = [];
  for (let i = -20; i <= 20; i += 2.5) {
    const span = Math.sqrt(22 * 22 - i * i);
    points.push(-span, 0.01, i, span, 0.01, i, i, 0.01, -span, i, 0.01, span);
  }
  const gridShape = geometry(new THREE.BufferGeometry());
  gridShape.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
  scene.add(new THREE.LineSegments(gridShape, lineMaterial));

  const pillarShape = geometry(new THREE.BoxGeometry(0.32, 1.8, 0.32));
  const pillars = new THREE.InstancedMesh(pillarShape, dark, 48);
  const pillarLights = new THREE.InstancedMesh(geometry(new THREE.BoxGeometry(0.36, 0.14, 0.36)), cyan, 48);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < 48; i++) {
    const angle = (i / 48) * Math.PI * 2;
    dummy.position.set(Math.sin(angle) * 22.8, 0.5, Math.cos(angle) * 22.8);
    dummy.rotation.y = angle;
    dummy.updateMatrix();
    pillars.setMatrixAt(i, dummy.matrix);
    dummy.position.y = 1.45;
    dummy.updateMatrix();
    pillarLights.setMatrixAt(i, dummy.matrix);
  }
  scene.add(pillars, pillarLights);
  const coverShape = geometry(new THREE.CylinderGeometry(1.35, 1.5, 2.4, 6));
  for (const cover of COVER) {
    const block = mesh(coverShape, metal(0x3e596f));
    block.position.set(cover.x, 1.1, cover.z);
    block.castShadow = true;
    const top = mesh(geometry(new THREE.TorusGeometry(1.23, 0.06, 4, 6)), amber);
    top.rotation.x = Math.PI / 2;
    top.position.set(cover.x, 2.33, cover.z);
  }
  const reactor = new THREE.Group();
  scene.add(reactor);
  mesh(geometry(new THREE.CylinderGeometry(2.7, 3.1, 0.28, 48)), metal(0x243e4e), reactor).position.y = 0.12;
  const core = mesh(geometry(new THREE.IcosahedronGeometry(0.9, 1)), metal(0x5bf4e2, 0x64e9ef, 0.7), reactor);
  core.position.y = 2.1;
  const reactorHalo = mesh(geometry(new THREE.TorusGeometry(1.65, 0.045, 6, 64)), cyan, reactor);
  reactorHalo.position.y = 2.1;
  const deposit = mesh(
    geometry(new THREE.TorusGeometry(3.1, 0.12, 8, 64)),
    material(new THREE.MeshBasicMaterial({ color: 0x64e9ef, transparent: true, opacity: 0.4 })),
  );
  deposit.rotation.x = Math.PI / 2;
  deposit.position.y = 0.12;

  const stars = new Float32Array(360 * 3);
  for (let i = 0; i < stars.length; i += 3) {
    const angle = i * 2.399;
    const radius = 38 + (i % 23) * 2;
    stars[i] = Math.cos(angle) * radius;
    stars[i + 1] = 5 + (i % 37);
    stars[i + 2] = Math.sin(angle) * radius;
  }
  const starShape = geometry(new THREE.BufferGeometry());
  starShape.setAttribute("position", new THREE.BufferAttribute(stars, 3));
  scene.add(
    new THREE.Points(
      starShape,
      material(new THREE.PointsMaterial({ color: 0x93b7cf, size: 0.12, transparent: true, opacity: 0.65 })),
    ),
  );

  const player = new THREE.Group();
  scene.add(player);
  const body = mesh(geometry(new THREE.ConeGeometry(0.85, 2.1, 3)), metal(0x74d6e9, 0x123f54, 0.5), player);
  body.rotation.x = Math.PI / 2;
  body.position.y = 0.9;
  body.castShadow = true;
  const wings = mesh(geometry(new THREE.BoxGeometry(2.7, 0.16, 0.72)), metal(0x2f6d88), player);
  wings.position.set(0, 0.75, -0.35);
  mesh(geometry(new THREE.SphereGeometry(0.34, 12, 8)), metal(0x112c40, 0x44d5ff, 0.8), player).position.set(
    0,
    1.05,
    0.05,
  );
  for (const x of [-0.95, 0.95]) {
    const jet = mesh(geometry(new THREE.ConeGeometry(0.18, 0.65, 8)), amber, player);
    jet.rotation.x = -Math.PI / 2;
    jet.position.set(x, 0.65, -0.9);
  }
  const playerRing = mesh(geometry(new THREE.TorusGeometry(1.1, 0.035, 4, 30)), glow(0x9defff, 0.65), player);
  playerRing.rotation.x = Math.PI / 2;
  playerRing.position.y = 0.1;
  const pulseRing = mesh(
    geometry(new THREE.TorusGeometry(1, 0.055, 6, 80)),
    material(new THREE.MeshBasicMaterial({ color: 0x88f4de, transparent: true, opacity: 1 })),
  );
  pulseRing.rotation.x = Math.PI / 2;
  pulseRing.position.y = 0.3;
  pulseRing.visible = false;

  // Both versions occupy the same plane. Only the native version has DOM
  // descendants in this WebGL canvas; the comparison texture is plain pixels.
  const texture = new THREE.CanvasTexture(source);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  const canvasSurface = material(
    new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, toneMapped: false }),
  );
  const board = mesh(geometry(new THREE.PlaneGeometry(12, 15.5)), canvasSurface);
  board.position.set(-2, 10, -18);
  const boardFrame = mesh(geometry(new THREE.BoxGeometry(12.4, 15.9, 0.25)), metal(0x24475a));
  boardFrame.position.copy(board.position);
  const html = createHtmlSurface(canvas, renderer.getContext() as ElementGL, terminal);
  const nativeLog = terminal.querySelector<HTMLElement>("[data-terminal-log]");
  const htmlSurface = material(
    new THREE.MeshBasicMaterial({ map: html.texture, side: THREE.DoubleSide, toneMapped: false }),
  );
  // The experimental upload (including Three r187's legacy call) uses RGBA8,
  // rather than an sRGB hardware texture. Decode once before output conversion.
  htmlSurface.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <map_fragment>",
      "#include <map_fragment>\ndiffuseColor = sRGBTransferEOTF(diffuseColor);",
    );
  };
  htmlSurface.customProgramCacheKey = () => "terminal-html-rgba8";
  onNativeMode(html.mode);
  let nativeReady = false;
  let nativeFailed = false;
  let terminalOpen = false;
  let terminalView: TerminalView = "html";
  let terminalAngle = -0.18;
  let resumeAfterTerminal = false;
  let scrollPointer: { id: number; y: number } | null = null;
  const htmlPaint = () => {
    nativeReady = true;
  };
  canvas.addEventListener("paint", htmlPaint);

  const enemyShape = geometry(new THREE.OctahedronGeometry(0.9));
  const bossShape = geometry(new THREE.IcosahedronGeometry(2.1, 1));
  const hpShape = geometry(new THREE.BoxGeometry(1.6, 0.12, 0.12));
  const hpMaterial = glow(0xffba8c);
  const bulletShape = geometry(new THREE.SphereGeometry(0.2, 6, 4));
  const hostileMaterial = glow(0xff6078);
  const pickupShape = geometry(new THREE.OctahedronGeometry(0.8));
  const healthShape = geometry(new THREE.BoxGeometry(0.7, 0.7, 0.7));
  const healthMaterial = glow(0x78efbe);
  const enemyHaloShape = geometry(new THREE.TorusGeometry(1.2, 0.07, 5, 24));
  const bossHaloShape = geometry(new THREE.TorusGeometry(2.6, 0.07, 5, 24));
  const enemyHaloMaterial = glow(0xb9a0ff);
  const pickupHaloShape = geometry(new THREE.TorusGeometry(1.1, 0.035, 4, 24));
  const enemyMeshes = new Map<number, THREE.Group>();
  const shotMeshes = new Map<number, THREE.Mesh>();
  const pickupMeshes = new Map<number, THREE.Group>();
  const particles = new THREE.InstancedMesh(
    geometry(new THREE.SphereGeometry(0.12, 4, 3)),
    material(new THREE.MeshBasicMaterial()),
    180,
  );
  particles.frustumCulled = false;
  scene.add(particles);
  let game = new Simulation();
  let disposed = false;
  const held = new Set<string>();
  let dashRequested = false;
  let pulseRequested = false;
  let previous = 0;
  let accumulator = 0;
  let notifyClock = 0;
  let visualTime = 0;
  let cameraScale = 1;
  let cameraYaw = Math.atan2(25, 33);
  let cameraPitch = Math.atan2(32, Math.hypot(25, 33));
  let orbitPointer: { id: number; x: number; y: number } | null = null;
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const publish = () => {
    if (!disposed) onChange(game.snapshot());
  };
  const clearInput = () => {
    held.clear();
    dashRequested = false;
    pulseRequested = false;
  };
  const focus = () => region.focus({ preventScroll: true });
  const togglePause = () => {
    if (game.phase === "playing") game.pause();
    else game.resume();
    clearInput();
    focus();
    publish();
  };
  const reset = () => {
    game = new Simulation(Date.now());
    game.start();
    clearInput();
    focus();
    publish();
  };
  const keyDown = (event: KeyboardEvent) => {
    if (!region.contains(document.activeElement)) return;
    const element = event.target as HTMLElement;
    if (ownsTextInput({ isComposing: event.isComposing, keyCode: event.keyCode, target: element })) return;
    if (terminalOpen) return;
    if (element.tagName === "BUTTON" && ["Space", "Enter"].includes(event.code)) return;
    if (
      [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "Space",
        "ShiftLeft",
        "ShiftRight",
        "KeyE",
        "KeyP",
        "Escape",
        "KeyW",
        "KeyA",
        "KeyS",
        "KeyD",
        "KeyR",
      ].includes(event.code)
    )
      event.preventDefault();
    if (event.repeat) return;
    if (["KeyP", "Escape"].includes(event.code)) togglePause();
    else if (event.code === "KeyR") reset();
    else if (event.code.startsWith("Shift")) dashRequested = true;
    else if (event.code === "KeyE") pulseRequested = true;
    else held.add(event.code);
  };
  const keyUp = (event: KeyboardEvent) => {
    held.delete(event.code);
  };
  const pauseOnBlur = () => {
    clearInput();
    game.pause();
    publish();
  };
  const visibility = () => {
    if (document.hidden) pauseOnBlur();
  };
  const pointerDown = (event: PointerEvent) => {
    // Native hits bubble from the real textarea/log. Never focus the game,
    // capture this pointer, or prevent browser text selection/IME here.
    if (terminal.contains(event.target as Node)) return;
    if (terminalOpen) {
      if (terminalView !== "canvas" || event.button !== 0) return;
      const hit = terminalHit(event);
      if (!hit) return;
      if (hit.y >= 152 && hit.y <= 248) onCanvasInput();
      if (hit.y >= 560 && hit.y <= 598) onCanvasClear();
      if (hit.y >= LOG_TOP && hit.y <= LOG_TOP + LOG_HEIGHT && event.pointerType === "touch") {
        scrollPointer = { id: event.pointerId, y: event.clientY };
        canvas.setPointerCapture(event.pointerId);
      }
      return;
    }
    if (event.button === 2) {
      focus();
      orbitPointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
      canvas.setPointerCapture(event.pointerId);
      return;
    }
    if (event.button !== 0) return;
    focus();
    const rect = canvas.getBoundingClientRect();
    pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      (-(event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObject(board)[0];
    if (hit) return;
    held.add("PointerFire");
    canvas.setPointerCapture(event.pointerId);
  };
  const pointerMove = (event: PointerEvent) => {
    if (scrollPointer?.id === event.pointerId) {
      onCanvasScroll(scrollPointer.y - event.clientY);
      scrollPointer.y = event.clientY;
      return;
    }
    if (!orbitPointer || event.pointerId !== orbitPointer.id) return;
    cameraYaw -= (event.clientX - orbitPointer.x) * 0.006;
    cameraPitch = THREE.MathUtils.clamp(cameraPitch + (event.clientY - orbitPointer.y) * 0.004, 0.38, 1.05);
    orbitPointer.x = event.clientX;
    orbitPointer.y = event.clientY;
  };
  const pointerUp = () => {
    held.delete("PointerFire");
    orbitPointer = null;
    scrollPointer = null;
  };
  const terminalHit = (event: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, 1 - ((event.clientY - rect.top) / rect.height) * 2);
    raycaster.setFromCamera(pointer, camera);
    const uv = raycaster.intersectObject(board)[0]?.uv;
    return uv ? { x: uv.x * TERMINAL_WIDTH, y: (1 - uv.y) * TERMINAL_HEIGHT } : null;
  };
  const wheel = (event: WheelEvent) => {
    if (!terminalOpen || event.ctrlKey) return;
    if (terminalView === "html" && html.mode !== "legacy") return;
    const hit = terminalHit(event);
    if (!hit || hit.x < 20 || hit.x > 460 || hit.y < LOG_TOP || hit.y > LOG_TOP + LOG_HEIGHT) return;
    const delta = event.deltaY * (event.deltaMode === 1 ? 27 : event.deltaMode === 2 ? LOG_HEIGHT : 1);
    event.preventDefault();
    if (terminalView === "html") {
      // Some layoutsubtree builds route wheel events to WebGL, even though
      // pointer events hit DOM children. Forward only the delta; HTML still
      // owns text layout, clipping, selection, scrollbars and keyboard scrolling.
      nativeLog?.scrollBy({ top: delta, behavior: "auto" });
    } else onCanvasScroll(delta);
  };
  const contextMenu = (event: Event) => {
    if (!terminal.contains(event.target as Node)) event.preventDefault();
  };
  const lostContext = (event: Event) => {
    event.preventDefault();
    game.pause();
    renderer.setAnimationLoop(null);
    onError("3D描画が中断されました。再読み込みして再開できます。");
  };
  window.addEventListener("keydown", keyDown);
  window.addEventListener("keyup", keyUp);
  window.addEventListener("blur", pauseOnBlur);
  document.addEventListener("visibilitychange", visibility);
  canvas.addEventListener("pointerdown", pointerDown);
  canvas.addEventListener("pointermove", pointerMove);
  canvas.addEventListener("contextmenu", contextMenu);
  canvas.addEventListener("pointerup", pointerUp);
  canvas.addEventListener("pointercancel", pointerUp);
  canvas.addEventListener("lostpointercapture", pointerUp);
  canvas.addEventListener("webglcontextlost", lostContext);
  canvas.addEventListener("wheel", wheel, { passive: false });
  canvas.addEventListener("focusin", clearInput);
  const resize = new ResizeObserver(() => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    cameraScale = camera.aspect < 1 ? 1.35 : 1;
  });
  resize.observe(canvas);
  const removeStale = <T extends THREE.Object3D>(map: Map<number, T>, ids: Set<number>) => {
    map.forEach((value, id) => {
      if (!ids.has(id)) {
        scene.remove(value);
        map.delete(id);
      }
    });
  };

  renderer.setAnimationLoop((timestamp) => {
    if (disposed) return;
    const delta = previous ? Math.min((timestamp - previous) / 1000, 0.1) : 0;
    previous = timestamp;
    visualTime += delta;
    accumulator = Math.min(accumulator + delta, 0.1);
    const right =
      (held.has("KeyD") || held.has("ArrowRight") ? 1 : 0) - (held.has("KeyA") || held.has("ArrowLeft") ? 1 : 0);
    const forward =
      (held.has("KeyW") || held.has("ArrowUp") ? 1 : 0) - (held.has("KeyS") || held.has("ArrowDown") ? 1 : 0);
    while (accumulator >= 1 / 60) {
      game.step(1 / 60, {
        x: right * Math.cos(cameraYaw) - forward * Math.sin(cameraYaw),
        z: -right * Math.sin(cameraYaw) - forward * Math.cos(cameraYaw),
        fire: held.has("Space") || held.has("PointerFire"),
        dash: dashRequested,
        pulse: pulseRequested,
      });
      dashRequested = false;
      pulseRequested = false;
      accumulator -= 1 / 60;
    }
    notifyClock += delta;
    if (notifyClock > 0.1) {
      publish();
      notifyClock = 0;
    }
    core.rotation.y = visualTime * 0.5;
    core.rotation.z = visualTime * 0.2;
    reactorHalo.rotation.set(visualTime * 0.25 + 0.6, 0, visualTime * 0.35);
    const canDeposit = game.cores >= 3 && !game.enemies.some((enemy) => enemy.kind === "boss");
    (deposit.material as THREE.MeshBasicMaterial).opacity = canDeposit ? 0.65 + Math.sin(visualTime * 5) * 0.3 : 0.22;
    player.position.set(game.player.x, Math.sin(visualTime * 7) * 0.06, game.player.z);
    player.rotation.y = game.player.angle;
    player.visible = game.player.invulnerable <= 0 || Math.sin(visualTime * 35) > -0.2;
    pulseRing.visible = game.pulseRing > 0;
    pulseRing.position.set(game.pulseOrigin.x, 0.35, game.pulseOrigin.z);
    pulseRing.scale.setScalar((1 - game.pulseRing / 0.65) * 8 + 0.1);
    (pulseRing.material as THREE.MeshBasicMaterial).opacity = game.pulseRing / 0.65;

    for (const enemy of game.enemies) {
      let object = enemyMeshes.get(enemy.id);
      if (!object) {
        object = new THREE.Group();
        scene.add(object);
        enemyMeshes.set(enemy.id, object);
        const shell = mesh(
          enemy.kind === "boss" ? bossShape : enemyShape,
          enemy.kind === "scout" ? pink : purple,
          object,
        );
        shell.castShadow = true;
        const bar = mesh(hpShape, hpMaterial, object);
        bar.name = "health";
        bar.position.y = enemy.kind === "boss" ? 2.8 : 1.4;
        if (enemy.kind !== "scout") {
          const shield = mesh(enemy.kind === "boss" ? bossHaloShape : enemyHaloShape, enemyHaloMaterial, object);
          shield.rotation.x = 0.8;
        }
      }
      object.position.set(
        enemy.x,
        enemy.kind === "boss" ? 2.2 : 1.25 + Math.sin(visualTime * 4 + enemy.id) * 0.15,
        enemy.z,
      );
      object.rotation.y += delta * (enemy.kind === "boss" ? 0.4 : 1.4);
      const bar = object.getObjectByName("health");
      if (bar) bar.scale.x = Math.max(0.01, enemy.hp / enemy.maxHp);
    }
    removeStale(enemyMeshes, new Set(game.enemies.map((value) => value.id)));
    for (const shot of game.shots) {
      let object = shotMeshes.get(shot.id);
      if (!object) {
        object = mesh(bulletShape, shot.hostile ? hostileMaterial : cyan);
        shotMeshes.set(shot.id, object);
      }
      object.position.set(shot.x, 0.95, shot.z);
      object.scale.setScalar(shot.hostile ? 1.5 : 1);
    }
    removeStale(shotMeshes, new Set(game.shots.map((value) => value.id)));
    for (const pickup of game.pickups) {
      let object = pickupMeshes.get(pickup.id);
      if (!object) {
        object = new THREE.Group();
        scene.add(object);
        pickupMeshes.set(pickup.id, object);
        mesh(
          pickup.kind === "core" ? pickupShape : healthShape,
          pickup.kind === "core" ? amber : healthMaterial,
          object,
        );
        const halo = mesh(pickupHaloShape, pickup.kind === "core" ? amber : healthMaterial, object);
        halo.rotation.x = Math.PI / 2;
        halo.position.y = -0.8;
      }
      object.position.set(pickup.x, 1.3 + Math.sin(visualTime * 2.5 + pickup.id) * 0.2, pickup.z);
      object.rotation.y += delta;
    }
    removeStale(pickupMeshes, new Set(game.pickups.map((value) => value.id)));
    particles.count = game.sparks.length;
    const color = new THREE.Color();
    game.sparks.forEach((spark, index) => {
      dummy.position.set(spark.x, 0.4 + Math.sin((0.7 - spark.life) * 4) * 1.1, spark.z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(Math.max(0.1, spark.life * 2));
      dummy.updateMatrix();
      particles.setMatrixAt(index, dummy.matrix);
      particles.setColorAt(index, color.setHex(spark.color));
    });
    dummy.scale.setScalar(1);
    particles.instanceMatrix.needsUpdate = true;
    if (particles.instanceColor) particles.instanceColor.needsUpdate = true;
    const offset = new THREE.Vector3(game.player.x * 0.28, 0, game.player.z * 0.28);
    const cameraRadius = 52.3 * cameraScale;
    if (terminalOpen) {
      const halfFov = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const distance = Math.max(15.5 / (2 * halfFov * 0.76), 12 / (2 * halfFov * camera.aspect * 0.84));
      camera.position.copy(board.position).add(new THREE.Vector3(distance * 0.15, distance * 0.06, distance));
      camera.lookAt(board.position);
      board.rotation.set(-0.08, terminalAngle, -0.025);
      board.scale.setScalar(1);
    } else {
      camera.position.lerp(
        new THREE.Vector3(
          Math.sin(cameraYaw) * Math.cos(cameraPitch) * cameraRadius,
          Math.sin(cameraPitch) * cameraRadius,
          Math.cos(cameraYaw) * Math.cos(cameraPitch) * cameraRadius,
        ).add(offset),
        1 - Math.exp(-delta * 3),
      );
      camera.lookAt(offset.x, 0, offset.z);
      board.lookAt(camera.position);
      board.scale.setScalar(0.65);
    }
    boardFrame.scale.copy(board.scale);
    boardFrame.quaternion.copy(board.quaternion);
    boardFrame.position
      .copy(board.position)
      .addScaledVector(new THREE.Vector3(0, 0, -1).applyQuaternion(board.quaternion), 0.2);
    const native = terminalView === "html" && html.texture && nativeReady && !nativeFailed;
    board.material = native ? htmlSurface : canvasSurface;
    try {
      if (native && terminalOpen) {
        html.sync(
          terminalProjection(
            board,
            camera,
            { width: canvas.clientWidth, height: canvas.clientHeight },
            { width: terminal.offsetWidth, height: terminal.offsetHeight },
          ),
        );
      } else html.clearGeometry();
      renderer.render(scene, camera);
    } catch {
      if (native) {
        nativeFailed = true;
        html.clearGeometry();
        board.material = canvasSurface;
        onNativeMode("fallback", "HTML-in-Canvasの3D描画に失敗したため、普通のCanvasへ切り替えました。");
        renderer.resetState();
      } else {
        renderer.setAnimationLoop(null);
        onError("3D描画が中断されました。再読み込みして再開できます。");
      }
    }
  });
  camera.position.set(25, 32, 33);
  camera.lookAt(0, 0, 0);
  publish();
  return {
    start: reset,
    togglePause,
    repair: () => {
      game.repair();
      focus();
      publish();
    },
    hold: (key, active) => {
      if (active) held.add(key);
      else held.delete(key);
    },
    dash: () => {
      dashRequested = true;
      focus();
    },
    pulse: () => {
      pulseRequested = true;
      focus();
    },
    refreshTexture: () => {
      texture.needsUpdate = true;
    },
    rotateView: () => {
      if (terminalOpen) terminalAngle = terminalAngle >= 0.2 ? -0.32 : terminalAngle + 0.18;
      else cameraYaw += Math.PI / 4;
      focus();
    },
    capture: () => {
      renderer.render(scene, camera);
      focus();
      return canvas.toDataURL("image/png");
    },
    setTerminal: (open, view) => {
      if (open && !terminalOpen) {
        resumeAfterTerminal = game.phase === "playing";
        game.pause();
      } else if (!open && terminalOpen) {
        if (resumeAfterTerminal) game.resume();
        focus();
      }
      terminalOpen = open;
      terminalView = view;
      clearInput();
      if (!open || view !== "html") html.clearGeometry();
      if (open && view === "html") canvas.requestPaint?.();
      publish();
    },
    dispose: () => {
      disposed = true;
      renderer.setAnimationLoop(null);
      resize.disconnect();
      clearInput();
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
      window.removeEventListener("blur", pauseOnBlur);
      document.removeEventListener("visibilitychange", visibility);
      canvas.removeEventListener("pointerdown", pointerDown);
      canvas.removeEventListener("pointerup", pointerUp);
      canvas.removeEventListener("pointermove", pointerMove);
      canvas.removeEventListener("contextmenu", contextMenu);
      canvas.removeEventListener("pointercancel", pointerUp);
      canvas.removeEventListener("lostpointercapture", pointerUp);
      canvas.removeEventListener("webglcontextlost", lostContext);
      canvas.removeEventListener("paint", htmlPaint);
      canvas.removeEventListener("wheel", wheel);
      canvas.removeEventListener("focusin", clearInput);
      for (const value of Array.from(geometries)) value.dispose();
      for (const value of Array.from(materials)) value.dispose();
      particles.dispose();
      pillars.dispose();
      pillarLights.dispose();
      texture.dispose();
      html.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
