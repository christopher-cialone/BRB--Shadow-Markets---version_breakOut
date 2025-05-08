using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class PlayerData : MonoBehaviour
{
    // Player archetype
    public enum Archetype { None, Entrepreneur, Adventurer }
    public Archetype SelectedArchetype { get; private set; } = Archetype.None;

    // Player name
    public string PlayerName { get; private set; } = "Cowboy";

    // Resources
    public int Cattle { get; private set; } = 0;
    public float CattleBalance { get; private set; } = 100f; // Initial $CATTLE
    public int Hay { get; private set; } = 100;
    public int Water { get; private set; } = 100;
    public int BarnCapacity { get; private set; } = 100;

    // Collections
    public List<Cattle> CattleCollection { get; private set; } = new List<Cattle>();
    public List<ShadowPotion> PotionCollection { get; private set; } = new List<ShadowPotion>();

    // Initialize player data
    public void InitializePlayer(string name, Archetype archetype)
    {
        PlayerName = name;
        SelectedArchetype = archetype;
        
        // Apply archetype bonuses
        switch (archetype)
        {
            case Archetype.Entrepreneur:
                // +10% $CATTLE earning rate will be applied in earning functions
                break;
            case Archetype.Adventurer:
                // +10% heist success rate (for future implementation)
                break;
        }
    }

    // Resource management functions
    public bool SpendCattle(float amount)
    {
        if (CattleBalance >= amount)
        {
            CattleBalance -= amount;
            return true;
        }
        return false;
    }

    public void EarnCattle(float amount)
    {
        // Apply entrepreneur bonus if applicable
        if (SelectedArchetype == Archetype.Entrepreneur)
        {
            amount *= 1.1f; // 10% bonus
        }
        
        CattleBalance += amount;
    }

    public bool UseHay(int amount)
    {
        if (Hay >= amount)
        {
            Hay -= amount;
            return true;
        }
        return false;
    }

    public bool UseWater(int amount)
    {
        if (Water >= amount)
        {
            Water -= amount;
            return true;
        }
        return false;
    }

    public void AddHay(int amount)
    {
        Hay = Mathf.Min(Hay + amount, BarnCapacity);
    }

    public void AddWater(int amount)
    {
        Water = Mathf.Min(Water + amount, BarnCapacity);
    }

    public bool UpgradeBarn()
    {
        float cost = 50f;
        if (SpendCattle(cost))
        {
            BarnCapacity += 50;
            return true;
        }
        return false;
    }

    // Cattle management
    public bool BreedCattle()
    {
        int hayNeeded = 10;
        int waterNeeded = 10;
        
        if (UseHay(hayNeeded) && UseWater(waterNeeded))
        {
            // Generate new cattle with random traits
            int speed = Random.Range(1, 10);
            int milk = Random.Range(1, 10);
            
            Cattle newCattle = new Cattle(CattleCollection.Count + 1, speed, milk);
            CattleCollection.Add(newCattle);
            Cattle++;
            
            return true;
        }
        
        return false;
    }

    // Shadow potion management
    public bool CraftShadowPotion()
    {
        float cost = 20f;
        
        if (SpendCattle(cost))
        {
            // 50% burn mechanic
            float burnAmount = cost * 0.5f;
            // The rest is just taken from the player's balance already
            
            // Create a new shadow potion with random potency
            int potency = Random.Range(1, 10);
            ShadowPotion newPotion = new ShadowPotion(PotionCollection.Count + 1, potency);
            PotionCollection.Add(newPotion);
            
            return true;
        }
        
        return false;
    }

    public bool SellShadowPotion(int index)
    {
        if (index >= 0 && index < PotionCollection.Count)
        {
            // Random price between 25-35 $CATTLE
            float sellingPrice = Random.Range(25f, 35f);
            
            // Apply entrepreneur bonus if applicable
            if (SelectedArchetype == Archetype.Entrepreneur)
            {
                sellingPrice *= 1.1f; // 10% bonus
            }
            
            EarnCattle(sellingPrice);
            PotionCollection.RemoveAt(index);
            
            return true;
        }
        
        return false;
    }

    // Saloon poker game
    public float PlayPoker(float wager)
    {
        if (SpendCattle(wager))
        {
            // 10% burn
            float burnAmount = wager * 0.1f;
            float playableAmount = wager - burnAmount;
            
            // 50/50 chance of winning
            bool win = Random.value >= 0.5f;
            
            if (win)
            {
                // Win = 2x wager after burn
                float winnings = playableAmount * 2f;
                EarnCattle(winnings);
                return winnings;
            }
            else
            {
                // Lose = wager lost (already spent)
                return -wager;
            }
        }
        
        return 0f; // No game played
    }

    // Get player stats for sticky note printing
    public string GetPlayerStats()
    {
        return $"Player: {PlayerName}\n" +
               $"Archetype: {SelectedArchetype}\n" +
               $"$CATTLE: {CattleBalance:F2}\n" +
               $"Cattle: {Cattle}\n" +
               $"Potions: {PotionCollection.Count}\n" +
               $"Hay: {Hay}/{BarnCapacity}\n" +
               $"Water: {Water}/{BarnCapacity}";
    }
}
