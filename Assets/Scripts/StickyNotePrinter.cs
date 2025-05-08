using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System.IO;
using System.Threading.Tasks;

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
    [SerializeField] private Button blockchainTipButton;
    [SerializeField] private RawImage previewImage;
    [SerializeField] private Button shareButton;
    
    // NFT data for notes
    [SerializeField] private Toggle mintAsNFTToggle;
    [SerializeField] private TextMeshProUGUI nftInfoText;
    
    // References
    private PlayerData playerData;
    private SolanaManager solanaManager;
    private MPL404Manager mpl404Manager;
    
    // Financial tips - both traditional and blockchain-focused
    private string[] financialTips = new string[]
    {
        "Tip: Balance Hay/Water to avoid shortages, just like balancing a household budget!",
        "Tip: Invest wisely in barn upgrades for long-term growth, similar to infrastructure investments!",
        "Tip: Diversify your income streams beyond cattle breeding to reduce risk exposure!",
        "Tip: Remember that gambling has risks - only wager what you can afford to lose!",
        "Tip: Monitor market prices for the best time to sell shadow potions, just like real markets!",
        "Tip: Keep emergency funds for unexpected opportunities or market downturns!",
        "Tip: Compare potential returns before investing your $CATTLE to maximize profits!",
        "Tip: Time management is key - use day and night cycles effectively, just like work-life balance!"
    };
    
    private string[] blockchainTips = new string[]
    {
        "Crypto Tip: Token burning (like in poker) reduces supply, potentially increasing value of remaining tokens.",
        "Crypto Tip: NFTs (Non-Fungible Tokens) like your cattle have unique properties that can affect their value.",
        "Crypto Tip: The MPL-404 standard allows seamless conversion between NFTs and fungible tokens.",
        "Crypto Tip: Market volatility affects prices - timing your sales during high market periods maximizes returns.",
        "Crypto Tip: Smart contracts (like our poker game) execute automatically when conditions are met.",
        "Crypto Tip: Token economics is all about supply, demand, and utility - $CATTLE has all three!",
        "Crypto Tip: Blockchain provides transparency in transactions, reducing fraud and building trust.",
        "Crypto Tip: Deflationary tokens (like $CATTLE with burns) can increase in value as supply decreases."
    };
    
    private enum NoteTemplate { ToDo, Tip, BlockchainTip }
    private NoteTemplate selectedTemplate = NoteTemplate.Tip;
    
    // State
    private bool isPrinting = false;
    private bool isMintingNFT = false;

    private void Start()
    {
        // Get references
        playerData = GameManager.Instance.PlayerData;
        solanaManager = SolanaManager.Instance;
        mpl404Manager = MPL404Manager.Instance;
        
        // Initialize UI elements
        InitializeUI();
        
        // Hide panels initially
        if (printPanel != null) printPanel.SetActive(false);
        if (previewPanel != null) previewPanel.SetActive(false);
        if (printingAnimation != null) printingAnimation.SetActive(false);
        if (templateSelectionPanel != null) templateSelectionPanel.SetActive(false);
    }

    private void InitializeUI()
    {
        // Setup button listeners
        if (printButton != null) printButton.onClick.AddListener(OpenPrintPanel);
        if (closePrintButton != null) closePrintButton.onClick.AddListener(ClosePrintPanel);
        if (printNowButton != null) printNowButton.onClick.AddListener(PrintNote);
        if (toDoTemplateButton != null) toDoTemplateButton.onClick.AddListener(() => SelectTemplate(NoteTemplate.ToDo));
        if (tipTemplateButton != null) tipTemplateButton.onClick.AddListener(() => SelectTemplate(NoteTemplate.Tip));
        if (blockchainTipButton != null) blockchainTipButton.onClick.AddListener(() => SelectTemplate(NoteTemplate.BlockchainTip));
        if (shareButton != null) shareButton.onClick.AddListener(ShareNote);
        
        // Setup NFT mint toggle
        if (mintAsNFTToggle != null)
        {
            mintAsNFTToggle.onValueChanged.AddListener(OnMintToggleChanged);
            mintAsNFTToggle.isOn = false;
        }
        
        // Set NFT info text
        if (nftInfoText != null)
        {
            nftInfoText.text = "Mint this note as an NFT (costs 5 $CATTLE)";
        }
    }

    /// <summary>
    /// Open the print panel
    /// </summary>
    private void OpenPrintPanel()
    {
        // Play UI sound
        GameManager.Instance.SoundManager.PlayButtonClick();
        
        // Show template selection panel
        if (templateSelectionPanel != null)
        {
            templateSelectionPanel.SetActive(true);
        }
        
        // Show print panel
        if (printPanel != null)
        {
            printPanel.SetActive(true);
        }
        
        // Check if wallet is connected
        if (solanaManager != null && mintAsNFTToggle != null)
        {
            mintAsNFTToggle.interactable = solanaManager.IsWalletConnected;
            
            if (!solanaManager.IsWalletConnected && nftInfoText != null)
            {
                nftInfoText.text = "Connect wallet to mint as NFT";
            }
        }
    }

    /// <summary>
    /// Close the print panel
    /// </summary>
    private void ClosePrintPanel()
    {
        // Play UI sound
        GameManager.Instance.SoundManager.PlayButtonClick();
        
        // Hide all panels
        if (printPanel != null) printPanel.SetActive(false);
        if (previewPanel != null) previewPanel.SetActive(false);
        if (printingAnimation != null) printingAnimation.SetActive(false);
        if (templateSelectionPanel != null) templateSelectionPanel.SetActive(false);
    }

    /// <summary>
    /// Select a note template
    /// </summary>
    private void SelectTemplate(NoteTemplate template)
    {
        // Play UI sound
        GameManager.Instance.SoundManager.PlayButtonClick();
        
        selectedTemplate = template;
        
        // Hide template selection and show preview
        if (templateSelectionPanel != null)
        {
            templateSelectionPanel.SetActive(false);
        }
        
        // Generate preview based on selected template
        GeneratePreview();
        
        // Show preview
        if (previewPanel != null)
        {
            previewPanel.SetActive(true);
        }
    }

    /// <summary>
    /// Generate preview text based on selected template
    /// </summary>
    private void GeneratePreview()
    {
        if (playerData == null || previewText == null) return;
        
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
                          $"Current $CATTLE: {playerData.GetCattleBalance():F2}\n" +
                          $"Cattle owned: {playerData.Cattle}";
                break;
            
            case NoteTemplate.Tip:
                // Select a random financial tip
                string randomTip = financialTips[Random.Range(0, financialTips.Length)];
                
                preview = "FINANCIAL TIP:\n\n" +
                          $"{randomTip}\n\n" +
                          $"Current $CATTLE: {playerData.GetCattleBalance():F2}\n" +
                          $"Hay: {playerData.Hay}/{playerData.BarnCapacity}\n" +
                          $"Water: {playerData.Water}/{playerData.BarnCapacity}";
                break;
                
            case NoteTemplate.BlockchainTip:
                // Select a random blockchain tip
                string randomBlockchainTip = blockchainTips[Random.Range(0, blockchainTips.Length)];
                
                preview = "BLOCKCHAIN TIP:\n\n" +
                          $"{randomBlockchainTip}\n\n" +
                          $"Current $CATTLE: {playerData.GetCattleBalance():F2}\n" +
                          $"Wallet: {(solanaManager != null ? solanaManager.WalletAddress : "Not connected")}\n" +
                          $"NFTs: {(playerData != null ? playerData.GetCattleNFTs().Count + playerData.GetPotionNFTs().Count : 0)}";
                break;
        }
        
        // Set preview text
        previewText.text = preview;
        
        // Generate preview image
        GeneratePreviewImage(preview);
    }
    
    /// <summary>
    /// Generate preview image from text
    /// </summary>
    private void GeneratePreviewImage(string text)
    {
        if (previewImage == null) return;
        
        // For MVP, we'll use a basic texture with the text
        // In a real implementation, this would generate a styled image
        
        // Create a texture for the note
        Texture2D texture = new Texture2D(512, 512, TextureFormat.RGBA32, false);
        
        // Fill with note background color (yellow)
        Color backgroundColor = new Color(1.0f, 0.95f, 0.7f);
        Color textColor = new Color(0.1f, 0.1f, 0.1f);
        
        // Fill background
        for (int y = 0; y < texture.height; y++)
        {
            for (int x = 0; x < texture.width; x++)
            {
                // Add some noise to make it look like paper
                float noise = Random.Range(0.95f, 1.0f);
                Color pixelColor = backgroundColor * noise;
                
                // Add subtle lines for ruled paper effect
                if (y % 32 == 0 && y > 64)
                {
                    pixelColor = new Color(0.8f, 0.8f, 0.6f);
                }
                
                texture.SetPixel(x, y, pixelColor);
            }
        }
        
        // Apply changes
        texture.Apply();
        
        // Set the texture to the image
        previewImage.texture = texture;
        
        // In a real implementation, we would render the text onto the texture
        // For MVP, we'll rely on the separate text component
    }

    /// <summary>
    /// Handle NFT mint toggle changed
    /// </summary>
    private void OnMintToggleChanged(bool isOn)
    {
        // Update NFT info text
        if (nftInfoText != null)
        {
            if (isOn)
            {
                nftInfoText.text = "This note will be minted as an NFT (costs 5 $CATTLE)";
            }
            else
            {
                nftInfoText.text = "Mint this note as an NFT (costs 5 $CATTLE)";
            }
        }
    }

    /// <summary>
    /// Print the note and optionally mint as NFT
    /// </summary>
    private async void PrintNote()
    {
        if (isPrinting) return;
        
        // Play UI sound
        GameManager.Instance.SoundManager.PlayButtonClick();
        
        // Set printing flag
        isPrinting = true;
        
        // Hide preview
        if (previewPanel != null)
        {
            previewPanel.SetActive(false);
        }
        
        // Show printing animation
        if (printingAnimation != null)
        {
            printingAnimation.SetActive(true);
        }
        
        if (printingStatusText != null)
        {
            printingStatusText.text = "Printing...";
        }
        
        // Check if we should mint as NFT
        bool mintAsNFT = mintAsNFTToggle != null && mintAsNFTToggle.isOn;
        
        if (mintAsNFT)
        {
            // Mint note as NFT
            await MintNoteAsNFT();
        }
        
        // Simulate printing process
        StartCoroutine(SimulatePrinting(mintAsNFT));
    }

    /// <summary>
    /// Mint the note as an NFT on the blockchain
    /// </summary>
    private async Task MintNoteAsNFT()
    {
        if (solanaManager == null || !solanaManager.IsWalletConnected) return;
        
        if (printingStatusText != null)
        {
            printingStatusText.text = "Minting as NFT...";
        }
        
        // Create attributes based on template
        Dictionary<string, int> attributes = new Dictionary<string, int>();
        
        switch (selectedTemplate)
        {
            case NoteTemplate.ToDo:
                attributes.Add("Type", 1); // 1 = ToDo
                attributes.Add("Items", 4); // 4 todo items
                break;
                
            case NoteTemplate.Tip:
                attributes.Add("Type", 2); // 2 = Financial Tip
                attributes.Add("Wisdom", Random.Range(1, 10)); // Random wisdom value
                break;
                
            case NoteTemplate.BlockchainTip:
                attributes.Add("Type", 3); // 3 = Blockchain Tip
                attributes.Add("Crypto", Random.Range(1, 10)); // Random crypto knowledge value
                break;
        }
        
        try
        {
            // Check if player has enough CATTLE
            float balance = await solanaManager.GetCattleBalance();
            
            if (balance < 5f)
            {
                if (printingStatusText != null)
                {
                    printingStatusText.text = "Not enough $CATTLE to mint NFT!";
                }
                
                return;
            }
            
            // Burn CATTLE for minting
            await solanaManager.BurnCattleTokens(5f, "Note NFT minting");
            
            // Mint the NFT
            string noteName = $"Note #{Random.Range(1000, 9999)}";
            string description = previewText != null ? previewText.text : "A sticky note from Bull Run Boost";
            
            await solanaManager.MintNFT(noteName, description, attributes);
            
            if (printingStatusText != null)
            {
                printingStatusText.text = "NFT minted successfully!";
            }
        }
        catch (System.Exception e)
        {
            Debug.LogError($"Error minting note as NFT: {e.Message}");
            
            if (printingStatusText != null)
            {
                printingStatusText.text = "Failed to mint NFT!";
            }
        }
    }

    /// <summary>
    /// Simulate the printing process
    /// </summary>
    private IEnumerator SimulatePrinting(bool mintedAsNFT)
    {
        // Wait for 3 seconds
        yield return new WaitForSeconds(3f);
        
        // Update status
        if (printingStatusText != null)
        {
            string message = "Note printed! Use with a nemonic-inspired printer.";
            
            if (mintedAsNFT)
            {
                message += " Also minted as an NFT in your wallet!";
            }
            
            printingStatusText.text = message;
        }
        
        // Play success sound
        GameManager.Instance.SoundManager.PlayPositiveFeedback();
        
        // Wait for 2 more seconds before closing
        yield return new WaitForSeconds(2f);
        
        // Reset flags
        isPrinting = false;
        
        // Close panel
        ClosePrintPanel();
    }
    
    /// <summary>
    /// Share the note (export/save)
    /// </summary>
    private void ShareNote()
    {
        // Play UI sound
        GameManager.Instance.SoundManager.PlayButtonClick();
        
        // In a real implementation, this would save the note to disk or share via social media
        // For MVP, we'll just show a message
        
        if (printingStatusText != null)
        {
            printingStatusText.text = "Note shared! (This would save to disk or share on social media)";
        }
        
        if (printingAnimation != null)
        {
            printingAnimation.SetActive(true);
        }
        
        if (previewPanel != null)
        {
            previewPanel.SetActive(false);
        }
        
        // Hide share message after a few seconds
        StartCoroutine(HideShareMessage());
    }
    
    /// <summary>
    /// Hide share message after delay
    /// </summary>
    private IEnumerator HideShareMessage()
    {
        yield return new WaitForSeconds(3f);
        
        if (printingAnimation != null)
        {
            printingAnimation.SetActive(false);
        }
        
        ClosePrintPanel();
    }

    // Show print button in UI
    public void ShowPrintButton()
    {
        if (printButton != null)
        {
            printButton.gameObject.SetActive(true);
        }
    }

    // Hide print button in UI
    public void HidePrintButton()
    {
        if (printButton != null)
        {
            printButton.gameObject.SetActive(false);
        }
    }
}
