using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;
using UnityEngine;

/// <summary>
/// Manages the in-game economy, bridging between game mechanics and blockchain
/// This handles the conversion between in-game actions and blockchain transactions
/// </summary>
public class GameEconomyManager : MonoBehaviour
{
    private static GameEconomyManager _instance;
    public static GameEconomyManager Instance
    {
        get
        {
            if (_instance == null)
            {
                GameObject obj = new GameObject("GameEconomyManager");
                _instance = obj.AddComponent<GameEconomyManager>();
                DontDestroyOnLoad(obj);
            }
            return _instance;
        }
    }

    // References to other managers
    private SolanaManager solanaManager;
    private MPL404Manager mpl404Manager;
    
    // Market price fluctuation
    private float marketPriceMultiplier = 1.0f;
    private float marketVolatility = 0.1f;
    
    // Last price update time
    private float lastPriceUpdateTime = 0f;
    private float priceUpdateInterval = 60f; // Update price every 60 seconds
    
    // Events
    public event Action<float> OnMarketPriceChanged;
    
    // Constants for economic parameters
    private const float BARN_UPGRADE_COST = 50f;
    private const float POTION_CRAFT_COST = 20f;
    private const float POTION_BURN_PERCENTAGE = 0.5f;
    private const float POKER_BURN_PERCENTAGE = 0.1f;
    private const int BREEDING_HAY_COST = 10;
    private const int BREEDING_WATER_COST = 10;

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
        // Get references to managers
        solanaManager = SolanaManager.Instance;
        mpl404Manager = MPL404Manager.Instance;
        
        // Initialize market price
        UpdateMarketPrice();
        
