import React, { createContext, useContext, useEffect, useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { StreamChat } from "stream-chat";
import { StreamVideoClient } from "@stream-io/video-react-sdk";

// Import CSS
import "stream-chat-react/dist/css/index.css";
import "@stream-io/video-react-sdk/dist/css/styles.css";

const StreamContext = createContext({
  chatClient: null,
  videoClient: null,
  isLoading: true,
  error: null,
});

export const useStream = () => useContext(StreamContext);

export const StreamProvider = ({ children }) => {
  const [chatClient, setChatClient] = useState(null);
  const [videoClient, setVideoClient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentUser = useQuery(api.users.getCurrent);
  const getTokenAction = useAction(api.stream.getToken);

  useEffect(() => {
    // If user query is in loading state
    if (currentUser === undefined) {
      setIsLoading(true);
      return;
    }

    // If user is not logged in (e.g. at auth page)
    if (currentUser === null) {
      setChatClient(null);
      setVideoClient(null);
      setIsLoading(false);
      return;
    }

    let isSubscribed = true;
    let activeChatClient = null;
    let activeVideoClient = null;

    const initStream = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Request token from Convex secure action
        const { apiKey, token, userId } = await getTokenAction();

        if (!isSubscribed) return;

        // 1. Initialize Stream Chat client
        const cClient = StreamChat.getInstance(apiKey);
        
        // Disconnect if previously connected
        if (cClient.userID) {
          await cClient.disconnectUser();
        }

        await cClient.connectUser(
          {
            id: userId,
            name: currentUser.name,
            image: currentUser.avatar || "",
          },
          token
        );

        if (!isSubscribed) {
          await cClient.disconnectUser();
          return;
        }

        activeChatClient = cClient;
        setChatClient(cClient);

        // 2. Initialize Stream Video client
        const vClient = new StreamVideoClient({
          apiKey,
          user: {
            id: userId,
            name: currentUser.name,
            image: currentUser.avatar || "",
          },
          token,
        });

        activeVideoClient = vClient;
        setVideoClient(vClient);
        setIsLoading(false);

      } catch (err) {
        console.error("Failed to initialize Stream SDKs:", err);
        if (isSubscribed) {
          setError(err.message || "Failed to connect to communication services");
          setIsLoading(false);
        }
      }
    };

    initStream();

    return () => {
      isSubscribed = false;
      
      const cleanUp = async () => {
        if (activeChatClient) {
          try {
            await activeChatClient.disconnectUser();
          } catch (e) {
            console.error("Error disconnecting chat client:", e);
          }
        }
        if (activeVideoClient) {
          try {
            await activeVideoClient.disconnectUser();
          } catch (e) {
            console.error("Error disconnecting video client:", e);
          }
        }
      };
      
      cleanUp();
      setChatClient(null);
      setVideoClient(null);
    };
  }, [currentUser?._id, getTokenAction]);

  return (
    <StreamContext.Provider value={{ chatClient, videoClient, isLoading, error }}>
      {children}
    </StreamContext.Provider>
  );
};
