using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;
using UnityEngine;

/// <summary>
/// Manager class for handling all Solana blockchain interactions
/// This will handle connecting to wallets, transactions, and token interactions
/// </summary>
public class SolanaManager : MonoBehaviour
{
    private static SolanaManager _instance;
    public static SolanaManager Instance
    {
        get
        {
            if (_instance == null)
            {
                GameObject obj = new GameObject("SolanaManager");
                _instance = obj.AddComponent<SolanaManager>();
                DontDestroyOnLoad(obj);
            }
            return _instance;
        }
    }

    // Wallet connection status
    public bool IsWalletConnected { get; private set; } = false;
    public string WalletAddress { get; private set; } = "";

    // Game token details
    private const string CATTLE_TOKEN_MINT = ""; // To be set with actual mint address
    private const string PROGRAM_ID = ""; // MPL-404 program ID

    // Events
    public event Action<string> OnWalletConnected;
    public event Action OnWalletDisconnected;
    public event Action<string> OnTransactionSuccess;
    public event Action<string> OnTransactionError;
    public event Action<float> OnCattleBalanceUpdated;
    public event Action<NFTItem> OnNFTMinted;

    // Wallet connection options
    public enum WalletProvider
    {
        Phantom,
        Solflare,
        Backpack,
        Mock // For development without a real connection
    }

    void Awake()
    {
        if (_instance == null)
        {
            _instance = this;
            DontDestroyOnLoad(gameObject);
            InitializeSolanaConnection();
        }
        else if (_instance != this)
        {
            Destroy(gameObject);
        }
    }

    private void InitializeSolanaConnection()
    {
        // In MVP, we'll start with the mock implementation
        // This would be replaced with actual Solana RPC connection
        Debug.Log("Initializing Solana connection...");
        
        // For MVP, we'll use the mock wallet
        #if UNITY_EDITOR
        UseMockWallet();
        #endif
    }

    /// <summary>
    /// Connect to a Solana wallet
    /// </summary>
    /// <param name="provider">The wallet provider to use</param>
    public async Task<bool> ConnectWallet(WalletProvider provider)
    {
        // In a real implementation, this would connect to the actual wallet
        // For MVP, this will use a mock implementation
        
        if (provider == WalletProvider.Mock)
        {
            return UseMockWallet();
        }
        
        // Future implementation for real wallets
        switch (provider)
        {
            case WalletProvider.Phantom:
                Debug.Log("Connecting to Phantom wallet...");
                // Implement Phantom wallet connection
                break;
            case WalletProvider.Solflare:
                Debug.Log("Connecting to Solflare wallet...");
                // Implement Solflare wallet connection
                break;
            case WalletProvider.Backpack:
                Debug.Log("Connecting to Backpack wallet...");
                // Implement Backpack wallet connection
                break;
        }
        
        // For MVP, return false for real wallets
        // This will be implemented in future iterations
        return false;
    }

    private bool UseMockWallet()
    {
        // Generate a mock wallet address for testing
        WalletAddress = "CattL" + UnityEngine.Random.Range(10000, 99999).ToString() + "....Solana";
        IsWalletConnected = true;
        
        Debug.Log($"Connected to mock wallet: {WalletAddress}");
        OnWalletConnected?.Invoke(WalletAddress);
        
        return true;
    }

    public void DisconnectWallet()
    {
        IsWalletConnected = false;
        WalletAddress = "";
        OnWalletDisconnected?.Invoke();
        Debug.Log("Wallet disconnected");
    }

    /// <summary>
    /// Get the CATTLE token balance for the connected wallet
    /// </summary>
    public async Task<float> GetCattleBalance()
    {
        if (!IsWalletConnected)
        {
            Debug.LogWarning("Cannot get balance, wallet not connected");
            return 0;
        }

        // In a real implementation, this would query the actual token account
        // For MVP, we'll use a mock implementation with PlayerPrefs
        float savedBalance = PlayerPrefs.GetFloat($"CATTLE_Balance_{WalletAddress}", 100f);
        return savedBalance;
    }

