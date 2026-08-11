// ==========================================================================
// Interactive CAD (STL) viewer
// Finds every <div class="cad-viewer" data-stl="path/to/file.stl"></div> on
// the page and turns it into a rotate/zoom/pan 3D viewer using three.js
// (loaded from a CDN — requires an internet connection to work).
//
// To add a new one: <div class="cad-viewer" data-stl="assets/models/your-part.stl"></div>
// That's it — no other JS needed, this file handles the rest.
// ==========================================================================
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/STLLoader.js';

function initViewer(container) {
  const stlPath = container.getAttribute('data-stl');
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

  const loader = new STLLoader();
  loader.load(
    stlPath,
    (geometry) => {
      loadingEl.remove();
      geometry.computeVertexNormals();
      geometry.center();

      const material = new THREE.MeshStandardMaterial({ color: green, metalness: 0.1, roughness: 0.6 });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      // Wireframe edges in navy for a technical-drawing feel
      const edges = new THREE.EdgesGeometry(geometry, 30);
      const lineMat = new THREE.LineBasicMaterial({ color: navy, linewidth: 1 });
      scene.add(new THREE.LineSegments(edges, lineMat));

      geometry.computeBoundingSphere();
      const radius = geometry.boundingSphere ? geometry.boundingSphere.radius : 50;
      camera.position.set(radius * 1.8, radius * 1.4, radius * 1.8);
      controls.target.set(0, 0, 0);
      controls.update();
    },
    undefined,
    () => {
      loadingEl.textContent = "Couldn't load this model — check the data-stl path.";
    }
  );

  function onResize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', onResize);

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
