using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System.Threading.Tasks;

public class EtherRangeController : MonoBehaviour
{
    // UI References
    [SerializeField] private TextMeshProUGUI cattleBalanceText;
    [SerializeField] private Button craftPotionButton;
    [SerializeField] private Button sellPotionButton;
    [SerializeField] private Button backToRanchButton;
    [SerializeField] private GameObject errorMessagePanel;
    [SerializeField] private TextMeshProUGUI errorMessageText;
    [SerializeField] private Button closeErrorButton;
    
    // NFT Management
    [SerializeField] private Button showNFTsButton;
    [SerializeField] private Button connectWalletButton;
    
    // Market display
    [SerializeField] private TextMeshProUGUI marketPriceText;
    
    // Night indicator
    [SerializeField] private Image dayCycleIndicator;
    [SerializeField] private Sprite moonSprite;
    
    // Educational elements
    [SerializeField] private GameObject tooltipPanel;
    [SerializeField] private TextMeshProUGUI tooltipText;
    
    // Time display
    [SerializeField] private TextMeshProUGUI dayNightText;
    
    // References
    private PlayerData playerData;
    private NFTDisplayManager nftDisplayManager;
    private WalletConnector walletConnector;
    private DayNightCycleManager dayNightManager;
    private GameEconomyManager economyManager;
    
    // Selected NFT for selling
    private NFTItem selectedPotion;
    
    // Button states
    private bool isCraftingPotion = false;
    private bool isSellingPotion = false;

    private void Start()
    {
        // Get references
        playerData = GameManager.Instance.PlayerData;
        dayNightManager = DayNightCycleManager.Instance;
        economyManager = GameEconomyManager.Instance;
        
        // Find UI managers
        nftDisplayManager = FindObjectOfType<NFTDisplayManager>();
        walletConnector = FindObjectOfType<WalletConnector>();
        
        // Initialize UI and setup listeners
        InitializeUI();
        
        // Initially hide error panel
        if (errorMessagePanel != null)
        {
            errorMessagePanel.SetActive(false);
        }
        
        // Set tooltip text
        if (tooltipText != null)
        {
            tooltipText.text = "Supply/Demand: Potion prices vary between 25-35 $CATTLE based on market conditions!";
        }
        
        // Update UI with current player data
        UpdateUI();
        
        // Subscribe to events
        if (playerData != null)
        {
            playerData.OnResourcesChanged += UpdateUI;
            playerData.OnCattleBalanceChanged += UpdateCattleBalance;
        }
        
        if (dayNightManager != null)
        {
            dayNightManager.OnTimeStateChanged += OnTimeStateChanged;
            dayNightManager.OnTimeProgressed += UpdateTimeDisplay;
        }
        
        if (economyManager != null)
        {
            economyManager.OnMarketPriceChanged += UpdateMarketPrice;
        }
        
        // Initially disable sell button until a potion is selected
        if (sellPotionButton != null)
        {
            sellPotionButton.interactable = false;
        }
    }

    private void InitializeUI()
    {
        // Setup button listeners
        if (craftPotionButton != null)
        {
            craftPotionButton.onClick.AddListener(CraftShadowPotion);
        }
        
        if (sellPotionButton != null)
        {
            sellPotionButton.onClick.AddListener(SellSelectedPotion);
        }
        
        if (backToRanchButton != null)
        {
            backToRanchButton.onClick.AddListener(BackToRanch);
        }
        
        if (closeErrorButton != null)
        {
            closeErrorButton.onClick.AddListener(CloseErrorPanel);
        }
        
        if (showNFTsButton != null)
        {
            showNFTsButton.onClick.AddListener(ShowNFTs);
        }
        
        if (connectWalletButton != null)
        {
            connectWalletButton.onClick.AddListener(ShowWalletConnect);
        }
        
        // Set night indicator
        if (dayCycleIndicator != null && moonSprite != null)
        {
            dayCycleIndicator.sprite = moonSprite;
        }
    }

    private void Update()
    {
        // Update time display
        UpdateTimeDisplay();
    }

    /// <summary>
    /// Update all UI elements based on player data
    /// </summary>
    private void UpdateUI()
    {
        if (playerData == null) return;
        
        // Update balance display
        if (cattleBalanceText != null)
        {
            cattleBalanceText.text = $"$CATTLE: {playerData.GetCattleBalance():F2}";
        }
        
        // Update button states
        UpdateButtonStates();
    }
    
