// /* eslint-disable no-unused-vars */
import * as THREE from 'three'
// import {SelectionBox} from "three/examples/jsm/interactive/SelectionBox";

const DragFrames = function (_objects, _camera, _scene, _orthoScene, _renderer) {
  
  // let _selectionBox = new SelectionBox(_camera, _scene);
  let _domElement = _renderer.domElement;
  let _dragInitX, _dragInitY;
  let _startPoint = new THREE.Vector3();
  let _endPoint = new THREE.Vector3();
  
  let _lineFrame, _geometry = null;
  let _selectDown = false;
  
  let _frustum = new THREE.Frustum();
  let _selected = [];
  
  let scope = this;
  
  function minMax(a, b) {
    return [Math.min(a, b), Math.max(a, b)];
  }
  
  
  function drawLineFrame(initX, initY, X, Y) {
    _orthoScene.remove(_lineFrame);
    
    let material = (initX > X) ?
      new THREE.LineDashedMaterial({color: 0x000000, dashSize: 5, gapSize: 3}) :
      new THREE.LineBasicMaterial({color: 0x000000});
    
    let [l, r] = minMax(initX, X);
    let [b, t] = minMax(initY, Y);
    
    const points = [];
    points.push(new THREE.Vector3(l, b, 0));
    points.push(new THREE.Vector3(r, b, 0));
    points.push(new THREE.Vector3(r, t, 0));
    points.push(new THREE.Vector3(l, t, 0));
    points.push(new THREE.Vector3(l, b, 0));
    
    if (_geometry != null) _geometry.dispose();
    _geometry = new THREE.BufferGeometry().setFromPoints(points);
    _lineFrame = new THREE.Line(_geometry, material);
    _lineFrame.computeLineDistances();
    _orthoScene.add(_lineFrame);
  }
  
  
  function activate() {
    _domElement.addEventListener('pointerdown', onDocumentPointerDown, false);
    _domElement.addEventListener('pointermove', onDocumentPointerMove, false);
    _domElement.addEventListener('pointerup', onDocumentPointerUp, false);
    
  }
  
  
  function deactivate() {
    _domElement.removeEventListener('pointerdown', onDocumentPointerDown, false);
    _domElement.removeEventListener('pointermove', onDocumentPointerMove, false);
    _domElement.removeEventListener('pointerup', onDocumentPointerUp, false);
  }
  
  function dispose() {
    
    deactivate();
    
  }
  
  function getObjects() {
    
    return _objects;
    
  }
  
  function getSelected() {
    return _selected;
  }
  
  
  function onDocumentPointerDown(event) {
    for (const item of _selected) {
      
      item.material.emissive.set(0x000000);
      
    }
    _selected = [];
    
    if (scope.enabled) {
      _startPoint.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1,
        0.5);
      
      _dragInitX = event.clientX;
      _dragInitY = event.clientY;
      
      _selectDown = true;
      
    }
  }
  
  
  function onDocumentPointerMove(event) {
    
    if (_selectDown) {
      for (const item of _selected) {
        
        if (item.type === "AxesHelper") continue;
        if (item.type === "GridHelper") continue;
        item.material.emissive.set(0x000000);
        
      }
      _selected = [];
      
      if (scope.enabled) {
        
        _endPoint.set(
          (event.clientX / window.innerWidth) * 2 - 1,
          -(event.clientY / window.innerHeight) * 2 + 1,
          0.5);
        
        _selected = select();
        
        for (const item of _selected) {
          item.material.emissive.set(0x666666);
          
        }
        //
        // scope.dispatchEvent({type: 'drag'}, _objects = _selected);
        drawLineFrame(_dragInitX, _dragInitY, event.clientX, event.clientY);

      }
    }
    
    
  }
  
  
  function onDocumentPointerUp(event) {
    _orthoScene.remove(_lineFrame);
    _selectDown = false;
    
    if (scope.enabled) {
      _endPoint.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1,
        0.5);
      
      
      _selected = select();
      
      for (const item of _selected) {
        item.material.emissive.set(0x666666);
      }
    }
    
    
    
  }
  
  
  function select(startPoint, endPoint) {
    _startPoint = startPoint || _startPoint;
    _endPoint = endPoint || _endPoint;
    
    _selected = [];
  
    updateFrustum(_startPoint, _endPoint);
    searchChildInFrustum(_frustum, _objects);
    
    return _selected;
  }
  
  
  function updateFrustum(startPoint, endPoint) {
    startPoint = startPoint || _startPoint;
    endPoint = endPoint || _endPoint;
    // Avoid invalid frustum
  
    if ( startPoint.x === endPoint.x ) {
    
      endPoint.x += Number.EPSILON;
    
    }
  
    if ( startPoint.y === endPoint.y ) {
    
      endPoint.y += Number.EPSILON;
    
    }
    
    _camera.updateProjectionMatrix();
    _camera.updateMatrixWorld();
    
    if(!_camera.isPerspectiveCamera) {
      console.error('THREE.SelectionBox: Unsupported camera type.');
      return;
    }
  
    const tmpPoint = new THREE.Vector3();
  
    const vecNear = new THREE.Vector3();
    const vecTopLeft = new THREE.Vector3();
    const vecTopRight = new THREE.Vector3();
    const vecDownRight = new THREE.Vector3();
    const vecDownLeft = new THREE.Vector3();
  
    const vectemp1 = new THREE.Vector3();
    const vectemp2 = new THREE.Vector3();
    const vectemp3 = new THREE.Vector3();
  
    tmpPoint.copy( startPoint );
    tmpPoint.x = Math.min( startPoint.x, endPoint.x );
    tmpPoint.y = Math.max( startPoint.y, endPoint.y );
    endPoint.x = Math.max( startPoint.x, endPoint.x );
    endPoint.y = Math.min( startPoint.y, endPoint.y );
  
    vecNear.setFromMatrixPosition( _camera.matrixWorld );
    vecTopLeft.copy( tmpPoint );
    vecTopRight.set( endPoint.x, tmpPoint.y, 0 );
    vecDownRight.copy( endPoint );
    vecDownLeft.set( tmpPoint.x, endPoint.y, 0 );
  
    vecTopLeft.unproject( _camera );
    vecTopRight.unproject( _camera );
    vecDownRight.unproject( _camera );
    vecDownLeft.unproject( _camera );
  
    vectemp1.copy( vecTopLeft ).sub( vecNear );
    vectemp2.copy( vecTopRight ).sub( vecNear );
    vectemp3.copy( vecDownRight ).sub( vecNear );
    vectemp1.normalize();
    vectemp2.normalize();
    vectemp3.normalize();
  
    vectemp1.multiplyScalar( Number.MAX_VALUE );
    vectemp2.multiplyScalar( Number.MAX_VALUE );
    vectemp3.multiplyScalar( Number.MAX_VALUE );
    vectemp1.add( vecNear );
    vectemp2.add( vecNear );
    vectemp3.add( vecNear );
  
    var planes = _frustum.planes;
  
    planes[ 0 ].setFromCoplanarPoints( vecNear, vecTopLeft, vecTopRight );
    planes[ 1 ].setFromCoplanarPoints( vecNear, vecTopRight, vecDownRight );
    planes[ 2 ].setFromCoplanarPoints( vecDownRight, vecDownLeft, vecNear );
    planes[ 3 ].setFromCoplanarPoints( vecDownLeft, vecTopLeft, vecNear );
    planes[ 4 ].setFromCoplanarPoints( vecTopRight, vecDownRight, vecDownLeft );
    planes[ 5 ].setFromCoplanarPoints( vectemp3, vectemp2, vectemp1 );
    planes[ 5 ].normal.multiplyScalar( - 1 );
  }
  
  function searchChildInFrustum(frustum, object) {
    if ( object.isMesh || object.isLine || object.isPoints ) {
    
      if ( object.material !== undefined ) {
      
        if ( object.geometry.boundingSphere === null ) object.geometry.computeBoundingSphere();
  
        const center = new THREE.Vector3();
  
        center.copy( object.geometry.boundingSphere.center );
        center.applyMatrix4( object.matrixWorld );
      
        if ( frustum.containsPoint( center ) ) {
          _selected.push( object );
        }
      
      }
    
    }
    
    if(object.isGroup) {
      for ( let x = 0; x < object.children.length; x ++ ) {
        searchChildInFrustum( frustum, object.children[ x ] );
      }
    }
  
    for ( let x = 0; x < object.length; x ++ ) {
      searchChildInFrustum( frustum, object[ x ] );
    }
  }
  
  
  activate();
  
  this.enabled = true;
  
  this.activate = activate;
  this.deactivate = deactivate;
  this.dispose = dispose;
  this.getObjects = getObjects;
  this.getSelected = getSelected;
};

DragFrames.prototype = Object.create(THREE.EventDispatcher.prototype);
DragFrames.prototype.constructor = DragFrames;

export {DragFrames};