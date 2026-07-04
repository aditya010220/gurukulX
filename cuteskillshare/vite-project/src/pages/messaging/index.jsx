import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useStream } from "../../components/providers/StreamProvider";
import {
  Chat,
  Channel as StreamChannel,
  Window,
  ChannelHeader,
  MessageList,
  MessageComposer,
  Thread,
} from "stream-chat-react";
import Button from "../../components/ui/Button";
import Icon from "../../components/AppIcon";

const MessagingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const partnerIdParam = searchParams.get("userId");

  const { chatClient, isLoading: streamLoading } = useStream();
  
  // Convex queries & mutations
  const currentUser = useQuery(api.users.getCurrent);
  const connectedUsers = useQuery(api.connections.listConnected);
  const getOrCreateSession = useMutation(api.sessions.getOrCreateSwapSession);

  const [selectedPartner, setSelectedPartner] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loadingChannel, setLoadingChannel] = useState(false);
  const [startingCall, setStartingCall] = useState(false);

  // Auto-select partner from query parameter or default to first connected user
  useEffect(() => {
    if (!connectedUsers || connectedUsers.length === 0) return;

    if (partnerIdParam) {
      const match = connectedUsers.find(
        (c) => c.user._id.toString() === partnerIdParam
      );
      if (match) {
        setSelectedPartner(match.user);
        return;
      }
    }

    // Default select first user if no selection is made yet
    if (!selectedPartner) {
      setSelectedPartner(connectedUsers[0].user);
    }
  }, [connectedUsers, partnerIdParam, selectedPartner]);

  // Load chat channel for selected partner
  useEffect(() => {
    if (!chatClient || !currentUser || !selectedPartner) return;

    const initChannel = async () => {
      try {
        setLoadingChannel(true);
        // Create/watch the private messaging channel
        const newChannel = chatClient.channel("messaging", {
          members: [currentUser._id.toString(), selectedPartner._id.toString()],
        });

        await newChannel.watch();
        setChannel(newChannel);
        setLoadingChannel(false);
      } catch (err) {
        console.error("Failed to initialize chat channel:", err);
        setLoadingChannel(false);
      }
    };

    initChannel();
  }, [chatClient, currentUser, selectedPartner]);

  const handleStartSession = async () => {
    if (!selectedPartner) return;
    try {
      setStartingCall(true);
      const { sessionId } = await getOrCreateSession({ partnerId: selectedPartner._id });
      navigate(`/session/${sessionId}`);
    } catch (err) {
      console.error("Failed to start session:", err);
      alert(err.message || "Could not start session");
    } finally {
      setStartingCall(false);
    }
  };

  if (streamLoading || connectedUsers === undefined || currentUser === undefined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="text-muted-foreground font-medium">Loading conversation board...</p>
      </div>
    );
  }

  return (
    <div className="flex bg-card rounded-3xl border border-border overflow-hidden h-[calc(100vh-12rem)] min-h-[500px]">
      {/* Sidebar - Connected Users list */}
      <div className="w-80 border-r border-border flex flex-col bg-card">
        <div className="p-5 border-b border-border flex justify-between items-center">
          <h2 className="font-heading font-bold text-foreground text-lg flex items-center gap-2">
            <Icon name="MessageSquare" size={20} className="text-primary" />
            Chats
          </h2>
          <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-xs font-semibold">
            {connectedUsers.length}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {connectedUsers.length > 0 ? (
            connectedUsers.map((conn) => {
              const isActive = selectedPartner?._id.toString() === conn.user._id.toString();
              return (
                <button
                  key={conn.user._id}
                  onClick={() => setSelectedPartner(conn.user)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 text-left ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-warm"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <img
                    src={conn.user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb"}
                    alt={conn.user.name}
                    className="w-11 h-11 rounded-full object-cover border border-border/20"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm truncate ${isActive ? "text-primary-foreground" : "text-foreground"}`}>
                      {conn.user.name}
                    </p>
                    <p className={`text-xs truncate opacity-85 mt-0.5`}>
                      {conn.user.title || "Learner"}
                    </p>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="py-12 px-4 text-center text-muted-foreground">
              <Icon name="Users2" size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">No connected learners</p>
              <p className="text-xs mt-1">Connect with learners in Smart Matches to start messaging.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => navigate("/matches")}
              >
                Find Matches
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Conversation Board */}
      <div className="flex-1 flex flex-col bg-background/30">
        {selectedPartner && chatClient && channel ? (
          <div className="flex-1 flex flex-col relative h-full">
            {/* Call Action Bar overlay */}
            <div className="absolute top-3 right-4 z-20 flex gap-2">
              <Button
                variant="success"
                size="sm"
                onClick={handleStartSession}
                disabled={startingCall}
                iconName="Phone"
                iconPosition="left"
              >
                {startingCall ? "Starting..." : "Start Session"}
              </Button>
            </div>

            {loadingChannel ? (
              <div className="flex-grow flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col h-full str-chat">
                <Chat client={chatClient}>
                  <StreamChannel channel={channel}>
                    <Window>
                      <ChannelHeader />
                      <div className="flex-1 overflow-y-auto px-4 py-2">
                        <MessageList />
                      </div>
                      <MessageComposer />
                    </Window>
                    <Thread />
                  </StreamChannel>
                </Chat>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <Icon name="MessageSquareDashed" size={48} className="opacity-40 mb-3" />
            <p className="font-semibold text-lg text-foreground">Start a conversation</p>
            <p className="text-sm mt-1 max-w-sm">
              Select a connected co-learner from the sidebar to open your private chat and exchange files, emojis, and skills.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagingPage;