    /// <summary>
    /// Update the local record of CATTLE tokens
    /// </summary>
    public void UpdateCattleBalance(float amount)
    {
        if (!IsWalletConnected) return;
        
        float currentBalance = PlayerPrefs.GetFloat($"CATTLE_Balance_{WalletAddress}", 100f);
        float newBalance = currentBalance + amount;
        
        // Ensure balance doesn't go negative
        newBalance = Mathf.Max(0, newBalance);
        
        PlayerPrefs.SetFloat($"CATTLE_Balance_{WalletAddress}", newBalance);
        PlayerPrefs.Save();
        
        OnCattleBalanceUpdated?.Invoke(newBalance);
        Debug.Log($"CATTLE balance updated to: {newBalance}");
    }

    /// <summary>
    /// Mint a new NFT using the MPL-404 token standard
    /// </summary>
    public async Task<NFTItem> MintNFT(string name, string description, Dictionary<string, int> attributes)
    {
        if (!IsWalletConnected)
        {
            Debug.LogWarning("Cannot mint NFT, wallet not connected");
            return null;
        }
        
        // In a real implementation, this would make a call to mint an actual NFT
        // For MVP, we'll create a mock NFT with the right structure

        // Generate a unique token ID
        string tokenId = Guid.NewGuid().ToString();
        
        // Create the NFT object
        NFTItem nft = new NFTItem
        {
            TokenId = tokenId,
            Name = name,
            Description = description,
            OwnerAddress = WalletAddress,
            MintTimestamp = DateTime.Now,
            Attributes = new Dictionary<string, int>(attributes)
        };
        
        // Store the NFT in local storage (PlayerPrefs as JSON)
        SaveNFTToLocalStorage(nft);
        
        OnNFTMinted?.Invoke(nft);
        OnTransactionSuccess?.Invoke($"Minted NFT: {name}");
        
        return nft;
    }

    /// <summary>
    /// Store NFT data in PlayerPrefs (for MVP persistence)
    /// </summary>
    private void SaveNFTToLocalStorage(NFTItem nft)
    {
        // Get the existing NFT list
        List<NFTItem> nftList = GetAllNFTs();
        
        // Add the new NFT
        nftList.Add(nft);
        
        // Convert to JSON
        string json = JsonUtility.ToJson(new NFTList { items = nftList });
        
        // Save to PlayerPrefs
        PlayerPrefs.SetString($"NFTs_{WalletAddress}", json);
        PlayerPrefs.Save();
    }

    /// <summary>
    /// Get all NFTs owned by the connected wallet
    /// </summary>
    public List<NFTItem> GetAllNFTs()
    {
        if (!IsWalletConnected) return new List<NFTItem>();
        
        // Get from PlayerPrefs
        string json = PlayerPrefs.GetString($"NFTs_{WalletAddress}", "");
        
        if (string.IsNullOrEmpty(json))
        {
            return new List<NFTItem>();
        }
        
        NFTList list = JsonUtility.FromJson<NFTList>(json);
        return list != null ? list.items : new List<NFTItem>();
    }

    /// <summary>
    /// Execute a burn operation, simulating token burning on Solana
    /// </summary>
    public async Task<bool> BurnCattleTokens(float amount, string reason)
    {
        if (!IsWalletConnected)
        {
            Debug.LogWarning("Cannot burn tokens, wallet not connected");
            return false;
        }
        
        float currentBalance = await GetCattleBalance();
        
        if (currentBalance < amount)
        {
            OnTransactionError?.Invoke("Insufficient balance for burn operation");
            return false;
        }
        
        // For MVP, just reduce the balance
        UpdateCattleBalance(-amount);
        
        OnTransactionSuccess?.Invoke($"Burned {amount} CATTLE tokens");
        return true;
    }

