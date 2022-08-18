import React, { useState, useEffect } from "react";
import { useMoralis, useWeb3ExecuteFunction } from "react-moralis";
import { Card, Skeleton, Input, notification, Button } from "antd";
import { BankOutlined, RightSquareOutlined } from "@ant-design/icons";

const { Meta } = Card;

const styles = {
  Offers: {
    display: "flex",
    flexWrap: "wrap",
    WebkitBoxPack: "start",
    justifyContent: "space-between",
    margin: "0 auto",
    maxWidth: "1000px",
    width: "100%",
    gap: "10px",
  },
};

function Contracts() {
  const { Moralis } = useMoralis();
  const [isPending, setIsPending] = useState(false);
  const [acceptedList, setAccepted] = useState();
  const [purchasedList, setPurchased] = useState();
  const [paymentId, setPaymentId] = useState();
  const { account, isAuthenticated } = useMoralis();
  const contractProcessor = useWeb3ExecuteFunction();

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
    console.log(isPending);
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

  const purchase = async function (escrowAddress, paymentId) {
    let options = {
      contractAddress: escrowAddress,
      functionName: "purchase",
      abi: [
        {
          inputs: [
            {
              internalType: "string",
              name: "_paymentId",
              type: "string",
            },
          ],
          name: "purchase",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
      params: { _paymentId: paymentId },
    };
    console.log(escrowAddress);
    console.log(paymentId);
    await contractProcessor.fetch({
      params: options,
      onSuccess: () => {
        handler({
          message: "Offer purchased!",
          description: `Purchased offer ${escrowAddress} with payment id ${paymentId}`,
        });
      },
      onError: (error) => {
        console.log(error);
        handler({
          message: "There was an error",
          description: error.message,
        });
      },
    });
  };

  async function paymentStatus(escrowAddress) {
    let options = {
      contractAddress: escrowAddress,
      functionName: "requestPaymentStatus",
      abi: [
        {
          inputs: [],
          name: "requestPaymentStatus",
          outputs: [
            {
              internalType: "bytes32",
              name: "requestId",
              type: "bytes32",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
      params: {},
    };
    await contractProcessor.fetch({
      params: options,
      onSuccess: () => {
        handler({
          message: "Payment status requested!",
          description: `Payment status requested from Tink Oracle`,
        });
      },
      onError: (error) => {
        handler({
          message: "There was an error",
          description: error.message,
        });
      },
    });
  }
  /*
  const getStatus = async function (escrowAddress) {
    const options = {
      chain: "mumbai",
      address: escrowAddress,
      function_name: "status",
      abi: [
        {
          inputs: [],
          name: "status",
          outputs: [
            {
              internalType: "string",
              name: "",
              type: "string"
            }
          ],
          stateMutability: "view",
          type: "function"
        },
      ],
      params: {},
    };
    setIsPending(true);
    const status = await Moralis.Web3API.native.runContractFunction(options);
    return status;
  };
  */
  async function paymentFulfilled(escrowAddress) {
    let options = {
      contractAddress: escrowAddress,
      functionName: "paymentFulfilled",
      abi: [
        {
          inputs: [],
          name: "paymentFulfilled",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
      ],
      params: {},
    };
    await contractProcessor.fetch({
      params: options,
      onSuccess: () => {
        handler({
          message: "Escrow release requested!",
          description: `Escrow release requested from Smart Contract`,
        });
      },
      onError: (error) => {
        console.log(error);
        handler({
          message: "There was an error",
          description: error.message,
        });
      },
    });
  }

  async function confirmPurchase(paymentId, escrowAddress) {
    if (account && isAuthenticated) {
      await purchase(escrowAddress, paymentId);
    }
  }

  useEffect(() => {
    // import similarly to how tx is imported in transfer from searchbar
    async function fetchAccepted() {
      const Accepted = Moralis.Object.extend("Accepted");
      const query = new Moralis.Query(Accepted);
      const Purchased = Moralis.Object.extend("Purchased");
      const purchased = new Moralis.Query(Purchased);
      query.equalTo("buyer", account);
      query.descending("updatedAt");
      query.doesNotMatchKeyInQuery("offerAddress", "offerAddress", purchased);
      const result = await query.find();
      setAccepted(result);
      console.log(acceptedList);
    }
    fetchAccepted();
  }, []);

  useEffect(() => {
    // import similarly to how tx is imported in transfer from searchbar
    async function fetchPurchased() {
      const Purchased = Moralis.Object.extend("Purchased");
      const query = new Moralis.Query(Purchased);
      const Finished = Moralis.Object.extend("Finished");
      const finished = new Moralis.Query(Finished);
      query.equalTo("buyer", account);
      query.descending("updatedAt");
      query.doesNotMatchKeyInQuery("offerAddress", "offerAddress", finished);
      const result = await query.find();
      setPurchased(result);
      console.log(purchasedList);
    }
    fetchPurchased();
  }, []);

  return (
    <div style={{ display: "flex" }}>
      <div
        style={{
          padding: "15px",
          minWidth: "500px",
          maxWidth: "1030px",
          width: "100%",
          justifyContent: "space-around",
        }}
      >
        <h1>Your Contracts</h1>
        <div style={styles.Offers}>
          <Skeleton loading={!acceptedList}>
            {acceptedList &&
              acceptedList.map((e) => {
                return (
                  <Card
                    title="Accepted"
                    hoverable
                    actions={[
                      <div>
                        <Button onClick={tinkLinkPayment}>Tink Payment</Button>
                        <Input
                          size="large"
                          style={{ width: "30%" }}
                          prefix={<BankOutlined />}
                          onChange={(e) => {
                            setPaymentId(`${e.target.value}`);
                            console.log(paymentId);
                          }}
                        ></Input>
                        <Button
                          onClick={() => {
                            paymentId === ""
                              ? alert("Paste the payment id.")
                              : confirmPurchase(
                                  paymentId,
                                  e.attributes.offerAddress,
                                );
                          }}
                        >
                          <RightSquareOutlined />
                        </Button>
                      </div>,
                    ]}
                    style={{
                      justifyContent: "flex-start",
                      width: "100%",
                      border: "4px solid #e7eaf3",
                    }}
                  >
                    <Meta
                      title={"Offer"}
                      description={String(e.attributes.offer / 10 ** 18)}
                    />
                    <Meta
                      title={"Price"}
                      description={`${e.attributes.fiat} ${e.attributes.currency}`}
                    />
                    <Meta title={"Seller"} description={e.attributes.seller} />
                  </Card>
                );
              })}
          </Skeleton>
        </div>
        <div>
          <Skeleton loading={!purchasedList}>
            {purchasedList &&
              purchasedList.map((e) => {
                return (
                  <Card
                    title="Purchased"
                    hoverable
                    actions={[
                      <div>
                        <Button
                          onClick={() => {
                            paymentStatus(e.attributes.offerAddress);
                          }}
                        >
                          Confirm Payment
                          <RightSquareOutlined />
                        </Button>
                        <Button
                          onClick={() => {
                            paymentFulfilled(e.attributes.offerAddress);
                          }}
                        >
                          Release Escrow
                          <RightSquareOutlined />
                        </Button>
                      </div>,
                    ]}
                    style={{
                      justifyContent: "flex-start",
                      width: "100%",
                      border: "4px solid #e7eaf3",
                    }}
                  >
                    <Meta
                      title={"Offer"}
                      description={String(e.attributes.offer / 10 ** 18)}
                    />
                    <Meta
                      title={"Price"}
                      description={`${e.attributes.fiat} ${e.attributes.currency}`}
                    />
                    <Meta title={"Seller"} description={e.attributes.seller} />
                  </Card>
                );
              })}
          </Skeleton>
        </div>
      </div>
      <div style={{ padding: "15px", maxWidth: "1030px", width: "100%" }}>
        <h1>Your Offers</h1>
        <div style={styles.Offers}>
          <Skeleton loading={!acceptedList}>
            {acceptedList &&
              acceptedList.map((e) => {
                return (
                  <Card
                    title="Listed"
                    hoverable
                    actions={[
                      <div>
                        <Input
                          size="large"
                          style={{ width: "30%" }}
                          prefix={<BankOutlined />}
                          onChange={(e) => {
                            setPaymentId(`${e.target.value}`);
                            console.log(paymentId);
                          }}
                        ></Input>
                        <Button
                          onClick={() => {
                            paymentId === ""
                              ? alert("Paste the payment id.")
                              : confirmPurchase(
                                  paymentId,
                                  e.attributes.offerAddress,
                                );
                          }}
                        >
                          <RightSquareOutlined />
                        </Button>
                      </div>,
                    ]}
                    style={{
                      justifyContent: "flex-start",
                      width: "100%",
                      border: "4px solid #e7eaf3",
                    }}
                  >
                    <Meta
                      title={"Offer"}
                      description={String(e.attributes.offer / 10 ** 18)}
                    />
                    <Meta
                      title={"Price"}
                      description={`${e.attributes.fiat} ${e.attributes.currency}`}
                    />
                    <Meta title={"Seller"} description={e.attributes.seller} />
                  </Card>
                );
              })}
          </Skeleton>
        </div>
        <div>
          <Skeleton loading={!purchasedList}>
            {purchasedList &&
              purchasedList.map((e) => {
                return (
                  <Card
                    title="Sold"
                    hoverable
                    actions={[
                      <div>
                        <Button
                          onClick={() => {
                            paymentStatus(e.attributes.offerAddress);
                          }}
                        >
                          <RightSquareOutlined />
                        </Button>
                      </div>,
                    ]}
                    style={{
                      justifyContent: "flex-start",
                      width: "100%",
                      border: "4px solid #e7eaf3",
                    }}
                  >
                    <Meta
                      title={"Offer"}
                      description={String(e.attributes.offer / 10 ** 18)}
                    />
                    <Meta
                      title={"Price"}
                      description={`${e.attributes.fiat} ${e.attributes.currency}`}
                    />
                    <Meta title={"Seller"} description={e.attributes.seller} />
                  </Card>
                );
              })}
          </Skeleton>
        </div>
      </div>
    </div>
  );
}

export default Contracts;
