from seahorse import Program, Account, Pubkey, invoke, AccountMeta

# Placeholder for MPL-404 program ID (replace with actual ID from Metaplex docs)
MPL_404_PROGRAM_ID = Pubkey.from_string("MPL4...")  # Replace with the actual program ID

def mint_token(authority: Account, token_account: Account, mint: Account):
    """
    Mints an MPL-404 token when a player achieves a milestone.
    
    Args:
        authority (Account): The game authority account (signer).
        token_account (Account): The token account to receive the minted token.
        mint (Account): The mint account for the token.
    """
    # Game logic: Verify the player's milestone (customize this based on BRB rules)
    if not some_game_condition_met():
        raise Exception("Milestone condition not met")

    # Prepare the instruction data for the MPL-404 mint instruction
    # Replace with the actual data format required by MPL-404 (e.g., token amount, metadata)
    instruction_data = bytes([0] * 8)  # Placeholder; update with correct data

    # Define the accounts required for the MPL-404 mint instruction
    accounts = [
        AccountMeta(authority.pubkey, is_signer=True, is_writable=True),
        AccountMeta(token_account.pubkey, is_signer=False, is_writable=True),
        AccountMeta(mint.pubkey, is_signer=False, is_writable=True),
        # Add additional accounts as required by MPL-404 (e.g., metadata account)
    ]

    # Invoke the MPL-404 mint instruction via CPI
    invoke(
        program_id=MPL_404_PROGRAM_ID,
        accounts=accounts,
        data=instruction_data,
    )

    print("MPL-404 token minted successfully!")

def some_game_condition_met():
    # Placeholder for BRB game logic (e.g., player completed a task)
    return True  # Replace with actual condition check