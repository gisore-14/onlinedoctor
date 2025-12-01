import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Activity } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { createBlob, decodeAudioData } from '../services/geminiService';

const LiveConsultation: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(false);
  const [status, setStatus] = useState("Ready to start consultation");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<Promise<any> | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const apiKey = process.env.API_KEY || '';
  const ai = new GoogleGenAI({ apiKey });

  const startConsultation = async () => {
    try {
      setStatus("Initializing audio...");
      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 16000});
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
      audioContextRef.current = outputAudioContext;

      setStatus("Requesting permissions...");
      const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: true, 
          video: camOn ? { width: 640, height: 480 } : false 
      });
      streamRef.current = stream;

      if (videoRef.current && camOn) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      setStatus("Connecting to OnlineDoctor Live...");
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setStatus("Connected. Dr. Gemini is listening.");
            setConnected(true);

            // Audio Streaming Setup
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              if (!micOn) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);

            // Video Streaming Setup (if enabled)
            if (camOn && videoRef.current && canvasRef.current) {
                const ctx = canvasRef.current.getContext('2d');
                setInterval(() => {
                    if (!videoRef.current || !canvasRef.current || !ctx) return;
                    canvasRef.current.width = videoRef.current.videoWidth;
                    canvasRef.current.height = videoRef.current.videoHeight;
                    ctx.drawImage(videoRef.current, 0, 0);
                    const base64 = canvasRef.current.toDataURL('image/jpeg', 0.5).split(',')[1];
                    sessionPromise.then(session => session.sendRealtimeInput({ media: { mimeType: 'image/jpeg', data: base64 } }));
                }, 1000); // 1 FPS for video to save bandwidth/processing
            }
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            
            if (base64Audio) {
              const ctx = audioContextRef.current;
              if(!ctx) return;

              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const audioBuffer = await decodeAudioData(base64Audio, ctx);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              
              source.onended = () => sourcesRef.current.delete(source);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
               sourcesRef.current.forEach(s => s.stop());
               sourcesRef.current.clear();
               nextStartTimeRef.current = 0;
            }
          },
          onclose: () => {
            setStatus("Consultation ended.");
            setConnected(false);
          },
          onerror: (err) => {
            console.error(err);
            setStatus("Connection error.");
            setConnected(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: "You are a helpful, professional online doctor. Listen to symptoms, ask clarifying questions, and provide preliminary advice. Be concise and empathetic. At the end, suggest they visit a clinic if serious.",
          speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
          }
        }
      });
      sessionRef.current = sessionPromise;

    } catch (e) {
      console.error(e);
      setStatus("Failed to start consultation. Please check permissions.");
    }
  };

  const endConsultation = () => {
      if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
          audioContextRef.current.close();
      }
      // Assuming session doesn't have an explicit close method exposed easily on the promise without saving the session obj
      // But the stream stop usually kills the connection or we reload.
      // Ideally we call session.close() if we stored the resolved session.
      sessionRef.current?.then(s => s.close());
      setConnected(false);
      setStatus("Consultation ended.");
  };

  return (
    <div className="bg-slate-900 text-white rounded-xl shadow-2xl overflow-hidden h-[600px] flex flex-col relative">
      <div className="absolute top-4 left-4 z-10 bg-black/50 px-3 py-1 rounded-full flex items-center backdrop-blur-sm">
        <Activity className={`w-4 h-4 mr-2 ${connected ? 'text-green-400 animate-pulse' : 'text-slate-400'}`} />
        <span className="text-sm font-medium">{status}</span>
      </div>

      <div className="flex-1 bg-slate-800 flex items-center justify-center relative">
         {camOn ? (
             <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
         ) : (
             <div className="text-slate-600">
                 <Activity className="w-32 h-32 opacity-20" />
             </div>
         )}
         <canvas ref={canvasRef} className="hidden" />
         
         {/* Visualizer placeholder */}
         {connected && !camOn && (
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 bg-blue-500/20 rounded-full animate-ping absolute" />
                <div className="w-32 h-32 bg-blue-500/40 rounded-full animate-pulse absolute" />
            </div>
         )}
      </div>

      <div className="h-24 bg-slate-950 flex items-center justify-center gap-6">
        {!connected ? (
            <button 
                onClick={startConsultation}
                className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-green-900/20 transition-all flex items-center"
            >
                <Mic className="w-5 h-5 mr-2" /> Start Consultation
            </button>
        ) : (
            <>
                <button onClick={() => setMicOn(!micOn)} className={`p-4 rounded-full ${micOn ? 'bg-slate-800 hover:bg-slate-700' : 'bg-red-500/20 text-red-500'}`}>
                    {micOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                </button>
                <button onClick={endConsultation} className="bg-red-600 hover:bg-red-500 text-white p-4 rounded-full shadow-lg">
                    <PhoneOff className="w-6 h-6" />
                </button>
                {/* Initial Cam toggle must happen before connect for simplicity in this demo, or renegotiation needed */}
            </>
        )}
         <div className="absolute right-6 flex items-center gap-2">
            <label className="flex items-center space-x-2 text-sm text-slate-400 cursor-pointer">
                <span className="text-xs uppercase font-bold tracking-wider">Video</span>
                <input 
                    type="checkbox" 
                    checked={camOn} 
                    onChange={(e) => { if(!connected) setCamOn(e.target.checked); }} 
                    disabled={connected}
                    className="accent-blue-500"
                />
            </label>
         </div>
      </div>
    </div>
  );
};

export default LiveConsultation;