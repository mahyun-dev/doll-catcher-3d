// Game variables
let scene, camera, renderer;
let claw, clawGroup, leftGripper, rightGripper;
let dolls = [];
let score = 0;
let isAnimating = false;
let clawPosition = { x: 0, z: 0 };
const MOVE_SPEED = 0.5;
const MAX_X = 4;
const MAX_Z = 4;

// Initialize the game
function init() {
    // Set up scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    scene.fog = new THREE.Fog(0x1a1a2e, 10, 50);

    // Set up camera
    const container = document.getElementById('game-container');
    camera = new THREE.PerspectiveCamera(
        60,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.set(0, 12, 12);
    camera.lookAt(0, 0, 0);

    // Set up renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(0, 8, 0);
    scene.add(pointLight);

    // Create machine structure
    createMachine();

    // Create claw
    createClaw();

    // Create dolls
    createDolls();

    // Add event listeners
    addEventListeners();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // Start animation loop
    animate();
}

// Create the claw machine structure
function createMachine() {
    // Floor
    const floorGeometry = new THREE.BoxGeometry(10, 0.5, 10);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2d3561,
        roughness: 0.8,
        metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = -0.25;
    floor.receiveShadow = true;
    scene.add(floor);

    // Walls (transparent glass effect)
    const wallMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x88ccff,
        transparent: true,
        opacity: 0.2,
        roughness: 0.1,
        metalness: 0.9,
        side: THREE.DoubleSide
    });

    // Back wall
    const backWall = new THREE.Mesh(
        new THREE.BoxGeometry(10, 8, 0.2),
        wallMaterial
    );
    backWall.position.set(0, 4, -5);
    scene.add(backWall);

    // Side walls
    const leftWall = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 8, 10),
        wallMaterial
    );
    leftWall.position.set(-5, 4, 0);
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 8, 10),
        wallMaterial
    );
    rightWall.position.set(5, 4, 0);
    scene.add(rightWall);

    // Top frame
    const topFrame = new THREE.Mesh(
        new THREE.BoxGeometry(10, 0.3, 10),
        new THREE.MeshStandardMaterial({ color: 0xffcc00, metalness: 0.5 })
    );
    topFrame.position.y = 8;
    scene.add(topFrame);

    // Support pillars
    const pillarMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffcc00,
        metalness: 0.5
    });
    const pillarGeometry = new THREE.CylinderGeometry(0.2, 0.2, 8, 8);

    const positions = [
        [-4.8, 4, -4.8],
        [4.8, 4, -4.8],
        [-4.8, 4, 4.8],
        [4.8, 4, 4.8]
    ];

    positions.forEach(pos => {
        const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
        pillar.position.set(...pos);
        scene.add(pillar);
    });
}

// Create the claw
function createClaw() {
    clawGroup = new THREE.Group();
    
    // Cable
    const cableGeometry = new THREE.CylinderGeometry(0.05, 0.05, 5, 8);
    const cableMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const cable = new THREE.Mesh(cableGeometry, cableMaterial);
    cable.position.y = 2.5;
    clawGroup.add(cable);

    // Claw head (main body)
    const clawHeadGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.5, 8);
    const clawHeadMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xff6b6b,
        metalness: 0.6
    });
    claw = new THREE.Mesh(clawHeadGeometry, clawHeadMaterial);
    claw.castShadow = true;
    clawGroup.add(claw);

    // Gripper arms
    const gripperGeometry = new THREE.BoxGeometry(0.1, 0.8, 0.1);
    const gripperMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xff4757,
        metalness: 0.7
    });

    // Left gripper
    leftGripper = new THREE.Mesh(gripperGeometry, gripperMaterial);
    leftGripper.position.set(-0.3, -0.6, 0);
    leftGripper.rotation.z = 0.3;
    leftGripper.castShadow = true;
    clawGroup.add(leftGripper);

    // Right gripper
    rightGripper = new THREE.Mesh(gripperGeometry, gripperMaterial);
    rightGripper.position.set(0.3, -0.6, 0);
    rightGripper.rotation.z = -0.3;
    rightGripper.castShadow = true;
    clawGroup.add(rightGripper);

    clawGroup.position.set(0, 6, 0);
    scene.add(clawGroup);
}

// Create random dolls
function createDolls() {
    const colors = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0x95e1d3, 0xf38181, 
                    0xaa96da, 0xfcbad3, 0xa8e6cf, 0xff8b94, 0xc7ceea];
    
    for (let i = 0; i < 15; i++) {
        const dollGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const dollMaterial = new THREE.MeshStandardMaterial({ 
            color: colors[Math.floor(Math.random() * colors.length)],
            roughness: 0.5,
            metalness: 0.2
        });
        const doll = new THREE.Mesh(dollGeometry, dollMaterial);
        
        // Random position on the floor
        doll.position.x = (Math.random() - 0.5) * 8;
        doll.position.y = 0.4;
        doll.position.z = (Math.random() - 0.5) * 8;
        
        doll.castShadow = true;
        doll.receiveShadow = true;
        
        scene.add(doll);
        dolls.push(doll);
    }
}

