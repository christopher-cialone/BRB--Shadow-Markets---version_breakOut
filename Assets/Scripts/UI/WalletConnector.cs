using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System.Threading.Tasks;

/// <summary>
/// Handles UI for connecting to Solana wallet
/// </summary>
public class WalletConnector : MonoBehaviour
{
    [SerializeField] private GameObject walletPanel;
    [SerializeField] private Button phantomButton;
    [SerializeField] private Button solflareButton;
    [SerializeField] private Button backpackButton;
    [SerializeField] private Button mockWalletButton;
    [SerializeField] private Button closeButton;
    [SerializeField] private TextMeshProUGUI statusText;
    [SerializeField] private TextMeshProUGUI addressText;
    [SerializeField] private TextMeshProUGUI balanceText;
    
    private SolanaManager solanaManager;
    
    private void Start()
    {
        // Get reference to Solana Manager
        solanaManager = SolanaManager.Instance;
        
        // Setup UI elements if not assigned in inspector
        SetupUI();
        
        // Setup button listeners
        SetupButtonListeners();
        
        // Subscribe to wallet events
        SubscribeToWalletEvents();
        
        // Initially hide wallet panel
        if (walletPanel != null)
        {
            walletPanel.SetActive(false);
        }
        
        // Update connection status
        UpdateConnectionStatus();
    }
    
