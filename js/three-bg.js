/* ==========================================================================
   Three.js particle mesh background.

   80 points drifting inside a 20x20x10 box, with line segments drawn between
   any pair closer than 3.5 units. Purely decorative — if Three.js failed to
   load, or the user prefers reduced motion, the canvas is simply left blank.
   ========================================================================== */

(function () {
    'use strict';

    const PARTICLE_COUNT = 80;
    const BOUNDS = { x: 20, y: 20, z: 10 };
    const LINK_DISTANCE = 3.5;
    const LINK_UPDATE_INTERVAL = 3;   // rebuild the line mesh every N frames
    const MAX_LINE_SEGMENTS = PARTICLE_COUNT * PARTICLE_COUNT;

    const THEME_COLORS = { dark: 0x8b5cf6, light: 0x7c3aed };

    const canvas = document.getElementById('bgCanvas');
    if (!canvas || typeof THREE === 'undefined') return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let renderer, scene, camera;
    let points, pointsMaterial;
    let lines, lineGeometry, lineMaterial;
    let velocities;
    let frame = 0;
    let paused = false;
    let animationId = null;

    function currentColor() {
        const theme = document.documentElement.getAttribute('data-theme');
        return THEME_COLORS[theme] || THEME_COLORS.dark;
    }

    function init() {
        renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight, false);

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.z = 18;

        const color = currentColor();

        // Particles
        const positions = new Float32Array(PARTICLE_COUNT * 3);
        velocities = new Float32Array(PARTICLE_COUNT * 3);
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            positions[i * 3]     = (Math.random() - 0.5) * BOUNDS.x;
            positions[i * 3 + 1] = (Math.random() - 0.5) * BOUNDS.y;
            positions[i * 3 + 2] = (Math.random() - 0.5) * BOUNDS.z;
            velocities[i * 3]     = (Math.random() - 0.5) * 0.012;
            velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.012;
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.012;
        }

        const pointGeometry = new THREE.BufferGeometry();
        pointGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        pointsMaterial = new THREE.PointsMaterial({
            color: color,
            size: 0.11,
            transparent: true,
            opacity: 0.9,
            sizeAttenuation: true
        });
        points = new THREE.Points(pointGeometry, pointsMaterial);
        scene.add(points);

        // Connection lines — allocated once at max size, drawn partially each update
        lineGeometry = new THREE.BufferGeometry();
        lineGeometry.setAttribute('position',
            new THREE.BufferAttribute(new Float32Array(MAX_LINE_SEGMENTS * 3), 3));
        lineMaterial = new THREE.LineBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.18
        });
        lines = new THREE.LineSegments(lineGeometry, lineMaterial);
        scene.add(lines);

        window.addEventListener('resize', onResize);
        document.addEventListener('visibilitychange', () => { paused = document.hidden; });
        watchTheme();

        animate();
    }

    function onResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight, false);
    }

    /** Recolours the mesh in place when the theme attribute flips. */
    function watchTheme() {
        const observer = new MutationObserver(() => {
            const color = currentColor();
            pointsMaterial.color.setHex(color);
            lineMaterial.color.setHex(color);
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
    }

    function stepParticles() {
        const pos = points.geometry.attributes.position.array;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const ix = i * 3;
            pos[ix]     += velocities[ix];
            pos[ix + 1] += velocities[ix + 1];
            pos[ix + 2] += velocities[ix + 2];

            // Bounce off the bounding box
            if (Math.abs(pos[ix])     > BOUNDS.x / 2) velocities[ix]     *= -1;
            if (Math.abs(pos[ix + 1]) > BOUNDS.y / 2) velocities[ix + 1] *= -1;
            if (Math.abs(pos[ix + 2]) > BOUNDS.z / 2) velocities[ix + 2] *= -1;
        }
        points.geometry.attributes.position.needsUpdate = true;
    }

    /** O(n^2) neighbour scan — cheap enough at 80 points every third frame. */
    function rebuildLinks() {
        const pos = points.geometry.attributes.position.array;
        const linePos = lineGeometry.attributes.position.array;
        let cursor = 0;

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            for (let j = i + 1; j < PARTICLE_COUNT; j++) {
                const dx = pos[i * 3]     - pos[j * 3];
                const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
                const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
                if (dx * dx + dy * dy + dz * dz > LINK_DISTANCE * LINK_DISTANCE) continue;

                linePos[cursor++] = pos[i * 3];
                linePos[cursor++] = pos[i * 3 + 1];
                linePos[cursor++] = pos[i * 3 + 2];
                linePos[cursor++] = pos[j * 3];
                linePos[cursor++] = pos[j * 3 + 1];
                linePos[cursor++] = pos[j * 3 + 2];
            }
        }

        lineGeometry.setDrawRange(0, cursor / 3);
        lineGeometry.attributes.position.needsUpdate = true;
    }

    function animate() {
        animationId = requestAnimationFrame(animate);
        if (paused) return;

        frame++;
        stepParticles();
        if (frame % LINK_UPDATE_INTERVAL === 0) rebuildLinks();

        // Slow camera sway so the mesh reads as three-dimensional
        const t = frame * 0.0012;
        camera.position.x = Math.sin(t) * 1.6;
        camera.position.y = Math.cos(t * 0.8) * 1.1;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
