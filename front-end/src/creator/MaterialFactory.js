import * as THREE from 'three';
import { ToonShader2, ToonShaderHatching, ToonShaderDotted } from 'three/examples/jsm/shaders/ToonShader.js';

/**
 * Material based on {@link https://threejs.org/examples/webgl_marchingcubes.html}
 * @constructor
 */
const MaterialFactory = function () {
  function init() {
    // TODO: load default envmap
  }
  
  this.texture = undefined;
  this.reflection = undefined;
  this.refrection = undefined;
  let scope = this;
  
  init();
  /* ---------- Normal ---------- */
  
  this.Matte = function (color=0xdddddd) {
    return new THREE.MeshPhongMaterial( { color: color, specular: 0x111111, shininess: 1 } )
  }
  
  this.Flat = function (color=0xdddddd) {
    return new THREE.MeshLambertMaterial( { color: color, flatShading: true } )
  }

  this.Plastic = function (color=0xdddddd) {
    return new THREE.MeshPhongMaterial( { color: color, specular: 0x888888, shininess: 250 } )
  }
  
  this.Textured = function (color=0xdddddd, texture) {
    if(texture) scope.texture = texture;
    return new THREE.MeshPhongMaterial( { color: color, specular: 0x111111, shininess: 1, map: scope.texture } );
  }
  
  /* ---------- Reflection ---------- */
  
  this.Chrome = function (color=0xdddddd, reflectionCube) {
    if(reflectionCube) scope.reflectionCube = reflectionCube;
    const chromeMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff, envMap: scope.reflectionCube } );
    setMaterialColor(chromeMaterial, color);
    return chromeMaterial;
  }
  
  this.Liquid = function (color=0xdddddd, refractionCube) {
    if(refractionCube) scope.refractionCube = refractionCube;
    const liquidMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff, envMap: scope.refractionCube, refractionRatio: 0.85 } );
    setMaterialColor(liquidMaterial, color);
    return liquidMaterial;
  }
  
  this.Shiny = function (color=0xdddddd, reflectionCube) {
    if(reflectionCube) scope.reflectionCube = reflectionCube;
    const shinyMaterial = new THREE.MeshStandardMaterial( { color: 0x550000, envMap: scope.reflectionCube, roughness: 0.1, metalness: 1.0 } );
    setMaterialColor(shinyMaterial, color);
    return shinyMaterial;
  }
  
  /* ---------- Shader Material ---------- */
  
  //FIXME: color not set, always 0xffffff
  /**
   * enable with {@link SceneBasic}
   * @constructor
   */
  this.Toon = function (color=0xdddddd, light, ambientLight) {
    const toonMaterial = createShaderMaterial( ToonShader2, light, ambientLight );
    toonMaterial.h = 0.4;
    toonMaterial.s = 1;
    toonMaterial.l = 0.75;
    
    setMaterialColor(toonMaterial, color);
    return toonMaterial;
  }
  
  /**
   * enable with {@link SceneBasic}
   * @constructor
   */
  this.Hatching = function (color=0xdddddd, light, ambientLight) {
    const hatchingMaterial = createShaderMaterial( ToonShaderHatching, light, ambientLight );
    setMaterialColor(hatchingMaterial, color);
    return hatchingMaterial;
  }
  
  /**
   * enable with {@link SceneBasic}
   * @constructor
   */
  this.Dotted = function (color=0xdddddd, light, ambientLight) {
    const dottedMaterial = createShaderMaterial( ToonShaderDotted, light, ambientLight );
    setMaterialColor(dottedMaterial, color);
    return dottedMaterial;
  }
  
  function createShaderMaterial( shader, light, ambientLight ) {
    
    const u = THREE.UniformsUtils.clone( shader.uniforms );
    
    const vs = shader.vertexShader;
    const fs = shader.fragmentShader;
    
    const material = new THREE.ShaderMaterial( { uniforms: u, vertexShader: vs, fragmentShader: fs } );
    
    material.uniforms[ "uDirLightPos" ].value = light.position;
    material.uniforms[ "uDirLightColor" ].value = light.color;
    
    material.uniforms[ "uAmbientLightColor" ].value = ambientLight.color;
    
    return material;
    
  }

}

/**
 * Set whole mesh with same material
 * @param mesh
 * @param material
 */
function setMaterial (mesh, material) {
  if (mesh.material.length > 0) {
    let materials = []
    mesh.material.forEach(() => materials.push(material));
    mesh.material = materials;
  } else {
    mesh.material = material;
  }
  
}

function setMaterialColor(material, color) {
  if(material === undefined) return;
  if(material.length > 0) {
    material.forEach((item) => {
      setMaterialColor(item, color);
    })
  }
  material.color = new THREE.Color(color);
}

/**
 * Set whole material with transparency and opacity
 * @param material
 * @param opacity
 */
function setMaterialOpacity(material, opacity) {
  if(material === undefined) return;
  if(material.length > 0) {
    material.forEach((item) => {
      setMaterialOpacity(item, opacity);
    })
  }
  
  material.transparent = true;
  material.opacity = opacity;
}

/**
 * Set material polygon offset to avoid z-fighting {@link https://en.wikipedia.org/wiki/Z-fighting}.
 * must use with line edge
 * @param material
 */
function setPolygonOffsetMaterial(material) {
  if(material === undefined) return;
  if(material.length > 0) {
    material.forEach((item) => {
      setPolygonOffsetMaterial(item);
    })
  }
  
  material.polygonOffset = true;
  material.polygonOffsetFactor = 1.0;
  material.polygonOffsetUnits = 1.0;
}

export {
  MaterialFactory ,
  setMaterial,
  setMaterialColor,
  setMaterialOpacity,
  setPolygonOffsetMaterial,
}