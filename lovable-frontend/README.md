# Monad Security Monitor Frontend

A React-based security monitoring dashboard for detecting EIP-7702 delegation attacks on Monad testnet.

## 🛡️ Features

- **Real-time Threat Detection**: Monitor Monad testnet for delegation attacks
- **Wallet Security Scanner**: Check any address for security threats
- **No Wallet Connection Required**: Scan addresses without connecting wallets
- **Community Protection**: Shared threat intelligence database
- **Mobile Responsive**: Works on all devices

## 🚀 Quick Start

### Development

```bash
npm install
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview
```

## 🔧 Environment Variables

Create a `.env` file:

```
VITE_API_URL=https://your-backend-api.onrender.com
```

## 📱 Deployment to Lovable

This project is optimized for deployment on [Lovable.dev](https://lovable.dev):

1. **Connect GitHub Repository** to Lovable
2. **Set Environment Variables** in Lovable dashboard
3. **Deploy Automatically** via GitHub integration

See `DEPLOY-TO-LOVABLE.md` for detailed instructions.

## 🔒 Security Features

- **EIP-7702 Delegation Detection**: Identifies dangerous wallet delegations
- **Known Threat Database**: Pre-loaded with malicious contracts
- **Real-time Monitoring**: WebSocket alerts for new threats
- **Attack Pattern Recognition**: Detects NFT verification scam style attacks

## 🧪 Test Cases

The app includes quick test buttons for:
- `0x275b2f6aF83f99C40FDaBf5bc6b22E1B6C3F75B7` - Known attacker wallet
- `0xee224caafbc78cc9a208bd22f8e7362b76eef4fa` - Malicious delegation contract

## 🛠️ Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **WebSocket** for real-time updates

## 📊 Project Structure

```
src/
├── App.tsx          # Main security monitor component
├── main.tsx         # React app entry point
└── index.css        # Tailwind CSS styles
public/
└── shield.svg       # Security icon
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - Built by the Monad Security Community

---

**Protecting the Monad community from EIP-7702 delegation attacks** 🛡️