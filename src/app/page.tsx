'use client';

import React, { useState } from 'react';
import ChatBox from '@/components/ChatBox';
import '@/styles/globals.css';

const App: React.FC = () => {
  const [showChat, setShowChat] = useState(true);

  return (
    <div className="h-screen w-screen flex flex-col bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-500 overflow-hidden">

      <main className="flex-grow flex justify-center items-center px-2 sm:px-6">
        {showChat && (
          <section className="w-full max-w-6xl h-[90vh] bg-white shadow-2xl rounded-3xl p-6 flex flex-col">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-center mb-6 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
              Smart Assistant
            </h1>
            <div className="flex-1 overflow-hidden">
              <ChatBox />
            </div>
          </section>


        )}
      </main>
    </div>
  );
};

export default App;
