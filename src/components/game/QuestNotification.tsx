import React, { useEffect } from 'react';
import { Quest } from '../../types';

interface QuestNotificationProps {
  quest: Quest;
  onView: () => void;
}

const QuestNotification: React.FC<QuestNotificationProps> = ({ quest, onView }) => {
  // Auto-dismiss after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onView();
    }, 10000);
    
    return () => clearTimeout(timer);
  }, [onView]);
  
  // Format reward text
  const getRewardText = () => {
    const rewards = [];
    
    if (quest.reward.btTokens) {
      rewards.push(`${quest.reward.btTokens} BT`);
    }
    
    if (quest.reward.bcTokens) {
      rewards.push(`${quest.reward.bcTokens} BC`);
    }
    
    if (quest.reward.xp) {
      rewards.push(`${quest.reward.xp} XP`);
    }
    
    if (quest.reward.item) {
      rewards.push(quest.reward.item);
    }
    
    return rewards.join(', ');
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-sm">
      <div 
        className="bg-neutral-dark/90 border-2 border-neon-pink rounded-lg p-6 max-w-lg w-full mx-4"
        style={{ 
          boxShadow: '0 0 30px rgba(255, 68, 204, 0.6)',
          animation: 'fadeIn 0.5s ease-out'
        }}
      >
        <div className="text-center mb-6">
          <div 
            className="text-4xl mb-3"
            style={{ 
              filter: 'drop-shadow(0 0 8px rgba(255, 204, 0, 0.8))'
            }}
          >
            🏆
          </div>
          <h2 className="text-neon-cyan text-xl mb-1 font-pixel">Quest Completed!</h2>
          <h3 className="text-neon-pink text-lg">{quest.title}</h3>
        </div>
        
        <div className="mb-6">
          <p className="text-center text-cyan-300 mb-4">{quest.description}</p>
          
          <div className="bg-neutral-dark/60 rounded-lg p-4 mb-4">
            <div className="text-center text-neon-pink text-sm mb-2 font-pixel">REWARDS</div>
            <div className="text-center text-xl font-bold">{getRewardText()}</div>
          </div>
        </div>
        
        <div className="flex justify-center">
          <button 
            onClick={onView}
            className="button button-primary px-8 py-2"
          >
            Claim Rewards
          </button>
        </div>
        
        <div className="text-center mt-4 text-xs text-gray-400">
          This notification will auto-dismiss in a few seconds
        </div>
      </div>
    </div>
  );
};

export default QuestNotification;