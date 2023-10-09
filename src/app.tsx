import * as React from 'react';
import {useRef, useMemo, useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Map, Source, Layer, Marker,
  Popup,
  NavigationControl,
  FullscreenControl,
  ScaleControl,
  GeolocateControl} from 'react-map-gl';
import Pin from './pin';
import CITIES from './data/cities.json';
import geojsonData from './data/vietnam.geojson';

// import ControlPanel from './control-panel';
import {clusterLayer, clusterCountLayer, unclusteredPointLayer} from './layers';

import type {MapRef} from 'react-map-gl';
import type {GeoJSONSource} from 'mapbox-gl';

const MAPBOX_TOKEN = 'pk.eyJ1IjoidHVuazA0MTEiLCJhIjoiY2xuZGozeXNqMDR4YTJrcXhlMXo5Zm04bCJ9.xEsevhM0tASYE9U0trqF7w'; // Set your mapbox token here

export default function App() {
  const [dataCluster, setDataCluster] = useState(null);
  const mapRef = useRef<MapRef>(null);

  const onClick = event => {
    const feature = event.features[0];
    const clusterId = feature.properties.cluster_id;

    const mapboxSource = mapRef.current.getSource('earthquakes') as GeoJSONSource;

    mapboxSource.getClusterExpansionZoom(clusterId, (err, zoom) => {
      if (err) {
        return;
      }

      mapRef.current.easeTo({
        center: feature.geometry.coordinates,
        zoom,
        duration: 500
      });
    });
  };

  useEffect(() => {
    /* global fetch */
    fetch(
      'https://raw.githubusercontent.com/TuNK0411/app-demo/blob/main/src/data/vietnam.geojson'
    )
      .then(resp => resp.json())
      .then(json => setDataCluster(json))
      .catch(err => console.error('Could not load data', err)); // eslint-disable-line
  }, []);


  const pins = useMemo(
    () =>
      CITIES.map((city, index) => (
        <Marker
          key={`marker-${index}`}
          longitude={city.lng}
          latitude={city.lat}
          anchor="bottom"
          onClick={e => {
            // If we let the click event propagates to the map, it will immediately close the popup
            // with `closeOnClick: true`
            e.originalEvent.stopPropagation();
            // setPopupInfo(city);
          }}
        >
          <Pin />
        </Marker>
      )),
    []
  );

  return (
    <>
      <Map
        initialViewState={{
          latitude: 14.0583,
          longitude: 108.2772,
          zoom: 6
        }}
        mapStyle="mapbox://styles/mapbox/dark-v9"
        mapboxAccessToken={MAPBOX_TOKEN}
        interactiveLayerIds={[clusterLayer.id]}
        onClick={onClick}
        ref={mapRef}
      >
        {pins}
        <Source
          id="vietnam"
          type="geojson"
          data={geojsonData}
          cluster={true}
          clusterMaxZoom={14}
          clusterRadius={50}
        >
          <Layer {...clusterLayer} />
          <Layer {...clusterCountLayer} />
          <Layer {...unclusteredPointLayer} />
        </Source>
      </Map>
    </>
  );
}

export function renderToDom(container) {
  createRoot(container).render(<App />);
}
