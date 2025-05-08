using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class CharacterSelection : MonoBehaviour
{
    [SerializeField] private GameObject entrepreneurSprite;
    [SerializeField] private GameObject adventurerSprite;
    [SerializeField] private TextMeshProUGUI bonusText;
    
    private PlayerData.Archetype currentArchetype = PlayerData.Archetype.None;

    private void Start()
    {
        // Hide all character sprites initially
        entrepreneurSprite.SetActive(false);
        adventurerSprite.SetActive(false);
        
        bonusText.text = "Select an archetype to see bonus";
    }

    public void SelectEntrepreneur()
    {
        currentArchetype = PlayerData.Archetype.Entrepreneur;
        UpdateCharacterDisplay();
        
        // Update bonus text
        bonusText.text = "Bonus: +10% $CATTLE earning rate";
    }

    public void SelectAdventurer()
    {
        currentArchetype = PlayerData.Archetype.Adventurer;
        UpdateCharacterDisplay();
        
        // Update bonus text
        bonusText.text = "Bonus: +10% heist success rate";
    }

    private void UpdateCharacterDisplay()
    {
        // Show the selected character sprite and hide the other
        entrepreneurSprite.SetActive(currentArchetype == PlayerData.Archetype.Entrepreneur);
        adventurerSprite.SetActive(currentArchetype == PlayerData.Archetype.Adventurer);
        
        // Play UI sound
        GameManager.Instance.SoundManager.PlayButtonClick();
    }

    public PlayerData.Archetype GetSelectedArchetype()
    {
        return currentArchetype;
    }
}
