import React from 'react';
import { Stethoscope, Activity, Video, Radio, Image } from 'lucide-react';
import { Tab } from '../types';

interface HeaderProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: Tab.HOME, label: 'Home', icon: Stethoscope },
    { id: Tab.SYMPTOMS, label: 'Diagnostics', icon: Activity },
    { id: Tab.LIVE, label: 'Live Consult', icon: Radio },
    { id: Tab.IMAGING, label: 'Imaging', icon: Image },
    { id: Tab.VIDEO, label: 'Resources', icon: Video },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center cursor-pointer" onClick={() => setActiveTab(Tab.HOME)}>
            <div className="bg-blue-600 p-2 rounded-lg">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <span className="ml-3 text-xl font-bold text-slate-900 tracking-tight">OnlineDoctor</span>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === item.id
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center md:hidden">
            {/* Mobile menu button could go here */}
          </div>
        </div>
      </div>
      {/* Mobile Nav */}
      <div className="md:hidden flex overflow-x-auto border-t border-slate-100 bg-white">
        {navItems.map((item) => (
           <button
             key={item.id}
             onClick={() => setActiveTab(item.id)}
             className={`flex-1 flex flex-col items-center py-3 text-xs font-medium ${
               activeTab === item.id ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'
             }`}
           >
             <item.icon className="h-5 w-5 mb-1" />
             {item.label}
           </button>
        ))}
      </div>
    </header>
  );
};

export default Header;