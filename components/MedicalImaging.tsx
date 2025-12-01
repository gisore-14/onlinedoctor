import React, { useState } from 'react';
import { Upload, Image as ImageIcon, Wand2, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { analyzeMedicalImage, generateMedicalIllustration, editMedicalImage } from '../services/geminiService';
import { ImageGenerationConfig } from '../types';

const MedicalImaging: React.FC = () => {
  const [mode, setMode] = useState<'analyze' | 'generate' | 'edit'>('analyze');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Configs
  const [genSize, setGenSize] = useState<"1K" | "2K" | "4K">("1K");
  const [genRatio, setGenRatio] = useState("1:1");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove data URL prefix for API
        const base64Data = base64String.split(',')[1];
        setSelectedImage(base64Data);
        setResult(''); // clear previous results
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAction = async () => {
    setLoading(true);
    setResult('');
    try {
      if (mode === 'analyze') {
        if (!selectedImage) return;
        const text = await analyzeMedicalImage(selectedImage, prompt || "Analyze this medical image for anomalies.");
        setResult(text);
      } else if (mode === 'generate') {
        const imgData = await generateMedicalIllustration(prompt, genSize, genRatio);
        setResult(imgData); // This will be a data URL
      } else if (mode === 'edit') {
        if (!selectedImage) return;
        const imgData = await editMedicalImage(selectedImage, prompt);
        setResult(imgData);
      }
    } catch (e: any) {
      setResult(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Sidebar Controls */}
      <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md border border-slate-200 space-y-6">
        <h3 className="font-bold text-lg text-slate-800 flex items-center">
            <ImageIcon className="w-5 h-5 mr-2 text-blue-600" />
            Imaging Suite
        </h3>
        
        <div className="flex bg-slate-100 p-1 rounded-lg">
            {(['analyze', 'generate', 'edit'] as const).map(m => (
                <button
                    key={m}
                    onClick={() => { setMode(m); setResult(''); setSelectedImage(null); }}
                    className={`flex-1 py-2 text-sm font-medium capitalize rounded-md ${mode === m ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    {m}
                </button>
            ))}
        </div>

        <div className="space-y-4">
            {mode !== 'generate' && (
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors relative">
                    <input type="file" onChange={handleFileChange} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">
                        {selectedImage ? "Image selected" : "Upload Medical Image"}
                    </p>
                </div>
            )}

            {mode === 'generate' && (
                <>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Size</label>
                        <select value={genSize} onChange={(e) => setGenSize(e.target.value as any)} className="w-full p-2 border rounded">
                            <option value="1K">1K (Standard)</option>
                            <option value="2K">2K (High Res)</option>
                            <option value="4K">4K (Ultra Res)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Aspect Ratio</label>
                        <select value={genRatio} onChange={(e) => setGenRatio(e.target.value)} className="w-full p-2 border rounded">
                            <option value="1:1">1:1 (Square)</option>
                            <option value="16:9">16:9 (Landscape)</option>
                            <option value="4:3">4:3</option>
                            <option value="3:4">3:4</option>
                            <option value="9:16">9:16 (Portrait)</option>
                        </select>
                    </div>
                </>
            )}

            <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                    {mode === 'analyze' ? 'Clinical Question (Optional)' : mode === 'generate' ? 'Illustration Description' : 'Edit Instruction'}
                </label>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={mode === 'analyze' ? "E.g. Is there a fracture?" : mode === 'edit' ? "E.g. Highlight the fracture in red" : "E.g. Anatomical heart diagram"}
                    className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    rows={4}
                />
            </div>

            <button
                onClick={handleAction}
                disabled={loading || (mode !== 'generate' && !selectedImage) || (mode !== 'analyze' && !prompt)}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-slate-300 transition-colors flex justify-center items-center"
            >
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />}
                {mode === 'analyze' ? 'Analyze Image' : mode === 'generate' ? 'Generate' : 'Apply Edit'}
            </button>
        </div>
      </div>

      {/* Main Display Area */}
      <div className="lg:col-span-2 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center p-6 min-h-[400px]">
        {loading ? (
            <div className="text-center">
                <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
                <p className="text-slate-500">Processing with Gemini...</p>
            </div>
        ) : result ? (
            <div className="w-full h-full flex flex-col items-center">
                {result.startsWith('data:image') ? (
                    <img src={result} alt="Result" className="max-w-full max-h-[500px] rounded shadow-lg object-contain" />
                ) : (
                     <div className="bg-white p-6 rounded-lg shadow w-full text-slate-800 whitespace-pre-wrap">
                        <h4 className="font-bold mb-2 text-blue-600 flex items-center"><AlertCircle className="w-4 h-4 mr-2" /> Analysis Result</h4>
                        {result}
                     </div>
                )}
            </div>
        ) : (
            <div className="text-center text-slate-400">
                <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Result will appear here</p>
                {selectedImage && mode !== 'generate' && (
                    <img src={`data:image/jpeg;base64,${selectedImage}`} alt="Preview" className="mt-4 max-h-48 opacity-50 rounded border" />
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default MedicalImaging;