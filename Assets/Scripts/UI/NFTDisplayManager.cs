using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

/// <summary>
/// Manages the display of NFTs in the UI
/// </summary>
public class NFTDisplayManager : MonoBehaviour
{
    [SerializeField] private GameObject nftListPanel;
    [SerializeField] private Transform nftListContent;
    [SerializeField] private GameObject nftItemPrefab;
    [SerializeField] private GameObject nftDetailPanel;
    [SerializeField] private Button closeListButton;
    [SerializeField] private Button closeDetailButton;
    [SerializeField] private TextMeshProUGUI detailTitleText;
    [SerializeField] private TextMeshProUGUI detailDescriptionText;
    [SerializeField] private TextMeshProUGUI detailAttributesText;
    [SerializeField] private Image detailImage;
    [SerializeField] private Button convertButton;
    [SerializeField] private Button moreInfoButton;
    
    // Display settings
    [SerializeField] private Color cattleColor = new Color(0.8f, 0.6f, 0.2f);
    [SerializeField] private Color potionColor = new Color(0.5f, 0.2f, 0.8f);
    
    // Current selection
    private NFTItem selectedNFT;
    
    // References
    private SolanaManager solanaManager;
    private MPL404Manager mpl404Manager;
    private PlayerData playerData;
    
    private Dictionary<string, GameObject> nftItemInstances = new Dictionary<string, GameObject>();
    
    private void Start()
    {
        // Get references
        solanaManager = SolanaManager.Instance;
        mpl404Manager = MPL404Manager.Instance;
        playerData = GameManager.Instance.PlayerData;
        
        // Setup listeners
        SetupListeners();
        
        // Initially hide panels
        if (nftListPanel != null)
        {
            nftListPanel.SetActive(false);
        }
        
        if (nftDetailPanel != null)
        {
            nftDetailPanel.SetActive(false);
        }
        
        // Subscribe to NFT events
        if (solanaManager != null)
        {
            solanaManager.OnNFTMinted += HandleNFTMinted;
        }
        
        // Subscribe to player data changes
        if (playerData != null)
        {
            playerData.OnResourcesChanged += RefreshNFTList;
        }
    }
    
    private void SetupListeners()
    {
        if (closeListButton != null)
        {
            closeListButton.onClick.AddListener(CloseNFTList);
        }
        
        if (closeDetailButton != null)
        {
            closeDetailButton.onClick.AddListener(CloseNFTDetail);
        }
        
        if (convertButton != null)
        {
            convertButton.onClick.AddListener(ConvertSelectedNFT);
        }
        
        if (moreInfoButton != null)
        {
            moreInfoButton.onClick.AddListener(ShowMoreInfo);
        }
    }
    
    /// <summary>
    /// Show the NFT list panel with all player NFTs
    /// </summary>
    public void ShowNFTList(string filter = "")
    {
        if (nftListPanel == null) return;
        
        // Show the panel
        nftListPanel.SetActive(true);
        
        // Refresh the list
        RefreshNFTList(filter);
    }
    
    /// <summary>
    /// Refresh the NFT list content
    /// </summary>
    public void RefreshNFTList(string filter = "")
    {
        if (nftListContent == null || playerData == null) return;
        
        // Get NFTs from player data
        List<NFTItem> nfts = new List<NFTItem>();
        
        if (string.IsNullOrEmpty(filter) || filter.ToLower() == "all")
        {
            nfts.AddRange(playerData.GetCattleNFTs());
            nfts.AddRange(playerData.GetPotionNFTs());
        }
        else if (filter.ToLower() == "cattle")
        {
            nfts.AddRange(playerData.GetCattleNFTs());
        }
        else if (filter.ToLower() == "potion")
        {
            nfts.AddRange(playerData.GetPotionNFTs());
        }
        
        // Clear dictionary of old instances that aren't in the new list
        List<string> tokenIdsToRemove = new List<string>();
        foreach (var kvp in nftItemInstances)
        {
            bool found = false;
            foreach (var nft in nfts)
            {
                if (nft.TokenId == kvp.Key)
                {
                    found = true;
                    break;
                }
            }
            
            if (!found)
            {
                tokenIdsToRemove.Add(kvp.Key);
            }
        }
        
        // Remove old instances
        foreach (var tokenId in tokenIdsToRemove)
        {
            Destroy(nftItemInstances[tokenId]);
            nftItemInstances.Remove(tokenId);
        }
        
        // Add or update NFT items
        foreach (var nft in nfts)
        {
            // Check if we already have an instance for this NFT
            if (nftItemInstances.TryGetValue(nft.TokenId, out GameObject existingInstance))
            {
                // Update existing instance
                UpdateNFTItemUI(existingInstance, nft);
            }
            else
            {
                // Create new instance
                CreateNFTItemUI(nft);
            }
        }
    }
    
