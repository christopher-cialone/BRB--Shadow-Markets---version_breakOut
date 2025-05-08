using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;
using UnityEngine;

public class PlayerData : MonoBehaviour
{
    // Player archetype
    public enum Archetype { None, Entrepreneur, Adventurer }
    public Archetype SelectedArchetype { get; private set; } = Archetype.None;

    // Player name
    public string PlayerName { get; private set; } = "Cowboy";

    // Resources - these are stored locally for gameplay
    public int Cattle { get; private set; } = 0;
    public int Hay { get; private set; } = 100;
    public int Water { get; private set; } = 100;
    public int BarnCapacity { get; private set; } = 100;

    // On-chain resources - these are tracked on the blockchain through SolanaManager
    // We'll cache them locally for faster access but sync with blockchain regularly
    private float cachedCattleBalance = 100f; // Initial $CATTLE
    private List<NFTItem> cachedCattleNFTs = new List<NFTItem>();
    private List<NFTItem> cachedPotionNFTs = new List<NFTItem>();

    // Blockchain managers
    private SolanaManager solanaManager;
    private GameEconomyManager economyManager;

    // Sync status
    public bool IsSyncing { get; private set; } = false;
    private float lastSyncTime = 0f;
    private float syncInterval = 30f; // Sync with blockchain every 30 seconds

    // Events
    public event System.Action OnResourcesChanged;
    public event System.Action<float> OnCattleBalanceChanged;

    private void Start()
    {
        // Get references to managers
        solanaManager = SolanaManager.Instance;
        economyManager = GameEconomyManager.Instance;
        
        // Subscribe to blockchain events
        if (solanaManager != null)
        {
            solanaManager.OnCattleBalanceUpdated += UpdateCachedCattleBalance;
            solanaManager.OnNFTMinted += HandleNewNFT;
            solanaManager.OnWalletConnected += (_) => SyncWithBlockchain();
        }
        
        // Initial sync
        SyncWithBlockchain();
    }

    private void Update()
    {
        // Periodic sync with blockchain
        if (Time.time - lastSyncTime > syncInterval && solanaManager != null && solanaManager.IsWalletConnected)
        {
            SyncWithBlockchain();
        }
    }

    /// <summary>
    /// Sync local player data with blockchain state
    /// </summary>
    public async void SyncWithBlockchain()
    {
        if (IsSyncing || solanaManager == null || !solanaManager.IsWalletConnected) return;
        
        IsSyncing = true;
        lastSyncTime = Time.time;
        
        try
        {
            // Sync CATTLE balance
            float blockchainBalance = await solanaManager.GetCattleBalance();
            UpdateCachedCattleBalance(blockchainBalance);
            
            // Sync NFTs
            List<NFTItem> allNFTs = solanaManager.GetAllNFTs();
            
            // Process cattle NFTs
            cachedCattleNFTs.Clear();
            foreach (var nft in allNFTs)
            {
                if (nft.Name.Contains("Cattle"))
                {
                    cachedCattleNFTs.Add(nft);
                }
            }
            
            // Process potion NFTs
            cachedPotionNFTs.Clear();
            foreach (var nft in allNFTs)
            {
                if (nft.Name.Contains("Potion"))
                {
                    cachedPotionNFTs.Add(nft);
                }
            }
            
            // Update cattle count
            Cattle = cachedCattleNFTs.Count;
            
            Debug.Log("Synced with blockchain: " +
                     $"{cachedCattleBalance} CATTLE, " +
                     $"{cachedCattleNFTs.Count} cattle NFTs, " +
                     $"{cachedPotionNFTs.Count} potion NFTs");
                     
            OnResourcesChanged?.Invoke();
        }
        catch (System.Exception e)
        {
            Debug.LogError($"Error syncing with blockchain: {e.Message}");
        }
        finally
        {
            IsSyncing = false;
        }
    }

