import React, { useState } from 'react';
import { useGameState } from '../../hooks/useGameState';
import { useToast } from '../../hooks/useToast';

interface CattleShopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CattleShopModal: React.FC<CattleShopModalProps> = ({ isOpen, onClose }) => {
  const { gameState, purchaseCattle } = useGameState();
  const { toast } = useToast();
  const [cattleName, setCattleName] = useState('');
  
  if (!isOpen) return null;
  
  const handlePurchase = async (type: 'milk_cow' | 'beef_cow' | 'bull') => {
    if (!cattleName.trim()) {
      toast({
        title: 'Name Required',
        description: 'Please enter a name for your new cattle',
        variant: 'warning'
      });
      return;
    }
    
    try {
      await purchaseCattle(type, cattleName);
      setCattleName('');
      onClose();
    } catch (error) {
      toast({
        title: 'Purchase Failed',
        description: error instanceof Error ? error.message : 'Failed to purchase cattle',
        variant: 'error'
      });
    }
  };
  
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">Cattle Shop</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="mb-4">
            <label className="block text-sm mb-1 text-neon-cyan">Cattle Name</label>
            <input
              type="text"
              value={cattleName}
              onChange={(e) => setCattleName(e.target.value)}
              className="w-full bg-neutral-dark/80 text-white p-2 rounded border border-neon-purple focus:border-neon-pink outline-none"
              placeholder="Enter a name for your cattle"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card">
              <h4 className="font-pixel text-neon-cyan text-sm mb-2">Milk Cow</h4>
              <div className="text-center text-2xl mb-2">🐄</div>
              <div className="mb-3">
                <div className="text-neon-pink text-xs mb-1">PRICE</div>
                <div className="font-bold">80 BT</div>
              </div>
              <div className="mb-3">
                <div className="text-neon-pink text-xs mb-1">BENEFITS</div>
                <div className="text-sm">Produces milk for BT tokens</div>
              </div>
              <button
                onClick={() => handlePurchase('milk_cow')}
                disabled={!gameState.player || gameState.player.btBalance < 80}
                className={`button button-primary w-full ${(!gameState.player || gameState.player.btBalance < 80) ? 'button-disabled' : ''}`}
              >
                Buy Milk Cow
              </button>
            </div>
            
            <div className="card">
              <h4 className="font-pixel text-neon-cyan text-sm mb-2">Beef Cow</h4>
              <div className="text-center text-2xl mb-2">🐄</div>
              <div className="mb-3">
                <div className="text-neon-pink text-xs mb-1">PRICE</div>
                <div className="font-bold">60 BT</div>
              </div>
              <div className="mb-3">
                <div className="text-neon-pink text-xs mb-1">BENEFITS</div>
                <div className="text-sm">Yields more when sold</div>
              </div>
              <button
                onClick={() => handlePurchase('beef_cow')}
                disabled={!gameState.player || gameState.player.btBalance < 60}
                className={`button button-primary w-full ${(!gameState.player || gameState.player.btBalance < 60) ? 'button-disabled' : ''}`}
              >
                Buy Beef Cow
              </button>
            </div>
            
            <div className="card">
              <h4 className="font-pixel text-neon-cyan text-sm mb-2">Bull</h4>
              <div className="text-center text-2xl mb-2">🐂</div>
              <div className="mb-3">
                <div className="text-neon-pink text-xs mb-1">PRICE</div>
                <div className="font-bold">100 BT</div>
              </div>
              <div className="mb-3">
                <div className="text-neon-pink text-xs mb-1">BENEFITS</div>
                <div className="text-sm">Can compete in rodeos for BT</div>
              </div>
              <button
                onClick={() => handlePurchase('bull')}
                disabled={!gameState.player || gameState.player.btBalance < 100}
                className={`button button-primary w-full ${(!gameState.player || gameState.player.btBalance < 100) ? 'button-disabled' : ''}`}
              >
                Buy Bull
              </button>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="button button-outline" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CattleShopModal;