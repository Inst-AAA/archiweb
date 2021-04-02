/* eslint-disable no-unused-vars,no-case-declarations */
import mapboxgl from 'mapbox-gl';
import * as dat from 'dat.gui';

let gui, util, map;

mapboxgl.accessToken = 'pk.eyJ1IjoiYW1vbW9ybmluZyIsImEiOiJjazQxMnNscTkwN2h4M2VwZjF4NnRnanV3In0.6h98h7WZQ9-L5TMfIcRjvw';

let control = {
  randomCenter: function () {
    let center = map.getCenter();
    let dx = Math.random() * 0.02 - 0.01;
    let dy = Math.random() * 0.02 - 0.01;
    map.flyTo({
      center: [center.lng + dx, center.lat + dy],
      essential: true
    });
    
  },
  getAABB: function () {
    let bbox = [[16.371658895495273, 48.20703295326334], [16.37303218651013, 48.207855212279554]]
    let range = [];
    bbox.forEach((p) => {
      range.push(mousePos(map.project(p)))
    });
    let feature = map.queryRenderedFeatures(range, {
      layers: ['building']
    });
    for (let i = 0; i < feature.length; ++i) {
      highlightBuilding(feature[i], 'h' + i.toString());
    }
    
  }
}

function mousePos(e) {
  let canvas = map.getCanvasContainer();
  let rect = canvas.getBoundingClientRect();
  return new mapboxgl.Point(
    e.x - rect.left - canvas.clientLeft,
    e.y - rect.top - canvas.clientTop
  )
}


function initGUI() {
  gui = new dat.GUI({autoPlace: false});
  
  util = gui.addFolder('Utils');
  util.add(control, 'randomCenter').name('center');
  util.add(control, 'getAABB').name('getAABB');
  util.open();
  
  const container = document.getElementById('gui-container');
  container.appendChild(gui.domElement);
}


function highlightBuilding(feature, id = '') {
  if (typeof map.getLayer('building-highlighted' + id) !== "undefined" &&
    map.getSource('building-highlighted' + id)._data.id !== feature.id) {
    map.removeLayer('building-highlighted' + id)
    map.removeSource('building-highlighted' + id);
    
  }
  
  if (typeof map.getLayer('building-highlighted' + id) === "undefined") {
    map.addSource('building-highlighted' + id, {
      "type": "geojson",
      "data": feature.toJSON()
    });
  }
  
  if (typeof map.getLayer('building-highlighted' + id) === "undefined") {
    map.addLayer({
        'id': 'building-highlighted' + id,
        'type': 'fill',
        'source': 'building-highlighted' + id,
        'paint': {
          'fill-outline-color': '#401212',
          'fill-color': '#723d3d',
          'fill-opacity': 0.6,
        },
      }
    )
  }
}

/* ---------- main entry ---------- */
function main() {
  
  map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/amomorning/ckmzydbvf0aik18obwp77yn5g', // style URL
    center: [16.373, 48.208], // starting position [lng, lat]
    zoom: 17 // starting zoom
  });
  
  map.addControl(new mapboxgl.FullscreenControl(), 'bottom-left');
  
  initGUI();
  map.on('load', () => {
    
    map.on('mousemove', function (e) {
        let feature = map.queryRenderedFeatures(e.point, {layers: ['building']})[0];
        if (feature === undefined) {
          if (typeof map.getLayer('building-highlighted') !== "undefined") {
            map.removeLayer('building-highlighted')
          }
          if (typeof map.getSource('building-highlighted') !== "undefined") {
            map.removeSource('building-highlighted')
          }
        } else {
  
          highlightBuilding(feature);
  
        }
    
      }
    );
  
    // map.on('click', function (e) {
    //   console.log(e.lngLat);
    //   console.log(map.unproject(e.point));
    // })
  })
  
}

export {
  main
}
