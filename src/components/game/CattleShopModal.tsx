import React, { useState } from 'react';
import { useGameState } from '../../hooks/useGameState';
import { useToast } from '../../hooks/useToast';

interface CattleShopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CattleShopModal: React.FC<CattleShopModalProps> = ({ isOpen, onClose }) => {
  const [selectedType, setSelectedType] = useState<'cow' | 'bull'>('cow');
  const { gameState, purchaseCattle } = useGameState();
  const { toast } = useToast();
  
  if (!isOpen) return null;
  
  const handlePurchase = () => {
    if (!gameState.player) {
      toast({
        title: 'Error',
        description: 'Player data not found',
        variant: 'error'
      });
      return;
    }
    
    const cost = selectedType === 'cow' ? 50 : 75;
    
    if (gameState.player.btBalance < cost) {
      toast({
        title: 'Insufficient Funds',
        description: `You need ${cost} BT to purchase a ${selectedType}`,
        variant: 'error'
      });
      return;
    }
    
    // Purchase the cattle
    purchaseCattle(selectedType);
    
    toast({
      title: 'Purchase Successful',
      description: `You've purchased a new ${selectedType}!`,
      variant: 'success'
    });
    
    onClose();
  };
  
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">Cattle Shop</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <p className="mb-4 text-cyan-300">
            Purchase cattle to produce milk and breed new cattle. Each type has different benefits.
          </p>
          
          <div className="mb-4">
            <label className="block text-sm mb-2 text-neon-cyan">Select Cattle Type</label>
            <div className="grid grid-cols-2 gap-4">
              <div 
                className={`card cursor-pointer ${selectedType === 'cow' ? 'border-neon-cyan' : ''}`}
                onClick={() => setSelectedType('cow')}
              >
                <div className="text-center text-4xl mb-2">🐄</div>
                <h4 className="font-pixel text-neon-cyan text-center mb-2">Cow</h4>
                <div className="mb-2">
                  <div className="text-neon-pink text-xs mb-1">COST</div>
                  <div className="font-bold">50 BT</div>
                </div>
                <div className="mb-2">
                  <div className="text-neon-pink text-xs mb-1">BENEFITS</div>
                  <div className="text-sm">Produces milk daily, which can be sold for BT</div>
                </div>
              </div>
              
              <div 
                className={`card cursor-pointer ${selectedType === 'bull' ? 'border-neon-cyan' : ''}`}
                onClick={() => setSelectedType('bull')}
              >
                <div className="text-center text-4xl mb-2">🐂</div>
                <h4 className="font-pixel text-neon-cyan text-center mb-2">Bull</h4>
                <div className="mb-2">
                  <div className="text-neon-pink text-xs mb-1">COST</div>
                  <div className="font-bold">75 BT</div>
                </div>
                <div className="mb-2">
                  <div className="text-neon-pink text-xs mb-1">BENEFITS</div>
                  <div className="text-sm">Higher breeding rate, helps produce more cattle</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <h4 className="font-pixel text-neon-cyan text-sm mb-2">Purchase Summary</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-neon-pink text-xs mb-1">CATTLE TYPE</div>
                <div className="font-bold capitalize">{selectedType}</div>
              </div>
              <div>
                <div className="text-neon-pink text-xs mb-1">COST</div>
                <div className="font-bold">{selectedType === 'cow' ? '50' : '75'} BT</div>
              </div>
              <div>
                <div className="text-neon-pink text-xs mb-1">YOUR BALANCE</div>
                <div className="font-bold">{gameState.player?.btBalance || 0} BT</div>
              </div>
              <div>
                <div className="text-neon-pink text-xs mb-1">AFTER PURCHASE</div>
                <div className="font-bold">
                  {gameState.player 
                    ? gameState.player.btBalance - (selectedType === 'cow' ? 50 : 75) 
                    : 0} BT
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="button button-outline" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="button button-primary" 
            onClick={handlePurchase}
            disabled={gameState.player 
              ? gameState.player.btBalance < (selectedType === 'cow' ? 50 : 75)
              : true
            }
          >
            Purchase {selectedType}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CattleShopModal;