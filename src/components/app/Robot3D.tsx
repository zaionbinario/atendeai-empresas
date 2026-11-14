import { useEffect, useRef } from "react";

/** Procedural 3D robot, rendered with WebGL. No external model download. */
export function Robot3D() {
  const mount = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = mount.current;
    if (!host) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let stopped = false;
    let dispose = () => {};
    import("three").then((THREE) => {
      try {
      if (stopped || !host) return;
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setSize(host.clientWidth, host.clientHeight);
      host.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(34, host.clientWidth / host.clientHeight, .1, 100);
      camera.position.set(0, .1, 10);
      scene.add(new THREE.AmbientLight(0xc7e7ff, 1.8));
      const key = new THREE.DirectionalLight(0xffffff, 3.5); key.position.set(-3, 6, 8); scene.add(key);
      const rim = new THREE.PointLight(0x168cff, 80, 18); rim.position.set(4, 0, -2); scene.add(rim);
      const robot = new THREE.Group(); scene.add(robot);
      const metal = new THREE.MeshStandardMaterial({ color: 0xc6d3e6, metalness: .7, roughness: .22 });
      const dark = new THREE.MeshStandardMaterial({ color: 0x040d22, metalness: .35, roughness: .16 });
      const glow = new THREE.MeshStandardMaterial({ color: 0x5eeaff, emissive: 0x00baff, emissiveIntensity: 2.8, roughness: .15 });
      const line = new THREE.MeshStandardMaterial({ color: 0x55dfff, emissive: 0x0077ff, emissiveIntensity: 1.4 });
      const sphere = (parent: THREE.Group, x: number, y: number, z: number, sx: number, sy: number, sz: number, mat: THREE.Material) => {
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), mat);
        mesh.position.set(x, y, z); mesh.scale.set(sx, sy, sz); parent.add(mesh); return mesh;
      };
      const body = new THREE.Group(); robot.add(body);
      sphere(body, 0, -.85, 0, 1.08, 1.28, .78, metal);
      sphere(body, 0, -.7, .72, .72, .018, .025, line);
      const head = new THREE.Group(); head.position.y = 1.05; robot.add(head);
      sphere(head, 0, .18, 0, 1.45, 1.08, 1.05, metal);
      sphere(head, 0, .05, .79, 1.18, .73, .32, dark);
      sphere(head, -.48, .07, 1.075, .23, .31, .055, glow);
      sphere(head, .48, .07, 1.075, .23, .31, .055, glow);
      sphere(head, -1.45, .15, 0, .22, .62, .48, metal);
      sphere(head, 1.45, .15, 0, .22, .62, .48, metal);
      const leftArm = new THREE.Group(); leftArm.position.set(-1.25, -.5, 0); robot.add(leftArm);
      sphere(leftArm, -.23, -.5, 0, .37, .73, .42, metal);
      const rightArm = new THREE.Group(); rightArm.position.set(1.25, -.5, 0); robot.add(rightArm);
      sphere(rightArm, .23, -.5, 0, .37, .73, .42, metal);
      const mouse = { x: 0, y: 0 };
      const move = (e: PointerEvent) => { mouse.x = Math.max(-1, Math.min(1, (e.clientX / window.innerWidth - .5) * 2)); mouse.y = Math.max(-1, Math.min(1, (e.clientY / window.innerHeight - .5) * 2)); };
      window.addEventListener("pointermove", move, { passive: true });
      const clock = new THREE.Clock();
      let frame = 0;
      const animate = () => {
        frame = requestAnimationFrame(animate);
        const t = clock.getElapsedTime();
        robot.position.y = reducedMotion ? 0 : Math.sin(t * 1.7) * .18;
        robot.rotation.y += ((mouse.x * .15 + (reducedMotion ? 0 : Math.sin(t * .4) * .08)) - robot.rotation.y) * .045;
        robot.rotation.x += (0 - robot.rotation.x) * .045;
        head.rotation.z += ((-mouse.x * .08 + (reducedMotion ? 0 : Math.sin(t * .9) * .025)) - head.rotation.z) * .09;
        head.rotation.y += ((mouse.x * .62) - head.rotation.y) * .09;
        // Screen Y grows downward; Three.js positive X pitches the face upward. Invert it.
        head.rotation.x += ((-mouse.y * .5) - head.rotation.x) * .12;
        leftArm.rotation.z = reducedMotion ? 0 : Math.sin(t * 1.7) * .13;
        rightArm.rotation.z = reducedMotion ? 0 : -Math.sin(t * 1.7 + .8) * .13;
        renderer.render(scene, camera);
      };
      // Reduced-motion users keep mouse tracking, without idle bobbing.
      animate();
      host.dataset.webgl = "ready";
      const resize = new ResizeObserver(() => {
        if (!host.clientWidth || !host.clientHeight) return;
        camera.aspect = host.clientWidth / host.clientHeight; camera.updateProjectionMatrix();
        renderer.setSize(host.clientWidth, host.clientHeight);
      });
      resize.observe(host);
      dispose = () => {
        cancelAnimationFrame(frame); resize.disconnect(); window.removeEventListener("pointermove", move);
        scene.traverse(obj => { if (obj instanceof THREE.Mesh) obj.geometry.dispose(); });
        for (const mat of [metal, dark, glow, line]) mat.dispose();
        renderer.dispose(); renderer.domElement.remove();
      };
      } catch (error) { console.warn("Zyon Robot3D: WebGL indisponível; usando robô de reserva.", error); }
    }).catch((error) => { console.warn("Zyon Robot3D: biblioteca 3D não carregou; usando reserva.", error); });
    return () => { stopped = true; dispose(); };
  }, []);
  return <div ref={mount} aria-hidden="true" className="zyon-robot-container pointer-events-none absolute bottom-[4%] right-[-110px] h-[290px] w-[290px] opacity-85 sm:bottom-[8%] sm:right-[-50px] sm:h-[380px] sm:w-[380px] lg:bottom-[10%] lg:right-[-35px] lg:h-[400px] lg:w-[400px]">
    <svg className="zyon-robot-fallback h-full w-full" viewBox="0 0 400 430" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="robotFallbackMetal" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#eef8ff"/><stop offset=".55" stopColor="#8298b8"/><stop offset="1" stopColor="#405372"/></linearGradient><filter id="robotFallbackGlow"><feGaussianBlur stdDeviation="7"/></filter></defs>
      <g className="zyon-robot-float"><ellipse cx="200" cy="390" rx="92" ry="14" fill="#168cff" opacity=".35" filter="url(#robotFallbackGlow)"/>
      <path d="M105 243Q75 225 66 258L46 324Q45 354 75 358Q103 361 114 331L136 277Z" fill="url(#robotFallbackMetal)" stroke="#a5bfdc" strokeWidth="3"/>
      <path d="M295 243Q325 225 334 258L354 324Q355 354 325 358Q297 361 286 331L264 277Z" fill="url(#robotFallbackMetal)" stroke="#a5bfdc" strokeWidth="3"/>
      <path d="M142 227Q200 207 258 227Q282 260 268 342Q251 389 200 398Q149 389 132 342Q118 260 142 227Z" fill="url(#robotFallbackMetal)" stroke="#a5bfdc" strokeWidth="3"/>
      <path d="M139 335Q200 375 261 335" stroke="#59e8ff" strokeWidth="4" fill="none"/>
      <g className="zyon-robot-head"><ellipse cx="200" cy="125" rx="125" ry="101" fill="url(#robotFallbackMetal)" stroke="#d5e7fa" strokeWidth="4"/>
      <ellipse cx="78" cy="135" rx="19" ry="46" fill="#91a9c7"/><ellipse cx="322" cy="135" rx="19" ry="46" fill="#91a9c7"/>
      <rect x="102" y="86" width="196" height="111" rx="51" fill="#030918" stroke="#6c8db4" strokeWidth="4"/>
      <ellipse cx="158" cy="143" rx="22" ry="27" fill="#5deaff"/><ellipse cx="242" cy="143" rx="22" ry="27" fill="#5deaff"/></g></g>
    </svg>
  </div>;
}
