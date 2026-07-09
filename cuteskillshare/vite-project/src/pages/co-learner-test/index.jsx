import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { StreamChat } from "stream-chat";
import { StreamVideoClient, StreamCall, StreamTheme, SpeakerLayout, CallControls } from "@stream-io/video-react-sdk";
import Button from "../../components/ui/Button";
import Icon from "../../components/AppIcon";

const CoLearnerTestPage = () => {
  // ─── Convex State & Setup ─────────────────────────────────────
  const testUsers = useQuery(api.testUtils.getTestUsers);
  const setupTestUsers = useMutation(api.testUtils.setupTestUsers);
  const resetTestState = useMutation(api.testUtils.resetTestState);
  const sendTestConnection = useMutation(api.testUtils.sendTestConnection);
  const acceptTestConnection = useMutation(api.testUtils.acceptTestConnection);
  const rejectTestConnection = useMutation(api.testUtils.rejectTestConnection);
  const createTestSession = useMutation(api.testUtils.createTestSession);
  const getTestConnectionStatus = useQuery(
    api.testUtils.getTestConnectionStatus,
    testUsers && testUsers.alice && testUsers.bob
      ? { aliceId: testUsers.alice._id, bobId: testUsers.bob._id }
      : "skip"
  );

  const getTestTokenAction = useAction(api.stream.getTestToken);

  // ─── Simulator UI State ───────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("checking"); // "checking" | "ready" | "live" | "simulated"
  const [errorMessage, setErrorMessage] = useState("");
  const [activeStep, setActiveStep] = useState(1); // 1: Setup, 2: Request, 3: Accept, 4: Messaging, 5: Video Call
  const [simulatorResponded, setSimulatorResponded] = useState(null); // null | "accepted" | "rejected"
  
  // Stream Clients for Alice and Bob
  const [aliceChat, setAliceChat] = useState(null);
  const [aliceVideo, setAliceVideo] = useState(null);
  const [bobChat, setBobChat] = useState(null);
  const [bobVideo, setBobVideo] = useState(null);

  // Active Stream elements
  const [sessionInfo, setSessionInfo] = useState(null); // { sessionId }
  const [aliceCall, setAliceCall] = useState(null);
  const [bobCall, setBobCall] = useState(null);

  // Mock messaging fallback state
  const [mockMessages, setMockMessages] = useState([]);
  const [aliceInput, setAliceInput] = useState("");
  const [bobInput, setBobInput] = useState("");

  // Video call state
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [aliceMicMuted, setAliceMicMuted] = useState(false);
  const [aliceCamOff, setAliceCamOff] = useState(false);
  const [bobMicMuted, setBobMicMuted] = useState(false);
  const [bobCamOff, setBobCamOff] = useState(false);

  // Auto-setup test users on page load
  useEffect(() => {
    const initUsers = async () => {
      setLoading(true);
      try {
        await setupTestUsers();
      } catch (err) {
        console.error("Setup users error:", err);
      } finally {
        setLoading(false);
      }
    };
    initUsers();
  }, [setupTestUsers]);

  // Adjust active step based on connection/session status
  useEffect(() => {
    if (!testUsers?.alice || !testUsers?.bob) {
      setActiveStep(1); // Need setup
      return;
    }

    if (!getTestConnectionStatus) {
      setActiveStep(2); // No connection request sent yet
    } else if (getTestConnectionStatus.status === "Pending") {
      setActiveStep(3); // Request pending
    } else if (getTestConnectionStatus.status === "Accepted") {
      if (isVideoCallActive) {
        setActiveStep(5); // In video call
      } else {
        setActiveStep(4); // Messaging & call available
      }
    } else if (getTestConnectionStatus.status === "Rejected" || simulatorResponded === "rejected") {
      setActiveStep(3); // Keep on request step for reject feedback
    }
  }, [testUsers, getTestConnectionStatus, isVideoCallActive, simulatorResponded]);

  // Handle Clean up for Stream SDK clients
  useEffect(() => {
    return () => {
      const cleanup = async () => {
        if (aliceChat) await aliceChat.disconnectUser().catch(console.error);
        if (bobChat) await bobChat.disconnectUser().catch(console.error);
        if (aliceVideo) await aliceVideo.disconnectUser().catch(console.error);
        if (bobVideo) await bobVideo.disconnectUser().catch(console.error);
      };
      cleanup();
    };
  }, [aliceChat, bobChat, aliceVideo, bobVideo]);

  // ─── Initialize Stream Live Mode ──────────────────────────────
  const initializeLiveStream = async () => {
    if (!testUsers?.alice || !testUsers?.bob) return;
    setLoading(true);
    setErrorMessage("");

    try {
      // 1. Get tokens
      const aliceData = await getTestTokenAction({ userId: testUsers.alice._id.toString() });
      const bobData = await getTestTokenAction({ userId: testUsers.bob._id.toString() });

      // 2. Init Alice Chat
      const aChat = new StreamChat(aliceData.apiKey);
      await aChat.connectUser(
        {
          id: aliceData.userId,
          name: testUsers.alice.name,
          image: testUsers.alice.avatar,
        },
        aliceData.token
      );
      setAliceChat(aChat);

      // 3. Init Bob Chat
      const bChat = new StreamChat(bobData.apiKey);
      await bChat.connectUser(
        {
          id: bobData.userId,
          name: testUsers.bob.name,
          image: testUsers.bob.avatar,
        },
        bobData.token
      );
      setBobChat(bChat);

      // 4. Init Video Clients
      const aVideo = new StreamVideoClient({
        apiKey: aliceData.apiKey,
        user: { id: aliceData.userId, name: testUsers.alice.name, image: testUsers.alice.avatar },
        token: aliceData.token,
      });
      setAliceVideo(aVideo);

      const bVideo = new StreamVideoClient({
        apiKey: bobData.apiKey,
        user: { id: bobData.userId, name: testUsers.bob.name, image: testUsers.bob.avatar },
        token: bobData.token,
      });
      setBobVideo(bVideo);

      setMode("live");
    } catch (err) {
      console.warn("Failed to initialize Live Stream SDK, falling back to simulated mode:", err);
      setErrorMessage(err.message || "Failed to initialize live stream. Simulator mode activated.");
      setMode("simulated");
    } finally {
      setLoading(false);
    }
  };

  // ─── Actions ───────────────────────────────────────────────────
  const handleReset = async () => {
    if (!testUsers?.alice || !testUsers?.bob) return;
    setLoading(true);
    try {
      await resetTestState({
        aliceId: testUsers.alice._id,
        bobId: testUsers.bob._id,
      });
      
      // Cleanup Stream video calls if any
      if (aliceCall) {
        await aliceCall.leave().catch(console.error);
        setAliceCall(null);
      }
      if (bobCall) {
        await bobCall.leave().catch(console.error);
        setBobCall(null);
      }
      setIsVideoCallActive(false);
      setIsCalling(false);
      setSessionInfo(null);
      setMockMessages([]);
      setSimulatorResponded(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async () => {
    if (!testUsers?.alice || !testUsers?.bob) return;
    setLoading(true);
    try {
      await sendTestConnection({
        senderId: testUsers.alice._id,
        receiverId: testUsers.bob._id,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (!getTestConnectionStatus || !testUsers?.bob) return;
    setLoading(true);
    setSimulatorResponded("accepted");
    try {
      await acceptTestConnection({
        connectionId: getTestConnectionStatus._id,
        receiverId: testUsers.bob._id,
      });
      
      // Initialize Stream Chat/Video right after connection is accepted
      await initializeLiveStream();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async () => {
    if (!getTestConnectionStatus || !testUsers?.bob) return;
    setLoading(true);
    setSimulatorResponded("rejected");
    try {
      await rejectTestConnection({
        connectionId: getTestConnectionStatus._id,
        receiverId: testUsers.bob._id,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Custom Local Messaging Implementation (For Simulated Mode)
  const sendMockMessage = (senderId, text) => {
    if (!text.trim()) return;
    const sender = senderId === testUsers.alice._id ? testUsers.alice : testUsers.bob;
    setMockMessages((prev) => [
      ...prev,
      {
        id: `mock_${Date.now()}`,
        senderId,
        senderName: sender.name,
        senderAvatar: sender.avatar,
        content: text,
        createdAt: Date.now(),
      },
    ]);

    if (senderId === testUsers.alice._id) {
      setAliceInput("");
    } else {
      setBobInput("");
    }
  };

  // Video Call Flow
  const startVideoCall = async () => {
    if (!testUsers?.alice || !testUsers?.bob) return;
    setIsCalling(true);
    try {
      const { sessionId } = await createTestSession({
        aliceId: testUsers.alice._id,
        bobId: testUsers.bob._id,
      });

      setSessionInfo({ sessionId });

      if (mode === "live" && aliceVideo && bobVideo) {
        // Setup live stream call for Alice
        const aCall = aliceVideo.call("default", sessionId);
        await aCall.join({ create: true });
        setAliceCall(aCall);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const joinVideoCall = async () => {
    if (!sessionInfo) return;
    setLoading(true);
    try {
      if (mode === "live" && bobVideo) {
        // Setup live stream call for Bob
        const bCall = bobVideo.call("default", sessionInfo.sessionId);
        await bCall.join({ create: true });
        setBobCall(bCall);
      }
      setIsVideoCallActive(true);
      setIsCalling(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const endVideoCall = async () => {
    if (aliceCall) {
      await aliceCall.leave().catch(console.error);
      setAliceCall(null);
    }
    if (bobCall) {
      await bobCall.leave().catch(console.error);
      setBobCall(null);
    }
    setIsVideoCallActive(false);
    setIsCalling(false);
    setSessionInfo(null);
  };

  // Render loading state
  if (!testUsers) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="text-muted-foreground font-medium">Loading simulator environment...</p>
      </div>
    );
  }

  const { alice, bob } = testUsers;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header and Control Bar */}
      <div className="bg-card rounded-3xl border border-border p-6 shadow-warm-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground flex items-center gap-2">
            <Icon name="TestTube" className="text-primary" size={28} />
            Co-Learner Flow Simulator
          </h1>
          <p className="text-muted-foreground mt-1">
            Simulate and test interaction between two co-learners (Alice & Bob) in real time
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
            mode === "live" 
              ? "bg-success/15 text-success" 
              : mode === "simulated" 
              ? "bg-warning/15 text-warning" 
              : "bg-muted text-muted-foreground"
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              mode === "live" ? "bg-success animate-pulse" : mode === "simulated" ? "bg-warning" : "bg-muted-foreground"
            }`} />
            {mode === "live" ? "Live Stream SDK Mode" : mode === "simulated" ? "Simulator Fallback Mode" : "Pending Activation"}
          </span>
          <Button variant="outline" size="sm" iconName="RefreshCw" onClick={handleReset} loading={loading}>
            Reset Test Flow
          </Button>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-2">
          {[
            { step: 1, label: "Setup Profiles", desc: "Create test accounts" },
            { step: 2, label: "Send Request", desc: "Alice sends request" },
            { step: 3, label: "Accept Request", desc: "Bob accepts connection" },
            { step: 4, label: "Messaging", desc: "Co-learner chat active" },
            { step: 5, label: "Video Session", desc: "Start live video call" },
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-3 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                activeStep >= item.step
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground border border-border"
              }`}>
                {activeStep > item.step ? <Icon name="Check" size={14} /> : item.step}
              </div>
              <div className="text-left">
                <p className={`text-xs font-bold ${activeStep >= item.step ? "text-foreground" : "text-muted-foreground"}`}>
                  {item.label}
                </p>
                <p className="text-[10px] text-muted-foreground">{item.desc}</p>
              </div>
              {item.step < 5 && <div className="hidden lg:block flex-1 h-[2px] bg-border ml-2" />}
            </div>
          ))}
        </div>
      </div>

      {/* Split-Screen Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* User A Workspace (Alice) */}
        <div className="bg-card rounded-3xl border border-border overflow-hidden flex flex-col min-h-[480px] shadow-sm">
          {/* User A Header */}
          <div className="p-4 border-b border-border bg-muted/45 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={alice.avatar} alt={alice.name} className="w-10 h-10 rounded-xl object-cover border border-border" />
              <div>
                <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                  {alice.name}
                  <span className="bg-primary/15 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold">User A</span>
                </h3>
                <p className="text-xs text-muted-foreground">{alice.title || "Frontend Student"}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Icon name="MapPin" size={12} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{alice.location}</span>
            </div>
          </div>

          {/* User A Content Area */}
          <div className="p-5 flex-1 flex flex-col space-y-4">
            
            {/* Step-specific UI for Alice */}
            {activeStep === 1 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-border rounded-2xl">
                <Icon name="UserCheck" size={40} className="text-muted-foreground mb-2" />
                <p className="font-semibold text-sm">Account Ready</p>
                <p className="text-xs text-muted-foreground max-w-xs mt-1">
                  Alice has been registered in the database. Proceed to Step 2 to establish a connection request.
                </p>
              </div>
            )}

            {activeStep === 2 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-primary/30 rounded-2xl bg-primary/5">
                <Icon name="UserPlus" size={40} className="text-primary mb-2" />
                <p className="font-semibold text-sm text-foreground">Connect with Bob</p>
                <p className="text-xs text-muted-foreground max-w-xs mt-1 mb-4">
                  Alice wants to learn React from Bob. Click to send him a skill exchange request.
                </p>
                <Button variant="default" iconName="Send" onClick={handleSendRequest} loading={loading}>
                  Send Connection Request
                </Button>
              </div>
            )}

            {activeStep === 3 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-border rounded-2xl bg-muted/20">
                <div className="relative">
                  <Icon name="Clock" size={40} className="text-warning mb-2" />
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-warning"></span>
                  </span>
                </div>
                <p className="font-semibold text-sm">Waiting for Acceptance</p>
                <p className="text-xs text-muted-foreground max-w-xs mt-1">
                  Connection request is sent. Check Bob's notification pane on the right to accept the connection request.
                </p>
              </div>
            )}

            {activeStep >= 4 && (
              <div className="flex-grow flex flex-col h-[320px] bg-background/50 rounded-2xl border border-border overflow-hidden">
                {isVideoCallActive ? (
                  // Video call overlay/screen for Alice (Google Meet Style)
                  <div className="flex-1 bg-[#111214] text-white flex flex-col justify-between p-3.5 relative overflow-hidden">
                    {/* Header bar */}
                    <div className="absolute top-3 left-3 z-15 bg-black/40 backdrop-blur px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider text-neutral-300">
                      Google Meet Test • Alice
                    </div>
                    
                    {/* Speaker feeds (Side-by-Side Grid) */}
                    <div className="flex-1 flex items-center justify-center gap-3 mt-4 mb-14">
                      {/* Alice Tile */}
                      <div className="w-1/2 aspect-video bg-[#202124] rounded-2xl flex flex-col items-center justify-center border border-white/5 overflow-hidden relative shadow-inner">
                        {aliceMicMuted && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-md z-10 flex items-center justify-center w-5.5 h-5.5">
                            <Icon name="MicOff" size={10} />
                          </div>
                        )}
                        {aliceCamOff ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 text-primary font-bold text-xl">
                              A
                            </div>
                            <span className="text-[10px] text-neutral-400">Camera Off</span>
                          </div>
                        ) : (
                          <img src={alice.avatar} alt="Alice video stream" className="w-full h-full object-cover" />
                        )}
                        <span className="absolute bottom-2.5 left-3 text-xs bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md font-medium text-white">
                          You
                        </span>
                      </div>

                      {/* Bob Tile */}
                      <div className="w-1/2 aspect-video bg-[#202124] rounded-2xl flex flex-col items-center justify-center border border-white/5 overflow-hidden relative shadow-inner">
                        {bobMicMuted && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-md z-10 flex items-center justify-center w-5.5 h-5.5">
                            <Icon name="MicOff" size={10} />
                          </div>
                        )}
                        {bobCamOff ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-14 h-14 rounded-full bg-success/20 flex items-center justify-center border border-success/30 text-success font-bold text-xl">
                              B
                            </div>
                            <span className="text-[10px] text-neutral-400">Camera Off</span>
                          </div>
                        ) : (
                          <img src={bob.avatar} alt="Bob video stream" className="w-full h-full object-cover" />
                        )}
                        <span className="absolute bottom-2.5 left-3 text-xs bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md font-medium text-white">
                          Bob (React Expert)
                        </span>
                      </div>
                    </div>

                    {/* Fixed Google Meet Controls Menu */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 px-4 py-2 bg-[#1e1e24]/90 backdrop-blur-md rounded-full border border-neutral-700/40 shadow-2xl">
                      {/* Mic Control Pill */}
                      <div className={`flex items-center rounded-full text-white cursor-pointer transition-all duration-200 ${
                        aliceMicMuted ? "bg-red-500/90 hover:bg-red-600" : "bg-[#2d2f31] hover:bg-[#3c4043]"
                      }`}>
                        <button 
                          onClick={() => setAliceMicMuted(!aliceMicMuted)} 
                          className="flex items-center justify-center w-9 h-9 pl-3 pr-1 rounded-l-full text-white" 
                          title={aliceMicMuted ? "Unmute Mic" : "Mute Mic"}
                        >
                          <Icon name={aliceMicMuted ? "MicOff" : "Mic"} size={16} />
                        </button>
                        <div className="w-[1px] h-3.5 bg-white/20"></div>
                        <button className="pl-1 pr-3 py-2 text-white flex items-center justify-center" aria-label="Mic Settings">
                          <Icon name="ChevronUp" size={8} />
                        </button>
                      </div>

                      {/* Camera Control Pill */}
                      <div className={`flex items-center rounded-full text-white cursor-pointer transition-all duration-200 ${
                        aliceCamOff ? "bg-red-500/90 hover:bg-red-600" : "bg-[#2d2f31] hover:bg-[#3c4043]"
                      }`}>
                        <button 
                          onClick={() => setAliceCamOff(!aliceCamOff)} 
                          className="flex items-center justify-center w-9 h-9 pl-3 pr-1 rounded-l-full text-white" 
                          title={aliceCamOff ? "Turn On Camera" : "Turn Off Camera"}
                        >
                          <Icon name={aliceCamOff ? "VideoOff" : "Video"} size={16} />
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
                      <button className="flex items-center justify-center w-9 h-9 bg-[#2d2f31] hover:bg-[#3c4043] rounded-full text-white transition-colors duration-200" title="Present Screen">
                        <Icon name="MonitorUp" size={16} />
                      </button>

                      {/* Recording */}
                      <button className="flex items-center justify-center w-9 h-9 bg-[#2d2f31] hover:bg-[#3c4043] rounded-full text-white transition-colors duration-200" title="Record Session">
                        <Icon name="CircleDot" size={16} />
                      </button>

                      {/* Leave Call (Red) */}
                      <button 
                        onClick={endVideoCall} 
                        className="flex items-center justify-center w-9 h-9 bg-[#ea4335] hover:bg-[#d93025] rounded-full text-white transition-colors duration-200" 
                        title="End Call"
                      >
                        <Icon name="PhoneOff" size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  // Chat workspace for Alice
                  <div className="flex-1 flex flex-col justify-between h-full">
                    {/* Header */}
                    <div className="p-3 border-b border-border bg-muted/20 flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">Chat with {bob.name}</span>
                      {activeStep === 4 && (
                        <Button 
                          variant="success" 
                          size="xs" 
                          iconName="Video" 
                          onClick={startVideoCall}
                          disabled={isCalling}
                        >
                          {isCalling ? "Calling..." : "Video Call"}
                        </Button>
                      )}
                    </div>
                    {/* Chat Messages */}
                    <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
                      {mockMessages.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-center p-4">
                          <p className="text-xs text-muted-foreground">No messages yet. Send a greeting to start exchanging skills!</p>
                        </div>
                      ) : (
                        mockMessages.map((msg) => {
                          const isMe = msg.senderId === alice._id;
                          return (
                            <div key={msg.id} className={`flex gap-2 max-w-[85%] ${isMe ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
                              <img src={msg.senderAvatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                              <div>
                                <div className={`p-2.5 rounded-2xl text-xs ${
                                  isMe ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted text-foreground rounded-tl-none"
                                }`}>
                                  {msg.content}
                                </div>
                                <p className={`text-[9px] text-muted-foreground mt-0.5 ${isMe ? "text-right" : "text-left"}`}>
                                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                    {/* Input */}
                    <div className="p-2 border-t border-border bg-muted/10 flex gap-2">
                      <input
                        type="text"
                        placeholder="Type message to Bob..."
                        value={aliceInput}
                        onChange={(e) => setAliceInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMockMessage(alice._id, aliceInput)}
                        className="flex-1 bg-background border border-border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <Button variant="default" size="xs" onClick={() => sendMockMessage(alice._id, aliceInput)}>
                        Send
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Alice Stats Card */}
            <div className="bg-muted/30 border border-border/80 rounded-2xl p-3 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <p className="text-muted-foreground text-[10px] uppercase font-bold">Skills</p>
                <p className="font-semibold text-foreground mt-0.5">{alice.skills.join(", ")}</p>
              </div>
              <div className="border-x border-border/80">
                <p className="text-muted-foreground text-[10px] uppercase font-bold">Learning</p>
                <p className="font-semibold text-foreground mt-0.5">{alice.learningGoals.join(", ")}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[10px] uppercase font-bold">Coins</p>
                <p className="font-semibold text-primary mt-0.5">{alice.skillCoins} SC</p>
              </div>
            </div>

          </div>
        </div>

        {/* User B Workspace (Bob) */}
        <div className="bg-card rounded-3xl border border-border overflow-hidden flex flex-col min-h-[480px] shadow-sm">
          {/* User B Header */}
          <div className="p-4 border-b border-border bg-muted/45 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={bob.avatar} alt={bob.name} className="w-10 h-10 rounded-xl object-cover border border-border" />
              <div>
                <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                  {bob.name}
                  <span className="bg-success/15 text-success text-[10px] px-2 py-0.5 rounded-full font-bold">User B</span>
                </h3>
                <p className="text-xs text-muted-foreground">{bob.title || "React Mentor"}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Icon name="MapPin" size={12} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{bob.location}</span>
            </div>
          </div>

          {/* User B Content Area */}
          <div className="p-5 flex-1 flex flex-col space-y-4">
            
            {/* Step-specific UI for Bob */}
            {activeStep === 1 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-border rounded-2xl">
                <Icon name="UserCheck" size={40} className="text-muted-foreground mb-2" />
                <p className="font-semibold text-sm">Account Ready</p>
                <p className="text-xs text-muted-foreground max-w-xs mt-1">
                  Bob is registered and ready to review incoming match/connection requests.
                </p>
              </div>
            )}

            {activeStep === 2 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-border rounded-2xl bg-muted/20">
                <Icon name="MailOpen" size={40} className="text-muted-foreground mb-2" />
                <p className="font-semibold text-sm">Inbox Empty</p>
                <p className="text-xs text-muted-foreground max-w-xs mt-1">
                  Waiting for Alice to send a connection request. Click "Send Connection Request" in Alice's pane (left).
                </p>
              </div>
            )}

            {activeStep === 3 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-warning/30 rounded-2xl bg-warning/5">
                {getTestConnectionStatus?.status === "Rejected" || simulatorResponded === "rejected" ? (
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-error/15 flex items-center justify-center mb-3 text-error animate-bounce">
                      <Icon name="XCircle" size={24} />
                    </div>
                    <p className="font-bold text-foreground text-sm">Okay! Request is rejected</p>
                    <p className="text-xs text-muted-foreground max-w-xs mt-1 mb-4">
                      The connection request has been declined. Click "Reset Test Flow" above to start over.
                    </p>
                    <Button variant="outline" size="sm" iconName="RefreshCw" onClick={handleReset}>
                      Reset Simulator
                    </Button>
                  </div>
                ) : getTestConnectionStatus?.status === "Accepted" || simulatorResponded === "accepted" ? (
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-success/15 flex items-center justify-center mb-3 text-success">
                      <Icon name="CheckCircle" size={24} />
                    </div>
                    <p className="font-bold text-foreground text-sm">Okay! Request is accepted</p>
                    <p className="text-xs text-muted-foreground max-w-xs mt-1">
                      Loading channels... Preparing co-learning chat workspace!
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <Icon name="BellRing" size={40} className="text-warning mb-2" />
                      <span className="absolute -top-1 -right-1 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-warning"></span>
                      </span>
                    </div>
                    <p className="font-semibold text-sm text-foreground">Connection Request Received!</p>
                    <p className="text-xs text-muted-foreground max-w-xs mt-1 mb-4">
                      Alice wants to exchange skills (CSS/HTML for React). Review and accept.
                    </p>
                    <div className="flex gap-3">
                      <Button variant="success" iconName="CheckCircle" onClick={handleAcceptRequest} loading={loading}>
                        Accept Request
                      </Button>
                      <Button variant="ghost" iconName="XCircle" onClick={handleRejectRequest} loading={loading} className="text-error hover:bg-error/10 hover:text-error-foreground">
                        Reject
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeStep >= 4 && (
              <div className="flex-grow flex flex-col h-[320px] bg-background/50 rounded-2xl border border-border overflow-hidden">
                {isVideoCallActive ? (
                  // Video call overlay/screen for Bob (Google Meet Style)
                  <div className="flex-1 bg-[#111214] text-white flex flex-col justify-between p-3.5 relative overflow-hidden">
                    {/* Header bar */}
                    <div className="absolute top-3 left-3 z-15 bg-black/40 backdrop-blur px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider text-neutral-300">
                      Google Meet Test • Bob
                    </div>
                    
                    {/* Speaker feeds (Side-by-Side Grid) */}
                    <div className="flex-1 flex items-center justify-center gap-3 mt-4 mb-14">
                      {/* Bob Tile */}
                      <div className="w-1/2 aspect-video bg-[#202124] rounded-2xl flex flex-col items-center justify-center border border-white/5 overflow-hidden relative shadow-inner">
                        {bobMicMuted && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-md z-10 flex items-center justify-center w-5.5 h-5.5">
                            <Icon name="MicOff" size={10} />
                          </div>
                        )}
                        {bobCamOff ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-14 h-14 rounded-full bg-success/20 flex items-center justify-center border border-success/30 text-success font-bold text-xl">
                              B
                            </div>
                            <span className="text-[10px] text-neutral-400">Camera Off</span>
                          </div>
                        ) : (
                          <img src={bob.avatar} alt="Bob video stream" className="w-full h-full object-cover" />
                        )}
                        <span className="absolute bottom-2.5 left-3 text-xs bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md font-medium text-white">
                          You
                        </span>
                      </div>

                      {/* Alice Tile */}
                      <div className="w-1/2 aspect-video bg-[#202124] rounded-2xl flex flex-col items-center justify-center border border-white/5 overflow-hidden relative shadow-inner">
                        {aliceMicMuted && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-md z-10 flex items-center justify-center w-5.5 h-5.5">
                            <Icon name="MicOff" size={10} />
                          </div>
                        )}
                        {aliceCamOff ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 text-primary font-bold text-xl">
                              A
                            </div>
                            <span className="text-[10px] text-neutral-400">Camera Off</span>
                          </div>
                        ) : (
                          <img src={alice.avatar} alt="Alice video stream" className="w-full h-full object-cover" />
                        )}
                        <span className="absolute bottom-2.5 left-3 text-xs bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md font-medium text-white">
                          Alice (React Learner)
                        </span>
                      </div>
                    </div>

                    {/* Fixed Google Meet Controls Menu */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 px-4 py-2 bg-[#1e1e24]/90 backdrop-blur-md rounded-full border border-neutral-700/40 shadow-2xl">
                      {/* Mic Control Pill */}
                      <div className={`flex items-center rounded-full text-white cursor-pointer transition-all duration-200 ${
                        bobMicMuted ? "bg-red-500/90 hover:bg-red-600" : "bg-[#2d2f31] hover:bg-[#3c4043]"
                      }`}>
                        <button 
                          onClick={() => setBobMicMuted(!bobMicMuted)} 
                          className="flex items-center justify-center w-9 h-9 pl-3 pr-1 rounded-l-full text-white" 
                          title={bobMicMuted ? "Unmute Mic" : "Mute Mic"}
                        >
                          <Icon name={bobMicMuted ? "MicOff" : "Mic"} size={16} />
                        </button>
                        <div className="w-[1px] h-3.5 bg-white/20"></div>
                        <button className="pl-1 pr-3 py-2 text-white flex items-center justify-center" aria-label="Mic Settings">
                          <Icon name="ChevronUp" size={8} />
                        </button>
                      </div>

                      {/* Camera Control Pill */}
                      <div className={`flex items-center rounded-full text-white cursor-pointer transition-all duration-200 ${
                        bobCamOff ? "bg-red-500/90 hover:bg-red-600" : "bg-[#2d2f31] hover:bg-[#3c4043]"
                      }`}>
                        <button 
                          onClick={() => setBobCamOff(!bobCamOff)} 
                          className="flex items-center justify-center w-9 h-9 pl-3 pr-1 rounded-l-full text-white" 
                          title={bobCamOff ? "Turn On Camera" : "Turn Off Camera"}
                        >
                          <Icon name={bobCamOff ? "VideoOff" : "Video"} size={16} />
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
                      <button className="flex items-center justify-center w-9 h-9 bg-[#2d2f31] hover:bg-[#3c4043] rounded-full text-white transition-colors duration-200" title="Present Screen">
                        <Icon name="MonitorUp" size={16} />
                      </button>

                      {/* Recording */}
                      <button className="flex items-center justify-center w-9 h-9 bg-[#2d2f31] hover:bg-[#3c4043] rounded-full text-white transition-colors duration-200" title="Record Session">
                        <Icon name="CircleDot" size={16} />
                      </button>

                      {/* Leave Call (Red) */}
                      <button 
                        onClick={endVideoCall} 
                        className="flex items-center justify-center w-9 h-9 bg-[#ea4335] hover:bg-[#d93025] rounded-full text-white transition-colors duration-200" 
                        title="End Call"
                      >
                        <Icon name="PhoneOff" size={16} />
                      </button>
                    </div>
                  </div>
                ) : sessionInfo && !isVideoCallActive ? (
                  // Incoming Call screen for Bob
                  <div className="flex-grow flex flex-col items-center justify-center bg-success/5 border border-success/20 rounded-2xl p-6 text-center animate-pulse">
                    <div className="w-14 h-14 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-3">
                      <Icon name="PhoneCall" size={28} className="text-success" />
                    </div>
                    <p className="font-bold text-foreground text-sm">Incoming Call from Alice</p>
                    <p className="text-xs text-muted-foreground mt-1 mb-4">Alice has initiated a live swap call session.</p>
                    <div className="flex gap-2.5">
                      <Button variant="success" size="sm" iconName="Phone" onClick={joinVideoCall}>
                        Answer Call
                      </Button>
                      <Button variant="ghost" size="sm" onClick={endVideoCall}>
                        Reject
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Chat workspace for Bob
                  <div className="flex-1 flex flex-col justify-between h-full">
                    {/* Header */}
                    <div className="p-3 border-b border-border bg-muted/20 flex items-center">
                      <span className="text-xs font-bold text-foreground">Chat with {alice.name}</span>
                    </div>
                    {/* Chat Messages */}
                    <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
                      {mockMessages.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-center p-4">
                          <p className="text-xs text-muted-foreground">No messages yet. Send a greeting to start exchanging skills!</p>
                        </div>
                      ) : (
                        mockMessages.map((msg) => {
                          const isMe = msg.senderId === bob._id;
                          return (
                            <div key={msg.id} className={`flex gap-2 max-w-[85%] ${isMe ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
                              <img src={msg.senderAvatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                              <div>
                                <div className={`p-2.5 rounded-2xl text-xs ${
                                  isMe ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted text-foreground rounded-tl-none"
                                }`}>
                                  {msg.content}
                                </div>
                                <p className={`text-[9px] text-muted-foreground mt-0.5 ${isMe ? "text-right" : "text-left"}`}>
                                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                    {/* Input */}
                    <div className="p-2 border-t border-border bg-muted/10 flex gap-2">
                      <input
                        type="text"
                        placeholder="Type message to Alice..."
                        value={bobInput}
                        onChange={(e) => setBobInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMockMessage(bob._id, bobInput)}
                        className="flex-1 bg-background border border-border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <Button variant="default" size="xs" onClick={() => sendMockMessage(bob._id, bobInput)}>
                        Send
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bob Stats Card */}
            <div className="bg-muted/30 border border-border/80 rounded-2xl p-3 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <p className="text-muted-foreground text-[10px] uppercase font-bold">Skills</p>
                <p className="font-semibold text-foreground mt-0.5">{bob.skills.join(", ")}</p>
              </div>
              <div className="border-x border-border/80">
                <p className="text-muted-foreground text-[10px] uppercase font-bold">Learning</p>
                <p className="font-semibold text-foreground mt-0.5">{bob.learningGoals.join(", ")}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[10px] uppercase font-bold">Coins</p>
                <p className="font-semibold text-primary mt-0.5">{bob.skillCoins} SC</p>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Simulator Explanation Details */}
      <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
        <h3 className="font-heading font-bold text-foreground mb-3 flex items-center gap-1.5">
          <Icon name="Info" className="text-primary" size={20} />
          Simulation details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3 border border-border rounded-xl bg-muted/10">
            <h4 className="font-bold text-foreground mb-1">1. Connection Request</h4>
            <p className="text-muted-foreground leading-relaxed">
              When User A clicks "Send Connection Request", it inserts a pending request in Convex's <code>connections</code> table and triggers a notification.
            </p>
          </div>
          <div className="p-3 border border-border rounded-xl bg-muted/10">
            <h4 className="font-bold text-foreground mb-1">2. Connection Accepted</h4>
            <p className="text-muted-foreground leading-relaxed">
              Accepting updating the connection's status to <code>Accepted</code> in Convex, allowing mutual messaging and video calls.
            </p>
          </div>
          <div className="p-3 border border-border rounded-xl bg-muted/10">
            <h4 className="font-bold text-foreground mb-1">3. Messaging</h4>
            <p className="text-muted-foreground leading-relaxed">
              Simulates direct co-learner workspace chat. In Stream mode, messages sync to a chat channel; in simulated mode, they run in live local state.
            </p>
          </div>
          <div className="p-3 border border-border rounded-xl bg-muted/10">
            <h4 className="font-bold text-foreground mb-1">4. Video Calling</h4>
            <p className="text-muted-foreground leading-relaxed">
              User A starts the video session, generating a session token. User B answers to hook up video streams side-by-side.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoLearnerTestPage;
