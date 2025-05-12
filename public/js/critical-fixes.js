/**
 * Critical Fixes for Bull Run Boost
 * 
 * This module implements direct fixes for:
 * 1. The claim bonus button functionality
 * 2. Race reset functionality
 * 
 * This is separate from other implementations to ensure these critical functions work
 * regardless of potential conflicts with other code.
 */

(function() {
    console.log("Loading critical fixes module...");
    
    // Initialize immediately when the DOM is loaded
    document.addEventListener('DOMContentLoaded', initCriticalFixes);
    
    // Main function to initialize all fixes
    function initCriticalFixes() {
        console.log("Initializing critical fixes");
        
        // Fix claim bonus button
        fixClaimBonusButton();
        
        // Fix race reset
        fixRaceReset();
        
        // Set up event listener for scene changes to reapply fixes
        document.addEventListener('scene-changed', function(e) {
            if (e.detail && e.detail.scene === 'saloon') {
                console.log("Scene changed to saloon, reapplying critical fixes");
                setTimeout(function() {
                    fixClaimBonusButton();
                    fixRaceReset();
                }, 100); // Short delay to ensure DOM is ready
            }
        });
        
        console.log("Critical fixes initialized");
    }
    
    // Fix for claim bonus button
    function fixClaimBonusButton() {
        const bonusButton = document.getElementById('claim-bonus');
        if (!bonusButton) {
            console.log("Bonus button not found, will retry later");
            return;
        }
        
        console.log("Found bonus button, fixing functionality");
        
        // Create a new button element to replace the existing one
        // This effectively removes any existing event listeners
        const newButton = bonusButton.cloneNode(true);
        bonusButton.parentNode.replaceChild(newButton, bonusButton);
        
        // Add our event listener
        newButton.addEventListener('click', function(e) {
            console.log("Critical fix: Claim bonus button clicked");
            
            // Create socket if not exists
            if (!window.socket) {
                console.log("No socket connection found, creating one");
                window.socket = io();
            }
            
            // Send claim-bonus event to server
            window.socket.emit('claim-bonus');
            
            // Prevent default to be safe
            e.preventDefault();
        });
        
        // Set up listener for bonus-claimed event
        if (window.socket) {
            // Remove existing listeners first (create a new socket connection)
            const currentSocket = window.socket;
            
            // Add new listener
            currentSocket.on('bonus-claimed', function(data) {
                console.log("Critical fix: Bonus claimed event received", data);
                
                // Update UI
                const bonusButton = document.getElementById('claim-bonus');
                if (bonusButton) {
                    bonusButton.innerHTML = '<span class="icon">✓</span><span class="label">Bonus Claimed (+50)</span>';
                    bonusButton.classList.add('disabled');
                    bonusButton.disabled = true;
                }
                
                // Update balance displays
                updateBalanceDisplays(data.player.cattleBalance);
                
                // Show notification
                if (typeof window.showNotification === 'function') {
                    window.showNotification(`Bonus claimed! +${data.amount} $CATTLE added to your balance.`, 'success');
                } else {
                    alert(`Bonus claimed! +${data.amount} $CATTLE added to your balance.`);
                }
                
                // Show confetti animation if available
                if (typeof window.createConfetti === 'function') {
                    window.createConfetti();
                }
            });
            
            // Also listen for error messages
            currentSocket.on('error-message', function(data) {
                console.log("Critical fix: Error message received", data);
                
                // Show notification
                if (typeof window.showNotification === 'function') {
                    window.showNotification(data.message, 'error');
                } else {
                    alert(data.message);
                }
            });
        }
    }
    
    // Fix for race reset functionality
    function fixRaceReset() {
        // Setup socket to handle race finish events
        if (!window.socket) {
            console.log("No socket connection found, creating one for race reset fix");
            window.socket = io();
        }
        
        // Listen for race-finished event
        window.socket.on('race-finished', function(data) {
            console.log("Critical fix: Race finished event received", data);
            
            // Display the winner and potential winnings
            if (typeof window.showNotification === 'function') {
                if (data.winnings > 0) {
                    window.showNotification(`Race finished! ${data.winner} won! You won ${data.winnings} $CATTLE!`, 'success');
                    
                    // Show confetti
                    if (typeof window.createConfetti === 'function') {
                        window.createConfetti();
                    }
                    
                    // Show win celebration
                    if (typeof window.showWinCelebration === 'function') {
                        window.showWinCelebration(data.winnings);
                    }
                } else {
                    window.showNotification(`Race finished! ${data.winner} won! Better luck next time.`, 'info');
                }
            }
            
            // Update player balance
            if (data.player && typeof data.player.cattleBalance !== 'undefined') {
                updateBalanceDisplays(data.player.cattleBalance);
            }
            
            // After a delay, reset the UI for a new race
            setTimeout(function() {
                console.log("Critical fix: Resetting race UI");
                resetRaceUI();
            }, 3000);
        });
    }
    
    // Function to reset the race UI
    function resetRaceUI() {
        // Reset the progress bars
        const progressBars = [
            document.getElementById('hearts-progress'),
            document.getElementById('diamonds-progress'),
            document.getElementById('clubs-progress'),
            document.getElementById('spades-progress')
        ];
        
        progressBars.forEach(function(bar) {
            if (bar) bar.style.width = '0%';
        });
        
        // Reset the bet amounts
        const betDisplays = [
            document.getElementById('hearts-bet-amount'),
            document.getElementById('diamonds-bet-amount'),
            document.getElementById('clubs-bet-amount'),
            document.getElementById('spades-bet-amount'),
            document.getElementById('total-bet-amount'),
            document.getElementById('burn-amount')
        ];
        
        betDisplays.forEach(function(display) {
            if (display) display.textContent = '0';
        });
        
        // Reset the card display
        const cardDisplay = document.getElementById('drawn-card');
        if (cardDisplay) cardDisplay.innerHTML = '';
        
        // Enable the start race button and disable the draw card button
        const startRaceBtn = document.getElementById('start-race-btn');
        const drawCardBtn = document.getElementById('draw-card-btn');
        
        if (startRaceBtn) {
            startRaceBtn.disabled = false;
            startRaceBtn.classList.remove('disabled');
        }
        
        if (drawCardBtn) {
            drawCardBtn.disabled = true;
            drawCardBtn.classList.add('disabled');
        }
    }
    
    // Helper function to update all balance displays
    function updateBalanceDisplays(balance) {
        const displays = document.querySelectorAll('.cattle-balance, #cattle-balance, #saloon-cattle-balance, #night-cattle-balance');
        displays.forEach(function(display) {
            if (display) display.textContent = balance;
        });
    }
    
    // Export some functions for external use or debugging
    window.criticalFixes = {
        init: initCriticalFixes,
        fixClaimBonusButton: fixClaimBonusButton,
        fixRaceReset: fixRaceReset,
        resetRaceUI: resetRaceUI
    };
    
    console.log("Critical fixes module loaded");
})();