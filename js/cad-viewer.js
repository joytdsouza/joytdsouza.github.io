// ==========================================================================
// Interactive CAD model viewer — STL and GLTF/GLB
// Finds every <div class="cad-viewer" data-model="path/to/file.stl"></div>
// (or the older data-stl="..." attribute, still supported) and turns it into
// a rotate/zoom/pan 3D viewer using three.js (loaded from a CDN — requires
// an internet connection to work). The file extension decides which loader
// runs — .stl uses STLLoader, .gltf/.glb uses GLTFLoader — everything else
// about the viewer (camera framing, lighting, controls, fullscreen) is
// identical either way.
//
// To add one: <div class="cad-viewer" data-model="assets/models/your-part.stl"></div>
// or:         <div class="cad-viewer" data-model="assets/models/your-part.glb"></div>
// That's it — no other JS needed, this file handles the rest.
//
// For a SolidWorks eDrawings "Publish eDrawings for the web" export (a
// self-contained interactive HTML file with its own viewer built in), don't
// use this file at all — embed it directly instead:
//   <div class="media-frame edrawings-embed">
//     <iframe src="assets/models/your-part.html" loading="lazy"></iframe>
//   </div>
// That gets the same bordered frame + click-to-fullscreen behavior as every
// other media type (see js/main.js), it just runs eDrawings' own viewer
// inside the frame rather than three.js.
// ==========================================================================
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/STLLoader.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

// Sets the camera's near/far clipping planes relative to the model's own
// size, then frames it. A fixed near/far (e.g. 0.1–5000) works fine for
// STL exports using arbitrary "large" units, but breaks for GLTF exports
// from tools like Onshape, which use meters — a small part can be
// 0.01–0.03 units across, well inside a fixed 0.1 near plane, so the whole
// model gets clipped into invisibility. Scaling near/far to the model's
// bounding radius makes this work at any scale.
function frameCamera(camera, controls, center, radius) {
  const r = radius || 1;
  camera.near = r / 100;
  camera.far = r * 100;
  camera.updateProjectionMatrix();
  camera.position.set(center.x + r * 1.8, center.y + r * 1.4, center.z + r * 1.8);
  controls.target.copy(center);
  controls.update();
}

function initViewer(container) {
  const modelPath = container.getAttribute('data-model') || container.getAttribute('data-stl');
  const ext = (modelPath || '').split('.').pop().toLowerCase();
  const navy = 0x1b2432;
  const green = 0x058c42;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf7f7ff);

  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 5000);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.screenSpacePanning = true;

  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(1, 1.4, 1);
  scene.add(dirLight);
  const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
  dirLight2.position.set(-1, -0.5, -1);
  scene.add(dirLight2);

  const loadingEl = document.createElement('div');
  loadingEl.className = 'cad-loading';
  loadingEl.textContent = 'Loading model…';
  container.appendChild(loadingEl);

  function onLoadError() {
    loadingEl.textContent = "Couldn't load this model — check the data-model path.";
  }

  if (ext === 'stl') {
    new STLLoader().load(
      modelPath,
      (geometry) => {
        loadingEl.remove();
        geometry.computeVertexNormals();
        geometry.center();

        const material = new THREE.MeshStandardMaterial({ color: green, metalness: 0.1, roughness: 0.6 });
        scene.add(new THREE.Mesh(geometry, material));

        // Wireframe edges in navy for a technical-drawing feel
        const edges = new THREE.EdgesGeometry(geometry, 30);
        const lineMat = new THREE.LineBasicMaterial({ color: navy, linewidth: 1 });
        scene.add(new THREE.LineSegments(edges, lineMat));

        geometry.computeBoundingSphere();
        const radius = geometry.boundingSphere ? geometry.boundingSphere.radius : 50;
        frameCamera(camera, controls, new THREE.Vector3(0, 0, 0), radius);
      },
      undefined,
      onLoadError
    );
  } else if (ext === 'gltf' || ext === 'glb') {
    new GLTFLoader().load(
      modelPath,
      (gltf) => {
        loadingEl.remove();
        scene.add(gltf.scene);

        const box = new THREE.Box3().setFromObject(gltf.scene);
        const sphere = box.getBoundingSphere(new THREE.Sphere());
        frameCamera(camera, controls, sphere.center, sphere.radius || 50);
      },
      undefined,
      onLoadError
    );
  } else {
    loadingEl.textContent = 'Unsupported model format — use .stl, .gltf, or .glb.';
  }

  function onResize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  // ResizeObserver (rather than a window resize listener) means this also
  // picks up size changes from being reparented into the fullscreen
  // lightbox (see js/main.js openCadLightbox) and back, not just window resizes.
  const resizeObserver = new ResizeObserver(onResize);
  resizeObserver.observe(container);

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.cad-viewer').forEach(initViewer);
});