    private void SetupUI()
    {
        // Find objects in scene if not assigned
        if (walletPanel == null)
        {
            walletPanel = GameObject.Find("WalletPanel");
        }
        
        // Create components if not found
        if (walletPanel == null)
        {
            walletPanel = new GameObject("WalletPanel");
            walletPanel.transform.SetParent(transform);
            
            // Add Canvas Group for animations
            CanvasGroup canvasGroup = walletPanel.AddComponent<CanvasGroup>();
            
            // Setup panel
            RectTransform rectTransform = walletPanel.GetComponent<RectTransform>();
            if (rectTransform == null)
            {
                rectTransform = walletPanel.AddComponent<RectTransform>();
            }
            
            // Set panel position and size
            rectTransform.anchorMin = new Vector2(0.5f, 0.5f);
            rectTransform.anchorMax = new Vector2(0.5f, 0.5f);
            rectTransform.pivot = new Vector2(0.5f, 0.5f);
            rectTransform.sizeDelta = new Vector2(400, 600);
            
            // Add background image
            Image bgImage = walletPanel.AddComponent<Image>();
            bgImage.color = new Color(0.1f, 0.1f, 0.1f, 0.9f);
        }
        
        // Setup wallet buttons (simplified for MVP)
        if (mockWalletButton == null && walletPanel != null)
        {
            GameObject buttonObj = new GameObject("MockWalletButton");
            buttonObj.transform.SetParent(walletPanel.transform);
            
            RectTransform rectTransform = buttonObj.AddComponent<RectTransform>();
            rectTransform.anchorMin = new Vector2(0.5f, 0.5f);
            rectTransform.anchorMax = new Vector2(0.5f, 0.5f);
            rectTransform.pivot = new Vector2(0.5f, 0.5f);
            rectTransform.sizeDelta = new Vector2(300, 60);
            
            mockWalletButton = buttonObj.AddComponent<Button>();
            Image buttonImage = buttonObj.AddComponent<Image>();
            buttonImage.color = new Color(0.2f, 0.4f, 0.8f);
            
            // Create text
            GameObject textObj = new GameObject("Text");
            textObj.transform.SetParent(buttonObj.transform);
            
            RectTransform textRect = textObj.AddComponent<RectTransform>();
            textRect.anchorMin = Vector2.zero;
            textRect.anchorMax = Vector2.one;
            textRect.sizeDelta = Vector2.zero;
            
            TextMeshProUGUI buttonText = textObj.AddComponent<TextMeshProUGUI>();
            buttonText.text = "Connect Demo Wallet";
            buttonText.alignment = TextAlignmentOptions.Center;
            buttonText.fontSize = 24;
        }
        
        // Setup status and address text
        if (statusText == null && walletPanel != null)
        {
            GameObject textObj = new GameObject("StatusText");
            textObj.transform.SetParent(walletPanel.transform);
            
            RectTransform rectTransform = textObj.AddComponent<RectTransform>();
            rectTransform.anchorMin = new Vector2(0.5f, 0.8f);
            rectTransform.anchorMax = new Vector2(0.5f, 0.8f);
            rectTransform.pivot = new Vector2(0.5f, 0.5f);
            rectTransform.sizeDelta = new Vector2(300, 40);
            
            statusText = textObj.AddComponent<TextMeshProUGUI>();
            statusText.text = "Not Connected";
            statusText.alignment = TextAlignmentOptions.Center;
            statusText.fontSize = 24;
        }
        
        if (addressText == null && walletPanel != null)
        {
            GameObject textObj = new GameObject("AddressText");
            textObj.transform.SetParent(walletPanel.transform);
            
            RectTransform rectTransform = textObj.AddComponent<RectTransform>();
            rectTransform.anchorMin = new Vector2(0.5f, 0.7f);
            rectTransform.anchorMax = new Vector2(0.5f, 0.7f);
            rectTransform.pivot = new Vector2(0.5f, 0.5f);
            rectTransform.sizeDelta = new Vector2(300, 40);
            
            addressText = textObj.AddComponent<TextMeshProUGUI>();
            addressText.text = "";
            addressText.alignment = TextAlignmentOptions.Center;
            addressText.fontSize = 16;
        }
        
        if (balanceText == null && walletPanel != null)
        {
            GameObject textObj = new GameObject("BalanceText");
            textObj.transform.SetParent(walletPanel.transform);
            
            RectTransform rectTransform = textObj.AddComponent<RectTransform>();
            rectTransform.anchorMin = new Vector2(0.5f, 0.6f);
            rectTransform.anchorMax = new Vector2(0.5f, 0.6f);
            rectTransform.pivot = new Vector2(0.5f, 0.5f);
            rectTransform.sizeDelta = new Vector2(300, 40);
            
            balanceText = textObj.AddComponent<TextMeshProUGUI>();
            balanceText.text = "CATTLE: 0";
            balanceText.alignment = TextAlignmentOptions.Center;
            balanceText.fontSize = 20;
        }
        
        // Setup close button
        if (closeButton == null && walletPanel != null)
        {
            GameObject buttonObj = new GameObject("CloseButton");
            buttonObj.transform.SetParent(walletPanel.transform);
            
            RectTransform rectTransform = buttonObj.AddComponent<RectTransform>();
            rectTransform.anchorMin = new Vector2(0.5f, 0.3f);
            rectTransform.anchorMax = new Vector2(0.5f, 0.3f);
            rectTransform.pivot = new Vector2(0.5f, 0.5f);
            rectTransform.sizeDelta = new Vector2(300, 60);
            
            closeButton = buttonObj.AddComponent<Button>();
            Image buttonImage = buttonObj.AddComponent<Image>();
            buttonImage.color = new Color(0.8f, 0.2f, 0.2f);
            
            // Create text
            GameObject textObj = new GameObject("Text");
            textObj.transform.SetParent(buttonObj.transform);
            
            RectTransform textRect = textObj.AddComponent<RectTransform>();
            textRect.anchorMin = Vector2.zero;
            textRect.anchorMax = Vector2.one;
            textRect.sizeDelta = Vector2.zero;
            
            TextMeshProUGUI buttonText = textObj.AddComponent<TextMeshProUGUI>();
            buttonText.text = "Close";
            buttonText.alignment = TextAlignmentOptions.Center;
            buttonText.fontSize = 24;
        }
    }
    
