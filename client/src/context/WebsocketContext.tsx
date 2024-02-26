import React, { createContext, useState, useEffect, useContext } from 'react';

const WebSocketContext = createContext<WebSocketContextType | null>(null);

interface WebSocketContextType {
    connectToRoom: (roomId: string, userName: string) => void;
    closeRoomConnection: (roomId: string) => void;
    sendMessage: (roomId: string, message: any) => void; // Adjust message type as needed
    messages: any[]; // Replace 'any' with a more specific type 
    roomMembers: string[]
    error: Error | null;
}

interface Subscription {
    connection: WebSocket; // Use the underlying WebSocket type
    roomId: string; 
}

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [messages, setMessages] = useState<any>([]);
    const [roomMembers, setRoomMembers] = useState<string[]>([]);
    const [error, setError] = useState<any>(null); 

    const connectToRoom = (roomId: string, userName: string) => {
        const ws = new WebSocket(`ws://localhost:1990/ws/${roomId}/${userName}`); 

        ws.onopen = () => {
            setSubscriptions(prev => [...prev, { connection: ws, roomId }]);
        };

        ws.onmessage = (event) => {
            console.log(event,'the event');
            const data = JSON.parse(event.data); 
            console.log(data);
            if(data.event === "newMessage"){
                setMessages((prevMessages: any) => [...prevMessages, data.data]);
            }else if(data.event ==="updateMembers"){
                console.log(data.data,"my room members");
                setRoomMembers(data.data);
            }
        };

        ws.onerror = (err) => {
            setError(err);
        };

        ws.onclose = () => {
          setSubscriptions(prev => prev.filter(s => s.connection !== ws));   
        };
    };

    const closeRoomConnection = (roomId: string) => {
      console.log('here closing')
      const sub = subscriptions.find(s => s.roomId === roomId);
      if (sub) {
        console.log("will close here",sub)
          sub.connection.close(); // Close the WebSocket
          setSubscriptions(prev => prev.filter(s => s !== sub)); // Remove from subscriptions
      }
  };


    const sendMessage = (roomId: string, message: any) => {
      console.log('hello here')
        const sub = subscriptions.find(s => s.roomId === roomId);
        if (sub && sub.connection.readyState === WebSocket.OPEN) {
            sub.connection.send(JSON.stringify(message));
        }
    };

    return (
        <WebSocketContext.Provider 
            value={{ connectToRoom, sendMessage, messages, error,closeRoomConnection,roomMembers }}
        >
            {children}
        </WebSocketContext.Provider>
    );
};

export default WebSocketContext;