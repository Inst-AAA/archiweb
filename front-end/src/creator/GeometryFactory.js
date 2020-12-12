import * as THREE from 'three'
import {LineMaterial} from "three/examples/jsm/lines/LineMaterial";
import {WireframeGeometry2} from "three/examples/jsm/lines/WireframeGeometry2";
import {Wireframe} from "three/examples/jsm/lines/Wireframe";

/**
 *      ___           ___           ___           ___                       ___           ___           ___
 *     /\  \         /\  \         /\  \         /\__\          ___        /\__\         /\  \         /\  \
 *    /::\  \       /::\  \       /::\  \       /:/  /         /\  \      /:/ _/_       /::\  \       /::\  \
 *   /:/\:\  \     /:/\:\  \     /:/\:\  \     /:/__/          \:\  \    /:/ /\__\     /:/\:\  \     /:/\:\  \
 *  /::\~\:\  \   /::\~\:\  \   /:/  \:\  \   /::\  \ ___      /::\__\  /:/ /:/ _/_   /::\~\:\  \   /::\~\:\__\
 * /:/\:\ \:\__\ /:/\:\ \:\__\ /:/__/ \:\__\ /:/\:\  /\__\  __/:/\/__/ /:/_/:/ /\__\ /:/\:\ \:\__\ /:/\:\ \:|__|
 * \/__\:\/:/  / \/_|::\/:/  / \:\  \  \/__/ \/__\:\/:/  / /\/:/  /    \:\/:/ /:/  / \:\~\:\ \/__/ \:\~\:\/:/  /
 *      \::/  /     |:|::/  /   \:\  \            \::/  /  \::/__/      \::/_/:/  /   \:\ \:\__\    \:\ \::/  /
 *      /:/  /      |:|\/__/     \:\  \           /:/  /    \:\__\       \:\/:/  /     \:\ \/__/     \:\/:/  /
 *     /:/  /       |:|  |        \:\__\         /:/  /      \/__/        \::/  /       \:\__\        \::/__/
 *     \/__/         \|__|         \/__/         \/__/                     \/__/         \/__/         ~~
 *
 *
 *
 * Copyright (c) 2020-present, Inst.AAA.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Date: 2020-11-12
 * Author: Yichen Mo
 */
import {setPolygonOffsetMaterial} from "@/creator/MaterialFactory";

