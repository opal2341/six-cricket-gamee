import * as THREE from './three.module.js';
import * as CANNON from './cannon.min.js';

let scene, camera, renderer, world;
let ball, bat, score = 0, timer = 60;
let scoreEl = document.getElementById("score");
let timerEl = document.getElementById("timer");
let audio = new Audio('crowd.mp3');

scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 15);
renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 20, 10).normalize();
scene.add(light);

world = new CANNON.World();
world.gravity.set(0, -9.8, 0);

const groundMat = new CANNON.Material();
const groundBody = new CANNON.Body({ mass: 0, shape: new CANNON.Plane(), material: groundMat });
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
world.addBody(groundBody);

const groundGeo = new THREE.PlaneGeometry(50, 50);
const groundMat3 = new THREE.MeshPhongMaterial({ color: 0x007700 });
const groundMesh = new THREE.Mesh(groundGeo, groundMat3);
groundMesh.rotation.x = -Math.PI / 2;
scene.add(groundMesh);

const batGeo = new THREE.BoxGeometry(1, 4, 0.3);
const batMat = new THREE.MeshPhongMaterial({ color: 0x8b4513 });
bat = new THREE.Mesh(batGeo, batMat);
bat.position.set(0, 2, 0);
scene.add(bat);

function createBall() {
  const ballShape = new CANNON.Sphere(0.3);
  const ballBody = new CANNON.Body({ mass: 1, shape: ballShape });
  ballBody.position.set(0, 1, -10);
  ballBody.velocity.set(0, 2, 8);
  world.addBody(ballBody);

  const ballMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.3),
    new THREE.MeshStandardMaterial({ color: 0xff0000 })
  );
  scene.add(ballMesh);
  return { body: ballBody, mesh: ballMesh };
}

ball = createBall();

const interval = setInterval(() => {
  timer--;
  timerEl.textContent = timer;
  if (timer <= 0) {
    clearInterval(interval);
    alert(`Game Over! Your Score: ${score}`);
    window.location.reload();
  }
}, 1000);

window.addEventListener('keydown', (e) => {
  if (e.code === "Space") {
    const dx = ball.body.position.x - bat.position.x;
    const dz = ball.body.position.z - bat.position.z;
    const dy = ball.body.position.y - bat.position.y;
    const dist = Math.sqrt(dx * dx + dz * dz + dy * dy);
    if (dist < 2.5) {
      ball.body.velocity.set(0, 5, -15);
      score += 6;
      scoreEl.textContent = score;
      audio.play();
    }
  }
});

function animate() {
  requestAnimationFrame(animate);
  world.step(1/60);
  ball.mesh.position.copy(ball.body.position);
  renderer.render(scene, camera);
  if (ball.body.position.z > 20 || ball.body.position.y < -5) {
    scene.remove(ball.mesh);
    world.removeBody(ball.body);
    ball = createBall();
  }
}
animate();