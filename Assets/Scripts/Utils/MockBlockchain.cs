using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System;

// This class simulates blockchain interactions for the MVP
// It will be replaced with actual Solana blockchain integration in the future
public class MockBlockchain : MonoBehaviour
{
    private static MockBlockchain _instance;
    public static MockBlockchain Instance
    {
        get
        {
            if (_instance == null)
            {
                GameObject obj = new GameObject("MockBlockchain");
                _instance = obj.AddComponent<MockBlockchain>();
                DontDestroyOnLoad(obj);
            }
            return _instance;
        }
    }

    // Mock wallet address
    public string WalletAddress { get; private set; } = "Abc123...XYZ";
    
    // Mock transaction history
    private List<MockTransaction> transactionHistory = new List<MockTransaction>();
    
    // Mock NFT collection (MPL-404 tokens)
    private List<MockNFT> nftCollection = new List<MockNFT>();

    private void Awake()
    {
        if (_instance == null)
        {
            _instance = this;
            DontDestroyOnLoad(gameObject);
            
            // Generate a random wallet address for this session
            WalletAddress = GenerateRandomWalletAddress();
        }
        else if (_instance != this)
        {
            Destroy(gameObject);
        }
    }

    // Simulate minting an NFT on the blockchain
    public MockNFT MintNFT(string name, string metadataJson)
    {
        // Generate a mock NFT with a unique token ID
        string tokenId = GenerateRandomTokenId();
        
        // Create the NFT object
        MockNFT nft = new MockNFT
        {
            TokenId = tokenId,
            Name = name,
            Metadata = metadataJson,
            Owner = WalletAddress,
            MintTimestamp = DateTime.Now
        };
        
        // Add to collection
        nftCollection.Add(nft);
        
        // Add mint transaction to history
        RecordTransaction("mint", tokenId, 0);
        
        return nft;
    }

    // Simulate burning tokens
    public bool BurnTokens(float amount, string reason)
    {
        // In a real implementation, this would interact with the blockchain
        // For now, just record the transaction
        RecordTransaction("burn", reason, amount);
        
        return true;
    }

    // Simulate transferring tokens
    public bool TransferTokens(string toAddress, float amount, string memo)
    {
        // In a real implementation, this would interact with the blockchain
        // For now, just record the transaction
        RecordTransaction("transfer", toAddress, amount, memo);
        
        return true;
    }

    // Record a transaction in the mock history
    private void RecordTransaction(string type, string target, float amount, string memo = "")
    {
        MockTransaction transaction = new MockTransaction
        {
            Timestamp = DateTime.Now,
            Type = type,
            Amount = amount,
            From = WalletAddress,
            To = target,
            Memo = memo,
            TransactionId = GenerateRandomTransactionId()
        };
        
        transactionHistory.Add(transaction);
        
        // Log transaction for debugging
        Debug.Log($"Transaction: {transaction.Type} | Amount: {transaction.Amount} | Target: {transaction.To}");
    }

    // Get all transactions from history
    public List<MockTransaction> GetTransactionHistory()
    {
        return new List<MockTransaction>(transactionHistory);
    }

    // Get all NFTs owned by the player
    public List<MockNFT> GetNFTCollection()
    {
        return new List<MockNFT>(nftCollection);
    }

    // Generate a random Solana-like wallet address
    private string GenerateRandomWalletAddress()
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        char[] addressChars = new char[32];
        
        for (int i = 0; i < addressChars.Length; i++)
        {
            addressChars[i] = chars[UnityEngine.Random.Range(0, chars.Length)];
        }
        
        return new string(addressChars);
    }

    // Generate a random token ID
    private string GenerateRandomTokenId()
    {
        return Guid.NewGuid().ToString();
    }

    // Generate a random transaction ID
    private string GenerateRandomTransactionId()
    {
        return Guid.NewGuid().ToString();
    }

    // Mock transaction class
    public class MockTransaction
    {
        public DateTime Timestamp { get; set; }
        public string Type { get; set; } // mint, burn, transfer
        public float Amount { get; set; }
        public string From { get; set; }
        public string To { get; set; }
        public string Memo { get; set; }
        public string TransactionId { get; set; }
    }

    // Mock NFT class
    public class MockNFT
    {
        public string TokenId { get; set; }
        public string Name { get; set; }
        public string Metadata { get; set; }
        public string Owner { get; set; }
        public DateTime MintTimestamp { get; set; }
    }
}
