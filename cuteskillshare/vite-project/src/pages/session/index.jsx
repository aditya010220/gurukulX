import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useStream } from "../../components/providers/StreamProvider";
import {
  StreamCall,
  StreamTheme as VideoTheme,
  SpeakerLayout,
  CallParticipantsList,
  useCall,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import {
  Chat,
  Channel,
  Window,
  ChannelHeader,
  MessageList,
  MessageComposer,
  Thread,
} from "stream-chat-react";
import Button from "../../components/ui/Button";
import Icon from "../../components/AppIcon";

const CustomCallControls = ({ onLeave }) => {
  const call = useCall();
  const { useMicrophoneState, useCameraState } = useCallStateHooks();
  const micState = useMicrophoneState();
  const camState = useCameraState();

  const isMuted = !micState.isEnabled;
  const isCamOff = !camState.isEnabled;

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 px-4 py-2 bg-[#1e1e24]/90 backdrop-blur-md rounded-full border border-neutral-700/40 shadow-2xl">
      {/* Mic Control Pill */}
      <div className={`flex items-center rounded-full text-white cursor-pointer transition-all duration-200 ${
        isMuted ? "bg-red-500/90 hover:bg-red-600" : "bg-[#2d2f31] hover:bg-[#3c4043]"
      }`}>
        <button 
          onClick={() => call?.microphone.toggle()} 
          className="flex items-center justify-center w-9 h-9 pl-3 pr-1 rounded-l-full text-white"
          title={isMuted ? "Unmute Mic" : "Mute Mic"}
        >
          <Icon name={isMuted ? "MicOff" : "Mic"} size={16} />
        </button>
        <div className="w-[1px] h-3.5 bg-white/20"></div>
        <button className="pl-1 pr-3 py-2 text-white flex items-center justify-center" aria-label="Mic Settings">
          <Icon name="ChevronUp" size={8} />
        </button>
      </div>

      {/* Camera Control Pill */}
      <div className={`flex items-center rounded-full text-white cursor-pointer transition-all duration-200 ${
        isCamOff ? "bg-red-500/90 hover:bg-red-600" : "bg-[#2d2f31] hover:bg-[#3c4043]"
      }`}>
        <button 
          onClick={() => call?.camera.toggle()} 
          className="flex items-center justify-center w-9 h-9 pl-3 pr-1 rounded-l-full text-white"
          title={isCamOff ? "Turn On Camera" : "Turn Off Camera"}
        >
          <Icon name={isCamOff ? "VideoOff" : "Video"} size={16} />
        </button>
        <div className="w-[1px] h-3.5 bg-white/20"></div>
        <button className="pl-1 pr-3 py-2 text-white flex items-center justify-center" aria-label="Camera Settings">
          <Icon name="ChevronUp" size={8} />
        </button>
      </div>

      {/* Emoji/Reaction */}
      <button className="flex items-center justify-center w-9 h-9 bg-[#2d2f31] hover:bg-[#3c4043] rounded-full text-white transition-colors duration-200" title="Send Reaction">
        <Icon name="Smile" size={16} />
      </button>

      {/* Screen Share */}
      <button 
        onClick={() => call?.screenShare.toggle()}
        className="flex items-center justify-center w-9 h-9 bg-[#2d2f31] hover:bg-[#3c4043] rounded-full text-white transition-colors duration-200" 
        title="Present Screen"
      >
        <Icon name="MonitorUp" size={16} />
      </button>

      {/* Recording */}
      <button className="flex items-center justify-center w-9 h-9 bg-[#2d2f31] hover:bg-[#3c4043] rounded-full text-white transition-colors duration-200" title="Record Session">
        <Icon name="CircleDot" size={16} />
      </button>

      {/* Leave Call (Red) */}
      <button 
        onClick={onLeave} 
        className="flex items-center justify-center w-9 h-9 bg-[#ea4335] hover:bg-[#d93025] rounded-full text-white transition-colors duration-200" 
        title="End Call"
      >
        <Icon name="PhoneOff" size={16} />
      </button>
    </div>
  );
};

const JoinSessionPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { chatClient, videoClient, isLoading: streamLoading, error: streamError } = useStream();

  // Query session/booking details and authorize user
  const sessionData = useQuery(api.sessions.getBySessionId, { sessionId });

  const [call, setCall] = useState(null);
  const [channel, setChannel] = useState(null);
  const [sessionError, setSessionError] = useState(null);
  const [joining, setJoining] = useState(true);

  useEffect(() => {
    if (streamLoading) return;
    if (streamError) {
      setSessionError(streamError);
      setJoining(false);
      return;
    }
    if (sessionData === undefined) return; // Wait for convex query

    if (sessionData === null) {
      setSessionError("Session not found or expired.");
      setJoining(false);
      return;
    }

    const initCallAndChat = async () => {
      try {
        setJoining(true);

        // 1. Initialize Stream Call
        const newCall = videoClient.call("default", sessionId);
        
        // Join call, creating it if it doesn't exist
        await newCall.join({ create: true });
        setCall(newCall);

        // 2. Initialize Stream Chat Channel
        let members = [];
        let channelName = "Co-learning Session";

        if (sessionData.type === "course") {
          members = [sessionData.booking.studentId.toString(), sessionData.booking.mentorId.toString()];
          channelName = `Session: ${sessionData.course?.title || "Course Session"}`;
        } else if (sessionData.type === "swap") {
          members = sessionData.session.participants.map(p => p.toString());
          channelName = `Swap Session with ${sessionData.partner?.name || "Learner"}`;
        }

        const newChannel = chatClient.channel("messaging", sessionId, {
          name: channelName,
          members,
        });

        await newChannel.watch();
        setChannel(newChannel);
        setJoining(false);

      } catch (err) {
        console.error("Failed to join call/chat session:", err);
        setSessionError(err.message || "Failed to establish video call or chat channel");
        setJoining(false);
      }
    };

    initCallAndChat();

    // Clean up call on leave
    return () => {
      if (call) {
        call.leave().catch(console.error);
      }
    };
  }, [sessionId, videoClient, chatClient, streamLoading, streamError, sessionData]);

  if (streamLoading || (sessionData === undefined && !sessionError)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="text-muted-foreground font-medium animate-pulse">Initializing communication services...</p>
      </div>
    );
  }

  if (sessionError || !sessionData) {
    return (
      <div className="max-w-md mx-auto mt-12 p-8 bg-card border border-border rounded-3xl text-center shadow-warm-lg">
        <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
          <Icon name="AlertTriangle" size={24} className="text-error" />
        </div>
        <h2 className="text-xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground text-sm mb-6 leading-relaxed text-balance">
          {sessionError || "You are not authorized to join this session or it does not exist."}
        </p>
        <Button variant="default" onClick={() => navigate("/swaps")}>
          Back to My Swaps
        </Button>
      </div>
    );
  }

  if (joining) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-success"></div>
        <p className="text-muted-foreground font-medium">Connecting to call room & chat channel...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-12rem)] min-h-[550px]">
      {/* Video Section */}
      <div className="flex-1 bg-[#1a1a24] rounded-3xl border border-border/10 overflow-hidden flex flex-col relative shadow-2xl">
        <div className="absolute top-4 left-6 z-10 bg-background/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-border/30 text-xs font-semibold text-foreground">
          {sessionData.type === "course" ? "1-on-1 Mentorship Call" : "Skill Exchange Swap Call"}
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          {call && (
            <StreamCall call={call}>
              <VideoTheme>
                <div className="w-full h-full flex flex-col justify-between relative">
                  <div className="flex-1 relative rounded-2xl overflow-hidden min-h-[300px]">
                    <SpeakerLayout />
                    <CustomCallControls onLeave={() => navigate(-1)} />
                  </div>
                </div>
              </VideoTheme>
            </StreamCall>
          )}
        </div>
      </div>

      {/* Chat Section */}
      <div className="w-full lg:w-96 bg-card rounded-3xl border border-border overflow-hidden flex flex-col shadow-warm-md str-chat">
        {chatClient && channel && (
          <Chat client={chatClient}>
            <Channel channel={channel}>
              <Window>
                <ChannelHeader />
                <div className="flex-1 overflow-y-auto px-4 py-2 min-h-[250px]">
                  <MessageList />
                </div>
                <MessageComposer />
              </Window>
              <Thread />
            </Channel>
          </Chat>
        )}
      </div>
    </div>
  );
};

export default JoinSessionPage;
