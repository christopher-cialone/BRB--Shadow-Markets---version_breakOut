using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Cattle
{
    // Unique identifier
    public int Id { get; private set; }
    
    // Traits
    public int Speed { get; private set; }
    public int Milk { get; private set; }
    
    // Constructor
    public Cattle(int id, int speed, int milk)
    {
        Id = id;
        Speed = speed;
        Milk = milk;
    }
    
    // Return a string representation of the cattle
    public override string ToString()
    {
        return $"Cattle #{Id}: Speed {Speed}, Milk {Milk}";
    }
    
    // Simulate a mock MPL-404 NFT entity
    public string GetMockNFTData()
    {
        // This is a mock representation of what would be a Solana NFT
        return $"{{\"name\":\"Cattle #{Id}\",\"symbol\":\"CATTLE\",\"description\":\"A virtual cattle on the Solana blockchain\",\"attributes\":[{{\"trait_type\":\"Speed\",\"value\":{Speed}}},{{\"trait_type\":\"Milk\",\"value\":{Milk}}}]}}";
    }
}