    private void SetupButtonListeners()
    {
        if (phantomButton != null)
        {
            phantomButton.onClick.AddListener(() => ConnectWallet(SolanaManager.WalletProvider.Phantom));
        }
        
        if (solflareButton != null)
        {
            solflareButton.onClick.AddListener(() => ConnectWallet(SolanaManager.WalletProvider.Solflare));
        }
        
        if (backpackButton != null)
        {
            backpackButton.onClick.AddListener(() => ConnectWallet(SolanaManager.WalletProvider.Backpack));
        }
        
        if (mockWalletButton != null)
        {
            mockWalletButton.onClick.AddListener(() => ConnectWallet(SolanaManager.WalletProvider.Mock));
        }
        
        if (closeButton != null)
        {
            closeButton.onClick.AddListener(CloseWalletPanel);
        }
    }
    
    private void SubscribeToWalletEvents()
    {
        if (solanaManager != null)
        {
            solanaManager.OnWalletConnected += OnWalletConnected;
            solanaManager.OnWalletDisconnected += OnWalletDisconnected;
            solanaManager.OnCattleBalanceUpdated += UpdateBalanceDisplay;
        }
    }
    
    /// <summary>
    /// Connect to wallet with specified provider
    /// </summary>
    private async void ConnectWallet(SolanaManager.WalletProvider provider)
    {
        if (solanaManager == null) return;
        
        // Update status
        if (statusText != null)
        {
            statusText.text = "Connecting...";
        }
        
        // Attempt to connect
        bool success = await solanaManager.ConnectWallet(provider);
        
        // Status will be updated via event callbacks
        if (!success)
        {
            if (statusText != null)
            {
                statusText.text = "Connection Failed";
            }
        }
    }
    
    /// <summary>
    /// Disconnect wallet
    /// </summary>
    public void DisconnectWallet()
    {
        if (solanaManager == null) return;
        
        solanaManager.DisconnectWallet();
    }
    
    /// <summary>
    /// Handle wallet connected event
    /// </summary>
    private void OnWalletConnected(string address)
    {
        UpdateConnectionStatus();
        UpdateBalanceDisplay(0); // Will be updated to correct value via blockchain sync
    }
    
    /// <summary>
    /// Handle wallet disconnected event
    /// </summary>
    private void OnWalletDisconnected()
    {
        UpdateConnectionStatus();
    }
    
    /// <summary>
    /// Update connection status display
    /// </summary>
    private void UpdateConnectionStatus()
    {
        if (solanaManager == null) return;
        
        bool connected = solanaManager.IsWalletConnected;
        string address = solanaManager.WalletAddress;
        
        if (statusText != null)
        {
            statusText.text = connected ? "Connected" : "Not Connected";
            statusText.color = connected ? Color.green : Color.red;
        }
        
        if (addressText != null)
        {
            addressText.text = connected ? address : "";
        }
        
        // Hide/show appropriate buttons
        if (mockWalletButton != null)
        {
            mockWalletButton.gameObject.SetActive(!connected);
        }
        
        if (phantomButton != null)
        {
            phantomButton.gameObject.SetActive(!connected);
        }
        
        if (solflareButton != null)
        {
            solflareButton.gameObject.SetActive(!connected);
        }
        
        if (backpackButton != null)
        {
            backpackButton.gameObject.SetActive(!connected);
        }
        
        // Update balance (if connected)
        if (connected)
        {
            UpdateWalletBalance();
        }
    }
    
    /// <summary>
    /// Update balance display
    /// </summary>
    private void UpdateBalanceDisplay(float balance)
    {
        if (balanceText != null)
        {
            balanceText.text = $"CATTLE: {balance:F2}";
        }
    }
    
    /// <summary>
    /// Get latest wallet balance
    /// </summary>
    private async void UpdateWalletBalance()
    {
        if (solanaManager == null || !solanaManager.IsWalletConnected) return;
        
        float balance = await solanaManager.GetCattleBalance();
        UpdateBalanceDisplay(balance);
    }
    
    /// <summary>
    /// Show the wallet connection panel
    /// </summary>
    public void ShowWalletPanel()
    {
        if (walletPanel != null)
        {
            walletPanel.SetActive(true);
            UpdateConnectionStatus();
        }
    }
    
    /// <summary>
    /// Hide the wallet connection panel
    /// </summary>
    public void CloseWalletPanel()
    {
        if (walletPanel != null)
        {
            walletPanel.SetActive(false);
        }
    }
}