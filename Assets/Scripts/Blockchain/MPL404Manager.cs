using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;
using UnityEngine;

/// <summary>
/// Manager for MPL-404 hybrid token operations
/// This handles the specific functionality of the MPL-404 standard which allows
/// for seamless swapping between NFTs and fungible tokens
/// </summary>
public class MPL404Manager : MonoBehaviour
{
    private static MPL404Manager _instance;
    public static MPL404Manager Instance
    {
        get
        {
            if (_instance == null)
            {
                GameObject obj = new GameObject("MPL404Manager");
                _instance = obj.AddComponent<MPL404Manager>();
                DontDestroyOnLoad(obj);
            }
            return _instance;
        }
    }

    // MPL-404 program ID (to be set with actual ID)
    private const string MPL_404_PROGRAM_ID = "";
    
    // Reference to SolanaManager for blockchain operations
    private SolanaManager solanaManager;
    
    // Events
    public event Action<string> OnSwapSuccess;
    public event Action<string> OnSwapError;

    private void Awake()
    {
        if (_instance == null)
        {
            _instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else if (_instance != this)
        {
            Destroy(gameObject);
        }
    }

    private void Start()
    {
        // Get reference to SolanaManager
        solanaManager = SolanaManager.Instance;
        Debug.Log("MPL-404 Manager initialized");
    }

    /// <summary>
    /// Convert a cattle NFT to fungible CATTLE tokens
    /// This uses the MPL-404 standard to convert an NFT to its token equivalent
    /// </summary>
    public async Task<bool> ConvertNftToTokens(NFTItem nft)
    {
        if (!solanaManager.IsWalletConnected)
        {
            Debug.LogWarning("Cannot convert NFT, wallet not connected");
            OnSwapError?.Invoke("Wallet not connected");
            return false;
        }

        // Calculate token value based on NFT attributes
        float tokenValue = CalculateNftTokenValue(nft);
        
        // For MVP: This would be a real MPL-404 token swap call
        // For now, we'll simulate by removing the NFT and adding tokens
        
        try
        {
            // Remove NFT from collection
            bool sold = await solanaManager.SellNFTForCattle(nft, tokenValue);
            
            if (sold)
            {
                OnSwapSuccess?.Invoke($"Converted {nft.Name} to {tokenValue} CATTLE tokens");
                return true;
            }
            else
            {
                OnSwapError?.Invoke("Failed to convert NFT to tokens");
                return false;
            }
        }
        catch (Exception e)
        {
            Debug.LogError($"Error converting NFT to tokens: {e.Message}");
            OnSwapError?.Invoke("Error during conversion");
            return false;
        }
    }

    /// <summary>
    /// Convert fungible CATTLE tokens to a new cattle NFT
    /// This uses the MPL-404 standard to convert tokens to an NFT
    /// </summary>
    public async Task<NFTItem> ConvertTokensToNft(float tokenAmount, string nftName, Dictionary<string, int> attributes)
    {
        if (!solanaManager.IsWalletConnected)
        {
            Debug.LogWarning("Cannot convert tokens, wallet not connected");
            OnSwapError?.Invoke("Wallet not connected");
            return null;
        }

        // Check if we have enough tokens
        float balance = await solanaManager.GetCattleBalance();
        if (balance < tokenAmount)
        {
            OnSwapError?.Invoke("Insufficient tokens for conversion");
            return null;
        }

        try
        {
            // Burn the tokens
            bool burned = await solanaManager.BurnCattleTokens(tokenAmount, "NFT conversion");
            
            if (!burned)
            {
                OnSwapError?.Invoke("Failed to burn tokens for conversion");
                return null;
            }
            
            // Create the NFT
            NFTItem newNft = await solanaManager.MintNFT(
                nftName,
                "A cattle NFT converted from CATTLE tokens using MPL-404",
                attributes
            );
            
            if (newNft != null)
            {
                OnSwapSuccess?.Invoke($"Converted {tokenAmount} CATTLE tokens to NFT: {nftName}");
                return newNft;
            }
            else
            {
                // Refund tokens if NFT creation failed
                solanaManager.UpdateCattleBalance(tokenAmount);
                OnSwapError?.Invoke("Failed to create NFT");
                return null;
            }
        }
        catch (Exception e)
        {
            Debug.LogError($"Error converting tokens to NFT: {e.Message}");
            OnSwapError?.Invoke("Error during conversion");
            return null;
        }
    }

    /// <summary>
    /// Calculate the token value of an NFT based on its attributes
    /// </summary>
    private float CalculateNftTokenValue(NFTItem nft)
    {
        float baseValue = 20f; // Base value for any NFT
        float attributeValue = 0f;
        
        // Sum up value of attributes
        foreach (var attr in nft.Attributes)
        {
            switch (attr.Key.ToLower())
            {
                case "speed":
                    attributeValue += attr.Value * 2.5f;
                    break;
                case "milk":
                    attributeValue += attr.Value * 3f;
                    break;
                case "potency":
                    attributeValue += attr.Value * 3.5f;
                    break;
                default:
                    attributeValue += attr.Value * 1f;
                    break;
            }
        }
        
        return baseValue + attributeValue;
    }

    /// <summary>
    /// Gets the price data for the CATTLE token in USD
    /// This would connect to a real price oracle in a full implementation
    /// </summary>
    public async Task<float> GetCattleTokenPrice()
    {
        // In a real implementation, this would fetch actual price data
        // For MVP, we'll return a mock price
        return 0.05f; // $0.05 per CATTLE token
    }

    /// <summary>
    /// Gets the floor price for Cattle NFTs
    /// This would connect to a real marketplace in a full implementation
    /// </summary>
    public async Task<float> GetCattleNftFloorPrice()
    {
        // In a real implementation, this would fetch actual floor price data
        // For MVP, we'll return a mock price
        return 20f; // 20 CATTLE tokens floor price
    }
}