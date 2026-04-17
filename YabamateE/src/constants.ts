export const WYDA_CONTRACT_ADDRESS = "0xD84B7E8b295d9Fa9656527AC33Bf4F683aE7d2C4";

export const WYDA_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint amount)"
];

export const MOCK_CREATORS = [
  {
    id: "1",
    name: "CryptoArtist",
    handle: "@crypto_art",
    description: "Creating unique digital landscapes and abstract 3D animations.",
    avatar: "https://picsum.photos/seed/artist1/200/200",
    cover: "https://picsum.photos/seed/cover1/1200/400",
    subscribers: 1240,
    tiers: [
      { name: "Supporter", price: 10, perks: ["Early access to art", "Discord role"] },
      { name: "Collector", price: 50, perks: ["Monthly high-res print", "Behind the scenes"] },
      { name: "Patron", price: 200, perks: ["1-on-1 consultation", "Custom NFT"] }
    ]
  },
  {
    id: "2",
    name: "Web3 Dev Guru",
    handle: "@web3_guru",
    description: "Deep dives into smart contract security and dApp architecture.",
    avatar: "https://picsum.photos/seed/artist2/200/200",
    cover: "https://picsum.photos/seed/cover2/1200/400",
    subscribers: 850,
    tiers: [
      { name: "Student", price: 5, perks: ["Weekly newsletter", "Code snippets"] },
      { name: "Developer", price: 25, perks: ["Private repo access", "Q&A sessions"] },
      { name: "Architect", price: 100, perks: ["Project review", "Direct DM access"] }
    ]
  }
];
