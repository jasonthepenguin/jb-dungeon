'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

const GRID_SIZE = 10; // 10x10 grid

interface ChatMessage {
  type: 'command' | 'response' | 'error';
  text: string;
}

export default function Home() {
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });
  const [command, setCommand] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { type: 'response', text: 'Welcome to Grid Adventure! Type commands like "up 2" or "right 3" to move.' }
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Focus on input when component mounts
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    // Scroll to bottom when chat updates
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const addChatMessage = (type: ChatMessage['type'], text: string) => {
    setChatHistory(prev => [...prev, { type, text }]);
  };

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!command.trim()) return;

    // Add command to chat
    addChatMessage('command', command);

    const parts = command.trim().toLowerCase().split(' ');
    if (parts.length !== 2) {
      addChatMessage('error', 'Invalid command! Use format: "direction number" (e.g., "up 2")');
      setCommand('');
      return;
    }

    const [direction, distanceStr] = parts;
    const distance = parseInt(distanceStr);

    if (isNaN(distance) || distance < 1) {
      addChatMessage('error', 'Invalid distance! Please enter a positive number.');
      setCommand('');
      return;
    }

    let newX = playerPosition.x;
    let newY = playerPosition.y;

    switch (direction) {
      case 'up':
        newY = playerPosition.y - distance;
        break;
      case 'down':
        newY = playerPosition.y + distance;
        break;
      case 'left':
        newX = playerPosition.x - distance;
        break;
      case 'right':
        newX = playerPosition.x + distance;
        break;
      default:
        addChatMessage('error', 'Invalid direction! Use: up, down, left, or right');
        setCommand('');
        return;
    }

    // Check boundaries
    if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) {
      addChatMessage('error', `Can't move there! Stay within the ${GRID_SIZE}x${GRID_SIZE} grid.`);
      setCommand('');
      return;
    }

    setPlayerPosition({ x: newX, y: newY });
    addChatMessage('response', `Moved ${direction} ${distance} square${distance > 1 ? 's' : ''}. Now at position (${newX}, ${newY})`);
    setCommand('');
  };

  return (
    <div className="min-h-screen bg-black p-4 flex flex-col">
      {/* Game Title */}
      <h1 className="text-3xl font-bold text-white mb-4 text-center">Grid Adventure</h1>
      
      {/* Main Game Container */}
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-neutral-900 p-6 rounded-lg shadow-xl">
          {/* Grid */}
          <div className="grid grid-cols-10 gap-1">
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
              const x = index % GRID_SIZE;
              const y = Math.floor(index / GRID_SIZE);
              const isPlayer = x === playerPosition.x && y === playerPosition.y;
              
              return (
                <div
                  key={index}
                  className={`w-12 h-12 border border-neutral-700 flex items-center justify-center ${
                    isPlayer ? 'bg-neutral-800' : 'bg-black'
                  }`}
                >
                  {isPlayer && (
                    <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex items-end gap-4 mt-4">
        {/* Chat Window */}
        <div className="flex-1 bg-neutral-900 rounded-lg p-4 flex flex-col h-64">
          {/* Chat History */}
          <div className="flex-1 overflow-y-auto mb-3 space-y-2">
            {chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`text-sm ${
                  msg.type === 'command'
                    ? 'text-blue-400'
                    : msg.type === 'error'
                    ? 'text-red-400'
                    : 'text-gray-300'
                }`}
              >
                {msg.type === 'command' && '> '}
                {msg.text}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          
          {/* Command Input */}
          <form onSubmit={handleCommand}>
            <input
              ref={inputRef}
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Type command..."
              className="w-full px-3 py-2 bg-black text-white border border-neutral-700 rounded focus:outline-none focus:border-blue-500"
            />
          </form>
        </div>

        {/* Player Image */}
        <div className="bg-neutral-900 p-4 rounded-lg">
          <Image
            src="/player.png"
            alt="Player"
            width={300}
            height={300}
            className="rounded"
          />
        </div>
      </div>
    </div>
  );
}