        Debug.Log("Game Economy Manager initialized");
    }

    private void Update()
    {
        // Update market price periodically
        if (Time.time - lastPriceUpdateTime > priceUpdateInterval)
        {
            UpdateMarketPrice();
        }
    }

    /// <summary>
    /// Update the market price multiplier with some randomness
    /// This affects prices for selling NFTs and other market transactions
    /// </summary>
    private void UpdateMarketPrice()
    {
        // Add some random fluctuation
        float change = UnityEngine.Random.Range(-marketVolatility, marketVolatility);
        marketPriceMultiplier = Mathf.Clamp(marketPriceMultiplier + change, 0.8f, 1.2f);
        
        lastPriceUpdateTime = Time.time;
        
        OnMarketPriceChanged?.Invoke(marketPriceMultiplier);
        Debug.Log($"Market price multiplier updated to: {marketPriceMultiplier}");
    }

    /// <summary>
    /// Get the current CATTLE token balance for the player
    /// </summary>
    public async Task<float> GetCattleBalance()
    {
        return await solanaManager.GetCattleBalance();
    }

    /// <summary>
    /// Get all cattle NFTs owned by the player
    /// </summary>
    public List<NFTItem> GetAllCattle()
    {
        List<NFTItem> allNfts = solanaManager.GetAllNFTs();
        return allNfts.FindAll(nft => nft.Name.Contains("Cattle"));
    }

    /// <summary>
    /// Get all shadow potion NFTs owned by the player
    /// </summary>
    public List<NFTItem> GetAllPotions()
    {
        List<NFTItem> allNfts = solanaManager.GetAllNFTs();
        return allNfts.FindAll(nft => nft.Name.Contains("Potion"));
    }

    /// <summary>
    /// Breed a new cattle NFT using hay and water resources
    /// </summary>
    public async Task<NFTItem> BreedCattle(PlayerData playerData)
    {
        // Check resources
        if (playerData.Hay < BREEDING_HAY_COST || playerData.Water < BREEDING_WATER_COST)
        {
            Debug.LogWarning("Not enough resources to breed cattle");
            return null;
        }
        
        // Consume resources
        playerData.UseHay(BREEDING_HAY_COST);
        playerData.UseWater(BREEDING_WATER_COST);
        
        // Generate random traits
        int speed = UnityEngine.Random.Range(1, 10);
        int milk = UnityEngine.Random.Range(1, 10);
        
        // Create attributes dictionary
        Dictionary<string, int> attributes = new Dictionary<string, int>
        {
            { "Speed", speed },
            { "Milk", milk }
        };
        
        // Mint the NFT on the blockchain
        int cattleNumber = GetAllCattle().Count + 1;
        string cattleName = $"Cattle #{cattleNumber}";
        
        NFTItem newCattle = await solanaManager.MintNFT(
            cattleName,
            "A virtual cattle on the Solana blockchain with unique traits",
            attributes
        );
        
        if (newCattle != null)
        {
            // Increment cattle count in player data
            playerData.IncrementCattle();
        }
        
        return newCattle;
    }

    /// <summary>
    /// Upgrade the barn capacity by spending CATTLE tokens
    /// </summary>
    public async Task<bool> UpgradeBarn(PlayerData playerData)
    {
        float balance = await GetCattleBalance();
        
        if (balance < BARN_UPGRADE_COST)
        {
            Debug.LogWarning("Not enough CATTLE to upgrade barn");
            return false;
        }
        
        // Spend CATTLE tokens
        bool success = await solanaManager.BurnCattleTokens(BARN_UPGRADE_COST, "Barn upgrade");
        
        if (success)
        {
            // Increase barn capacity
            playerData.IncreaseBarnCapacity(50);
            return true;
        }
        
        return false;
    }

    /// <summary>
    /// Play poker game in the saloon with a wager amount
    /// </summary>
    public async Task<float> PlayPoker(float wagerAmount)
    {
        float balance = await GetCattleBalance();
        
        if (balance < wagerAmount)
        {
            Debug.LogWarning("Not enough CATTLE for poker wager");
            return 0;
        }
        
        // Determine outcome with 50/50 chance
        bool win = UnityEngine.Random.value >= 0.5f;
        
        // Calculate burn amount
        float burnAmount = wagerAmount * POKER_BURN_PERCENTAGE;
        float remainingWager = wagerAmount - burnAmount;
        
        if (win)
        {
            // Win gives 2x the remaining wager
            float winnings = remainingWager * 2;
            
            // Burn tokens first
            await solanaManager.BurnCattleTokens(burnAmount, "Poker burn");
            
            // Then add winnings (which already deducts the original wager)
            solanaManager.UpdateCattleBalance(winnings - wagerAmount);
            
            return winnings;
        }
        else
        {
            // Lose, just burn the whole wager
            await solanaManager.BurnCattleTokens(wagerAmount, "Poker loss");
            return -wagerAmount;
        }
    }

    /// <summary>
    /// Craft a shadow potion NFT
    /// </summary>
    public async Task<NFTItem> CraftShadowPotion(PlayerData playerData)
    {
        float balance = await GetCattleBalance();
        
        if (balance < POTION_CRAFT_COST)
        {
            Debug.LogWarning("Not enough CATTLE to craft shadow potion");
            return null;
        }
        
        // Calculate burn amount (50% of cost)
        float burnAmount = POTION_CRAFT_COST * POTION_BURN_PERCENTAGE;
        
        // Burn tokens first
        bool burnSuccess = await solanaManager.BurnCattleTokens(burnAmount, "Potion crafting burn");
        
        if (!burnSuccess)
        {
            return null;
        }
        
        // Then spend the rest
        bool spendSuccess = await solanaManager.BurnCattleTokens(POTION_CRAFT_COST - burnAmount, "Potion crafting cost");
        
        if (!spendSuccess)
        {
            // Refund the burned amount if spending fails
            solanaManager.UpdateCattleBalance(burnAmount);
            return null;
        }
        
        // Generate random potency
        int potency = UnityEngine.Random.Range(1, 10);
        
        // Create attributes dictionary
        Dictionary<string, int> attributes = new Dictionary<string, int>
        {
            { "Potency", potency }
        };
        
        // Mint the NFT on the blockchain
        int potionNumber = GetAllPotions().Count + 1;
        string potionName = $"Shadow Potion #{potionNumber}";
        
        return await solanaManager.MintNFT(
            potionName,
            "A magical shadow potion from the Ether Range with unique potency",
            attributes
        );
    }

    /// <summary>
    /// Sell a shadow potion for CATTLE tokens
    /// </summary>
    public async Task<float> SellShadowPotion(NFTItem potion)
    {
        if (potion == null || !potion.Name.Contains("Potion"))
        {
            Debug.LogWarning("Invalid potion for sale");
            return 0;
        }
        
        // Calculate selling price based on potency and market price
        float basePrice = 25f;
        float potencyValue = 0;
        
        if (potion.Attributes.TryGetValue("Potency", out int potency))
        {
            potencyValue = potency;
        }
        
        // Price formula: base + (potency * 1.5) * market multiplier
        float price = (basePrice + (potencyValue * 1.5f)) * marketPriceMultiplier;
        
        // Clamp to 25-35 range
        price = Mathf.Clamp(price, 25f, 35f);
        
        // Sell the NFT
        bool sold = await solanaManager.SellNFTForCattle(potion, price);
        
        if (sold)
        {
            return price;
        }
        
        return 0;
    }

    /// <summary>
    /// Convert a cattle NFT to CATTLE tokens using MPL-404
    /// </summary>
    public async Task<bool> ConvertCattleToTokens(NFTItem cattle)
    {
        if (cattle == null || !cattle.Name.Contains("Cattle"))
        {
            Debug.LogWarning("Invalid cattle for conversion");
            return false;
        }
        
        return await mpl404Manager.ConvertNftToTokens(cattle);
    }

    /// <summary>
    /// Convert CATTLE tokens to a new cattle NFT using MPL-404
    /// </summary>
    public async Task<NFTItem> ConvertTokensToCattle(float amount)
    {
        float balance = await GetCattleBalance();
        
        if (balance < amount)
        {
            Debug.LogWarning("Not enough CATTLE for conversion");
            return null;
        }
        
        // Generate random traits
        int speed = UnityEngine.Random.Range(1, 10);
        int milk = UnityEngine.Random.Range(1, 10);
        
        // Create attributes dictionary
        Dictionary<string, int> attributes = new Dictionary<string, int>
        {
            { "Speed", speed },
            { "Milk", milk }
        };
        
        // Name the new cattle
        int cattleNumber = GetAllCattle().Count + 1;
        string cattleName = $"Cattle #{cattleNumber}";
        
        return await mpl404Manager.ConvertTokensToNft(amount, cattleName, attributes);
    }
}