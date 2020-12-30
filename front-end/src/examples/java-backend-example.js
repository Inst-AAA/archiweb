import * as THREE from "three";
import * as ARCH from "@/archiweb"

let scene, gui;
let geoFty, matFty;
// let archijson;
let lastRandom = 1;
function random(seed){
  seed = seed || lastRandom;
  return lastRandom = ('0.'+Math.sin(seed).toString().substr(6));
}

/* ---------- GUI setup ---------- */
const control = {
  num:10,
  nx:500,
  ny:300,
}

function initGUI() {
  
  gui.add(control, 'num', 5, 1000, 1).onChange(()=>{
    generatePoints(control.num, control.nx, control.ny);
  });
  gui.add(control, 'nx', 100, 1000).onChange(()=>{
    generatePoints(control.num, control.nx, control.ny);
    border.scale.x = control.nx;
  })
  gui.add(control, 'ny', 100, 1000).onChange(()=>{
    generatePoints(control.num, control.nx, control.ny);
    border.scale.y = control.ny;
  })
  
}


/* ---------- create your scene object ---------- */
let positions, colors, points, border;
function initScene() {
  geoFty = new ARCH.GeometryFactory(scene);
  matFty = new ARCH.MaterialFactory();
  //
  // archijson = ARCH.ArchiJSON(scene);
  //


  
  const geometry = new THREE.BufferGeometry();
  const material = new THREE.PointsMaterial( { size: 10, vertexColors: true } );
  points = new THREE.Points(geometry, material);
  
  generatePoints(control.num, control.nx, control.ny);
  
  border = geoFty.Box([0, 0, 0], [control.nx, control.ny, 0],
    matFty.Void(), true);
  ARCH.sceneAddMesh(scene, points, false);
  
  // refresh global objects
  ARCH.refreshSelection(scene);
}

function generatePoints(num, nx, ny){
  positions = [];
  colors = [];
  random(233);
  for (let i = 0; i < num; ++ i) {
    const x = random() * nx - nx/2;
    const y = random() * ny - ny/2;
    positions.push(x, y, 0);
    colors.push(x/nx+0.5, y/ny+0.5, 0);
  }
  
  points.geometry.setAttribute('position', new THREE.Float32BufferAttribute( positions, 3 ));
  points.geometry.setAttribute('color', new THREE.Float32BufferAttribute( colors, 3 ));
}


/* ---------- animate per frame ---------- */
function draw() {

}


/* ---------- main entry ---------- */
function main() {
  const viewport = new ARCH.Viewport();
  scene = viewport.scene;
  gui = viewport.gui.gui;
  
  initGUI();
  initScene();
  
  viewport.draw = draw;

}

export {
  main
}