import React, { useEffect, useState, useCallback } from 'react';
import Map from './components/Map';
import Chat from './components/Chat';
import TrainInfoTable from './components/TrainInfoTable';
import { connectWebSocket, disconnectWebSocket, sendChatMessage } from './services/websocketService';
import './App.css';

function App() {
  const [trainPositions, setTrainPositions] = useState({});
  const [trainDetails, setTrainDetails] = useState({});
  const [chatMessages, setChatMessages] = useState([]);
  const [currentStations, setCurrentStations] = useState({});

  const handleWebSocketMessage = useCallback((message) => {
    switch (message.type) {
      case 'position':
        const { train_id, position } = message.data;
        setTrainPositions(prevPositions => ({
          ...prevPositions,
          [train_id]: {
            ...prevPositions[train_id],
            ...message.data,
            path: [...(prevPositions[train_id]?.path || []), position]
          }
        }));
        break;
      case 'status':
        //print the status message
        console.log(message.data, "timestamp:", message.timestamp);
        setTrainDetails(prevDetails => ({
          ...prevDetails,
          [message.data.train_id]: {
            ...prevDetails[message.data.train_id],
            status: message.data.status
          }
        }));
        break;
      case 'arrival':
        setCurrentStations(prevStations => {
          const updatedStations = {...prevStations, [message.data.train_id]: message.data.station_id};
          return updatedStations;
        });
        break;
      case 'departure':
        break;
      case 'boarding':
        setTrainDetails(prevDetails => ({
          ...prevDetails,
          [message.data.train_id]: {
            ...prevDetails[message.data.train_id],
            passengers: (prevDetails[message.data.train_id]?.passengers || 0) + message.data.boarded_passengers
          }
        }));
        break;
      case 'unboarding':
        setTrainDetails(prevDetails => ({
          ...prevDetails,
          [message.data.train_id]: {
            ...prevDetails[message.data.train_id],
            passengers: (prevDetails[message.data.train_id]?.passengers || 0) - message.data.unboarded_passengers
          }
        }));
        break;
      case 'message':
        setChatMessages(prevMessages => [...prevMessages, {
          ...message.data,
          timestamp: message.timestamp,
          name: message.data.name || 'Sistema'
        }]);
        break;
      case 'accepted':
        console.log('WebSocket connection accepted');
        break;
      default:
        console.log('Received unknown message type:', message.type);
    }
  }, []);

  useEffect(() => {
    const connectWebSocketAndFetchData = () => {
      connectWebSocket(handleWebSocketMessage).then(() => {
        // Fetch initial train data
        const fetchData = async () => {
          try {
            const response = await fetch('https://tarea-2.2024-1.tallerdeintegracion.cl/api/metro/trains');
            const data = await response.json();
            const activeTrainIds = new Set(data.map(item => item.train_id));
  
            // Merge new train details with existing to avoid overwriting WebSocket updates
            setTrainDetails(prevDetails => {
              const details = data.reduce((acc, item) => {
                if (!prevDetails[item.train_id]) {
                  // Only set new details if not already present
                  acc[item.train_id] = { ...item, passengers: 0 };
                } else {
                  // Otherwise, keep existing details, could also merge some new info if needed
                  acc[item.train_id] = { ...prevDetails[item.train_id], ...item };
                }
                return acc;
              }, {});
              return { ...prevDetails, ...details };
            });
  
            // Filter and maintain positions of only active trains
            setTrainPositions(prevPositions => {
              return Object.keys(prevPositions).reduce((acc, trainId) => {
                if (activeTrainIds.has(trainId)) {
                  acc[trainId] = prevPositions[trainId];
                }
                return acc;
              }, {});
            });
  
          } catch (error) {
            console.error('Failed to fetch train details:', error);
          }
        };
  
        fetchData();
        const intervalId = setInterval(fetchData, 2500); // Update every 2.5 seconds
  
        return () => {
          clearInterval(intervalId);
          disconnectWebSocket();
        };
      }).catch(error => {
        console.error('Error connecting WebSocket:', error);
      });
    };
  
    connectWebSocketAndFetchData();
  
    return () => {
      disconnectWebSocket();
    };
  }, [handleWebSocketMessage]); // Ensure the dependency list is correct
  
  
  
  

  const handleSendMessage = (messageContent) => {
    sendChatMessage(messageContent);  // Solo pasas el contenido
  };

  return (
    <div className="App">
      <h1>Monitor de Trenes del Metro de Santiago</h1>
      <Map trainPositions={trainPositions} trainDetails={trainDetails} />
      <TrainInfoTable trainPositions={trainPositions} currentStations={currentStations} />
      <Chat messages={chatMessages} onSendMessage={handleSendMessage} />
    </div>
  );
}

export default App;
