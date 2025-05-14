import React, { useState } from 'react';
import { useGameState } from '../../hooks/useGameState';
import { useToast } from '../../hooks/useToast';

interface StakingModalProps {
  isOpen: boolean;
  onClose: () => void;
  poolType: 'pasture' | 'laboratory';
}

const StakingModal: React.FC<StakingModalProps> = ({ 
  isOpen, 
  onClose,
  poolType
}) => {
  const { gameState, dispatch } = useGameState();
  const { toast } = useToast();
  const [stakeAmount, setStakeAmount] = useState('');
  const [stakeDuration, setStakeDuration] = useState('7');
  
  if (!isOpen) return null;
  
  // Calculate APY based on duration
  const getAPY = (days: number) => {
    if (days <= 7) return 15;
    if (days <= 30) return 25;
    return 40;
  };
  
  const apy = getAPY(Number(stakeDuration));
  
  // Calculate estimated rewards
  const calculateRewards = () => {
    const amount = Number(stakeAmount);
    if (isNaN(amount) || amount <= 0) return 0;
    
    const days = Number(stakeDuration);
    if (isNaN(days) || days <= 0) return 0;
    
    // Daily rate based on APY
    const dailyRate = apy / 365;
    
    // Calculate reward
    return (amount * dailyRate * days) / 100;
  };
  
  const estimatedRewards = calculateRewards();
  
  const handleStake = () => {
    const amount = Number(stakeAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid stake amount',
        variant: 'error'
      });
      return;
    }
    
    const tokenType = poolType === 'pasture' ? 'BT' : 'BC';
    const balance = poolType === 'pasture' 
      ? gameState.player?.btBalance || 0
      : gameState.player?.bcBalance || 0;
    
    if (amount > balance) {
      toast({
        title: 'Insufficient Balance',
        description: `You don't have enough ${tokenType} tokens`,
        variant: 'error'
      });
      return;
    }
    
    // Update player balance
    if (gameState.player) {
      const updatedPlayer = { ...gameState.player };
      
      if (poolType === 'pasture') {
        updatedPlayer.btBalance -= amount;
      } else {
        updatedPlayer.bcBalance -= amount;
      }
      
      // Add XP for staking
      updatedPlayer.xp += Math.floor(amount / 10);
      
      // Check if enough XP for level up
      if (updatedPlayer.xp >= updatedPlayer.xpToNextLevel) {
        updatedPlayer.level += 1;
        updatedPlayer.xp -= updatedPlayer.xpToNextLevel;
        updatedPlayer.xpToNextLevel = updatedPlayer.level * 100;
        
        toast({
          title: 'Level Up!',
          description: `You are now level ${updatedPlayer.level}`,
          variant: 'success'
        });
      }
      
      dispatch({ type: 'SET_PLAYER', payload: updatedPlayer });
    }
    
    // In a real implementation, we would record the stake details
    // For simplicity, we just show a toast notification
    
    toast({
      title: 'Stake Successful',
      description: `You have staked ${amount} ${tokenType} for ${stakeDuration} days with ${apy}% APY`,
      variant: 'success'
    });
    
    // Reset form and close modal
    setStakeAmount('');
    setStakeDuration('7');
    onClose();
  };
  
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">
            {poolType === 'pasture' ? 'Ranch Staking Pool' : 'Shadow Market Staking Pool'}
          </h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <p className="mb-4 text-cyan-300">
            {poolType === 'pasture' 
              ? 'Stake your BT tokens to earn passive income and unlock ranch expansion capabilities.'
              : 'Stake your BC tokens to earn passive income and unlock shadow market expansion capabilities.'
            }
          </p>
          
          <div className="card mb-4">
            <h4 className="font-pixel text-neon-cyan text-sm mb-3">Staking Information</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-neon-pink text-xs mb-1">CURRENT BALANCE</div>
                <div className="font-bold">
                  {poolType === 'pasture' 
                    ? `${gameState.player?.btBalance || 0} BT`
                    : `${gameState.player?.bcBalance || 0} BC`
                  }
                </div>
              </div>
              <div>
                <div className="text-neon-pink text-xs mb-1">REWARDS APY</div>
                <div className="font-bold">{apy}%</div>
              </div>
              <div>
                <div className="text-neon-pink text-xs mb-1">LOCK PERIOD</div>
                <div className="font-bold">{stakeDuration} days</div>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm mb-1 text-neon-cyan">Stake Amount</label>
            <div className="flex">
              <input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                className="flex-1 bg-neutral-dark/80 text-white p-2 rounded-l border border-neon-purple focus:border-neon-pink outline-none"
                placeholder="Enter amount to stake"
                min="1"
              />
              <div className="bg-neutral-dark p-2 rounded-r border border-l-0 border-neon-purple">
                {poolType === 'pasture' ? 'BT' : 'BC'}
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm mb-1 text-neon-cyan">Lock Period</label>
            <select
              value={stakeDuration}
              onChange={(e) => setStakeDuration(e.target.value)}
              className="w-full bg-neutral-dark/80 text-white p-2 rounded border border-neon-purple focus:border-neon-pink outline-none"
            >
              <option value="7">7 days (15% APY)</option>
              <option value="30">30 days (25% APY)</option>
              <option value="90">90 days (40% APY)</option>
            </select>
          </div>
          
          <div className="card bg-neutral-dark/60">
            <h4 className="font-pixel text-neon-cyan text-sm mb-2">Estimated Rewards</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-neon-pink text-xs mb-1">STAKE AMOUNT</div>
                <div className="font-bold">
                  {stakeAmount ? `${stakeAmount} ${poolType === 'pasture' ? 'BT' : 'BC'}` : '-'}
                </div>
              </div>
              <div>
                <div className="text-neon-pink text-xs mb-1">REWARD AMOUNT</div>
                <div className="font-bold">
                  {estimatedRewards.toFixed(2)} {poolType === 'pasture' ? 'BT' : 'BC'}
                </div>
              </div>
              <div>
                <div className="text-neon-pink text-xs mb-1">LOCK PERIOD</div>
                <div className="font-bold">{stakeDuration} days</div>
              </div>
              <div>
                <div className="text-neon-pink text-xs mb-1">APY</div>
                <div className="font-bold">{apy}%</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="button button-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="button button-primary" onClick={handleStake}>
            Stake Tokens
          </button>
        </div>
      </div>
    </div>
  );
};

export default StakingModal;