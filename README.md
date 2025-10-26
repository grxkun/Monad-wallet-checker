# Monad Wallet Checker

A comprehensive tool to detect and cancel malicious EIP-7702 delegations on Monad testnet. This tool helps protect your wallet from multicall attacks and unauthorized delegations.

## 🚨 Emergency Use Case

If your wallet has been compromised by a multicall attack with EIP-7702 delegation:

1. **Immediate Action**: Run `npm run cancel` to cancel the delegation
2. **Safety First**: Use dry-run mode first to test: `npm run cancel -- --dry-run`
3. **Verify**: Check the cancellation was successful with `npm run check`

## Features

- ✅ **Delegation Detection**: Scan wallets for active EIP-7702 delegations
- ❌ **Delegation Cancellation**: Cancel malicious delegations safely
- 🛡️ **Safety Checks**: Comprehensive pre-transaction validation
- 🔍 **Risk Assessment**: Analyze delegation risk levels
- 💻 **Interactive CLI**: User-friendly command-line interface
- 🧪 **Dry Run Mode**: Test transactions without sending them

## Installation

### Quick Setup

```bash
# Clone the repository
git clone https://github.com/grxkun/Monad-wallet-checker.git
cd Monad-wallet-checker

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your details (optional)
nano .env

# Build the project
npm run build
```

### Environment Configuration

Create a `.env` file with your settings:

```env
# Monad testnet RPC (default provided)
MONAD_RPC_URL=https://testnet1.monad.xyz

# Your wallet details (optional, can be provided via CLI)
PRIVATE_KEY=your_private_key_here
WALLET_ADDRESS=your_wallet_address_here

# Custom gas settings (optional)
MAX_FEE_PER_GAS=20
MAX_PRIORITY_FEE_PER_GAS=2
GAS_LIMIT=100000
```

## Usage

### Command Line Interface

#### Check Wallet Status
```bash
# Check specific wallet
npm run check -- --address 0x1234...

# Interactive mode
npm run dev check

# With custom RPC
npm run check -- --address 0x1234... --rpc https://your-rpc-url
```

#### Cancel Delegation
```bash
# Cancel with private key from .env
npm run cancel

# Cancel with manual private key input
npm run cancel -- --private-key your_key

# Dry run (simulate only)
npm run cancel -- --dry-run

# With custom gas settings
npm run cancel -- --gas-limit 150000 --max-fee 30 --max-priority-fee 3
```

#### Interactive Mode
```bash
# Full interactive experience
npm run dev interactive
```

### Programmatic Usage

```typescript
import { MonadWalletChecker } from 'monad-wallet-checker';

const checker = new MonadWalletChecker('https://testnet1.monad.xyz');

// Check wallet status
const status = await checker.checkWallet('0x1234...');
console.log('Is delegated:', status.delegation.isDelegated);
console.log('Risk level:', status.delegation.riskLevel);

// Cancel delegation
if (status.delegation.isDelegated) {
  const result = await checker.cancelDelegation('your_private_key', {
    dryRun: true // Test first
  });
  
  if (result.success) {
    // Actually cancel
    await checker.cancelDelegation('your_private_key');
  }
}
```

## Understanding EIP-7702 Delegations

### What is EIP-7702?
EIP-7702 allows Externally Owned Accounts (EOAs) to temporarily set code in their account, enabling features like:
- Transaction batching
- Sponsored transactions
- Advanced wallet functionality

### The Risk
Malicious actors can exploit this by:
1. Tricking users into signing delegation authorizations
2. Setting malicious contract code in the user's wallet
3. Gaining complete control over the wallet's funds

### How This Tool Helps
This tool detects active delegations and allows you to:
- **Cancel** malicious delegations by setting delegation to zero address
- **Verify** the cancellation was successful
- **Assess** risk levels of current delegations

## Safety Guidelines

### 🚨 Before Using This Tool
- **Backup your private key** securely
- **Verify the tool source code** (it's open source)
- **Test with small amounts** first if possible
- **Understand the risks** of delegation cancellation

### ✅ Best Practices
- Always use **dry-run mode** first
- **Double-check wallet addresses** before operations
- **Monitor gas prices** to avoid overpaying
- **Verify cancellation** after the transaction

### ⚠️ Warning Signs
Cancel delegation immediately if you see:
- Unexpected balance changes
- Transactions you didn't initiate
- Unknown delegation addresses
- High-risk assessments from this tool

## Technical Details

### EIP-7702 Cancellation Process
1. **Create Authorization**: Sign an authorization tuple with zero address
2. **Build Transaction**: Construct EIP-7702 transaction with cancellation data
3. **Submit**: Send transaction to clear the delegation indicator
4. **Verify**: Confirm the account code is reset to empty

### Transaction Structure
```typescript
{
  type: 0x04,  // EIP-7702 transaction type
  authorizationList: [[
    chainId,
    '0x0000000000000000000000000000000000000000', // Zero address
    nonce,
    yParity,
    r,
    s
  ]]
}
```

### Gas Considerations
- **Base Cost**: ~25,000 gas for delegation operations
- **Network Fees**: Variable based on Monad testnet congestion
- **Safety Buffer**: Tool includes 20% gas buffer by default

## Troubleshooting

### Common Issues

#### "No delegation found"
- Wallet may not have active delegation
- Check wallet address is correct
- Verify network connection

#### "Insufficient balance"
- Add more ETH for gas fees
- Try with lower gas settings
- Check current gas prices

#### "Transaction failed"
- Network congestion may cause failures
- Try increasing gas limit/price
- Verify wallet has no pending transactions

#### "Invalid private key"
- Check private key format (with/without 0x prefix)
- Ensure key corresponds to the target wallet
- Verify key is not corrupted

### Getting Help
1. Check the error message details
2. Try dry-run mode first
3. Verify network connectivity
4. Review safety guidelines
5. Open an issue on GitHub if problems persist

## Development

### Building from Source
```bash
# Install dependencies
npm install

# Run development mode
npm run dev

# Build for production
npm run build

# Run built version
npm start
```

### Testing
```bash
# Type checking
npx tsc --noEmit

# Run with debugging
DEBUG=true npm run dev
```

## Security

### Private Key Handling
- Keys are **never stored** by this tool
- Input is **masked** in CLI prompts
- Use environment variables for automation
- Consider hardware wallets for large amounts

### Code Verification
- **Open source**: Review all code on GitHub
- **No network calls** except to specified RPC
- **No telemetry** or tracking
- **Minimal dependencies** to reduce attack surface

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Disclaimer

This tool is provided as-is for educational and security purposes. Users are responsible for:
- Understanding the risks of EIP-7702 delegations
- Verifying the tool's behavior before use
- Securing their private keys properly
- Testing with small amounts first

The authors are not responsible for any loss of funds or damages resulting from the use of this tool.

---

**⚡ Built for Monad Testnet Security**

If this tool helped save your funds, consider starring the repository and sharing it with others who might need it!