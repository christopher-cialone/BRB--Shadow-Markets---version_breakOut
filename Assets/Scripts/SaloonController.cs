using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System.Threading.Tasks;

public class SaloonController : MonoBehaviour
{
    // UI References
    [SerializeField] private TextMeshProUGUI cattleBalanceText;
    [SerializeField] private Slider wagerSlider;
    [SerializeField] private TextMeshProUGUI wagerValueText;
    [SerializeField] private Button playPokerButton;
    [SerializeField] private Button backToRanchButton;
    [SerializeField] private TextMeshProUGUI resultText;
    [SerializeField] private GameObject resultPanel;
    [SerializeField] private Button closeResultButton;
    
    // Blockchain UI Elements
    [SerializeField] private Button connectWalletButton;
    [SerializeField] private TextMeshProUGUI transactionHashText;
    [SerializeField] private GameObject loadingPanel;
    [SerializeField] private TextMeshProUGUI loadingText;
    
    // Educational elements
    [SerializeField] private GameObject tooltipPanel;
    [SerializeField] private TextMeshProUGUI tooltipText;
    [SerializeField] private TextMeshProUGUI burnInfoText;

    // Wager state
    private float currentWager = 1f;
    private bool isPlayingPoker = false;
    
    // References
    private PlayerData playerData;
    private WalletConnector walletConnector;
    private SolanaManager solanaManager;

    private void Start()
    {
        // Get references
        playerData = GameManager.Instance.PlayerData;
        solanaManager = SolanaManager.Instance;
        
        // Find UI managers
        walletConnector = FindObjectOfType<WalletConnector>();
        
        // Initialize UI
        InitializeUI();
        
        // Hide panels initially
        if (resultPanel != null)
        {
            resultPanel.SetActive(false);
        }
        
        if (loadingPanel != null)
        {
            loadingPanel.SetActive(false);
        }
        
        // Set tooltip text
        if (tooltipText != null)
        {
            tooltipText.text = "Risk Management: 50% win chance! 10% of your wager is burned from the token supply.";
        }
        
        // Set burn info text
        if (burnInfoText != null)
        {
            burnInfoText.text = "10% of all wagers are permanently burned, decreasing the total supply of $CATTLE tokens over time.";
        }
        
        // Update UI with current player data
        UpdateUI();
        
        // Subscribe to events
        if (playerData != null)
        {
            playerData.OnCattleBalanceChanged += UpdateCattleBalance;
        }
        
        if (solanaManager != null)
        {
            solanaManager.OnTransactionSuccess += OnTransactionSuccess;
            solanaManager.OnTransactionError += OnTransactionError;
        }
    }

    private void InitializeUI()
    {
        // Setup button listeners
        if (playPokerButton != null)
        {
            playPokerButton.onClick.AddListener(PlayPoker);
        }
        
        if (backToRanchButton != null)
        {
            backToRanchButton.onClick.AddListener(BackToRanch);
        }
        
        if (closeResultButton != null)
        {
            closeResultButton.onClick.AddListener(CloseResultPanel);
        }
        
        if (connectWalletButton != null)
        {
            connectWalletButton.onClick.AddListener(ShowWalletConnect);
        }
        
        // Setup slider
        if (wagerSlider != null)
        {
            wagerSlider.minValue = 1f;
            wagerSlider.maxValue = 50f;
            wagerSlider.value = 1f;
            wagerSlider.onValueChanged.AddListener(OnWagerChanged);
        }
        
        // Initialize wager text
        if (wagerValueText != null)
        {
            wagerValueText.text = $"Wager: {currentWager:F0} $CATTLE";
        }
    }

    private void Update()
    {
        // Update UI continuously
        UpdateUI();
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
        
        // Update slider settings
        UpdateWagerSlider();
        
        // Update button states
        UpdateButtonStates();
    }
    
    /// <summary>
    /// Update wager slider based on available balance
    /// </summary>
    private void UpdateWagerSlider()
    {
        if (wagerSlider == null || playerData == null) return;
        
        // Update max wager based on player balance, cap at 50
        float balance = playerData.GetCattleBalance();
        wagerSlider.maxValue = Mathf.Min(50f, balance);
        
        // Ensure current wager is not more than available balance
        if (currentWager > balance)
        {
            currentWager = Mathf.Max(1f, balance);
            wagerSlider.value = currentWager;
            if (wagerValueText != null)
            {
                wagerValueText.text = $"Wager: {currentWager:F0} $CATTLE";
            }
        }
    }
    