    /// <summary>
    /// Update the cached CATTLE balance
    /// </summary>
    private void UpdateCachedCattleBalance(float newBalance)
    {
        cachedCattleBalance = newBalance;
        OnCattleBalanceChanged?.Invoke(cachedCattleBalance);
        OnResourcesChanged?.Invoke();
    }

    /// <summary>
    /// Handle new NFT minted event
    /// </summary>
    private void HandleNewNFT(NFTItem nft)
    {
        if (nft.Name.Contains("Cattle"))
        {
            cachedCattleNFTs.Add(nft);
            Cattle = cachedCattleNFTs.Count;
        }
        else if (nft.Name.Contains("Potion"))
        {
            cachedPotionNFTs.Add(nft);
        }
        
        OnResourcesChanged?.Invoke();
    }

    // Initialize player data
    public void InitializePlayer(string name, Archetype archetype)
    {
        PlayerName = name;
        SelectedArchetype = archetype;
        
        // Initial resources are set in the constructor
        // The blockchain account will be created/connected separately

        // Save player preferences
        PlayerPrefs.SetString("PlayerName", name);
        PlayerPrefs.SetInt("PlayerArchetype", (int)archetype);
        PlayerPrefs.Save();
    }

    // CATTLE token methods (on-chain)
    
    /// <summary>
    /// Get the current CATTLE balance from blockchain or cache
    /// </summary>
    public float GetCattleBalance()
    {
        return cachedCattleBalance;
    }

    /// <summary>
    /// Get all cattle NFTs from blockchain or cache
    /// </summary>
    public List<NFTItem> GetCattleNFTs()
    {
        return new List<NFTItem>(cachedCattleNFTs);
    }

    /// <summary>
    /// Get all potion NFTs from blockchain or cache
    /// </summary>
    public List<NFTItem> GetPotionNFTs()
    {
        return new List<NFTItem>(cachedPotionNFTs);
    }

    // Resource management functions (off-chain)
    
    /// <summary>
    /// Use hay resource
    /// </summary>
    public bool UseHay(int amount)
    {
        if (Hay >= amount)
        {
            Hay -= amount;
            OnResourcesChanged?.Invoke();
            return true;
        }
        return false;
    }

    /// <summary>
    /// Use water resource
    /// </summary>
    public bool UseWater(int amount)
    {
        if (Water >= amount)
        {
            Water -= amount;
            OnResourcesChanged?.Invoke();
            return true;
        }
        return false;
    }

    /// <summary>
    /// Add hay resource
    /// </summary>
    public void AddHay(int amount)
    {
        Hay = Mathf.Min(Hay + amount, BarnCapacity);
        OnResourcesChanged?.Invoke();
    }

    /// <summary>
    /// Add water resource
    /// </summary>
    public void AddWater(int amount)
    {
        Water = Mathf.Min(Water + amount, BarnCapacity);
        OnResourcesChanged?.Invoke();
    }

    /// <summary>
    /// Increase barn capacity
    /// </summary>
    public void IncreaseBarnCapacity(int amount)
    {
        BarnCapacity += amount;
        OnResourcesChanged?.Invoke();
    }

    /// <summary>
    /// Increment cattle count
    /// </summary>
    public void IncrementCattle()
    {
        Cattle++;
        OnResourcesChanged?.Invoke();
    }

    // On-chain operations (these use the blockchain)

    /// <summary>
    /// Upgrade the barn using CATTLE tokens on the blockchain
    /// </summary>
    public async Task<bool> UpgradeBarn()
    {
        if (economyManager == null) return false;
        
        bool success = await economyManager.UpgradeBarn(this);
        
        if (success)
        {
            // The barn capacity is updated by the economy manager
            Debug.Log("Barn upgraded successfully");
        }
        
        return success;
    }

    /// <summary>
    /// Breed a new cattle NFT using hay and water resources
    /// This creates a new NFT on the blockchain
    /// </summary>
    public async Task<NFTItem> BreedCattle()
    {
        if (economyManager == null) return null;
        
        NFTItem newCattle = await economyManager.BreedCattle(this);
        
        if (newCattle != null)
        {
            Debug.Log($"New cattle bred: {newCattle.Name}");
        }
        
        return newCattle;
    }

