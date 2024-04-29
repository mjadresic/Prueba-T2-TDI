let socket;
let isConnected = false;
let connectionPromise;

export const connectWebSocket = (onMessageReceived) => {
  if (socket && isConnected) {
    console.log('WebSocket is already connected.');
    return connectionPromise;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  console.log('Attempting to connect WebSocket...');
  socket = new WebSocket('wss://tarea-2.2024-1.tallerdeintegracion.cl/connect');

  connectionPromise = new Promise((resolve, reject) => {
    socket.onopen = () => {
      isConnected = true;
      console.log('WebSocket connected successfully');
      joinWebSocket(); // Llama a joinWebSocket después de que el socket esté abierto
      resolve(); // Resuelve la promesa solo cuando la conexión se establece correctamente
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      onMessageReceived(message);
    };

    socket.onerror = (error) => {
      isConnected = false;
      reject(new Error('WebSocket encountered an error: ' + error.message)); // Rechaza la promesa en caso de error
    };
  });

  return connectionPromise;
};


export const disconnectWebSocket = () => {
  if (!socket || !isConnected) {
    return;
  }

  console.log('Disconnecting WebSocket...');
  socket.close();
  isConnected = false;
  console.log('WebSocket disconnected');
};

const joinWebSocket = () => {
  if (socket.readyState === WebSocket.OPEN) {
    console.log('Joining WebSocket...');
    const joinEvent = {
      type: 'JOIN',
      payload: {
        id: '19625588',  // Tu número de alumno
        username: 'mjadresic',  // Opcional, un nombre de usuario
      }
    };
    socket.send(JSON.stringify(joinEvent));
    console.log('Joined WebSocket');
  } else {
    console.log('WebSocket is not open yet.');
  }
};

export const sendChatMessage = (content) => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.log('WebSocket is not open to send messages.');
    return;
  }

  const chatEvent = {
    type: 'MESSAGE',
    payload: {
      name: 'usuario',  // Asumiendo que siempre envías como 'usuario'
      content: content
    }
  };
  socket.send(JSON.stringify(chatEvent));
};
