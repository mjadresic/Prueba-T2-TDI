import React, { useEffect, useState } from 'react';
import './TrainInfoTable.css';

function TrainInfoTable({ trainPositions, currentStations }) {
  const [stations, setStations] = useState([]);
  const [trains, setTrains] = useState([]);

  useEffect(() => {
    const fetchStationsAndTrains = async () => {
      try {
        const stationsResponse = await fetch('https://tarea-2.2024-1.tallerdeintegracion.cl/api/metro/stations');
        const trainsResponse = await fetch('https://tarea-2.2024-1.tallerdeintegracion.cl/api/metro/trains');

        if (!stationsResponse.ok || !trainsResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const stationsData = await stationsResponse.json();
        const trainsData = await trainsResponse.json();

        setStations(stationsData);
        setTrains(trainsData.reduce((acc, train) => {
          acc[train.train_id] = { ...train, current_station_id: train.origin_station_id };
          return acc;
        }, {}));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchStationsAndTrains();
  }, [trainPositions]); // Dependencia actualizada

  const sortedTrains = Object.values(trains).sort((a, b) => a.line_id.localeCompare(b.line_id));
  
  return (
    <div className="tables-container">
      <div className="station-table-container">
        <h3>Estaciones</h3>
        <div className="scroll-container">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>ID</th>
                <th>Línea</th>
              </tr>
            </thead>
            <tbody>
              {stations.map(station => (
                <tr key={`${station.station_id}-${station.line_id}`}>
                  <td>{station.name}</td>
                  <td>{station.station_id}</td>
                  <td>{station.line_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="train-table-container">
        <h3>Trenes</h3>
        <div className="scroll-container">
          <table>
            <thead>
              <tr>
                <th>ID del Tren</th>
                <th>Línea</th>
                <th>Conductor</th>
                <th>Estación de Origen</th>
                <th>Estación de Destino</th>
                <th>Estación Actual</th>
              </tr>
            </thead>
            <tbody>
              {sortedTrains.map(train => (
                <tr key={train.train_id}>
                  <td>{train.train_id}</td>
                  <td>{train.line_id}</td>
                  <td>{train.driver_name}</td>
                  <td>{train.origin_station_id}</td>
                  <td>{train.destination_station_id}</td>
                  <td>{currentStations[train.train_id] || 'Cargando...'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TrainInfoTable;
