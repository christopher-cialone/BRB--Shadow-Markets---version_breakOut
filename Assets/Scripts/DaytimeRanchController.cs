using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

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
    [SerializeField] private GameObject cattleListPanel;
    [SerializeField] private Transform cattleListContent;
    [SerializeField] private GameObject cattleListItemPrefab;
    [SerializeField] private Button showCattleListButton;
    [SerializeField] private Button closeCattleListButton;

    // Day indicator
    [SerializeField] private Image dayCycleIndicator;
    [SerializeField] private Sprite sunSprite;

    private void Start()
    {
        // Initialize UI and setup listeners
        InitializeUI();
        
        // Initially hide error panel and cattle list
        errorMessagePanel.SetActive(false);
        cattleListPanel.SetActive(false);
        
        // Update UI with current player data
        UpdateUI();
    }

    private void InitializeUI()
    {
        // Setup button listeners
        breedCattleButton.onClick.AddListener(BreedCattle);
        upgradeBarnButton.onClick.AddListener(UpgradeBarn);
        goToSaloonButton.onClick.AddListener(GoToSaloon);
        enterEtherRangeButton.onClick.AddListener(EnterEtherRange);
        closeErrorButton.onClick.AddListener(CloseErrorPanel);
        showCattleListButton.onClick.AddListener(ShowCattleList);
        closeCattleListButton.onClick.AddListener(CloseCattleList);
        
        // Set day indicator
        dayCycleIndicator.sprite = sunSprite;
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
        
        // Update resource display
        hayText.text = $"Hay: {playerData.Hay}/{playerData.BarnCapacity}";
        waterText.text = $"Water: {playerData.Water}/{playerData.BarnCapacity}";
        cattleBalanceText.text = $"$CATTLE: {playerData.CattleBalance:F2}";
        
        // Update cattle stats
        cattleStatsText.text = $"Total Cattle: {playerData.Cattle}";
    }

    private void BreedCattle()
    {
        // Try to breed cattle
        PlayerData playerData = GameManager.Instance.PlayerData;
        
        if (playerData.BreedCattle())
        {
            // Success - play sound effect
            GameManager.Instance.SoundManager.PlayPositiveFeedback();
            
            // Show the newly bred cattle's stats
            int lastIndex = playerData.CattleCollection.Count - 1;
            if (lastIndex >= 0)
            {
                Cattle newCattle = playerData.CattleCollection[lastIndex];
                ShowMessage($"New cattle bred! Cattle #{newCattle.Id}: Speed {newCattle.Speed}, Milk {newCattle.Milk}");
            }
        }
        else
        {
            // Failed - show error
            GameManager.Instance.SoundManager.PlayNegativeFeedback();
            ShowError("Not enough resources! Breeding requires 10 Hay and 10 Water.");
        }
    }

    private void UpgradeBarn()
    {
        // Try to upgrade barn
        PlayerData playerData = GameManager.Instance.PlayerData;
        
        if (playerData.UpgradeBarn())
        {
            // Success - play sound effect
            GameManager.Instance.SoundManager.PlayPositiveFeedback();
            ShowMessage("Barn upgraded! Capacity increased by 50.");
        }
        else
        {
            // Failed - show error
            GameManager.Instance.SoundManager.PlayNegativeFeedback();
            ShowError("Not enough $CATTLE! Upgrading costs 50 $CATTLE.");
        }
    }

    private void GoToSaloon()
    {
        // Play UI sound
        GameManager.Instance.SoundManager.PlayButtonClick();
        
        // Go to saloon scene
        GameManager.Instance.GoToSaloon();
    }

    private void EnterEtherRange()
    {
        // Play UI sound
        GameManager.Instance.SoundManager.PlayButtonClick();
        
        // Go to ether range scene
        GameManager.Instance.GoToEtherRange();
    }

    private void ShowError(string errorMessage)
    {
        errorMessageText.text = errorMessage;
        errorMessageText.color = Color.red;
        errorMessagePanel.SetActive(true);
    }

    private void ShowMessage(string message)
    {
        errorMessageText.text = message;
        errorMessageText.color = Color.green;
        errorMessagePanel.SetActive(true);
    }

    private void CloseErrorPanel()
    {
        // Play UI sound
        GameManager.Instance.SoundManager.PlayButtonClick();
        
        errorMessagePanel.SetActive(false);
    }

    private void ShowCattleList()
    {
        // Play UI sound
        GameManager.Instance.SoundManager.PlayButtonClick();
        
        // Clear existing items
        foreach (Transform child in cattleListContent)
        {
            Destroy(child.gameObject);
        }
        
        // Create list items for each cattle
        PlayerData playerData = GameManager.Instance.PlayerData;
        foreach (Cattle cattle in playerData.CattleCollection)
        {
            GameObject listItem = Instantiate(cattleListItemPrefab, cattleListContent);
            TextMeshProUGUI itemText = listItem.GetComponentInChildren<TextMeshProUGUI>();
            if (itemText != null)
            {
                itemText.text = $"Cattle #{cattle.Id}: Speed {cattle.Speed}, Milk {cattle.Milk}";
            }
        }
        
        cattleListPanel.SetActive(true);
    }

    private void CloseCattleList()
    {
        // Play UI sound
        GameManager.Instance.SoundManager.PlayButtonClick();
        
        cattleListPanel.SetActive(false);
    }
}
