# ionx-ccip v1.0
IONX on ChainLink CCIP

Part of the Charged Particles Protocol
<https://charged.fi>

## Deploy Steps:

- nvm use
- yarn
- yarn deploy sepolia
- yarn deploy modeSepolia
- yarn setup sepolia
- yarn setup modeSepolia

## Test Bridge:
### Sepolia -> Mode-Sepolia
- yarn test-bridge sepolia
- ref: https://ccip.chain.link/tx/0xb960b33043e70609cfd9db560e2f782889aee8c34121040201bff396c09947b5

### Mode-Sepolia -> Sepolia
- yarn test-bridge modeSepolia
- ref: https://ccip.chain.link/tx/0x2d4aaeb32bb0437f4488bc5937b70494c5281c9c77f2f25ec9a762a6b0645e28
