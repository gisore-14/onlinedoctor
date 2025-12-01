import React from 'react';
import { Phone, Mail, MessageCircle } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white text-lg font-bold mb-4">OnlineDoctor</h3>
            <p className="text-sm">Professional diagnostic and medical consultation platform powered by advanced AI.</p>
          </div>
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-3 text-blue-400" />
                <span>+254 759 530 642</span>
              </li>
              <li className="flex items-center">
                <MessageCircle className="h-5 w-5 mr-3 text-green-400" />
                <span>WhatsApp Available</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-blue-400" />
                <span>doctorsplaza@gmail.com</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Legal</h3>
            <p className="text-xs text-slate-500">
              Disclaimer: This AI tool is for informational purposes only and does not replace professional medical advice. Always consult a certified physician.
            </p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-slate-800 text-center text-sm">
          &copy; {new Date().getFullYear()} OnlineDoctor. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;