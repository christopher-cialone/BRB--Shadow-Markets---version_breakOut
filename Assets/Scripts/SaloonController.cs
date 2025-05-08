using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

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
    [SerializeField] private GameObject tooltipPanel;
    [SerializeField] private TextMeshProUGUI tooltipText;

    private float currentWager = 1f;

    private void Start()
    {
        // Initialize UI
        InitializeUI();
        
        // Hide result panel initially
        resultPanel.SetActive(false);
        
        // Set tooltip text
        tooltipText.text = "Risk Management: 50% win chance! 10% is burned.";
        
        // Update UI with current player data
        UpdateUI();
    }

    private void InitializeUI()
    {
        // Setup button listeners
        playPokerButton.onClick.AddListener(PlayPoker);
        backToRanchButton.onClick.AddListener(BackToRanch);
        closeResultButton.onClick.AddListener(CloseResultPanel);
        
        // Setup slider
        wagerSlider.minValue = 1f;
        wagerSlider.maxValue = 50f;
        wagerSlider.value = 1f;
        wagerSlider.onValueChanged.AddListener(OnWagerChanged);
        
        // Initialize wager text
        wagerValueText.text = $"Wager: {currentWager:F0} $CATTLE";
    }

    private void Update()
    {
        // Continuously update UI to reflect current player data
        UpdateUI();
    }

    private void UpdateUI()
    {
        // Get player data
        PlayerData playerData = GameManager.Instance.PlayerData;
        
        // Update balance display
        cattleBalanceText.text = $"$CATTLE: {playerData.CattleBalance:F2}";
        
        // Update max wager based on player balance
        wagerSlider.maxValue = Mathf.Min(50f, playerData.CattleBalance);
        
        // Ensure current wager is not more than available balance
        if (currentWager > playerData.CattleBalance)
        {
            currentWager = playerData.CattleBalance;
            wagerSlider.value = currentWager;
            wagerValueText.text = $"Wager: {currentWager:F0} $CATTLE";
        }
        
        // Disable play button if balance is too low
        playPokerButton.interactable = playerData.CattleBalance >= 1f;
    }

    private void OnWagerChanged(float newValue)
    {
        currentWager = Mathf.Floor(newValue); // Only allow whole numbers
        wagerValueText.text = $"Wager: {currentWager:F0} $CATTLE";
        
        // Play UI sound
        GameManager.Instance.SoundManager.PlaySliderSound();
    }

    private void PlayPoker()
    {
        // Play the poker game
        PlayerData playerData = GameManager.Instance.PlayerData;
        float result = playerData.PlayPoker(currentWager);
        
        // Display result
        if (result > 0)
        {
            // Win
            resultText.text = $"You won {result:F2} $CATTLE!";
            resultText.color = Color.green;
            GameManager.Instance.SoundManager.PlayWinSound();
        }
        else if (result < 0)
        {
            // Loss
            resultText.text = $"You lost {Mathf.Abs(result):F2} $CATTLE!";
            resultText.color = Color.red;
            GameManager.Instance.SoundManager.PlayLoseSound();
        }
        else
        {
            // No game played (shouldn't happen if UI is working correctly)
            resultText.text = "Could not place wager.";
            resultText.color = Color.yellow;
            GameManager.Instance.SoundManager.PlayNegativeFeedback();
        }
        
        // Show result panel
        resultPanel.SetActive(true);
        
        // Update UI
        UpdateUI();
    }

    private void CloseResultPanel()
    {
        // Play UI sound
        GameManager.Instance.SoundManager.PlayButtonClick();
        
        resultPanel.SetActive(false);
    }

    private void BackToRanch()
    {
        // Play UI sound
        GameManager.Instance.SoundManager.PlayButtonClick();
        
        // Go back to ranch scene
        GameManager.Instance.GoToRanch();
    }
}