    /// <summary>
    /// Craft a new shadow potion NFT using CATTLE tokens
    /// This creates a new NFT on the blockchain
    /// </summary>
    public async Task<NFTItem> CraftShadowPotion()
    {
        if (economyManager == null) return null;
        
        NFTItem newPotion = await economyManager.CraftShadowPotion(this);
        
        if (newPotion != null)
        {
            Debug.Log($"New shadow potion crafted: {newPotion.Name}");
        }
        
        return newPotion;
    }

    /// <summary>
    /// Sell a shadow potion NFT for CATTLE tokens
    /// </summary>
    public async Task<float> SellShadowPotion(NFTItem potion)
    {
        if (economyManager == null) return 0;
        
        // Get entrepreneur bonus
        float bonusMultiplier = SelectedArchetype == Archetype.Entrepreneur ? 1.1f : 1.0f;
        
        // Sell the potion
        float baseAmount = await economyManager.SellShadowPotion(potion);
        
        // Apply entrepreneur bonus to the proceeds
        float totalAmount = baseAmount * bonusMultiplier;
        
        if (totalAmount > 0)
        {
            // If we got a bonus, add the extra amount separately
            if (bonusMultiplier > 1.0f)
            {
                float bonusAmount = baseAmount * (bonusMultiplier - 1.0f);
                solanaManager.UpdateCattleBalance(bonusAmount);
            }
            
            Debug.Log($"Sold potion for {totalAmount} CATTLE tokens (includes {bonusMultiplier}x bonus)");
        }
        
        return totalAmount;
    }

    /// <summary>
    /// Play poker in the saloon with a wager
    /// </summary>
    public async Task<float> PlayPoker(float wager)
    {
        if (economyManager == null) return 0;
        
        float result = await economyManager.PlayPoker(wager);
        
        if (result > 0)
        {
            // Apply entrepreneur bonus to winnings if needed
            if (SelectedArchetype == Archetype.Entrepreneur)
            {
                float bonus = result * 0.1f; // 10% bonus
                solanaManager.UpdateCattleBalance(bonus);
                result += bonus;
            }
            
            Debug.Log($"Won {result} CATTLE tokens in poker");
        }
        else if (result < 0)
        {
            Debug.Log($"Lost {-result} CATTLE tokens in poker");
        }
        
        return result;
    }

    /// <summary>
    /// Convert a cattle NFT to CATTLE tokens using MPL-404
    /// </summary>
    public async Task<bool> ConvertCattleToTokens(NFTItem cattle)
    {
        if (economyManager == null) return false;
        
        bool success = await economyManager.ConvertCattleToTokens(cattle);
        
        if (success)
        {
            Debug.Log($"Converted {cattle.Name} to CATTLE tokens");
        }
        
        return success;
    }

    /// <summary>
    /// Convert CATTLE tokens to a new cattle NFT using MPL-404
    /// </summary>
    public async Task<NFTItem> ConvertTokensToCattle(float amount)
    {
        if (economyManager == null) return null;
        
        NFTItem newCattle = await economyManager.ConvertTokensToCattle(amount);
        
        if (newCattle != null)
        {
            Debug.Log($"Converted {amount} CATTLE tokens to new cattle: {newCattle.Name}");
        }
        
        return newCattle;
    }

    // Get player stats for sticky note printing
    public string GetPlayerStats()
    {
        return $"Player: {PlayerName}\n" +
               $"Archetype: {SelectedArchetype}\n" +
               $"$CATTLE: {cachedCattleBalance:F2}\n" +
               $"Cattle: {Cattle}\n" +
               $"Potions: {cachedPotionNFTs.Count}\n" +
               $"Hay: {Hay}/{BarnCapacity}\n" +
               $"Water: {Water}/{BarnCapacity}";
    }
}
