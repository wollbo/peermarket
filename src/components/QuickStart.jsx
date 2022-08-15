import { Button, Card, Timeline, Typography } from "antd";
import React from "react";
//import { useMoralis } from "react-moralis";

const { Text } = Typography;

const styles = {
  title: {
    fontSize: "20px",
    fontWeight: "700",
  },
  text: {
    fontSize: "16px",
  },
  card: {
    boxShadow: "0 0.5rem 1.2rem rgb(189 197 209 / 20%)",
    border: "1px solid #e7eaf3",
    borderRadius: "0.5rem",
  },
  timeline: {
    marginBottom: "-45px",
  },
};

async function sendTinkRequest() {
  alert("Request sent");
  //const recipient = "SE2023668362587681437762";
  const baseUrl = "/payment/create"; // has been set as proxy
  const data = {
    //client_id: "68af8742e51a417d8e492fc72a058a7a",
    //client_secret: "4b7ffb599d964197b66d6ef0c301050e",
    market: "SE",
    currency: "SEK",
    amount: "1000",
  };
  const response = await fetch(baseUrl, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const responseData = await response.json();
  console.log(responseData);
  return responseData.id;
}

async function initiateTink(paymentRequestId) {
  // this works
  // args clientId, paymentRequestId
  const clientId = "68af8742e51a417d8e492fc72a058a7a";
  const service = "pay";
  const callback = "https://console.tink.com/callback";
  const market = "SE";
  const locale = "en_US";
  const inputProvider = "se-demobank-open-banking-redirect";

  //Returns url to end user for authentication
  const url = `https://link.tink.com/1.0/${service}?client_id=${clientId}&redirect_uri=${callback}&market=${market}&locale=${locale}&input_provider=${inputProvider}&payment_request_id=${paymentRequestId}`;
  window.open(url);
}

async function tinkLinkPayment() {
  const paymentId = await sendTinkRequest();
  initiateTink(paymentId);
}

export default function QuickStart() {
  //const { Moralis } = useMoralis();

  return (
    <div style={{ display: "flex", gap: "10px" }}>
      <Card
        style={styles.card}
        title={
          <>
            📒 <Text strong>Buyer Credentials</Text>
          </>
        }
      >
        <Timeline mode="left" style={styles.timeline}>
          <Timeline.Item dot="🇸🇪">
            <Text code style={styles.text}>
              SE: u58697449 / rjg121
            </Text>
          </Timeline.Item>

          <Timeline.Item dot="🇫🇮">
            <Text code style={styles.text}>
              FI: u06516046 / kam413
            </Text>
          </Timeline.Item>
        </Timeline>
      </Card>
      <Button onClick={tinkLinkPayment}>Tink Payment</Button>
      <div>
        <Card
          style={styles.card}
          title={
            <>
              📒 <Text strong>Seller Credentials</Text>
            </>
          }
        >
          <Timeline mode="left" style={styles.timeline}>
            <Timeline.Item dot="🇸🇪">
              <Text code style={styles.text}>
                SE: u27678322 / vrh343
              </Text>
            </Timeline.Item>
            <Timeline.Item dot="🇫🇮">
              <Text code style={styles.text}>
                FI: u80628915 / puv375
              </Text>
            </Timeline.Item>
          </Timeline>
        </Card>
        <Card
          style={{ marginTop: "10px", ...styles.card }}
          title={
            <>
              📡{" "}
              <Text strong> Connecting your Local Chain to the Moralis DB</Text>
            </>
          }
        >
          <Timeline mode="left" style={styles.timeline}>
            <Timeline.Item dot="💿">
              <Text style={styles.text}>
                Download{" "}
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://github.com/fatedier/frp/releases"
                >
                  frpc
                </a>{" "}
                and provide missing params in the <Text code>.env</Text> file
              </Text>
            </Timeline.Item>
            <Timeline.Item dot="⚙️">
              <Text style={styles.text}>
                Connect your Moralis Database and Local Chain:{" "}
                <Text code>npm run connect</Text>
              </Text>
            </Timeline.Item>
            <Timeline.Item dot="💾">
              <Text style={styles.text}>
                Add contract events you want to watch:{" "}
                <Text code>npm run watch:events</Text>
              </Text>
            </Timeline.Item>
          </Timeline>
        </Card>
      </div>
    </div>
  );
}
