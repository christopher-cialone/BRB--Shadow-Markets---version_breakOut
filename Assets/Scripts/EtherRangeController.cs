using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

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
    [SerializeField] private GameObject potionListPanel;
    [SerializeField] private Transform potionListContent;
    [SerializeField] private GameObject potionListItemPrefab;
    [SerializeField] private Button showPotionsButton;
    [SerializeField] private Button closePotionsButton;
    [SerializeField] private GameObject tooltipPanel;
    [SerializeField] private TextMeshProUGUI tooltipText;

    // Night indicator
    [SerializeField] private Image dayCycleIndicator;
    [SerializeField] private Sprite moonSprite;

    private int selectedPotionIndex = -1;

    private void Start()
    {
        // Initialize UI and setup listeners
        InitializeUI();
        
        // Initially hide error panel and potion list
        errorMessagePanel.SetActive(false);
        potionListPanel.SetActive(false);
        
        // Set tooltip text
        tooltipText.text = "Supply/Demand: Potion prices vary between 25-35 $CATTLE!";
        
        // Update UI with current player data
        UpdateUI();
    }

    private void InitializeUI()
    {
        // Setup button listeners
        craftPotionButton.onClick.AddListener(CraftShadowPotion);
        sellPotionButton.onClick.AddListener(SellSelectedPotion);
        backToRanchButton.onClick.AddListener(BackToRanch);
        closeErrorButton.onClick.AddListener(CloseErrorPanel);
        showPotionsButton.onClick.AddListener(ShowPotionList);
        closePotionsButton.onClick.AddListener(ClosePotionList);
        
        // Initially disable sell button until a potion is selected
        sellPotionButton.interactable = false;
        
        // Set night indicator
        dayCycleIndicator.sprite = moonSprite;
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
        
        // Update craft button interactability
        craftPotionButton.interactable = playerData.CattleBalance >= 20f;
        
        // Update sell button interactability
        sellPotionButton.interactable = selectedPotionIndex >= 0 && 
                                         selectedPotionIndex < playerData.PotionCollection.Count;
    }

    private void CraftShadowPotion()
    {
        // Try to craft a shadow potion
        PlayerData playerData = GameManager.Instance.PlayerData;
        
        if (playerData.CraftShadowPotion())
        {
            // Success - play sound effect
            GameManager.Instance.SoundManager.PlayPositiveFeedback();
            
            // Show the newly crafted potion's stats
            int lastIndex = playerData.PotionCollection.Count - 1;
            if (lastIndex >= 0)
            {
                ShadowPotion newPotion = playerData.PotionCollection[lastIndex];
                ShowMessage($"New shadow potion crafted! Potion #{newPotion.Id}: Potency {newPotion.Potency}");
                
                // Show potion list
                ShowPotionList();
            }
        }
        else
        {
            // Failed - show error
            GameManager.Instance.SoundManager.PlayNegativeFeedback();
            ShowError("Not enough $CATTLE! Crafting requires 20 $CATTLE.");
        }
    }

    private void SellSelectedPotion()
    {
        // Try to sell the selected potion
        PlayerData playerData = GameManager.Instance.PlayerData;
        
        if (selectedPotionIndex >= 0 && selectedPotionIndex < playerData.PotionCollection.Count)
        {
            // Remember the potion index and potency before selling
            int potionId = playerData.PotionCollection[selectedPotionIndex].Id;
            
            // Attempt to sell the potion
            if (playerData.SellShadowPotion(selectedPotionIndex))
            {
                // Success - play sound effect
                GameManager.Instance.SoundManager.PlayCoinsSound();
                
                // Show success message
                ShowMessage($"Potion #{potionId} sold successfully!");
                
                // Reset selected potion and refresh list
                selectedPotionIndex = -1;
                ShowPotionList();
            }
        }
        else
        {
            // No potion selected - show error
            GameManager.Instance.SoundManager.PlayNegativeFeedback();
            ShowError("No potion selected!");
        }
    }

    private void BackToRanch()
    {
        // Play UI sound
        GameManager.Instance.SoundManager.PlayButtonClick();
        
        // Go back to ranch scene
        GameManager.Instance.GoToRanch();
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

    private void ShowPotionList()
    {
        // Play UI sound
        GameManager.Instance.SoundManager.PlayButtonClick();
        
        // Clear existing items
        foreach (Transform child in potionListContent)
        {
            Destroy(child.gameObject);
        }
        
        // Create list items for each potion
        PlayerData playerData = GameManager.Instance.PlayerData;
        for (int i = 0; i < playerData.PotionCollection.Count; i++)
        {
            ShadowPotion potion = playerData.PotionCollection[i];
            GameObject listItem = Instantiate(potionListItemPrefab, potionListContent);
            
            // Setup text
            TextMeshProUGUI itemText = listItem.GetComponentInChildren<TextMeshProUGUI>();
            if (itemText != null)
            {
                itemText.text = $"Potion #{potion.Id}: Potency {potion.Potency}";
            }
            
            // Setup selection
            int index = i; // Capture the index for the closure
            Button itemButton = listItem.GetComponent<Button>();
            if (itemButton != null)
            {
                itemButton.onClick.AddListener(() => SelectPotion(index));
            }
            
            // Highlight the selected potion
            if (i == selectedPotionIndex)
            {
                itemButton.GetComponent<Image>().color = Color.yellow;
            }
        }
        
        potionListPanel.SetActive(true);
    }

    private void SelectPotion(int index)
    {
        // Play UI sound
        GameManager.Instance.SoundManager.PlayButtonClick();
        
        selectedPotionIndex = index;
        
        // Refresh the list to update highlighting
        ShowPotionList();
        
        // Enable sell button
        sellPotionButton.interactable = true;
    }

    private void ClosePotionList()
    {
        // Play UI sound
        GameManager.Instance.SoundManager.PlayButtonClick();
        
        potionListPanel.SetActive(false);
    }
}