    /// <summary>
    /// Update the time display
    /// </summary>
    private void UpdateTimeDisplay(float progress = -1)
    {
        if (dayNightManager == null || dayNightText == null) return;
        
        // Get time string from day/night manager
        string timeString = dayNightManager.GetTimeString();
        dayNightText.text = timeString;
    }
    
    /// <summary>
    /// Update market price display
    /// </summary>
    private void UpdateMarketPrice(float priceMultiplier)
    {
        if (marketPriceText == null) return;
        
        // Calculate and display price range
        float minPrice = 25f * priceMultiplier;
        float maxPrice = 35f * priceMultiplier;
        
        marketPriceText.text = $"Market Prices: {minPrice:F1}-{maxPrice:F1} $CATTLE";
        
        // Add color based on whether prices are high or low
        if (priceMultiplier > 1.1f)
        {
            marketPriceText.color = Color.green; // High prices
        }
        else if (priceMultiplier < 0.9f)
        {
            marketPriceText.color = Color.red; // Low prices
        }
        else
        {
            marketPriceText.color = Color.white; // Normal prices
        }
    }
    
    /// <summary>
    /// Handle time state changes
    /// </summary>
    private void OnTimeStateChanged(DayNightCycleManager.TimeState newState)
    {
        if (newState == DayNightCycleManager.TimeState.Day)
        {
            // We're switching to day - this controller should trigger navigation to Ranch
            // The transition is handled by DayNightCycleManager
        }
    }
    
    /// <summary>
    /// Update button enabled states based on resources
    /// </summary>
    private void UpdateButtonStates()
    {
        if (playerData == null) return;
        
        // Craft potion button
        if (craftPotionButton != null)
        {
            bool canCraft = playerData.GetCattleBalance() >= 20f && !isCraftingPotion;
            craftPotionButton.interactable = canCraft;
        }
        
        // Sell potion button
        if (sellPotionButton != null)
        {
            bool canSell = selectedPotion != null && !isSellingPotion;
            sellPotionButton.interactable = canSell;
        }
    }
    
    /// <summary>
    /// Update CATTLE balance display
    /// </summary>
    private void UpdateCattleBalance(float balance)
    {
        if (cattleBalanceText != null)
        {
            cattleBalanceText.text = $"$CATTLE: {balance:F2}";
        }
        
        // Update button states
        UpdateButtonStates();
    }

    /// <summary>
    /// Craft a new shadow potion NFT
    /// </summary>
    private async void CraftShadowPotion()
    {
        if (playerData == null) return;
        
        // Disable button during operation
        isCraftingPotion = true;
        if (craftPotionButton != null)
        {
            craftPotionButton.interactable = false;
        }
        
        // Show processing message
        ShowMessage("Crafting shadow potion...");
        
        try
        {
            // Attempt to craft potion
            NFTItem newPotion = await playerData.CraftShadowPotion();
            
            if (newPotion != null)
            {
                // Success
                GameManager.Instance.SoundManager.PlayPositiveFeedback();
                
                // Show success message with NFT details
                string potencyValue = "0";
                
                if (newPotion.Attributes.TryGetValue("Potency", out int potency))
                {
                    potencyValue = potency.ToString();
                }
                
                ShowMessage($"New shadow potion crafted! {newPotion.Name}: Potency {potencyValue}");
                
                // Show NFT list with the new potion
                if (nftDisplayManager != null)
                {
                    nftDisplayManager.ShowNFTList("potion");
                }
            }
            else
            {
                // Failed
                GameManager.Instance.SoundManager.PlayNegativeFeedback();
                ShowError("Failed to craft potion. Check your $CATTLE balance.");
            }
        }
        catch (System.Exception e)
        {
            // Error
            Debug.LogError($"Error crafting potion: {e.Message}");
            ShowError("An error occurred while crafting the potion.");
        }
        finally
        {
            // Re-enable button
            isCraftingPotion = false;
            UpdateButtonStates();
        }
    }

