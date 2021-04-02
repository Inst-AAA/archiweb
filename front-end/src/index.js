/* eslint-disable no-unused-vars,no-case-declarations */
import mapboxgl from 'mapbox-gl';
import * as dat from 'dat.gui';

let gui, util, map;

mapboxgl.accessToken = 'pk.eyJ1IjoiYW1vbW9ybmluZyIsImEiOiJjazQxMnNscTkwN2h4M2VwZjF4NnRnanV3In0.6h98h7WZQ9-L5TMfIcRjvw';

let control = {
  randomCenter: function () {
    let center = map.getCenter();
    console.log(center)
    let dx = Math.random() * 0.01 - 0.005;
    let dy = Math.random() * 0.01 - 0.005;
    map.flyTo({
      center: [center.lng + dx, center.lat + dy],
      essential: true
    });
    
  }
}

function initGUI() {
  gui = new dat.GUI({autoPlace: false});
  
  util = gui.addFolder('Utils');
  util.add(control, 'randomCenter').name('center');
  util.open();
  
  const container = document.getElementById('gui-container');
  container.appendChild(gui.domElement);
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
          if (typeof map.getLayer('building-highlighted') !== "undefined" &&
            map.getSource('building-highlighted')._data.id !== feature.id) {
            map.removeLayer('building-highlighted')
            map.removeSource('building-highlighted');
            
          }
          
          if (typeof map.getLayer('building-highlighted') === "undefined") {
            map.addSource('building-highlighted', {
              "type": "geojson",
              "data": feature.toJSON()
            });
          }
          
          if (typeof map.getLayer('building-highlighted') === "undefined") {
            map.addLayer({
                'id': 'building-highlighted',
                'type': 'fill',
                'source': 'building-highlighted',
                'paint': {
                  'fill-outline-color': '#401212',
                  'fill-color': '#723d3d',
                  'fill-opacity': 0.6,
                },
              }
            )
          }
        }
        
      }
    );
  })
  
}

export {
  main
}