    /// <summary>
    /// Create UI for an NFT item
    /// </summary>
    private void CreateNFTItemUI(NFTItem nft)
    {
        if (nftListContent == null || nftItemPrefab == null) return;
        
        // Create instance
        GameObject instance = Instantiate(nftItemPrefab, nftListContent);
        
        // Update UI
        UpdateNFTItemUI(instance, nft);
        
        // Add listener
        Button button = instance.GetComponent<Button>();
        if (button != null)
        {
            button.onClick.AddListener(() => ShowNFTDetail(nft));
        }
        
        // Store reference
        nftItemInstances[nft.TokenId] = instance;
    }
    
    /// <summary>
    /// Update UI for an NFT item
    /// </summary>
    private void UpdateNFTItemUI(GameObject instance, NFTItem nft)
    {
        // Get name text
        TextMeshProUGUI nameText = instance.GetComponentInChildren<TextMeshProUGUI>();
        if (nameText != null)
        {
            nameText.text = nft.Name;
        }
        
        // Get icon image
        Image icon = instance.GetComponentInChildren<Image>();
        if (icon != null)
        {
            // Set color based on type
            if (nft.Name.Contains("Cattle"))
            {
                icon.color = cattleColor;
            }
            else if (nft.Name.Contains("Potion"))
            {
                icon.color = potionColor;
            }
            
            // TODO: Replace with actual NFT image when available
        }
    }
    
    /// <summary>
    /// Show details for a specific NFT
    /// </summary>
    public void ShowNFTDetail(NFTItem nft)
    {
        if (nftDetailPanel == null) return;
        
        // Store selected NFT
        selectedNFT = nft;
        
        // Show the panel
        nftDetailPanel.SetActive(true);
        
        // Update title
        if (detailTitleText != null)
        {
            detailTitleText.text = nft.Name;
        }
        
        // Update description
        if (detailDescriptionText != null)
        {
            detailDescriptionText.text = nft.Description;
        }
        
        // Update attributes
        if (detailAttributesText != null)
        {
            string attributes = "";
            foreach (var attr in nft.Attributes)
            {
                attributes += $"{attr.Key}: {attr.Value}\n";
            }
            
            detailAttributesText.text = attributes;
        }
        
        // Update image
        if (detailImage != null)
        {
            // Set color based on type
            if (nft.Name.Contains("Cattle"))
            {
                detailImage.color = cattleColor;
            }
            else if (nft.Name.Contains("Potion"))
            {
                detailImage.color = potionColor;
            }
            
            // TODO: Replace with actual NFT image when available
        }
        
        // Update convert button
        if (convertButton != null)
        {
            // Only enable conversion for cattle NFTs
            bool isCattle = nft.Name.Contains("Cattle");
            convertButton.gameObject.SetActive(isCattle);
        }
    }
    
    /// <summary>
    /// Close the NFT list panel
    /// </summary>
    public void CloseNFTList()
    {
        if (nftListPanel != null)
        {
            nftListPanel.SetActive(false);
        }
    }
    
    /// <summary>
    /// Close the NFT detail panel
    /// </summary>
    public void CloseNFTDetail()
    {
        if (nftDetailPanel != null)
        {
            nftDetailPanel.SetActive(false);
            selectedNFT = null;
        }
    }
    
    /// <summary>
    /// Convert the selected NFT using MPL-404
    /// </summary>
    private async void ConvertSelectedNFT()
    {
        if (selectedNFT == null || mpl404Manager == null || playerData == null) return;
        
        // Only allow converting cattle NFTs
        if (!selectedNFT.Name.Contains("Cattle")) return;
        
        // Confirm conversion
        if (detailDescriptionText != null)
        {
            detailDescriptionText.text = "Converting...";
        }
        
        // Convert
        bool success = await playerData.ConvertCattleToTokens(selectedNFT);
        
        if (success)
        {
            // Close detail panel
            CloseNFTDetail();
            
            // Refresh list
            RefreshNFTList();
        }
        else
        {
            // Show error
            if (detailDescriptionText != null)
            {
                detailDescriptionText.text = "Conversion failed. Please try again.";
            }
        }
    }
    
    /// <summary>
    /// Show additional blockchain info for the NFT
    /// </summary>
    private void ShowMoreInfo()
    {
        if (selectedNFT == null) return;
        
        // Show blockchain details in the description
        if (detailDescriptionText != null)
        {
            string metadata = selectedNFT.GetMetadataJson();
            detailDescriptionText.text = $"Token ID: {selectedNFT.TokenId}\n" +
                                         $"Owner: {selectedNFT.OwnerAddress}\n" +
                                         $"Mint Time: {selectedNFT.MintTimestamp}\n\n" +
                                         $"Metadata: {metadata}";
        }
    }
    
    /// <summary>
    /// Handle newly minted NFT
    /// </summary>
    private void HandleNFTMinted(NFTItem nft)
    {
        // Refresh the list
        RefreshNFTList();
    }
}