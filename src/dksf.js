import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';

// scene ---
const scene = new THREE.Scene();

// camera ---
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 2.5;

// renderer ---
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#canvas'),
  antialias: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;



// Load HDRI environment map
const rgbeLoader = new RGBELoader();
rgbeLoader.load(
  'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/pond_bridge_night_1k.hdr',
  (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    // scene.background = envMap;
    // scene.environment = envMap;
    scene.environment = texture;
  },
  undefined,
  (error) => {
    console.error('An error happened while loading HDRI', error);
  }
);

// Load GLTF model
const loader = new GLTFLoader();
loader.load(
  '/public/DamagedHelmet.gltf',
  (gltf) => {
    scene.add(gltf.scene);
  },
  undefined,
  (error) => {
    console.error('An error happened', error);
  }
);

// // renderer ---
// const renderer = new THREE.WebGLRenderer({
//   canvas: document.querySelector('#canvas'),
//   antialias: true,
// });
// renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// renderer.setSize(window.innerWidth, window.innerHeight);

// postprocessing ---
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.uniforms['amount'].value = 0.0035; // Adjust the amount of RGB shift
composer.addPass(rgbShiftPass);

// controls ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// render ---
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  composer.render();
}

animate();