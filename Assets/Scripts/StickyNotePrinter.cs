using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class StickyNotePrinter : MonoBehaviour
{
    [SerializeField] private GameObject printPanel;
    [SerializeField] private GameObject previewPanel;
    [SerializeField] private TextMeshProUGUI previewText;
    [SerializeField] private Button printButton;
    [SerializeField] private Button closePrintButton;
    [SerializeField] private Button printNowButton;
    [SerializeField] private GameObject printingAnimation;
    [SerializeField] private TextMeshProUGUI printingStatusText;
    [SerializeField] private GameObject templateSelectionPanel;
    [SerializeField] private Button toDoTemplateButton;
    [SerializeField] private Button tipTemplateButton;
    
    private string[] financialTips = new string[]
    {
        "Tip: Balance Hay/Water to avoid shortages!",
        "Tip: Invest wisely in barn upgrades for long-term growth!",
        "Tip: Diversify your income streams beyond cattle breeding!",
        "Tip: Remember that gambling has risks - only wager what you can afford to lose!",
        "Tip: Monitor market prices for the best time to sell shadow potions!",
        "Tip: Keep emergency funds for unexpected opportunities!",
        "Tip: Compare potential returns before investing your $CATTLE!",
        "Tip: Time management is key - use day and night cycles effectively!"
    };
    
    private enum NoteTemplate { ToDo, Tip }
    private NoteTemplate selectedTemplate = NoteTemplate.Tip;

    private void Start()
    {
        // Initialize UI elements
        InitializeUI();
        
        // Hide panels initially
        printPanel.SetActive(false);
        previewPanel.SetActive(false);
        printingAnimation.SetActive(false);
        templateSelectionPanel.SetActive(false);
    }

    private void InitializeUI()
    {
        // Setup button listeners
        printButton.onClick.AddListener(OpenPrintPanel);
        closePrintButton.onClick.AddListener(ClosePrintPanel);
        printNowButton.onClick.AddListener(PrintNote);
        toDoTemplateButton.onClick.AddListener(() => SelectTemplate(NoteTemplate.ToDo));
        tipTemplateButton.onClick.AddListener(() => SelectTemplate(NoteTemplate.Tip));
    }

    private void OpenPrintPanel()
    {
        // Play UI sound
        GameManager.Instance.SoundManager.PlayButtonClick();
        
        // Show template selection panel
        templateSelectionPanel.SetActive(true);
        
        // Show print panel
        printPanel.SetActive(true);
    }

    private void ClosePrintPanel()
    {
        // Play UI sound
        GameManager.Instance.SoundManager.PlayButtonClick();
        
        // Hide all panels
        printPanel.SetActive(false);
        previewPanel.SetActive(false);
        printingAnimation.SetActive(false);
        templateSelectionPanel.SetActive(false);
    }

    private void SelectTemplate(NoteTemplate template)
    {
        // Play UI sound
        GameManager.Instance.SoundManager.PlayButtonClick();
        
        selectedTemplate = template;
        
        // Hide template selection and show preview
        templateSelectionPanel.SetActive(false);
        
        // Generate preview based on selected template
        GeneratePreview();
        
        // Show preview
        previewPanel.SetActive(true);
    }

    private void GeneratePreview()
    {
        // Get player data
        PlayerData playerData = GameManager.Instance.PlayerData;
        
        // Generate different preview text based on template
        string preview = "";
        
        switch (selectedTemplate)
        {
            case NoteTemplate.ToDo:
                preview = "TO-DO LIST:\n\n" +
                          "□ Breed more cattle\n" +
                          "□ Upgrade barn\n" +
                          "□ Visit saloon\n" +
                          "□ Craft potions\n\n" +
                          $"Current $CATTLE: {playerData.CattleBalance:F2}\n" +
                          $"Cattle owned: {playerData.Cattle}";
                break;
            
            case NoteTemplate.Tip:
                // Select a random financial tip
                string randomTip = financialTips[Random.Range(0, financialTips.Length)];
                
                preview = "FINANCIAL TIP:\n\n" +
                          $"{randomTip}\n\n" +
                          $"Current $CATTLE: {playerData.CattleBalance:F2}\n" +
                          $"Hay: {playerData.Hay}/{playerData.BarnCapacity}\n" +
                          $"Water: {playerData.Water}/{playerData.BarnCapacity}";
                break;
        }
        
        // Set preview text
        previewText.text = preview;
    }

    private void PrintNote()
    {
        // Play UI sound
        GameManager.Instance.SoundManager.PlayButtonClick();
        
        // Hide preview
        previewPanel.SetActive(false);
        
        // Show printing animation
        printingAnimation.SetActive(true);
        printingStatusText.text = "Printing...";
        
        // Simulate printing process
        StartCoroutine(SimulatePrinting());
    }

    private IEnumerator SimulatePrinting()
    {
        // Wait for 3 seconds
        yield return new WaitForSeconds(3f);
        
        // Update status
        printingStatusText.text = "Note printed! Use with a nemonic-inspired printer.";
        
        // Play success sound
        GameManager.Instance.SoundManager.PlayPositiveFeedback();
        
        // Wait for 2 more seconds before closing
        yield return new WaitForSeconds(2f);
        
        // Close panel
        ClosePrintPanel();
    }

    // Show print button in UI
    public void ShowPrintButton()
    {
        printButton.gameObject.SetActive(true);
    }

    // Hide print button in UI
    public void HidePrintButton()
    {
        printButton.gameObject.SetActive(false);
    }
}
