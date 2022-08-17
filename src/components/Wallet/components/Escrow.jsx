import {
  WalletOutlined,
  CreditCardOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { Button, Input, Timeline, notification } from "antd";
import Text from "antd/lib/typography/Text";
import { useEffect, useState } from "react";
import { useMoralis, useWeb3ExecuteFunction } from "react-moralis";
// Edited version of Transfer
const styles = {
  card: {
    alignItems: "center",
    width: "100%",
  },
  header: {
    textAlign: "center",
  },
  input: {
    width: "100%",
    outline: "none",
    fontSize: "16px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textverflow: "ellipsis",
    appearance: "textfield",
    color: "#041836",
    fontWeight: "700",
    border: "none",
    backgroundColor: "transparent",
  },
  select: {
    marginTop: "20px",
    display: "flex",
    alignItems: "center",
  },
  textWrapper: { maxWidth: "80px", width: "100%" },
  row: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexDirection: "row",
  },
  timeline: {
    marginTop: "20px",
    marginBottom: "-45px",
  },
};

function Escrow() {
  const { Moralis } = useMoralis();
  const [tx, setTx] = useState();
  const [amount, setAmount] = useState();
  const [fiat, setFiat] = useState();
  const [currency, setCurrency] = useState();
  const { account, isAuthenticated } = useMoralis();
  const [accountReport, setAccountReport] = useState();
  const [isPending, setIsPending] = useState(false);
  const contractProcessor = useWeb3ExecuteFunction();
  const peerMarketAddress = "0xD14155F9C414E0A6c49F3DDAf6C193E85c1685Fe";
  /*const flags = [ TODO: map market dot to flag
    {
      AT: "🇦🇹",
      EE: "🇪🇪",
      FI: "🇫🇮",
      FR: "🇫🇷",
      DE: "🇩🇪",
      IT: "🇮🇹",
      NL: "🇳🇱",
      NO: "🇳🇴",
      PT: "🇵🇹",
      ES: "🇪🇸",
      SE: "🇸🇪",
      UK: "🇬🇧",
    },
  ];*/

  useEffect(() => {
    amount && currency && fiat ? setTx({ amount, currency, fiat }) : setTx();
    console.log(tx);
  }, [amount, currency, fiat]);

  useEffect(() => {
    async function fetchAccounts() {
      const Accounts = Moralis.Object.extend("Account");
      const query = new Moralis.Query(Accounts);
      query.equalTo("address", account);
      query.descending("created");
      const result = await query.find();
      console.log(result);
      setAccountReport(result[0]);
      setCurrency(accountReport.attributes.currency);
    }

    fetchAccounts();
  }, [isAuthenticated]);

  const handler = ({ message, description }) => {
    notification.open({
      placement: "bottomRight",
      message,
      description,
      onClick: () => {
        console.log("Notification Clicked!");
      },
    });
    setIsPending(false);
  };

  const createOffer = async function (peerMarket, _offer, _currency, _fiat) {
    let options = {
      contractAddress: peerMarket,
      functionName: "newOffer",
      abi: [
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_offer",
              type: "uint256",
            },
            {
              internalType: "string",
              name: "_fiat",
              type: "string",
            },
            {
              internalType: "string",
              name: "_currency",
              type: "string",
            },
          ],
          name: "newOffer",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "payable",
          type: "function",
        },
      ],
      params: {
        _offer,
        _currency,
        _fiat,
      },
      msgValue: _offer,
    };
    console.log(peerMarket);
    console.log(_offer);
    console.log(_currency);
    console.log(_fiat);
    setIsPending(true);
    await contractProcessor.fetch({
      params: options,
      onSuccess: () => {
        handler({
          message: "Offer created!",
          description: `Listed ${_offer} MATIC for ${_fiat} ${_currency}`,
        });
      },
      onError: (error) => {
        handler({
          message: "There was an error",
          description: error.message,
        });
      },
    });
  };

  if (account && isAuthenticated && accountReport) {
    return (
      <div style={styles.card}>
        <div style={styles.tranfer}>
          <div style={styles.header}>
            <h3>Verified account</h3>
          </div>
          <div style={styles.timeline}>
            <Timeline mode="left" style={styles.timeline}>
              <Timeline.Item dot="🏦">
                <Text code style={styles.text}>
                  IBAN: {accountReport.attributes.iban}
                </Text>
              </Timeline.Item>
              <Timeline.Item dot="💱">
                <Text code style={styles.text}>
                  Currency: {accountReport.attributes.currency}
                </Text>
              </Timeline.Item>
              <Timeline.Item dot="🚩">
                <Text code style={styles.text}>
                  Market: {accountReport.attributes.market}
                </Text>
              </Timeline.Item>
            </Timeline>
          </div>
          <div style={styles.header}>
            <h3>New listing</h3>
          </div>
          <div style={styles.select}>
            <div style={styles.textWrapper}>
              <Text strong>Amount:</Text>
            </div>
            <Input
              size="large"
              prefix={<WalletOutlined />}
              onChange={(e) => {
                setAmount(`${e.target.value}`);
              }}
            />
          </div>
          <div style={styles.select}>
            <div style={styles.textWrapper}>
              <Text strong>Fiat:</Text>
            </div>
            <Input
              size="large"
              prefix={<CreditCardOutlined />}
              onChange={(e) => {
                setFiat(`${e.target.value}`);
              }}
            />
          </div>
          <Button
            type="primary"
            size="large"
            loading={isPending}
            style={{ width: "100%", marginTop: "25px" }}
            onClick={() =>
              createOffer(
                peerMarketAddress,
                String(amount * 10 ** 18),
                currency,
                fiat,
              )
            }
            disabled={!tx}
          >
            Create
          </Button>
        </div>
      </div>
    );
  }
  {
    !(account || isAuthenticated);
    return <QuestionCircleOutlined />;
  }
}

export default Escrow;