const GeometryFactory = function (_scene) {
  
  
  // Box Basic
  const boxGeometry = new THREE.BoxBufferGeometry(1, 1, 1);
  boxGeometry.translate(0, 0, 0.5);
  
  // Cylinder Basic
  const cylinderGeometry = new THREE.CylinderBufferGeometry(1, 1, 1, 32)
  cylinderGeometry.rotateX(Math.PI / 2);
  cylinderGeometry.translate(0, 0, 0.5);

  
  // const scope = this;
  // API
  this.Box = function ([x, y, z], [w, h, d], material, showEdge=true) {
    
    let mesh = new THREE.Mesh(boxGeometry, material);
    sceneAddMesh(_scene, mesh, showEdge)
    
    mesh.type = 'Box';
    mesh.scale.set(w, h, d);
    mesh.position.set(x, y, z);
    
    // publicProperties(mesh);
    
    return mesh;
  }
  
  this.Cylinder = function ([x, y, z], [r, h], material, showEdge = false) {
    let mesh = new THREE.Mesh(cylinderGeometry, material);
    sceneAddMesh(_scene, mesh, showEdge);
    
    mesh.type = 'Cylinder';
    mesh.scale.set(r, r, h);
    mesh.position.set(x, y, z);
    
    publicProperties(mesh);
    return mesh;
  }
  
  this.Line = function (points, color=0x000, selectable=false) {
    let line = new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial( { color: color } )
    );
    if(selectable)
      sceneAddMesh(_scene, line, false);
    else
      sceneAddMesh(_scene, line, false, false, []);
  
    line.type = 'Line';
    if(points)
      line.geometry.setFromPoints(points);
    publicProperties(line);
    return line;
  }
  
  /**
   * 2D shape to extruded geometry, set extruded = 0.0 to get a 2d polygon
   *
   * @param shape
   * @param material
   * @param extruded
   * @returns {Mesh<ExtrudeGeometry, *>}
   * @constructor
   */
  this.Shape = function (shape, material, extruded=0.0) {
    const extrudeSettings = {
      depth:extruded,
      bevelEnabled:false
    }
    
    const mesh = new THREE.Mesh(
      new THREE.ExtrudeGeometry(shape, extrudeSettings),
      material
    );
    mesh.type = 'Shape';
    sceneAddMesh(_scene, mesh)
    
    publicProperties(mesh);
    return mesh;
  }

  
  function updateModel (mesh, modelParam) {
    switch (mesh.type) {
      case 'Box' :
        mesh.scale.x = modelParam['w'];
        mesh.scale.y = modelParam['h'];
        mesh.scale.z = modelParam['d'];
        break;
      case 'Cylinder' :
        mesh.scale.x = modelParam['r'];
        mesh.scale.y = modelParam['r'];
        mesh.scale.z = modelParam['h'];
        break;
      default:
        break;
    }
  }
  
  function modelParam (mesh) {
    switch (mesh.type) {
      case 'Box':
        return {w: mesh.scale.x, h: mesh.scale.y, d: mesh.scale.z};
      case 'Cylinder':
        return {r: mesh.scale.x, h: mesh.scale.z};
      default:
        return {};
    }
  }
  

  
  
  function publicProperties (mesh) {
    
    mesh.updateModel = updateModel;
    mesh.modelParam = modelParam;
    
    mesh.exchange = true;
    mesh.toArchiJSON = function () {
      return {type: mesh.type, matrix: mesh.matrix.elements};
    }
    
    mesh.toInfoCard = function () {
      let o = mesh;
      window.InfoCard.info.uuid = o.uuid;
      window.InfoCard.info.position = o.position;
      window.InfoCard.info.model = o.modelParam(o);
      window.InfoCard.info.model = o.modelParam(o);
      window.InfoCard.info.properties = {
        type: o.type, material:
          JSON.stringify({
            type: o.material.type,
            uuid: o.material.uuid,
            color: o.material.color,
            opacity: o.material.opacity
          })
        , matrix: o.matrix.elements
      };
    }
  }
  
}


function createMeshEdge(mesh, color = 0x000000) {
  
  setPolygonOffsetMaterial(mesh.material);
  
  const matLine = new THREE.LineBasicMaterial({color: color});
  const geoLine = new THREE.EdgesGeometry(mesh.geometry);
  return new THREE.LineSegments(geoLine, matLine);
}

/**
 * create mesh wireframe with linewidth, must use specific LineMaterial in three@r0.121
 * @param mesh
 * @param color
 * @param linewidth
 * @returns {Wireframe}
 */
function createMeshWireframe(mesh, color = 0xffff00, linewidth) {
  
  setPolygonOffsetMaterial(mesh.material);
  
  const matLine = new LineMaterial({color: color, linewidth: linewidth});
  const geoLine = new WireframeGeometry2(mesh.geometry);
  const wireframe = new Wireframe(geoLine, matLine);
  wireframe.computeLineDistances();
  wireframe.scale.set(1, 1, 1);
  return wireframe;
}

/**
 * add a new mesh to a object3D (scene, group)
 * @param object
 * @param mesh
 * @param edge 
 * @param shadow
 * @param layer
 */
function sceneAddMesh (object, mesh, edge = true, shadow = true, layer=[0]) {
  // show edge
  if (edge) {
    mesh.add(createMeshWireframe(mesh, 0xffff00, 0.005));
    mesh.add(createMeshEdge(mesh));
    mesh.children[0].visible = false;
  }
  // show shadow
  if(shadow) {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
  }
  
  // layer, default is [0]
  mesh.layer = layer;
  object.add(mesh);
}
export {
  GeometryFactory,
  sceneAddMesh,
  createMeshWireframe,
  createMeshEdge
};