// Add event listeners for controls
function addEventListeners() {
    document.getElementById('btn-left').addEventListener('click', () => moveClawLeft());
    document.getElementById('btn-right').addEventListener('click', () => moveClawRight());
    document.getElementById('btn-forward').addEventListener('click', () => moveClawForward());
    document.getElementById('btn-backward').addEventListener('click', () => moveClawBackward());
    document.getElementById('btn-grab').addEventListener('click', () => grabDoll());
    document.getElementById('btn-reset').addEventListener('click', () => resetGame());
}

// Move claw functions
function moveClawLeft() {
    if (!isAnimating && clawPosition.x > -MAX_X) {
        clawPosition.x -= MOVE_SPEED;
        clawGroup.position.x = clawPosition.x;
    }
}

function moveClawRight() {
    if (!isAnimating && clawPosition.x < MAX_X) {
        clawPosition.x += MOVE_SPEED;
        clawGroup.position.x = clawPosition.x;
    }
}

function moveClawForward() {
    if (!isAnimating && clawPosition.z > -MAX_Z) {
        clawPosition.z -= MOVE_SPEED;
        clawGroup.position.z = clawPosition.z;
    }
}

function moveClawBackward() {
    if (!isAnimating && clawPosition.z < MAX_Z) {
        clawPosition.z += MOVE_SPEED;
        clawGroup.position.z = clawPosition.z;
    }
}

// Grab doll animation
function grabDoll() {
    if (isAnimating) return;
    
    isAnimating = true;
    disableControls();
    
    const originalY = clawGroup.position.y;
    const downY = 1.5;
    
    // Move down
    animateClawDown(originalY, downY, () => {
        // Close grippers
        closeGrippers(() => {
            // Check for collision with dolls
            checkDollCollision();
            
            // Move back up
            animateClawUp(downY, originalY, () => {
                // Open grippers
                openGrippers(() => {
                    isAnimating = false;
                    enableControls();
                });
            });
        });
    });
}

function animateClawDown(from, to, callback) {
    const duration = 1000;
    const startTime = Date.now();
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        clawGroup.position.y = from + (to - from) * progress;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            callback();
        }
    }
    
    animate();
}

function animateClawUp(from, to, callback) {
    const duration = 1000;
    const startTime = Date.now();
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        clawGroup.position.y = from + (to - from) * progress;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            callback();
        }
    }
    
    animate();
}

function closeGrippers(callback) {
    const duration = 500;
    const startTime = Date.now();
    const startRotationL = leftGripper.rotation.z;
    const startRotationR = rightGripper.rotation.z;
    const targetRotationL = 0.8;
    const targetRotationR = -0.8;
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        leftGripper.rotation.z = startRotationL + (targetRotationL - startRotationL) * progress;
        rightGripper.rotation.z = startRotationR + (targetRotationR - startRotationR) * progress;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            callback();
        }
    }
    
    animate();
}

function openGrippers(callback) {
    const duration = 500;
    const startTime = Date.now();
    const startRotationL = leftGripper.rotation.z;
    const startRotationR = rightGripper.rotation.z;
    const targetRotationL = 0.3;
    const targetRotationR = -0.3;
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        leftGripper.rotation.z = startRotationL + (targetRotationL - startRotationL) * progress;
        rightGripper.rotation.z = startRotationR + (targetRotationR - startRotationR) * progress;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            callback();
        }
    }
    
    animate();
}

function checkDollCollision() {
    const clawWorldPos = new THREE.Vector3();
    clawGroup.getWorldPosition(clawWorldPos);
    
    for (let i = dolls.length - 1; i >= 0; i--) {
        const doll = dolls[i];
        const distance = clawWorldPos.distanceTo(doll.position);
        
        if (distance < 1.2) {
            // Doll caught!
            scene.remove(doll);
            dolls.splice(i, 1);
            updateScore(10);
            break; // Only catch one doll at a time
        }
    }
}

function updateScore(points) {
    score += points;
    document.getElementById('score').textContent = score;
}

function disableControls() {
    document.querySelectorAll('.control-btn').forEach(btn => {
        if (btn.id !== 'btn-reset') {
            btn.disabled = true;
        }
    });
}

function enableControls() {
    document.querySelectorAll('.control-btn').forEach(btn => {
        btn.disabled = false;
    });
}

// Reset game
function resetGame() {
    // Remove existing dolls
    dolls.forEach(doll => scene.remove(doll));
    dolls = [];
    
    // Reset score
    score = 0;
    updateScore(0);
    
    // Reset claw position
    clawPosition = { x: 0, z: 0 };
    clawGroup.position.set(0, 6, 0);
    
    // Reset gripper rotation
    leftGripper.rotation.z = 0.3;
    rightGripper.rotation.z = -0.3;
    
    // Create new dolls
    createDolls();
    
    isAnimating = false;
    enableControls();
}

// Handle window resize
function onWindowResize() {
    const container = document.getElementById('game-container');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// Start the game when the page loads
window.addEventListener('load', init);
