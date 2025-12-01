import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import SymptomChecker from './components/SymptomChecker';
import LiveConsultation from './components/LiveConsultation';
import MedicalImaging from './components/MedicalImaging';
import VideoCenter from './components/VideoCenter';
import { Tab } from './types';
import { ArrowRight, Activity, ShieldCheck, Globe } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.HOME);

  const renderContent = () => {
    switch (activeTab) {
      case Tab.SYMPTOMS:
        return <SymptomChecker />;
      case Tab.LIVE:
        return (
          <div className="max-w-4xl mx-auto py-8">
             <h2 className="text-2xl font-bold mb-6 text-slate-800">Live Doctor Consultation</h2>
             <p className="text-slate-600 mb-6">Connect with our AI doctor in real-time. Speak naturally about your condition.</p>
             <LiveConsultation />
          </div>
        );
      case Tab.IMAGING:
        return (
            <div className="py-8">
                <h2 className="text-2xl font-bold mb-6 text-slate-800">AI Medical Imaging Suite</h2>
                <MedicalImaging />
            </div>
        );
      case Tab.VIDEO:
        return (
            <div className="max-w-3xl mx-auto py-8">
                <VideoCenter />
            </div>
        );
      case Tab.HOME:
      default:
        return (
          <div className="space-y-16 py-12">
            {/* Hero */}
            <div className="text-center space-y-6">
              <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
                Healthcare, <span className="text-blue-600">Reimagined.</span>
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Advanced diagnostics, real-time consultations, and medical imaging powered by Gemini 2.5 and 3.0 Pro models.
              </p>
              <div className="flex justify-center gap-4 pt-4">
                <button 
                  onClick={() => setActiveTab(Tab.SYMPTOMS)} 
                  className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition flex items-center"
                >
                  Check Symptoms <ArrowRight className="ml-2 w-4 h-4" />
                </button>
                <button 
                  onClick={() => setActiveTab(Tab.LIVE)}
                  className="bg-white text-slate-700 border border-slate-300 px-8 py-3 rounded-full font-semibold hover:bg-slate-50 transition"
                >
                  Live Consult
                </button>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 text-blue-600">
                  <Activity />
                </div>
                <h3 className="text-xl font-bold mb-2">Deep Diagnostics</h3>
                <p className="text-slate-600">Utilizing Gemini 3 Pro "Thinking" mode for complex symptom analysis and medical reasoning.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 text-green-600">
                  <Globe />
                </div>
                <h3 className="text-xl font-bold mb-2">Global Data</h3>
                <p className="text-slate-600">Real-time access to disease outbreaks and stats via Google Search Grounding.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 text-purple-600">
                  <ShieldCheck />
                </div>
                <h3 className="text-xl font-bold mb-2">Approved Care</h3>
                <p className="text-slate-600">Locate approved hospitals and enroll in programs using Maps Grounding.</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-300px)]">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
};

export default App;