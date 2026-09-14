(() => {
    window.addEventListener("DOMContentLoaded", () => {
        const canvas = document.getElementById('snitch-canvas');
        if (!canvas) return;

        // UI Elements
        const snitchDock = document.getElementById('snitch-dock');
        const hud = document.getElementById('snitch-hud');
        const btnRelease = document.getElementById('btn-release-snitch');
        const btnResume = document.getElementById('btn-quick-resume');
        const btnTop = document.getElementById('btn-fly-top');
        const btnCancel = document.getElementById('cancel-snitch-btn');
        const modalReward = document.getElementById('snitch-reward-modal');
        const closeReward = document.querySelector('.close-reward-modal');
        const btnRest = document.getElementById('btn-rest-snitch');

        // Scene, Camera, Renderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.set(0, 0, 10);

        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance'
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.35;

        canvas.style.pointerEvents = 'none';

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xfff5e6, 1.4);
        scene.add(ambientLight);
        const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
        keyLight.position.set(5, 8, 5);
        scene.add(keyLight);
        const fillLight = new THREE.DirectionalLight(0xffd700, 1.8);
        fillLight.position.set(-5, -2, 2);
        scene.add(fillLight);
        const rimLight = new THREE.DirectionalLight(0xfffaed, 2.2);
        rimLight.position.set(0, 5, -5);
        scene.add(rimLight);

        // Shader uniforms
        const customUniforms = {
            uTime: { value: 0 },
            uFlapSpeed: { value: 2.0 }
        };

        const snitchGroup = new THREE.Group();
        scene.add(snitchGroup);
        let modelLoaded = false;

        // Load 3D Model
        const loader = new THREE.GLTFLoader();
        loader.load(
            'assets/golden_snitch_detailed.glb',
            (gltf) => {
                const model = gltf.scene;

                model.traverse((child) => {
                    if (child.isMesh && child.material) {
                        const mats = Array.isArray(child.material) ? child.material : [child.material];
                        mats.forEach((mat) => {
                            mat.metalness = 0.75;
                            mat.roughness = 0.22;
                            mat.side = THREE.DoubleSide;

                            mat.onBeforeCompile = (shader) => {
                                shader.uniforms.uTime = customUniforms.uTime;
                                shader.uniforms.uFlapSpeed = customUniforms.uFlapSpeed;
                                shader.vertexShader = 'uniform float uTime;\nuniform float uFlapSpeed;\n' + shader.vertexShader;
                                shader.vertexShader = shader.vertexShader.replace(
                                    '#include <begin_vertex>',
                                    `
                                    #include <begin_vertex>
                                    if (abs(position.x) > 1.0) {
                                        float wingDist = abs(position.x) - 1.0;
                                        float flap = sin(uTime * uFlapSpeed) * 0.38 * wingDist;
                                        transformed.y += flap;
                                        transformed.z += cos(uTime * uFlapSpeed) * 0.20 * wingDist;
                                    }
                                    `
                                );
                            };
                        });
                    }
                });

                // Scale: Original majestic size (2.0)
                const box = new THREE.Box3().setFromObject(model);
                const size = new THREE.Vector3();
                box.getSize(size);
                const maxDim = Math.max(size.x, size.y, size.z);
                const targetScale = 2.0 / (maxDim || 1);
                model.scale.setScalar(targetScale);

                // Body sphere is naturally centered at (0,0,0)
                model.position.set(0, 0, 0);

                snitchGroup.add(model);

                // Place initially into rest dock
                updateRestTarget();
                snitchGroup.position.copy(restTarget);

                modelLoaded = true;
            },
            undefined,
            (err) => console.error('Error loading Snitch GLB:', err)
        );

        // Window resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            updateRestTarget();
        });

        function getFrustumBounds() {
            const vFOV = THREE.MathUtils.degToRad(camera.fov);
            const h = 2 * Math.tan(vFOV / 2) * camera.position.z;
            const w = h * camera.aspect;
            return {
                minX: -w * 0.46, maxX: w * 0.46,
                minY: -h * 0.43, maxY: h * 0.43
            };
        }

        const mouseNorm = new THREE.Vector2(0, 0);
        let lastInteractionTime = performance.now();

        window.addEventListener('mousemove', (e) => {
            lastInteractionTime = performance.now();
            mouseNorm.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouseNorm.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        function getMouseWorldPos() {
            const vec = new THREE.Vector3(mouseNorm.x, mouseNorm.y, 0.5);
            vec.unproject(camera);
            vec.sub(camera.position).normalize();
            const distance = -camera.position.z / vec.z;
            return new THREE.Vector3().copy(camera.position).add(vec.multiplyScalar(distance));
        }

        // --- State Machine ---
        // States: 'REST', 'GAME', 'RETURN', 'FLY_TOP', 'MODAL'
        let state = 'REST';
        let stateTimer = 0;
        let restTarget = new THREE.Vector3();
        let gameTarget = new THREE.Vector3();
        let velocity = new THREE.Vector3(0, 0, 0);

        // Fly-to-Top choreography tracking
        let flyTopStartTime = 0;
        let initialScrollY = 0;
        let crownTarget = new THREE.Vector3();

        // Moderate, engaging flight speed
        const maxSpeedGame = 0.082;
        const maxForceGame = 0.0035;

        function updateRestTarget() {
            // Dock center: right: 65px + 50px = 115px; bottom: 60px + 50px = 110px
            const x = window.innerWidth - 115;
            const y = window.innerHeight - 110;

            const vec = new THREE.Vector3();
            vec.set((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1, 0.5);
            vec.unproject(camera);
            vec.sub(camera.position).normalize();
            const distance = -camera.position.z / vec.z;
            restTarget.copy(camera.position).add(vec.multiplyScalar(distance));
        }

        // Computes position directly above "Naveenkumar Narsozhan" WHEN SCROLLED TO TOP (scrollY = 0)
        function getHeroCrownPosition() {
            const titleEl = document.querySelector('.hero-content h1');
            const bounds = getFrustumBounds();
            
            let screenX = window.innerWidth / 2;
            let screenY = window.innerHeight * 0.32; // Default safe fallback above hero center

            if (titleEl) {
                // Document-relative Y position (constant regardless of current scroll!)
                const docTop = titleEl.getBoundingClientRect().top + window.scrollY;
                // Place 60px directly above the title text
                screenY = docTop - 60;
                const rect = titleEl.getBoundingClientRect();
                screenX = rect.left + rect.width / 2;
            }

            // Ensure screenY is always cleanly within the upper visible quadrant of screen
            screenY = THREE.MathUtils.clamp(screenY, 80, window.innerHeight * 0.42);

            const vec = new THREE.Vector3(
                (screenX / window.innerWidth) * 2 - 1,
                -(screenY / window.innerHeight) * 2 + 1,
                0.5
            );
            vec.unproject(camera);
            vec.sub(camera.position).normalize();
            const dist = -camera.position.z / vec.z;
            const pos = new THREE.Vector3().copy(camera.position).add(vec.multiplyScalar(dist));

            // Hard safety clamp in 3D world space (NEVER exceeds bounds.maxY - 1.1)
            pos.x = THREE.MathUtils.clamp(pos.x, bounds.minX + 0.8, bounds.maxX - 0.8);
            pos.y = THREE.MathUtils.clamp(pos.y, 0.4, bounds.maxY - 1.1);
            pos.z = 0;
            return pos;
        }

        function getCubicBezier(p0, p1, p2, p3, t) {
            const u = 1 - t;
            const tt = t * t;
            const uu = u * u;
            const uuu = uu * u;
            const ttt = tt * t;
            return uuu * p0 + 3 * uu * t * p1 + 3 * u * tt * p2 + ttt * p3;
        }

        function pickRandomGameTarget() {
            const b = getFrustumBounds();
            return new THREE.Vector3(
                THREE.MathUtils.lerp(b.minX, b.maxX, Math.random()),
                THREE.MathUtils.lerp(b.minY, b.maxY, Math.random()),
                (Math.random() - 0.5) * 1.5 + 0.5
            );
        }

        // Click handler: Moderate, rewarding catch radius (135px)
        window.addEventListener('click', (e) => {
            lastInteractionTime = performance.now();
            if (state === 'GAME' && modelLoaded) {
                const screenPos = snitchGroup.position.clone();
                screenPos.project(camera);
                const snitchX = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
                const snitchY = -(screenPos.y * 0.5 - 0.5) * window.innerHeight;

                const dist = Math.hypot(e.clientX - snitchX, e.clientY - snitchY);
                if (dist < 135) {
                    catchSnitch();
                }
            }
        });

        function setRestMode() {
            state = 'RETURN';
            hud.classList.remove('visible');
            updateRestTarget();
        }

        function setGameMode() {
            state = 'GAME';
            stateTimer = 0;
            lastInteractionTime = performance.now();
            gameTarget = pickRandomGameTarget();
            hud.classList.add('visible');
            snitchDock.style.display = 'none';

            createSparkleBurst(window.innerWidth - 115, window.innerHeight - 110);
        }

        function catchSnitch() {
            state = 'MODAL';
            hud.classList.remove('visible');

            const screenPos = snitchGroup.position.clone();
            screenPos.project(camera);
            const px = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
            const py = (screenPos.y * -0.5 + 0.5) * window.innerHeight;
            createSparkleBurst(px, py, 60);

            modalReward.style.display = 'flex';
            modalReward.classList.remove('hidden');
        }

        function createSparkleBurst(x, y, count = 20) {
            for (let i = 0; i < count / 3; i++) {
                const e = new MouseEvent('mousemove', {
                    clientX: x + (Math.random() - 0.5) * 60,
                    clientY: y + (Math.random() - 0.5) * 60
                });
                window.dispatchEvent(e);
            }
        }

        // --- Fly to Top Visibility Handling ---
        function updateFlyTopVisibility() {
            if (!btnTop) return;
            // When already near top of the page (< 120px scroll), hide option
            if (window.scrollY < 120) {
                btnTop.classList.add('hidden-at-top');
            } else {
                btnTop.classList.remove('hidden-at-top');
            }
        }

        window.addEventListener('scroll', updateFlyTopVisibility, { passive: true });
        updateFlyTopVisibility();

        // UI Listeners
        btnRelease.addEventListener('click', (e) => {
            e.stopPropagation();
            setGameMode();
        });

        btnCancel.addEventListener('click', (e) => {
            e.stopPropagation();
            setRestMode();
        });

        btnResume.addEventListener('click', (e) => {
            e.stopPropagation();
            state = 'MODAL';
            snitchDock.style.display = 'none';
            modalReward.style.display = 'flex';
            modalReward.classList.remove('hidden');
            document.querySelector('.reward-title').textContent = "Naveen's Quick Dossier";
            document.querySelector('.reward-subtitle').textContent = "Straight to the point.";
        });

        btnTop.addEventListener('click', (e) => {
            e.stopPropagation();
            // Disallow clicking if already at the top of the page
            if (window.scrollY < 120) return;

            state = 'FLY_TOP';
            flyTopStartTime = performance.now();
            initialScrollY = window.scrollY;
            snitchDock.style.display = 'none';
        });

        const closeModal = () => {
            modalReward.style.display = 'none';
            modalReward.classList.add('hidden');
            document.querySelector('.reward-title').textContent = "Golden Snitch Caught!";
            document.querySelector('.reward-subtitle').textContent = "+150 Points to your House";
            setRestMode();
        };

        closeReward.addEventListener('click', closeModal);
        btnRest.addEventListener('click', closeModal);

        // --- Animation Loop ---
        const clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);

            const delta = Math.min(clock.getDelta(), 0.1);
            const elapsedTime = clock.getElapsedTime();
            customUniforms.uTime.value = elapsedTime;

            if (modelLoaded) {
                const now = performance.now();
                const bounds = getFrustumBounds();
                updateRestTarget();

                let flapSpeedTarget = 2.0;

                if (state === 'REST') {
                    // Permanently locked in dock center with gentle breathing
                    snitchGroup.position.x = restTarget.x + Math.sin(elapsedTime * 2.0) * 0.03;
                    snitchGroup.position.y = restTarget.y + Math.cos(elapsedTime * 1.5) * 0.03;
                    snitchGroup.position.z = restTarget.z;
                    velocity.set(0, 0, 0);

                    // Face directly forward (identity quaternion)
                    snitchGroup.quaternion.slerp(new THREE.Quaternion(), 0.1);
                    flapSpeedTarget = 2.0;
                    snitchDock.style.display = 'block';

                } else if (state === 'RETURN') {
                    // Direct smooth homing flight into dock center (no orbiting!)
                    flapSpeedTarget = 26.0;
                    const toRest = new THREE.Vector3().subVectors(restTarget, snitchGroup.position);
                    const dist = toRest.length();

                    if (dist < 0.08) {
                        snitchGroup.position.copy(restTarget);
                        velocity.set(0, 0, 0);
                        state = 'REST';
                        snitchDock.style.display = 'block';
                    } else {
                        const speed = THREE.MathUtils.clamp(dist * 0.08 + 0.03, 0.03, 0.12);
                        toRest.normalize().multiplyScalar(speed);
                        snitchGroup.position.add(toRest);

                        // Bank into return flight path
                        const forward = toRest.clone().normalize();
                        const up = new THREE.Vector3(0, 1, 0);
                        const bankAngle = THREE.MathUtils.clamp(-toRest.x * 2.5, -0.5, 0.5);
                        up.applyAxisAngle(forward, bankAngle);

                        const rotMatrix = new THREE.Matrix4();
                        rotMatrix.lookAt(snitchGroup.position, snitchGroup.position.clone().add(forward), up);
                        const targetQuat = new THREE.Quaternion().setFromRotationMatrix(rotMatrix);
                        snitchGroup.quaternion.slerp(targetQuat, 0.12);
                    }

                } else if (state === 'GAME') {
                    stateTimer += delta;
                    flapSpeedTarget = 48.0;

                    // Inactivity timeout: 20 seconds
                    if ((now - lastInteractionTime) > 20000) {
                        setRestMode();
                    } else {
                        // Pick new waypoint if reached
                        if (snitchGroup.position.distanceTo(gameTarget) < 1.0) {
                            gameTarget = pickRandomGameTarget();
                        }

                        // Moderate, playful evasion when mouse approaches
                        const mouseWorld = getMouseWorldPos();
                        const distToMouse = snitchGroup.position.distanceTo(mouseWorld);

                        if (distToMouse < 1.1) {
                            const fleeVector = new THREE.Vector3().subVectors(snitchGroup.position, mouseWorld).normalize();
                            gameTarget.copy(snitchGroup.position).add(fleeVector.multiplyScalar(1.3));
                            gameTarget.x = THREE.MathUtils.clamp(gameTarget.x, bounds.minX + 1.2, bounds.maxX - 1.2);
                            gameTarget.y = THREE.MathUtils.clamp(gameTarget.y, bounds.minY + 1.2, bounds.maxY - 1.2);
                        }

                        // Steering physics towards gameTarget
                        const desired = new THREE.Vector3().subVectors(gameTarget, snitchGroup.position);
                        const dist = desired.length();

                        if (dist > 0.01) {
                            desired.normalize();
                            const speed = dist < 2.0 ? maxSpeedGame * (dist / 2.0 * 0.7 + 0.3) : maxSpeedGame;
                            desired.multiplyScalar(speed);

                            const steer = new THREE.Vector3().subVectors(desired, velocity);
                            steer.clampLength(0, maxForceGame);
                            velocity.add(steer);
                        }

                        // Soft boundary turnaround
                        const edgeMargin = 1.0;
                        if (snitchGroup.position.x > bounds.maxX - edgeMargin) velocity.x -= 0.005;
                        if (snitchGroup.position.x < bounds.minX + edgeMargin) velocity.x += 0.005;
                        if (snitchGroup.position.y > bounds.maxY - edgeMargin) velocity.y -= 0.005;
                        if (snitchGroup.position.y < bounds.minY + edgeMargin) velocity.y += 0.005;

                        velocity.clampLength(0, maxSpeedGame);
                        snitchGroup.position.add(velocity);

                        // Orientation & Banking
                        if (velocity.lengthSq() > 0.0001) {
                            const forward = velocity.clone().normalize();
                            const up = new THREE.Vector3(0, 1, 0);
                            const bankAngle = THREE.MathUtils.clamp(-velocity.x * 2.0, -0.6, 0.6);
                            up.applyAxisAngle(forward, bankAngle);

                            const rotMatrix = new THREE.Matrix4();
                            rotMatrix.lookAt(snitchGroup.position, snitchGroup.position.clone().add(forward), up);
                            const targetQuat = new THREE.Quaternion().setFromRotationMatrix(rotMatrix);
                            snitchGroup.quaternion.slerp(targetQuat, 0.08);
                        }
                    }

                } else if (state === 'FLY_TOP') {
                    // --- Choreographed "Option 1 Dramatic Dip + Option 3 Crown Spotlight" ---
                    // 100% on-screen, clearly noticeable anticipation crouch, and a generous 2-second name spotlight
                    const elapsed = (now - flyTopStartTime) / 1000;
                    const totalDuration = 4.80;

                    if (elapsed >= totalDuration) {
                        setRestMode();
                    } else if (elapsed < 0.50) {
                        // --- PHASE 1: Noticeable Anticipation Dip (0.0s - 0.50s) ---
                        // Clearly crouches down ~35px in the dock as wings buzz aggressively
                        const dipProgress = elapsed / 0.50;
                        flapSpeedTarget = 95.0; // Hyper wing flutter gathering power

                        // Dramatic, clearly visible dip curve
                        const dipAmount = Math.sin(dipProgress * Math.PI) * 0.35;
                        snitchGroup.position.x = restTarget.x;
                        snitchGroup.position.y = restTarget.y - dipAmount;
                        snitchGroup.position.z = restTarget.z;

                        // Backward takeoff crouch tilt
                        const targetQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -0.32);
                        snitchGroup.quaternion.slerp(targetQuat, 0.25);

                        // Sparkle puff at lowest point of crouch right before launch
                        if (dipProgress > 0.55 && dipProgress < 0.70) {
                            const screenPos = snitchGroup.position.clone();
                            screenPos.project(camera);
                            const px = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
                            const py = (screenPos.y * -0.5 + 0.5) * window.innerHeight;
                            createSparkleBurst(px, py, 4);
                        }

                    } else if (elapsed < 1.90) {
                        // --- PHASE 2: Smooth Ascension & Buttery Framer Scroll (0.50s - 1.90s) ---
                        const surgeTime = elapsed - 0.50;
                        const surgeDuration = 1.40;
                        const t = surgeTime / surgeDuration;

                        // Framer ease-out cubic scroll to top
                        const scrollProgress = 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
                        window.scrollTo(0, Math.round(initialScrollY * (1 - scrollProgress)));

                        flapSpeedTarget = 55.0;
                        crownTarget = getHeroCrownPosition();

                        // Smooth cubic bezier trajectory to crown position
                        // Control points stay strictly inside the visible screen bounds
                        const p1x = restTarget.x - 1.2;
                        const p1y = restTarget.y + 1.8;
                        const p2x = crownTarget.x + 1.6;
                        const p2y = crownTarget.y - 0.2;

                        const prevPos = snitchGroup.position.clone();

                        const targetX = getCubicBezier(restTarget.x, p1x, p2x, crownTarget.x, t);
                        const targetY = getCubicBezier(restTarget.y, p1y, p2y, crownTarget.y, t);

                        // Strictly clamp inside screen bounds (never touches top or side edges!)
                        snitchGroup.position.x = THREE.MathUtils.clamp(targetX, bounds.minX + 0.8, bounds.maxX - 0.8);
                        snitchGroup.position.y = THREE.MathUtils.clamp(targetY, bounds.minY + 0.5, bounds.maxY - 1.1);
                        snitchGroup.position.z = restTarget.z;

                        // Dynamic banking into flight path
                        const moveVec = new THREE.Vector3().subVectors(snitchGroup.position, prevPos);
                        if (moveVec.lengthSq() > 0.00001) {
                            const forward = moveVec.clone().normalize();
                            const up = new THREE.Vector3(0, 1, 0);
                            const bankAngle = THREE.MathUtils.clamp(-moveVec.x * 3.0, -0.6, 0.6);
                            up.applyAxisAngle(forward, bankAngle);
                            const rotMatrix = new THREE.Matrix4();
                            rotMatrix.lookAt(snitchGroup.position, snitchGroup.position.clone().add(forward), up);
                            const targetQuat = new THREE.Quaternion().setFromRotationMatrix(rotMatrix);
                            snitchGroup.quaternion.slerp(targetQuat, 0.2);
                        }

                        // Sparkles along ascension trail
                        if (Math.random() < 0.40) {
                            const screenPos = snitchGroup.position.clone();
                            screenPos.project(camera);
                            const px = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
                            const py = (screenPos.y * -0.5 + 0.5) * window.innerHeight;
                            createSparkleBurst(px, py, 6);
                        }

                    } else if (elapsed < 3.90) {
                        // --- PHASE 3: Hero's Crown Spotlight Hover (1.90s - 3.90s: FULL 2 SECONDS!) ---
                        // Firmly locked at scroll 0, hovering directly above "NAVEENKUMAR NARSOZHAN"
                        window.scrollTo(0, 0);
                        crownTarget = getHeroCrownPosition();

                        flapSpeedTarget = 14.0; // Soft, regal wing flutter

                        // Gentle breathing hover directly above the name
                        const hoverT = (elapsed - 1.90) * Math.PI * 2;
                        snitchGroup.position.x = THREE.MathUtils.lerp(snitchGroup.position.x, crownTarget.x, 0.15);
                        snitchGroup.position.y = THREE.MathUtils.lerp(snitchGroup.position.y, crownTarget.y + Math.sin(hoverT * 1.5) * 0.05, 0.15);
                        snitchGroup.position.z = crownTarget.z;

                        // Face proudly forward
                        snitchGroup.quaternion.slerp(new THREE.Quaternion(), 0.15);

                        // Shimmering golden royal halo sparkles around the name
                        if (Math.random() < 0.30) {
                            const screenPos = snitchGroup.position.clone();
                            screenPos.project(camera);
                            const px = (screenPos.x * 0.5 + 0.5) * window.innerWidth + (Math.random() - 0.5) * 80;
                            const py = (screenPos.y * -0.5 + 0.5) * window.innerHeight + (Math.random() - 0.5) * 30;
                            createSparkleBurst(px, py, 4);
                        }

                    } else {
                        // --- PHASE 4: Gliding S-Curve Return to Dock (3.90s - 4.80s: 0.90s) ---
                        const returnTime = elapsed - 3.90;
                        const returnDuration = 0.90;
                        const t = returnTime / returnDuration;

                        flapSpeedTarget = 28.0;
                        const prevPos = snitchGroup.position.clone();

                        // S-curve glide down into dock via cubic bezier
                        const q1x = crownTarget.x + 1.8;
                        const q1y = crownTarget.y - 0.4;
                        const q2x = restTarget.x - 0.9;
                        const q2y = restTarget.y + 1.0;

                        const targetX = getCubicBezier(crownTarget.x, q1x, q2x, restTarget.x, t);
                        const targetY = getCubicBezier(crownTarget.y, q1y, q2y, restTarget.y, t);

                        snitchGroup.position.x = THREE.MathUtils.clamp(targetX, bounds.minX + 0.8, bounds.maxX - 0.8);
                        snitchGroup.position.y = THREE.MathUtils.clamp(targetY, bounds.minY + 0.5, bounds.maxY - 1.1);
                        snitchGroup.position.z = restTarget.z;

                        // Bank gracefully towards dock
                        const moveVec = new THREE.Vector3().subVectors(snitchGroup.position, prevPos);
                        if (moveVec.lengthSq() > 0.00001) {
                            const forward = moveVec.clone().normalize();
                            const up = new THREE.Vector3(0, 1, 0);
                            const bankAngle = THREE.MathUtils.clamp(-moveVec.x * 2.5, -0.5, 0.5);
                            up.applyAxisAngle(forward, bankAngle);
                            const rotMatrix = new THREE.Matrix4();
                            rotMatrix.lookAt(snitchGroup.position, snitchGroup.position.clone().add(forward), up);
                            const targetQuat = new THREE.Quaternion().setFromRotationMatrix(rotMatrix);
                            snitchGroup.quaternion.slerp(targetQuat, 0.2);
                        }
                    }

                } else if (state === 'MODAL') {
                    flapSpeedTarget = 1.0;
                    snitchGroup.rotation.y += delta * 0.5;
                }

                // Smooth flap transition
                customUniforms.uFlapSpeed.value = THREE.MathUtils.lerp(customUniforms.uFlapSpeed.value, flapSpeedTarget, delta * 5.0);
            }

            renderer.render(scene, camera);
        }

        animate();
    });
})();
