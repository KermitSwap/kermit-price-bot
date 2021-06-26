require("dotenv").config();

const SolanaWeb3 = require("@solana/web3.js");
const Serum = require("@project-serum/serum");
const Discord = require("discord.js");
const token = process.env.DISCORD_TOKEN;

async function getMarketPriceSerum() {
  try {
    let connection = new SolanaWeb3.Connection(
      "https://api.mainnet-beta.solana.com"
    );
    let marketAddress = new SolanaWeb3.PublicKey(
      "EmyoFKQQyALv7mMDL681vV5oanPsLhFggvgJh5gE29vn"
    );
    let programId = new SolanaWeb3.PublicKey(
      "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin"
    );
    let market = await Serum.Market.load(
      connection,
      marketAddress,
      {},
      programId
    );

    // Fetching orderbooks
    let bids = await market.loadBids(connection);
    let asks = await market.loadAsks(connection);
    let trades = await market.loadFills(connection);
    let bb = bids.getL2(20).length > 0 && Number(bids.getL2(20)[0][0]);
    let ba = asks.getL2(20).length > 0 && Number(asks.getL2(20)[0][0]);
    let last = trades && trades.length > 0 && trades[0].price;
    let markPrice =
      bb && ba
        ? last
          ? [bb, ba, last].sort((a, b) => a - b)[1]
          : (bb + ba) / 2
        : null;
    return markPrice;
  } catch (error) {
    console.error(error);
  }
}

const client = new Discord.Client();
let value;
client.on("ready", () => {
  setInterval(() => {
    getMarketPriceSerum().then((v) => {
      value = v.toString();
      console.log("up and running");
      client.user
        .setPresence({
          activity: { name: `1 KERMIT = ${value} USD` },
          status: "available",
        })
        .then(console.log)
        .catch(console.error);
    });
  }, 150000);
});

client.login(token);
