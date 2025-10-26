# QUICK START GUIDE

## 🚨 EMERGENCY SITUATION?

If your wallet has been compromised with a multicall attack and EIP-7702 delegation:

### IMMEDIATE STEPS:

1. **Navigate to the tool directory:**
   ```bash
   cd d:\evm\Monad-wallet-checker
   ```

2. **Quick setup (first time only):**
   ```bash
   # Windows
   setup.bat
   
   # Or manual setup
   npm install
   npm run build
   ```

3. **Check your wallet status:**
   ```bash
   npm run check -- --address YOUR_WALLET_ADDRESS
   ```

4. **Test cancellation (recommended first):**
   ```bash
   npm run cancel -- --dry-run
   ```

5. **Actually cancel the delegation:**
   ```bash
   npm run cancel
   ```

## 📋 WHAT YOU NEED:

- **Your wallet's private key** (will be prompted securely)
- **Enough ETH for gas fees** (~0.01 ETH should be sufficient)
- **The wallet address** that has the delegation

## 🔧 COMMANDS OVERVIEW:

### Check wallet status:
```bash
# Interactive prompt for address
npm run check

# Specific address
npm run check -- --address 0x1234...

# Custom RPC
npm run check -- --address 0x1234... --rpc https://your-rpc-url
```

### Cancel delegation:
```bash
# Interactive mode (safest)
npm run cancel

# With private key from environment
PRIVATE_KEY=your_key npm run cancel

# Dry run first (recommended)
npm run cancel -- --dry-run

# With custom gas settings
npm run cancel -- --gas-limit 150000 --max-fee 30
```

### Interactive mode:
```bash
npm run dev interactive
```

## ⚠️ SAFETY REMINDERS:

1. **Always test with dry-run first**
2. **Verify wallet address is correct**
3. **Keep private keys secure**
4. **Check gas prices before submitting**
5. **Verify cancellation was successful**

## 🆘 TROUBLESHOOTING:

### "Cannot find module" errors:
```bash
npm install
npm run build
```

### "Insufficient balance" error:
- Add more ETH to your wallet for gas fees
- Try with lower gas settings

### "No delegation found":
- Double-check wallet address
- Verify you're on the correct network

### Gas too high:
```bash
# Use lower gas settings
npm run cancel -- --max-fee 20 --max-priority-fee 2
```

## 📞 GET HELP:

- Read the full README.md for detailed documentation
- Check examples/ folder for code samples
- Report issues on GitHub

## 🎯 SUCCESS INDICATORS:

✅ **Delegation canceled successfully**  
✅ **Transaction hash provided**  
✅ **Verification shows no delegation**  
✅ **Wallet code cleared to empty**

---

**Remember: This tool can save your funds from malicious delegations, but always understand the risks and test carefully before using on mainnet or with large amounts.**