import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Hierarchical Model Variables
let scene, camera, renderer, controls;
let base, backTilt, backPan, blade;
let isBladeRotating = false;
let isAutoPanning = false;
let panRotationAngle = THREE.MathUtils.degToRad(0.2);

// Model Rotation Angles
const rotations = {
    base: 0,
    backTilt: 0,
    backPan: 0,
    blade: 0    
};

const defaultCamPositions = {
    x: -4,
    y: 5,
    z: -15
};

const defaultCamTarget = {
    x: 0,
    y: 1,
    z: 0
};

const defaultRotations = {
    base: 0,
    backTilt: 0,
    backPan: 0,
    blade: 0
};

function initScene() {
    // Scene Setup
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(
        defaultCamPositions.x,
        defaultCamPositions.y,
        defaultCamPositions.z
    );

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = true;
    controls.minDistance = 5;
    controls.maxDistance = 20;
    controls.minPolarAngle = 0.5;
    controls.maxPolarAngle = 1.5;
    controls.autoRotate = false;
    controls.target.set(
        defaultCamTarget.x,
        defaultCamTarget.y,
        defaultCamTarget.z
    );
    controls.update();

    // Lighting
    setupLighting();
    setupControls();
}

function setupLighting() {
    const spotLight = new THREE.SpotLight(0xffffff, 10, 40, 0.90, 1);
    spotLight.position.set(8, 60, -5);
    spotLight.castShadow = true;
    spotLight.shadow.bias = -0.0001;
    scene.add(spotLight);
  
    const spotLight1 = new THREE.SpotLight(0xffffff, 15, 50, 0.30, 1);
    spotLight1.position.set(0, 30, -5);
    spotLight1.castShadow = true;
    spotLight1.shadow.bias = -0.0001;
    scene.add(spotLight1);
  
    const spotLight2 = new THREE.SpotLight(0xffffff, 1);
    spotLight2.position.set(10, 10, 10);
    scene.add(spotLight2);
  }

// Setup event listeners
function setupControls() {
    // Base rotation slider
    document.getElementById('baseRotation').addEventListener('input', (e) => {
        rotations.base = parseFloat(e.target.value);
        updateModelHierarchy();
    });

    // Back Tilt rotation slider
    document.getElementById('backTiltRotation').addEventListener('input', (e) => {
        rotations.backTilt = parseFloat(e.target.value);
        updateModelHierarchy();
    });

    // Back Pan rotation slider
    document.getElementById('backPanRotation').addEventListener('input', (e) => {
        rotations.backPan = parseFloat(e.target.value);
        updateModelHierarchy();
    });

    // Blade rotation toggle
    document.getElementById('fanToggle').addEventListener('change', (e) => {
        isBladeRotating = e.target.checked;
    });

    // Auto panning toggle
    document.getElementById('autoPanToggle').addEventListener('change', (e) => {
        isAutoPanning = e.target.checked;
    });

    // Reset button
    document.getElementById('resetButton').addEventListener('click', resetAll);
}

function loadModels() {
  const loader = new GLTFLoader().setPath('models/');

  loader.load('1-base.glb', (gltf) => {
    base = gltf.scene;
    base.name = 'base';

    const basePivot = new THREE.Object3D();
    basePivot.position.set(0, -3, 0);
    basePivot.add(base);
    
    scene.add(basePivot);

    // const baseAxes = new THREE.AxesHelper(5);
    // base.add(baseAxes);

    loader.load('2-backTilt.glb', (gltfBackTilt) => {
      backTilt = gltfBackTilt.scene;
      backTilt.name = 'backTilt';

      const backTiltPivot = new THREE.Object3D();
      backTiltPivot.position.set(0, 3.49192, 0.459655);
      backTiltPivot.add(backTilt);

      base.add(backTiltPivot);

      // const backTiltAxes = new THREE.AxesHelper(3);
      // backTiltPivot.add(backTiltAxes);

      loader.load('3-backPan.glb', (gltfBackPan) => {
        backPan = gltfBackPan.scene;
        backPan.name = 'backPan';

        const backPanPivot = new THREE.Object3D();
        backPanPivot.position.set(0, 2.17623/2, -2.16662/4);
        backPanPivot.add(backPan);

        backTilt.add(backPanPivot);
        // const backPanAxes = new THREE.AxesHelper(3);
        // backPanPivot.add(backPanAxes);

        loader.load('4-blade.glb', (gltfBlade) => {
          blade = gltfBlade.scene;
          blade.name = 'blade';

          const bladePivot = new THREE.Object3D();
          bladePivot.position.set(0, 1.28505/2, -1.38096);
          bladePivot.add(blade);

          backPan.add(bladePivot);
          // const backPanAxes = new THREE.AxesHelper(3);
          // backPanPivot.add(backPanAxes);
          resetAll()

          // Initial hierarchy setup
          updateModelHierarchy();

        });
      });
    });
  });
}

function updateModelHierarchy() {
    if (!base) return;

    // Base rotation (Y-axis)
    base.rotation.y = THREE.MathUtils.degToRad(rotations.base);

    // Back Tilt rotation (X-axis)
    if (backTilt) {
        backTilt.rotation.x = THREE.MathUtils.degToRad(rotations.backTilt);
    }

    // Back Pan rotation (Y-axis)
    if (backPan && !isAutoPanning) {
        backPan.rotation.y = THREE.MathUtils.degToRad(rotations.backPan);
    }
}

function animate() {
    requestAnimationFrame(animate);

    // Blade rotation
    if (blade && isBladeRotating) {
        blade.rotation.z += THREE.MathUtils.degToRad(5);
    }

    // Back Pan rotation
    const maxRotation = THREE.MathUtils.degToRad(90);
    if (backPan && isAutoPanning && isBladeRotating) {
        if (backPan.rotation.y >= maxRotation || backPan.rotation.y <= -maxRotation) {
            panRotationAngle *= -1; // Balik arah
        }
        backPan.rotation.y += panRotationAngle;
    }

    controls.update();
    renderer.render(scene, camera);
}

function init() {
    initScene();
    loadModels();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    animate();
}

// Fungsi untuk mereset semua ke posisi default
function resetAll() {
    // Reset camera position
    camera.position.set(
        defaultCamPositions.x,
        defaultCamPositions.y,
        defaultCamPositions.z
    );
    
    // Reset camera target/look at
    controls.target.set(
        defaultCamTarget.x,
        defaultCamTarget.y,
        defaultCamTarget.z
    );
    
    // Reset orbital controls
    controls.reset();
    
    // Reset rotations
    rotations.base = defaultRotations.base;
    rotations.backTilt = defaultRotations.backTilt;
    rotations.backPan = defaultRotations.backPan;
    
    // Update slider values
    document.getElementById('baseRotation').value = defaultRotations.base;
    document.getElementById('backTiltRotation').value = defaultRotations.backTilt;
    document.getElementById('backPanRotation').value = defaultRotations.backPan;
    
    // Reset fan controls
    isBladeRotating = false;
    isAutoPanning = false;
    document.getElementById('fanToggle').checked = false;
    document.getElementById('autoPanToggle').checked = false;
    
    // Reset model hierarchy
    updateModelHierarchy();
    
    // Update controls
    controls.update();
}

// Initialize when DOM is loaded
init();