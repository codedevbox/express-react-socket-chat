import { createContext, ReactNode, useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";
import { useUserStore } from "../store/userStore";

interface SocketContextType {
  socket: Socket | null;
}

export const SocketContext = createContext<SocketContextType>({ socket: null });

interface SocketContextProviderProps {
  children: ReactNode;
}

export const SocketContextProvider: React.FC<SocketContextProviderProps> = ({
  children,
}) => {
  const { currentUser } = useUserStore();
  const [socket, setSocket] = useState<Socket | null>(null);
  const socketBaseUrl = import.meta.env.VITE_SOCKET_BASE_URL;

  useEffect(() => {
    const newSocket = io(socketBaseUrl);
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [socketBaseUrl]);

  useEffect(() => {
    currentUser && socket?.emit("newUser", currentUser.id);
  }, [currentUser, socket]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
