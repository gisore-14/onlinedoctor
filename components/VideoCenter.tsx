import React, { useState } from 'react';
import { Video, Film, Download, RefreshCw, AlertTriangle } from 'lucide-react';
import { generateMedicalVideo, checkVideoStatus } from '../services/geminiService';

const VideoCenter: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [progress, setProgress] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if(file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              const base64 = (reader.result as string).split(',')[1];
              setImageBase64(base64);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleGenerate = async () => {
    // Check for API Key first via window.aistudio
    try {
        if ((window as any).aistudio) {
            const hasKey = await (window as any).aistudio.hasSelectedApiKey();
            if (!hasKey) {
                await (window as any).aistudio.openSelectKey();
                // We proceed optimistically or return to let user click again
            }
        }
    } catch (e) {
        console.warn("AI Studio key selection not available", e);
    }

    setLoading(true);
    setVideoUri(null);
    setProgress('Initializing Veo generation...');

    try {
      let operation = await generateMedicalVideo(prompt, "16:9", imageBase64 || undefined);
      
      setProgress('Generating video (this takes a moment)...');
      
      // Poll for completion
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Check every 5s
        operation = await checkVideoStatus(operation);
        setProgress('Rendering frames...');
      }

      const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (uri) {
          // We need to fetch it with the key to display it
          const apiKey = process.env.API_KEY || '';
          const fetchResponse = await fetch(`${uri}&key=${apiKey}`);
          const blob = await fetchResponse.blob();
          const objUrl = URL.createObjectURL(blob);
          setVideoUri(objUrl);
      } else {
          setProgress('Failed to retrieve video URI.');
      }

    } catch (e: any) {
      setProgress(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
      <div className="flex items-center mb-6">
        <div className="bg-indigo-100 p-3 rounded-full mr-4">
            <Film className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Veo Medical Video</h2>
            <p className="text-slate-500">Generate educational medical videos from text or images.</p>
        </div>
      </div>

      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
        <div className="flex">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
            <p className="text-sm text-amber-700">
                Veo requires a paid GCP project key selected via the dialog. 
                <button 
                    onClick={async () => (window as any).aistudio?.openSelectKey()} 
                    className="underline font-bold ml-1"
                >
                    Select API Key
                </button>
            </p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Prompt</label>
            <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the medical process or anatomy to visualize..."
                className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                rows={3}
            />
        </div>

        <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Reference Image (Optional)</label>
            <input type="file" onChange={handleImageUpload} accept="image/*" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
        </div>

        <button 
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 disabled:bg-slate-300 transition-all flex justify-center items-center"
        >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin mr-2" /> : <Video className="w-5 h-5 mr-2" />}
            {loading ? progress : 'Generate Video'}
        </button>

        {videoUri && (
            <div className="mt-8">
                <h3 className="text-lg font-bold mb-4">Generated Video</h3>
                <div className="aspect-video bg-black rounded-lg overflow-hidden relative group">
                    <video src={videoUri} controls className="w-full h-full" />
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default VideoCenter;