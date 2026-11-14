import { useEffect, useRef } from "react";

/** Procedural 3D robot, rendered with WebGL. No external model download. */
export function Robot3D() {
  const mount = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = mount.current;
    if (!host || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let stopped = false;
    let dispose = () => {};
    import("three").then((THREE) => {
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
      const move = (e: PointerEvent) => { mouse.x = (e.clientX / window.innerWidth - .5) * 2; mouse.y = (e.clientY / window.innerHeight - .5) * 2; };
      window.addEventListener("pointermove", move, { passive: true });
      const clock = new THREE.Clock();
      let frame = 0;
      const animate = () => {
        frame = requestAnimationFrame(animate);
        const t = clock.getElapsedTime();
        robot.position.y = Math.sin(t * 1.7) * .18;
        robot.rotation.y += ((mouse.x * .42 + Math.sin(t * .4) * .12) - robot.rotation.y) * .045;
        robot.rotation.x += ((-mouse.y * .16) - robot.rotation.x) * .045;
        head.rotation.z = Math.sin(t * .9) * .075;
        head.rotation.y = Math.sin(t * .7) * .13;
        leftArm.rotation.z = Math.sin(t * 1.7) * .13;
        rightArm.rotation.z = -Math.sin(t * 1.7 + .8) * .13;
        renderer.render(scene, camera);
      };
      animate();
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
    }).catch(() => { /* Login stays functional without WebGL. */ });
    return () => { stopped = true; dispose(); };
  }, []);
  return <div ref={mount} aria-hidden="true" className="pointer-events-none absolute bottom-[2%] right-[-80px] h-[330px] w-[330px] opacity-75 sm:bottom-[5%] sm:right-[1%] sm:h-[460px] sm:w-[460px] lg:right-[5%] lg:h-[520px] lg:w-[520px]" />;
}
