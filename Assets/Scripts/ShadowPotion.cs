using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ShadowPotion
{
    // Unique identifier
    public int Id { get; private set; }
    
    // Traits
    public int Potency { get; private set; }
    
    // Constructor
    public ShadowPotion(int id, int potency)
    {
        Id = id;
        Potency = potency;
    }
    
    // Return a string representation of the potion
    public override string ToString()
    {
        return $"Shadow Potion #{Id}: Potency {Potency}";
    }
    
    // Simulate a mock MPL-404 NFT entity
    public string GetMockNFTData()
    {
        // This is a mock representation of what would be a Solana NFT
        return $"{{\"name\":\"Shadow Potion #{Id}\",\"symbol\":\"POTION\",\"description\":\"A magical shadow potion from the Ether Range\",\"attributes\":[{{\"trait_type\":\"Potency\",\"value\":{Potency}}}]}}";
    }
}