    /// <summary>
    /// Sell the selected shadow potion
    /// </summary>
    private async void SellSelectedPotion()
    {
        if (playerData == null || selectedPotion == null) return;
        
        // Disable button during operation
        isSellingPotion = true;
        if (sellPotionButton != null)
        {
            sellPotionButton.interactable = false;
        }
        
        // Show processing message
        ShowMessage($"Selling {selectedPotion.Name}...");
        
        try
        {
            // Attempt to sell potion
            float amount = await playerData.SellShadowPotion(selectedPotion);
            
            if (amount > 0)
            {
                // Success
                GameManager.Instance.SoundManager.PlayCoinsSound();
                
                // Show success message
                ShowMessage($"{selectedPotion.Name} sold for {amount:F2} $CATTLE!");
                
                // Reset selected potion
                selectedPotion = null;
                
                // Refresh NFT list if open
                if (nftDisplayManager != null)
                {
                    nftDisplayManager.RefreshNFTList();
                }
            }
            else
            {
                // Failed
                GameManager.Instance.SoundManager.PlayNegativeFeedback();
                ShowError("Failed to sell potion.");
            }
        }
        catch (System.Exception e)
        {
            // Error
            Debug.LogError($"Error selling potion: {e.Message}");
            ShowError("An error occurred while selling the potion.");
        }
        finally
        {
            // Re-enable button
            isSellingPotion = false;
            UpdateButtonStates();
        }
    }

    /// <summary>
    /// Navigate back to the Ranch
    /// </summary>
    private void BackToRanch()
    {
        // Play UI sound
        GameManager.Instance.SoundManager.PlayButtonClick();
        
        // Force a transition to day
        if (dayNightManager != null)
        {
            dayNightManager.SetTimeState(DayNightCycleManager.TimeState.Day);
        }
        else
        {
            // Fallback if day/night manager not found
            GameManager.Instance.GoToRanch();
        }
    }

    /// <summary>
    /// Show NFT inventory
    /// </summary>
    private void ShowNFTs()
    {
        // Play UI sound
        GameManager.Instance.SoundManager.PlayButtonClick();
        
        // Show NFT list
        if (nftDisplayManager != null)
        {
            nftDisplayManager.ShowNFTList("potion");
            
            // Set up callback for selection
            // This would typically be done with an event system
            // but for this MVP we'll use a custom method
            // to be called from the NFT display manager
            SetNFTSelectionCallback();
        }
    }
    
    /// <summary>
    /// Set up callback for NFT selection
    /// </summary>
    private void SetNFTSelectionCallback()
    {
        // This is a placeholder for setting up a more sophisticated event system
        // In a real implementation, we would subscribe to events from the NFT display manager
        // For now, we'll rely on the NFT display manager to call SelectNFT directly
    }
    
    /// <summary>
    /// Select an NFT for selling
    /// </summary>
    public void SelectNFT(NFTItem nft)
    {
        // Only allow selecting potions
        if (nft != null && nft.Name.Contains("Potion"))
        {
            selectedPotion = nft;
            UpdateButtonStates();
        }
    }
    
    /// <summary>
    /// Show wallet connection UI
    /// </summary>
    private void ShowWalletConnect()
    {
        // Play UI sound
        GameManager.Instance.SoundManager.PlayButtonClick();
        
        // Show wallet panel
        if (walletConnector != null)
        {
            walletConnector.ShowWalletPanel();
        }
    }

    /// <summary>
    /// Show error message
    /// </summary>
    private void ShowError(string errorMessage)
    {
        if (errorMessagePanel == null || errorMessageText == null) return;
        
        errorMessageText.text = errorMessage;
        errorMessageText.color = Color.red;
        errorMessagePanel.SetActive(true);
    }

    /// <summary>
    /// Show success/info message
    /// </summary>
    private void ShowMessage(string message)
    {
        if (errorMessagePanel == null || errorMessageText == null) return;
        
        errorMessageText.text = message;
        errorMessageText.color = Color.green;
        errorMessagePanel.SetActive(true);
    }

    /// <summary>
    /// Close message panel
    /// </summary>
    private void CloseErrorPanel()
    {
        // Play UI sound
        GameManager.Instance.SoundManager.PlayButtonClick();
        
        if (errorMessagePanel != null)
        {
            errorMessagePanel.SetActive(false);
        }
    }
}
