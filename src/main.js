import './style.css'
import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';
import gsap from 'gsap';
// import { mod } from 'three/tsl';

// scene ---
const scene = new THREE.Scene();

// camera ---
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 2;

// renderer ---
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#canvas'),
  antialias: true,
  alpha: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;

// postprocessing ---
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.uniforms['amount'].value = 0.0022; // Adjust the amount of RGB shift
composer.addPass(rgbShiftPass);

const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

// Load HDRI environment map
// const rgbeLoader = new RGBELoader();
// rgbeLoader.load(
//   'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/pond_bridge_night_1k.hdr',
//   (texture) => {
//     texture.mapping = THREE.EquirectangularReflectionMapping;
//     scene.background = envMap;
//     scene.environment = envMap;
//     scene.environment = texture;
//   },
//   undefined,
//   (error) => {
//     console.error('An error happened while loading HDRI', error);
//   }
// );

let model;

new RGBELoader()
  .load(
    'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/pond_bridge_night_1k.hdr', function (texture) {
      const envMap = pmremGenerator.fromEquirectangular(texture).texture;
      // texture.mapping = THREE.EquirectangularReflectionMapping;
      // scene.background = envMap;
      scene.environment = envMap;
      texture.dispose();
      pmremGenerator.dispose();

      // Load GLTF model
      const loader = new GLTFLoader();
      loader.load(
        '/public/DamagedHelmet.gltf',
        (gltf) => {
          model = gltf.scene;
          scene.add(model);
        },
        undefined,
        (error) => {
          console.error('An error happened', error);
        }
      );
    }
  );


// // Load GLTF model
// const loader = new GLTFLoader();
// loader.load(
//   '/public/DamagedHelmet.gltf',
//   (gltf) => {
//     scene.add(gltf.scene);
//   },
//   undefined,
//   (error) => {
//     console.error('An error happened', error);
//   }
// );

window.addEventListener("mousemove", (e) => {
  // console.log(e.clientX, e.clientY);
  if (model) {
    const rotationX = (e.clientX / window.innerWidth - .5) * (Math.PI * .4);
    const rotationY = (e.clientY / window.innerWidth - .5) * (Math.PI * .4);
    gsap.to(model.rotation, { y: rotationX, x: rotationY, duration: 0.5, ease: "power2.out" });
  }
})

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
})

// // controls ---
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;

// render ---
function animate() {
  requestAnimationFrame(animate);
  // controls.update();
  composer.render();
}

animate();