using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System.Threading.Tasks;

public class DaytimeRanchController : MonoBehaviour
{
    // UI References
    [SerializeField] private TextMeshProUGUI hayText;
    [SerializeField] private TextMeshProUGUI waterText;
    [SerializeField] private TextMeshProUGUI cattleBalanceText;
    [SerializeField] private TextMeshProUGUI cattleStatsText;
    [SerializeField] private Button breedCattleButton;
    [SerializeField] private Button upgradeBarnButton;
    [SerializeField] private Button goToSaloonButton;
    [SerializeField] private Button enterEtherRangeButton;
    [SerializeField] private GameObject errorMessagePanel;
    [SerializeField] private TextMeshProUGUI errorMessageText;
    [SerializeField] private Button closeErrorButton;
    
    // NFT Management
    [SerializeField] private Button showNFTsButton;
    [SerializeField] private Button connectWalletButton;
    
    // Day indicator
    [SerializeField] private Image dayCycleIndicator;
    [SerializeField] private Sprite sunSprite;
    [SerializeField] private TextMeshProUGUI timeText;
    
    // Time display
    [SerializeField] private TextMeshProUGUI dayNightText;
    
    // References
    private PlayerData playerData;
    private NFTDisplayManager nftDisplayManager;
    private WalletConnector walletConnector;
    private DayNightCycleManager dayNightManager;
    
    // Button states
    private bool isBreedingCattle = false;
    private bool isUpgradingBarn = false;

    private void Start()
    {
        // Get references
        playerData = GameManager.Instance.PlayerData;
        dayNightManager = DayNightCycleManager.Instance;
        
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
    }

    private void InitializeUI()
    {
        // Setup button listeners
        if (breedCattleButton != null)
        {
            breedCattleButton.onClick.AddListener(BreedCattle);
        }
        
        if (upgradeBarnButton != null)
        {
            upgradeBarnButton.onClick.AddListener(UpgradeBarn);
        }
        
        if (goToSaloonButton != null)
        {
            goToSaloonButton.onClick.AddListener(GoToSaloon);
        }
        
        if (enterEtherRangeButton != null)
        {
            enterEtherRangeButton.onClick.AddListener(EnterEtherRange);
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
        
        // Set day indicator
        if (dayCycleIndicator != null && sunSprite != null)
        {
            dayCycleIndicator.sprite = sunSprite;
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
        
        // Update resource display
        if (hayText != null)
        {
            hayText.text = $"Hay: {playerData.Hay}/{playerData.BarnCapacity}";
        }
        
        if (waterText != null)
        {
            waterText.text = $"Water: {playerData.Water}/{playerData.BarnCapacity}";
        }
        
        if (cattleBalanceText != null)
        {
            cattleBalanceText.text = $"$CATTLE: {playerData.GetCattleBalance():F2}";
        }
        
        // Update cattle stats
        if (cattleStatsText != null)
        {
            cattleStatsText.text = $"Total Cattle: {playerData.Cattle}";
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
    /// Handle time state changes
    /// </summary>
    private void OnTimeStateChanged(DayNightCycleManager.TimeState newState)
    {
        if (newState == DayNightCycleManager.TimeState.Night)
        {
            // We're switching to night - this controller should trigger navigation to Ether Range
            // The transition is handled by DayNightCycleManager
        }
    }
    
    /// <summary>
    /// Update button enabled states based on resources
    /// </summary>
    private void UpdateButtonStates()
    {
        if (playerData == null) return;
        
        // Breed cattle button
        if (breedCattleButton != null)
        {
            bool canBreed = playerData.Hay >= 10 && playerData.Water >= 10 && !isBreedingCattle;
            breedCattleButton.interactable = canBreed;
        }
        
        // Upgrade barn button
        if (upgradeBarnButton != null)
        {
            bool canUpgrade = playerData.GetCattleBalance() >= 50 && !isUpgradingBarn;
            upgradeBarnButton.interactable = canUpgrade;
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
    /// Breed a new cattle NFT
    /// </summary>
    private async void BreedCattle()
    {
        if (playerData == null) return;
        
        // Disable button during operation
        isBreedingCattle = true;
        if (breedCattleButton != null)
        {
            breedCattleButton.interactable = false;
        }
        
        // Show processing message
        ShowMessage("Breeding cattle...");
        
        try
        {
            // Attempt to breed cattle
            NFTItem newCattle = await playerData.BreedCattle();
            
            if (newCattle != null)
            {
                // Success
                GameManager.Instance.SoundManager.PlayPositiveFeedback();
                
                // Show success message with NFT details
                string speedValue = "0";
                string milkValue = "0";
                
                if (newCattle.Attributes.TryGetValue("Speed", out int speed))
                {
                    speedValue = speed.ToString();
                }
                
                if (newCattle.Attributes.TryGetValue("Milk", out int milk))
                {
                    milkValue = milk.ToString();
                }
                
                ShowMessage($"New cattle bred! {newCattle.Name}: Speed {speedValue}, Milk {milkValue}");
            }
            else
            {
                // Failed
                GameManager.Instance.SoundManager.PlayNegativeFeedback();
                ShowError("Failed to breed cattle. Check your resources.");
            }
        }
        catch (System.Exception e)
        {
            // Error
            Debug.LogError($"Error breeding cattle: {e.Message}");
            ShowError("An error occurred while breeding cattle.");
        }
        finally
        {
            // Re-enable button
            isBreedingCattle = false;
            UpdateButtonStates();
        }
    }

    /// <summary>
    /// Upgrade the barn
    /// </summary>
    private async void UpgradeBarn()
    {
        if (playerData == null) return;
        
        // Disable button during operation
        isUpgradingBarn = true;
        if (upgradeBarnButton != null)
        {
            upgradeBarnButton.interactable = false;
        }
        
        // Show processing message
        ShowMessage("Upgrading barn...");
        
        try
        {
            // Attempt to upgrade barn
            bool success = await playerData.UpgradeBarn();
            
            if (success)
            {
                // Success
                GameManager.Instance.SoundManager.PlayPositiveFeedback();
                ShowMessage("Barn upgraded! Capacity increased by 50.");
            }
            else
            {
                // Failed
                GameManager.Instance.SoundManager.PlayNegativeFeedback();
                ShowError("Not enough $CATTLE! Upgrading costs 50 $CATTLE.");
            }
        }
        catch (System.Exception e)
        {
            // Error
            Debug.LogError($"Error upgrading barn: {e.Message}");
            ShowError("An error occurred while upgrading the barn.");
        }
        finally
        {
            // Re-enable button
            isUpgradingBarn = false;
            UpdateButtonStates();
        }
    }

    /// <summary>
    /// Navigate to Saloon
    /// </summary>
    private void GoToSaloon()
    {
        // Play UI sound
        GameManager.Instance.SoundManager.PlayButtonClick();
        
        // Go to saloon scene
        GameManager.Instance.GoToSaloon();
    }

    /// <summary>
    /// Navigate to Ether Range
    /// </summary>
    private void EnterEtherRange()
    {
        // Play UI sound
        GameManager.Instance.SoundManager.PlayButtonClick();
        
        // Force a transition to night
        if (dayNightManager != null)
        {
            dayNightManager.SetTimeState(DayNightCycleManager.TimeState.Night);
        }
        else
        {
            // Fallback if day/night manager not found
            GameManager.Instance.GoToEtherRange();
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
            nftDisplayManager.ShowNFTList("cattle");
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