    /// <summary>
    /// Update button enabled states
    /// </summary>
    private void UpdateButtonStates()
    {
        if (playerData == null) return;
        
        // Disable play button if balance is too low or already playing
        if (playPokerButton != null)
        {
            bool canPlay = playerData.GetCattleBalance() >= 1f && !isPlayingPoker;
            playPokerButton.interactable = canPlay;
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
        
        // Update wager slider and button states
        UpdateWagerSlider();
        UpdateButtonStates();
    }

    /// <summary>
    /// Handle wager slider value changes
    /// </summary>
    private void OnWagerChanged(float newValue)
    {
        currentWager = Mathf.Floor(newValue); // Only allow whole numbers
        
        if (wagerValueText != null)
        {
            wagerValueText.text = $"Wager: {currentWager:F0} $CATTLE";
        }
        
        // Update burn info text
        if (burnInfoText != null)
        {
            float burnAmount = currentWager * 0.1f;
            burnInfoText.text = $"10% of wager ({burnAmount:F1} $CATTLE) will be permanently burned.";
        }
        
        // Play UI sound
        GameManager.Instance.SoundManager.PlaySliderSound();
    }

    /// <summary>
    /// Play the poker game with blockchain integration
    /// </summary>
    private async void PlayPoker()
    {
        if (playerData == null || currentWager <= 0) return;
        
        // Disable play button during game
        isPlayingPoker = true;
        if (playPokerButton != null)
        {
            playPokerButton.interactable = false;
        }
        
        // Show loading
        ShowLoading("Playing poker...");
        
        try
        {
            // Play the poker game
            float result = await playerData.PlayPoker(currentWager);
            
            // Hide loading
            HideLoading();
            
            // Display result
            if (result > 0)
            {
                // Win
                if (resultText != null)
                {
                    resultText.text = $"You won {result:F2} $CATTLE!";
                    resultText.color = Color.green;
                }
                
                GameManager.Instance.SoundManager.PlayWinSound();
                
                // Add educational element about winnings
                if (tooltipText != null)
                {
                    float burnAmount = currentWager * 0.1f;
                    float playableAmount = currentWager - burnAmount;
                    tooltipText.text = $"Risk Management: Your wager of {currentWager} $CATTLE had {burnAmount} burned. You won {result:F2} $CATTLE (2x of playable amount)!";
                }
            }
            else if (result < 0)
            {
                // Loss
                if (resultText != null)
                {
                    resultText.text = $"You lost {Mathf.Abs(result):F2} $CATTLE!";
                    resultText.color = Color.red;
                }
                
                GameManager.Instance.SoundManager.PlayLoseSound();
                
                // Add educational element about losses
                if (tooltipText != null)
                {
                    tooltipText.text = $"Risk Management: You lost your wager of {currentWager} $CATTLE. 10% was burned from the total supply, decreasing inflation.";
                }
            }
            else
            {
                // No game played (shouldn't happen if UI is working correctly)
                if (resultText != null)
                {
                    resultText.text = "Could not place wager.";
                    resultText.color = Color.yellow;
                }
                
                GameManager.Instance.SoundManager.PlayNegativeFeedback();
            }
            
            // Show result panel
            if (resultPanel != null)
            {
                resultPanel.SetActive(true);
            }
        }
        catch (System.Exception e)
        {
            // Error occurred
            Debug.LogError($"Error playing poker: {e.Message}");
            
            // Hide loading
            HideLoading();
            
            // Show error
            if (resultText != null)
            {
                resultText.text = "An error occurred while playing poker.";
                resultText.color = Color.red;
            }
            
            if (resultPanel != null)
            {
                resultPanel.SetActive(true);
            }
        }
        finally
        {
            // Re-enable play button
            isPlayingPoker = false;
            UpdateButtonStates();
        }
    }

    /// <summary>
    /// Handle successful blockchain transactions
    /// </summary>
    private void OnTransactionSuccess(string message)
    {
        // Update transaction hash text
        if (transactionHashText != null)
        {
            transactionHashText.text = message;
        }
        
        // Hide loading
        HideLoading();
    }
    
    /// <summary>
    /// Handle blockchain transaction errors
    /// </summary>
    private void OnTransactionError(string error)
    {
        // Show error
        if (resultText != null)
        {
            resultText.text = $"Transaction error: {error}";
            resultText.color = Color.red;
        }
        
        if (resultPanel != null)
        {
            resultPanel.SetActive(true);
        }
        
        // Hide loading
        HideLoading();
    }
    
    /// <summary>
    /// Show loading panel with message
    /// </summary>
    private void ShowLoading(string message)
    {
        if (loadingPanel == null) return;
        
        if (loadingText != null)
        {
            loadingText.text = message;
        }
        
        loadingPanel.SetActive(true);
    }
    
    /// <summary>
    /// Hide loading panel
    /// </summary>
    private void HideLoading()
    {
        if (loadingPanel != null)
        {
            loadingPanel.SetActive(false);
        }
    }

    /// <summary>
    /// Close the result panel
    /// </summary>
    private void CloseResultPanel()
    {
        // Play UI sound
        GameManager.Instance.SoundManager.PlayButtonClick();
        
        if (resultPanel != null)
        {
            resultPanel.SetActive(false);
        }
    }

    /// <summary>
    /// Navigate back to the ranch
    /// </summary>
    private void BackToRanch()
    {
        // Play UI sound
        GameManager.Instance.SoundManager.PlayButtonClick();
        
        // Go back to ranch scene
        GameManager.Instance.GoToRanch();
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
}
