using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class MainMenuController : MonoBehaviour
{
    // References to UI elements
    [SerializeField] private Button startGameButton;
    [SerializeField] private TMP_InputField playerNameInput;
    [SerializeField] private GameObject characterSelectionPanel;
    [SerializeField] private Button entrepreneurButton;
    [SerializeField] private Button adventurerButton;
    [SerializeField] private TextMeshProUGUI archetypeDescriptionText;
    [SerializeField] private TextMeshProUGUI statsText;
    
    // State tracking
    private PlayerData.Archetype selectedArchetype = PlayerData.Archetype.None;
    private string playerName = "Cowboy";

    private void Start()
    {
        // Setup button listeners
        startGameButton.onClick.AddListener(StartGame);
        entrepreneurButton.onClick.AddListener(() => SelectArchetype(PlayerData.Archetype.Entrepreneur));
        adventurerButton.onClick.AddListener(() => SelectArchetype(PlayerData.Archetype.Adventurer));
        
        // Set start button to disabled until an archetype is selected
        startGameButton.interactable = false;
        
        // Setup input field
        playerNameInput.onValueChanged.AddListener(OnPlayerNameChanged);
        
        // Update UI
        UpdateUI();
    }

    private void OnPlayerNameChanged(string newName)
    {
        playerName = newName;
        UpdateUI();
    }

    private void SelectArchetype(PlayerData.Archetype archetype)
    {
        selectedArchetype = archetype;
        
        // Enable start button now that an archetype is selected
        startGameButton.interactable = true;
        
        // Update UI to show archetype description and bonuses
        UpdateUI();
        
        // Play UI sound
        GameManager.Instance.SoundManager.PlayButtonClick();
    }

    private void UpdateUI()
    {
        // Update archetype description based on selection
        switch (selectedArchetype)
        {
            case PlayerData.Archetype.Entrepreneur:
                archetypeDescriptionText.text = "Entrepreneur: +10% $CATTLE earning rate";
                entrepreneurButton.GetComponent<Image>().color = Color.yellow; // Highlight selected
                adventurerButton.GetComponent<Image>().color = Color.white;
                break;
            case PlayerData.Archetype.Adventurer:
                archetypeDescriptionText.text = "Adventurer: +10% heist success rate";
                entrepreneurButton.GetComponent<Image>().color = Color.white;
                adventurerButton.GetComponent<Image>().color = Color.yellow; // Highlight selected
                break;
            default:
                archetypeDescriptionText.text = "Select an archetype";
                entrepreneurButton.GetComponent<Image>().color = Color.white;
                adventurerButton.GetComponent<Image>().color = Color.white;
                break;
        }
        
        // Update stats text
        statsText.text = $"Name: {playerName}\n" +
                         $"Archetype: {selectedArchetype}\n" +
                         $"Starting $CATTLE: 100";
    }

    private void StartGame()
    {
        if (selectedArchetype != PlayerData.Archetype.None)
        {
            // Initialize player data with selected options
            GameManager.Instance.PlayerData.InitializePlayer(playerName, selectedArchetype);
            
            // Go to daytime ranch scene
            GameManager.Instance.GoToRanch();
            
            // Play UI sound
            GameManager.Instance.SoundManager.PlayButtonClick();
        }
    }
}
