import Escrow from "./components/Escrow";
import NativeBalance from "../NativeBalance";
import Address from "../Address/Address";
import Blockie from "../Blockie";
import { Button, Card } from "antd";
import AccountVerification from "./components/AccountVerification";

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

async function initiateTink() {
  // could possibly be chained with a accountId = await tinkAccountReport() callback
  const clientId = "b406af283f1f4ce3906dce1b730b4aea"; // needs to be topup
  const service = "account-check";
  const callback = "https://console.tink.com/callback";
  //const market = "SE";
  const locale = "en_US";
  //const inputProvider = "se-demobank-open-banking-redirect";

  //Returns url to end user for authentication
  const url = `https://link.tink.com/1.0/${service}?client_id=${clientId}&redirect_uri=${callback}&locale=${locale}&test=true`;
  window.open(url);
}

function Wallet() {
  return (
    <Card
      style={styles.card}
      title={
        <div style={styles.header}>
          <Blockie scale={5} avatar currentWallet style />
          <Address size="6" copyable />
          <NativeBalance />
          <Button onClick={initiateTink}>Verify account</Button>
          <AccountVerification />
        </div>
      }
    >
      <Escrow />
    </Card>
  );
}

export default Wallet;
