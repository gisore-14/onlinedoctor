import React, { useState, useRef, useEffect } from 'react';
import { Send, MapPin, Search, BrainCircuit, Zap, Volume2, Loader2, Link as LinkIcon } from 'lucide-react';
import { ChatMessage } from '../types';
import { generateSymptomAnalysis, generateTTS } from '../services/geminiService';

const SymptomChecker: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hello. I am the OnlineDoctor AI assistant. Please describe your symptoms in detail. I can analyze potential issues, provide global statistics, and help you find approved hospitals.' }
  ]);
  const [loading, setLoading] = useState(false);
  const [useThinking, setUseThinking] = useState(false);
  const [useFast, setUseFast] = useState(false);
  const [useSearch, setUseSearch] = useState(true);
  const [useMaps, setUseMaps] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!prompt.trim()) return;
    
    const userMsg: ChatMessage = { role: 'user', text: prompt };
    setMessages(prev => [...prev, userMsg]);
    setPrompt('');
    setLoading(true);

    try {
      // Get location if maps is enabled
      let location;
      if (useMaps) {
        try {
          const pos: any = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        } catch (e) {
          console.warn("Location access denied");
        }
      }

      const result = await generateSymptomAnalysis(
        userMsg.text,
        useThinking,
        useFast,
        useSearch,
        useMaps,
        location
      );

      const modelMsg: ChatMessage = {
        role: 'model',
        text: result.text || "I couldn't generate a response. Please try again.",
        groundingMetadata: result.groundingMetadata
      };

      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: 'An error occurred while analyzing your request. Please try again later.' }]);
    } finally {
      setLoading(false);
    }
  };

  const playTTS = async (text: string) => {
    if (isPlaying) return;
    try {
      setIsPlaying(true);
      const base64Audio = await generateTTS(text);
      if (base64Audio) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const audioBuffer = await audioContext.decodeAudioData(
            Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0)).buffer
        );
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start(0);
        source.onended = () => setIsPlaying(false);
      } else {
          setIsPlaying(false);
      }
    } catch (e) {
      console.error("TTS Error", e);
      setIsPlaying(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 h-[calc(100vh-140px)] flex flex-col">
      <div className="p-4 border-b border-slate-100 flex flex-wrap gap-2 items-center justify-between bg-slate-50 rounded-t-xl">
        <h2 className="font-semibold text-slate-800">Symptom & Disease Analysis</h2>
        <div className="flex gap-2 text-xs">
           <button 
            onClick={() => { setUseThinking(!useThinking); if(!useThinking) setUseFast(false); }}
            className={`px-3 py-1 rounded-full flex items-center border ${useThinking ? 'bg-purple-100 border-purple-300 text-purple-700' : 'bg-white border-slate-200 text-slate-600'}`}
          >
            <BrainCircuit className="w-3 h-3 mr-1" /> Deep Think
          </button>
          <button 
            onClick={() => { setUseFast(!useFast); if(!useFast) setUseThinking(false); }}
            className={`px-3 py-1 rounded-full flex items-center border ${useFast ? 'bg-yellow-100 border-yellow-300 text-yellow-700' : 'bg-white border-slate-200 text-slate-600'}`}
          >
            <Zap className="w-3 h-3 mr-1" /> Fast Triage
          </button>
          <button 
            onClick={() => setUseSearch(!useSearch)}
            className={`px-3 py-1 rounded-full flex items-center border ${useSearch ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-white border-slate-200 text-slate-600'}`}
          >
            <Search className="w-3 h-3 mr-1" /> Web Data
          </button>
          <button 
            onClick={() => setUseMaps(!useMaps)}
            className={`px-3 py-1 rounded-full flex items-center border ${useMaps ? 'bg-green-100 border-green-300 text-green-700' : 'bg-white border-slate-200 text-slate-600'}`}
          >
            <MapPin className="w-3 h-3 mr-1" /> Find Hospital
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</div>
              
              {/* Grounding Sources */}
              {msg.groundingMetadata?.groundingChunks && (
                <div className="mt-3 pt-3 border-t border-slate-200/50">
                  <p className="text-xs font-semibold mb-2 opacity-70">Sources:</p>
                  <div className="flex flex-wrap gap-2">
                    {msg.groundingMetadata.groundingChunks.map((chunk: any, cIdx: number) => (
                      chunk.web ? (
                        <a key={cIdx} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs bg-white/50 hover:bg-white px-2 py-1 rounded text-blue-600 underline truncate max-w-xs">
                          <LinkIcon className="w-3 h-3 mr-1" /> {chunk.web.title || "Source"}
                        </a>
                      ) : chunk.maps ? (
                         <a key={cIdx} href={chunk.maps.googleMapsUri || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs bg-white/50 hover:bg-white px-2 py-1 rounded text-green-600 underline">
                          <MapPin className="w-3 h-3 mr-1" /> {chunk.maps.title}
                        </a>
                      ) : null
                    ))}
                  </div>
                </div>
              )}

              {msg.role === 'model' && (
                <button onClick={() => playTTS(msg.text)} className="mt-2 text-xs opacity-70 hover:opacity-100 flex items-center transition-opacity">
                   <Volume2 className="w-3 h-3 mr-1" /> Read Aloud
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="bg-slate-100 rounded-2xl p-4 flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span className="text-xs text-slate-500">{useThinking ? 'Thinking deeply about symptoms...' : 'Analyzing...'}</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Describe symptoms, ask about diseases, or search for hospitals..."
            className="flex-1 border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
          />
          <button
            onClick={handleSend}
            disabled={loading || !prompt.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg px-4 py-2 transition-colors flex items-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SymptomChecker;