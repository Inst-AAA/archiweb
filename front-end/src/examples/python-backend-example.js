"use strict";
import * as THREE from 'three'
import * as ARCH from "@/archiweb"
import {io} from 'socket.io-client'

const socket = io("ws://8.136.121.130:39481/")

let scene, gui;
let gf, am;

let vs, fs, mesh;

const control = {
  send: function () {
    socket.emit('compasFormFinding', {vertex: vs.toArchiJSON()['coordinates'], face: fs});
  }
}

function initWS() {
  socket.on('generateFormFindingResult', async function (message) {
    
    let vertex = message.data.vertex;
    let face = message.data.face;
    
    let vs = [];
    for (let i = 0; i <= message.data.max_vertex; ++i) {
      let v = vertex[i];
      vs.push(v.x, v.y, v.z)
    }
    
    let fs = [];
    for (let i = 0; i <= message.data.max_face; ++i) {
      fs.push(face[i][0], face[i][1], face[i][2], face[i][3]);
    }
    
    mesh = gf.Mesh({coordinates: vs, size: 3}, {
      index: fs,
      count: [fs.length / 4],
      size: [4]
    }, new THREE.MeshPhongMaterial({color: 0xdddddd, side: THREE.DoubleSide, flatShading: true}));
    
    am.addSelection([mesh], 1);
    am.refreshSelection(scene);
  })
}

function initGUI() {
  gui.gui.add(control, 'send');
}

function initScene() {
  
  gf = new ARCH.GeometryFactory(scene);
  
  let pts = []
  for (let i = 0; i < 11; ++i) {
    for (let j = 0; j < 11; ++j) {
      
      pts.push(new THREE.Vector3(i * 100, j * 100, 0));
    }
  }
  
  
  vs = gf.Vertices(pts);
  fs = []
  for (let i = 0; i < 10; ++i) {
    for (let j = 0; j < 10; ++j) {
      let face = [i * 11 + j, i * 11 + j + 1, (i + 1) * 11 + j + 1, (i + 1) * 11 + j];
      fs.push(face)
      gf.Segments([pts[face[0]], pts[face[1]], pts[face[2]], pts[face[3]]], true)
    }
  }
  
  
  control.send();
  am.refreshSelection(scene);
  
}

function main() {
  const viewport = new ARCH.Viewport();
  scene = viewport.scene;
  gui = viewport.gui;
  
  viewport.setCameraPosition([1400, -800, 300], [600, 250, 200]);
  
  am = viewport.enableAssetManager();
  viewport.enableDragFrames();
  viewport.enableTransformer();
  let sb = viewport.enableSceneBasic();
  sb.skyColor = '#e0e8ef'
  sb.floorColor = '#ffffff'
  sb.update();
  
  
  initScene();
  initGUI();
  initWS();
}

export {
  main
}