    /// <summary>
    /// Execute a token transfer operation
    /// </summary>
    public async Task<bool> TransferCattleTokens(string toAddress, float amount, string memo)
    {
        if (!IsWalletConnected)
        {
            Debug.LogWarning("Cannot transfer tokens, wallet not connected");
            return false;
        }
        
        float currentBalance = await GetCattleBalance();
        
        if (currentBalance < amount)
        {
            OnTransactionError?.Invoke("Insufficient balance for transfer");
            return false;
        }
        
        // For MVP, just reduce the sender's balance
        // In a real implementation, we would increase the recipient's balance as well
        UpdateCattleBalance(-amount);
        
        OnTransactionSuccess?.Invoke($"Transferred {amount} CATTLE tokens to {toAddress}");
        return true;
    }

    /// <summary>
    /// Simulate selling an NFT for CATTLE tokens using the MPL-404 swap functionality
    /// </summary>
    public async Task<bool> SellNFTForCattle(NFTItem nft, float price)
    {
        if (!IsWalletConnected)
        {
            Debug.LogWarning("Cannot sell NFT, wallet not connected");
            return false;
        }
        
        // Get all owned NFTs
        List<NFTItem> nftList = GetAllNFTs();
        
        // Find the NFT to sell
        int index = nftList.FindIndex(n => n.TokenId == nft.TokenId);
        
        if (index < 0)
        {
            OnTransactionError?.Invoke("NFT not found in wallet");
            return false;
        }
        
        // Remove the NFT
        nftList.RemoveAt(index);
        
        // Update the NFT list in storage
        string json = JsonUtility.ToJson(new NFTList { items = nftList });
        PlayerPrefs.SetString($"NFTs_{WalletAddress}", json);
        
        // Add the CATTLE tokens
        UpdateCattleBalance(price);
        
        OnTransactionSuccess?.Invoke($"Sold {nft.Name} for {price} CATTLE tokens");
        return true;
    }
}

/// <summary>
/// Represents a single NFT item (compatible with MPL-404 standard)
/// </summary>
[System.Serializable]
public class NFTItem
{
    public string TokenId;
    public string Name;
    public string Description;
    public string OwnerAddress;
    public DateTime MintTimestamp;
    
    // We need to use a serializable dictionary-like class for JSON serialization
    [System.Serializable]
    public class AttributePair
    {
        public string Key;
        public int Value;
    }
    
    [SerializeField] private List<AttributePair> attributeList = new List<AttributePair>();
    
    // Non-serialized dictionary for easier access in code
    [System.NonSerialized]
    public Dictionary<string, int> Attributes = new Dictionary<string, int>();
    
    // Convert between dictionary and serializable list
    public void OnBeforeSerialize()
    {
        attributeList.Clear();
        foreach (var kvp in Attributes)
        {
            attributeList.Add(new AttributePair { Key = kvp.Key, Value = kvp.Value });
        }
    }
    
    public void OnAfterDeserialize()
    {
        Attributes = new Dictionary<string, int>();
        foreach (var pair in attributeList)
        {
            Attributes[pair.Key] = pair.Value;
        }
    }
    
    // Create JSON for MPL-404 token metadata format
    public string GetMetadataJson()
    {
        string attributes = "";
        foreach (var kvp in Attributes)
        {
            attributes += $"{{\"trait_type\":\"{kvp.Key}\",\"value\":{kvp.Value}}},";
        }
        
        // Remove trailing comma
        if (attributes.Length > 0)
        {
            attributes = attributes.Substring(0, attributes.Length - 1);
        }
        
        return $"{{\"name\":\"{Name}\",\"symbol\":\"CATTLE\",\"description\":\"{Description}\",\"attributes\":[{attributes}]}}";
    }
}

/// <summary>
/// Helper class for serializing lists of NFTs to JSON
/// </summary>
[System.Serializable]
public class NFTList
{
    public List<NFTItem> items = new List<NFTItem>();
}