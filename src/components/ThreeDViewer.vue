<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { load3MFModel } from '@/lib/threeMFLoader';

const props = defineProps<{
  modelData?: string;
  colors?: string[];
  width?: number;
  height?: number;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let controls: OrbitControls | null = null;
let animationId: number | null = null;
let mesh: THREE.Mesh | null = null;

function initScene() {
  if (!canvasRef.value) return;

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf5f5f5);

  // Camera
  const width = props.width || canvasRef.value.clientWidth;
  const height = props.height || canvasRef.value.clientHeight;
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(0, 50, 100);

  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true,
    alpha: true,
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(50, 100, 50);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
  directionalLight2.position.set(-50, -50, -50);
  scene.add(directionalLight2);

  // Grid
  const gridHelper = new THREE.GridHelper(200, 20, 0x888888, 0xcccccc);
  scene.add(gridHelper);

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.minDistance = 10;
  controls.maxDistance = 500;
  controls.maxPolarAngle = Math.PI / 2;

  // Default geometry (placeholder cube)
  loadPlaceholder();

  // Animation loop
  animate();
}

function loadPlaceholder() {
  if (!scene) return;

  // Remove old mesh
  if (mesh) {
    scene.remove(mesh);
    mesh.geometry.dispose();
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach(m => m.dispose());
    } else {
      mesh.material.dispose();
    }
  }

  // Create placeholder box
  const geometry = new THREE.BoxGeometry(40, 40, 40);
  const material = new THREE.MeshStandardMaterial({
    color: props.colors?.[0] || '#1976d2',
    metalness: 0.1,
    roughness: 0.6,
  });
  
  mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);

  // Center camera on object
  centerCamera();
}

async function load3MFModelData(base64Data: string) {
  if (!scene) {
    console.error('❌ Scene not initialized');
    return;
  }

  console.log('🔵 load3MFModelData called with data length:', base64Data?.length);

  try {
    const geometry = await load3MFModel(base64Data);
    console.log('✅ Geometry loaded:', geometry);
    
    // Remove old mesh
    if (mesh) {
      scene.remove(mesh);
      mesh.geometry.dispose();
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(m => m.dispose());
      } else {
        mesh.material.dispose();
      }
    }

    // Create new mesh with loaded geometry
    const material = new THREE.MeshStandardMaterial({
      color: props.colors?.[0] || '#1976d2',
      metalness: 0.1,
      roughness: 0.6,
      side: THREE.DoubleSide,
    });

    mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    
    console.log('✅ Mesh added to scene');

    // Center camera on object
    centerCamera();
  } catch (error) {
    console.error('❌ Error loading 3MF model:', error);
    loadPlaceholder();
  }
}

function centerCamera() {
  if (!mesh || !camera || !controls) return;

  const box = new THREE.Box3().setFromObject(mesh);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());

  console.log('🔵 Centering camera on object');
  console.log('🔵 Box center:', center);
  console.log('🔵 Box size:', size);

  // Position camera to view entire object
  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = camera.fov * (Math.PI / 180);
  let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
  cameraZ *= 1.5; // Zoom out a little

  camera.position.set(center.x, center.y + maxDim * 0.5, center.z + cameraZ);
  camera.lookAt(center);
  controls.target.copy(center);
  controls.update();
  
  console.log('🔵 Camera position:', camera.position);
  console.log('🔵 Camera target:', controls.target);
}

function animate() {
  if (!renderer || !scene || !camera || !controls) return;

  animationId = requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

function handleResize() {
  if (!camera || !renderer || !canvasRef.value) return;

  const width = props.width || canvasRef.value.clientWidth;
  const height = props.height || canvasRef.value.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

onMounted(() => {
  console.log('🔵 ThreeDViewer mounted');
  console.log('🔵 Model data available:', !!props.modelData);
  console.log('🔵 Colors:', props.colors);
  
  initScene();
  window.addEventListener('resize', handleResize);
  
  // Load model if available
  if (props.modelData) {
    console.log('🔵 Loading model on mount...');
    load3MFModelData(props.modelData);
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
  }
  
  if (controls) {
    controls.dispose();
  }
  
  if (mesh) {
    mesh.geometry.dispose();
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach(m => m.dispose());
    } else {
      mesh.material.dispose();
    }
  }
  
  if (renderer) {
    renderer.dispose();
  }
});

watch(() => props.modelData, (newData) => {
  console.log('🔵 Model data changed:', !!newData);
  if (newData) {
    load3MFModelData(newData);
  } else {
    loadPlaceholder();
  }
});

watch(() => props.colors, (newColors) => {
  if (mesh && newColors && newColors.length > 0) {
    const material = mesh.material as THREE.MeshStandardMaterial;
    material.color.set(newColors[0]);
  }
}, { deep: true });
</script>

<template>
  <div class="relative w-full h-full">
    <canvas ref="canvasRef" class="w-full h-full" />
  </div>
</template>

<style scoped>
canvas {
  display: block;
}
</style>
