"use client";

interface GameModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  variant?: 'normal' | 'gold';
}

export default function GameModal({ isOpen, onClose, title, children, variant = 'normal' }: GameModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-[2px] animate-maple-in">
      <div className={`${variant === 'gold' ? 'maple-box-gold' : 'maple-box'} w-full max-w-sm relative`}>
        {/* 標題與關閉 */}
        <div className="flex justify-between items-center mb-4 border-b border-gray-600 pb-2">
          <h2 className="text-yellow-400 font-bold text-lg">{title}</h2>
          <button onClick={onClose} className="maple-btn !px-3 !py-1 text-sm">X</button>
        </div>
        
        {/* 內容區 */}
        <div className="text-white text-sm">
          {children}
        </div>
      </div>
    </div>
  );
}