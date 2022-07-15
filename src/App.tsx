import React, { useEffect, useRef } from 'react';
import { Auth } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import { LocationClient, GetGeofenceCommand } from "@aws-sdk/client-location";
import { createMap, drawPoints, drawGeofences, createAmplifyGeocoder } from "maplibre-gl-js-amplify";
import "maplibre-gl/dist/maplibre-gl.css";
import "@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css";
import "maplibre-gl-js-amplify/dist/public/amplify-geocoder.css";
import '@aws-amplify/ui-react/styles.css';
import './App.css';

function App() {
  const mapRef = useRef(null);

  useEffect(() => {
    let map: maplibregl.Map;
    async function initializeMap() {
      if (mapRef.current != null) {
        map = await createMap({
          container: mapRef.current,
          center: [-122.431297, 37.773972],
          zoom: 11,
        });
      }
      Auth.currentCredentials()
        .then(async (credentials) => {
          try {
            const client = new LocationClient({ region: 'us-east-1', credentials: Auth.essentialCredentials(credentials) });
            const data = await client.send(new GetGeofenceCommand({
              CollectionName: 'alsDemoAppCollection-dev',
              GeofenceId: 'monitoring-55323a82-69d3-4698-a9da-907e52f64629',
            }));
            map.on('load', () => {
              drawPoints("pointsSource",
                [
                  {
                    coordinates: [-122.483696, 37.833818],
                    title: "Golden Gate Bridge",
                    address: "A suspension bridge spanning the Golden Gate",
                  },
                  {
                    coordinates: [- 122.4770, 37.8105],
                  },
                ],
                map,
                {
                  showCluster: true,
                  unclusteredOptions: {
                    showMarkerPopup: true,
                  },
                  clusterOptions: {
                    showCount: true,
                  },
                }
              );
              console.log({ data });
              // @ts-ignore
              drawGeofences('goldenGateBridgeSource', [data.Geometry.Polygon], map, {});
            });
          } catch (err) {
            console.error(err);
          }
        });
        map.addControl(createAmplifyGeocoder());
    }
    initializeMap();

    return function cleanup() {
      if (map != null) map.remove();
    };
  }, []);

  return (
    <div ref={mapRef} id="map" />
  );
}

export default withAuthenticator(App);
