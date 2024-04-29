import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const mapStyle = { height: '600px', width: '100%' };

function Map({ trainPositions, trainDetails }) {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const [stations, setStations] = useState([]);
  const [lines, setLines] = useState([]);
  const trainMarkers = useRef({});
  const paths = useRef({});

  useEffect(() => {
    if (!mapContainerRef.current || !mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        center: [-33.45, -70.66667],
        zoom: 13,
        layers: [
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
          })
        ]
      });

      // Create a custom pane for train paths
      const trainPathPane = mapRef.current.createPane('trainPaths');
      trainPathPane.style.zIndex = 450;

      loadMapData();
    }
  }, []);

  const loadMapData = async () => {
    try {
      const stationsResponse = await fetch('https://tarea-2.2024-1.tallerdeintegracion.cl/api/metro/stations');
      const linesResponse = await fetch('https://tarea-2.2024-1.tallerdeintegracion.cl/api/metro/lines');

      if (!stationsResponse.ok || !linesResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const stationsData = await stationsResponse.json();
      const linesData = await linesResponse.json();

      setStations(stationsData);
      setLines(linesData);

      linesData.forEach(line => {
        const lineCoordinates = line.station_ids.map(id => {
          const station = stationsData.find(s => s.station_id === id && s.line_id === line.line_id);
          return station ? [station.position.lat, station.position.long] : null;
        }).filter(coord => coord !== null);

        if (lineCoordinates.length > 0) {
          L.polyline(lineCoordinates, { color: line.color }).addTo(mapRef.current);
        }
      });

      stationsData.forEach(station => {
        const icon = L.icon({
          iconUrl: '/logo_estacion.png',
          iconSize: [30, 30],
          iconAnchor: [15, 30],
          popupAnchor: [0, -30]
        });

        L.marker([station.position.lat, station.position.long], { icon })
          .bindPopup(`
            <div>
              <h3>${station.name}</h3>
              <p><strong>ID Estación:</strong> ${station.station_id}</p>
              <p><strong>Línea:</strong> ${station.line_id}</p>
            </div>
          `).addTo(mapRef.current);
      });
    } catch (error) {
      console.error('Error loading map data:', error);
    }
  };

  useEffect(() => {
    Object.keys(trainPositions).forEach(trainId => {
      const { position, path } = trainPositions[trainId];
      const trainDetail = trainDetails[trainId];
  
      let iconUrl = '/icono_metro_traveling.png'; // Default to traveling
      if (trainDetail && trainDetail.status) {
        const statusNormalized = trainDetail.status.toLowerCase();
        if (['stopped', 'arrived', 'departing', 'traveling'].includes(statusNormalized)) {
          iconUrl = `/icono_metro_${statusNormalized}.png`;
        }
      }
  
      const icon = L.icon({
        iconUrl: iconUrl,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });
  
      const popupContent = `
        <div>
          <h3>Tren ID: ${trainId}</h3>
          <p>Linea ID: ${trainDetail?.line_id || 'Cargando...'}</p>
          <p>Chofer: ${trainDetail?.driver_name || 'Cargando...'}</p>
          <p>Estado: ${trainDetail?.status || 'Cargando...'}</p>
          <p>Pasajeros: ${trainDetail?.passengers || 0}</p>
        </div>
      `;
  
      let marker = trainMarkers.current[trainId];
      if (!marker) {
        marker = L.marker([position.lat, position.long], { icon })
          .addTo(mapRef.current)
          .bindPopup(popupContent);
        trainMarkers.current[trainId] = marker;
      } else {
        // Check if the icon has actually changed
        if (marker.getIcon().options.iconUrl !== iconUrl) {
          mapRef.current.removeLayer(marker); // Remove the old marker
          marker = L.marker([position.lat, position.long], { icon }) // Create a new marker
            .addTo(mapRef.current)
            .bindPopup(popupContent);
          trainMarkers.current[trainId] = marker;
        } else {
          marker.setLatLng([position.lat, position.long]);
          marker.setPopupContent(popupContent);
        }
      }
  
      // Handle polylines similarly
      let polyline = paths.current[trainId];
      if (!polyline) {
        polyline = L.polyline(path.map(p => [p.lat, p.long]), { color: 'black', pane: 'trainPaths' }).addTo(mapRef.current);
        paths.current[trainId] = polyline;
      } else {
        polyline.setLatLngs(path.map(p => [p.lat, p.long]));
      }
    });
  
    // Cleanup markers for trains that no longer exist
    Object.keys(trainMarkers.current).forEach(trainId => {
      if (!trainPositions[trainId]) {
        if (trainMarkers.current[trainId]) {
          mapRef.current.removeLayer(trainMarkers.current[trainId]);
          delete trainMarkers.current[trainId];
        }
        if (paths.current[trainId]) {
          mapRef.current.removeLayer(paths.current[trainId]);
          delete paths.current[trainId];
        }
      }
    });
  }, [trainPositions, trainDetails]);
  
  

  return (
    <div>
      <h2>Mapa del Metro</h2>
      <div ref={mapContainerRef} style={mapStyle} />
    </div>
  );
}

export default Map;
