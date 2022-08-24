import Escrow from "./components/Escrow";
import NativeBalance from "../NativeBalance";
import Address from "../Address/Address";
import Blockie from "../Blockie";
import { Button, Card } from "antd";
import AccountVerification from "./components/AccountVerification";
import MarketSelector from "./components/MarketSelector";
import { useState } from "react";

function Wallet() {
  const [market, setMarket] = useState();

  const styles = {
    title: {
      fontSize: "30px",
      fontWeight: "600",
    },
    header: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "5px",
    },
    card: {
      boxShadow: "0 0.5rem 1.2rem rgb(189 197 209 / 20%)",
      border: "1px solid #e7eaf3",
      borderRadius: "1rem",
      width: "450px",
      fontSize: "16px",
      fontWeight: "500",
    },
  };

  const initiateTink = async function (market) {
    // could possibly be chained with a accountId = await tinkAccountReport() callback
    const clientId = "b406af283f1f4ce3906dce1b730b4aea"; // needs to be topup
    const service = "account-check";
    const callback = "https://console.tink.com/callback";
    const locale = "en_US";
    //const inputProvider = "se-demobank-open-banking-redirect"; needs a market input

    //Returns url to end user for authentication
    const url = `https://link.tink.com/1.0/${service}?client_id=${clientId}&redirect_uri=${callback}&locale=${locale}&market=${market}&test=true`;
    window.open(url);
  };
  // Eventually merge initiateTink with AccountVerification

  return (
    <Card
      style={styles.card}
      title={
        <div style={styles.header}>
          <Blockie scale={5} avatar currentWallet style />
          <Address size="6" copyable />
          <NativeBalance />
          <div>
            <MarketSelector setMarket={setMarket} style={{ width: "50%" }} />
            <Button
              type="primary"
              size="large"
              onClick={() => initiateTink(market.name)}
              disabled={!market}
            >
              Verify account
            </Button>
          </div>
          <AccountVerification />
        </div>
      }
    >
      <Escrow />
    </Card>
  );
}

export default Wallet;
