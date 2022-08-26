import React, { useState, useEffect } from "react";
import { useMoralis, useWeb3ExecuteFunction } from "react-moralis";
import { Card, Skeleton, Input, notification, Button } from "antd";
import {
  BankOutlined,
  RightSquareOutlined,
  PaperClipOutlined,
} from "@ant-design/icons";
import MarketSelector from "components/Wallet/components/MarketSelector";

const { Meta } = Card;

const styles = {
  Offers: {
    display: "flex",
    flexWrap: "wrap",
    WebkitBoxPack: "start",
    justifyContent: "space-between",
    margin: "0 auto",
    maxWidth: "1000px",
    width: "700px",
    gap: "10px",
  },
};

function Contracts() {
  const { Moralis } = useMoralis();
  const [isPending, setIsPending] = useState(false);
  const [acceptedList, setAccepted] = useState();
  const [purchasedList, setPurchased] = useState();
  const [sentList, setSent] = useState();
  const [listedList, setListed] = useState();
  const [payoutList, setPayout] = useState(); // seller version of purchased
  const [finishedList, setFinished] = useState();
  const [paymentId, setPaymentId] = useState();
  const [market, setMarket] = useState();
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

  function shortenString(long, display) {
    const start = long.substring(0, display);
    const end = long.substring(long.length - display, long.length);
    console.log(start + "..." + end);
    return start + "..." + end;
  }

  async function sendTinkRequest(market, currency, amount) {
    alert("Request sent");
    //const recipient = "SE2023668362587681437762";
    const baseUrl = "/payment/create"; // has been set as proxy
    const data = {
      market: market,
      currency: currency,
      amount: amount,
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

  async function initiateTink(market, paymentRequestId) {
    // this works
    // args clientId, paymentRequestId
    const clientId = "68af8742e51a417d8e492fc72a058a7a";
    const service = "pay";
    const callback = "https://console.tink.com/callback";
    const locale = "en_US";

    //Returns url to end user for authentication
    const url = `https://link.tink.com/1.0/${service}?client_id=${clientId}&redirect_uri=${callback}&market=${market}&locale=${locale}&payment_request_id=${paymentRequestId}`;
    window.open(url);
  }

  async function tinkLinkPayment(market, currency, amount) {
    const paymentId = await sendTinkRequest(market, currency, amount);
    initiateTink(market, paymentId);
  }

  const cancel = async function (escrowAddress) {
    let options = {
      contractAddress: escrowAddress,
      functionName: "cancel",
      abi: [
        {
          inputs: [],
          name: "cancel",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
      params: {},
    };
    console.log(escrowAddress);
    setIsPending(true);
    await contractProcessor.fetch({
      params: options,
      onSuccess: () => {
        handler({
          message: "Offer cancelled!",
          description: `Cancelled offer ${escrowAddress}`,
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

  const relist = async function (escrowAddress) {
    let options = {
      contractAddress: escrowAddress,
      functionName: "relist",
      abi: [
        {
          inputs: [],
          name: "relist",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
      params: {},
    };
    console.log(escrowAddress);
    setIsPending(true);
    await contractProcessor.fetch({
      params: options,
      onSuccess: () => {
        handler({
          message: "Offer relisted!",
          description: `Relisted offer ${escrowAddress}`,
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

  const confirm = async function (escrowAddress) {
    let options = {
      contractAddress: escrowAddress,
      functionName: "confirm",
      abi: [
        {
          inputs: [],
          name: "confirm",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
      ],
      params: {},
    };
    console.log(escrowAddress);
    setIsPending(true);
    await contractProcessor.fetch({
      params: options,
      onSuccess: () => {
        handler({
          message: "Escrow released!",
          description: `Released escrow for offer ${escrowAddress}`,
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
    setIsPending(true);
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
    setIsPending(true);
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
    setIsPending(true);
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

  async function cancelAccepted(escrowAddress) {
    if (account && isAuthenticated) {
      await cancel(escrowAddress);
    }
  }

  async function relistAccepted(escrowAddress) {
    if (account && isAuthenticated) {
      await relist(escrowAddress);
    }
  }

  async function releaseEscrow(escrowAddress) {
    if (account && isAuthenticated) {
      await confirm(escrowAddress);
    }
  }

  const copy = async (paste, desc) => {
    await navigator.clipboard.writeText(paste);
    handler({
      message: "Copied!",
      description: desc,
    });
  };

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
  }, [isPending]);

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
  }, [isPending]);

  useEffect(() => {
    // import similarly to how tx is imported in transfer from searchbar
    async function fetchSent() {
      const Sent = Moralis.Object.extend("Finished");
      const query = new Moralis.Query(Sent);
      query.equalTo("buyer", account);
      query.descending("updatedAt");
      const result = await query.find();
      setSent(result);
      console.log(purchasedList);
    }
    fetchSent();
  }, [isPending]);

  useEffect(() => {
    // import similarly to how tx is imported in transfer from searchbar
    async function fetchListed() {
      const Listed = Moralis.Object.extend("Listed");
      const query = new Moralis.Query(Listed);
      const Finished = Moralis.Object.extend("Finished");
      const finished = new Moralis.Query(Finished);
      query.equalTo("seller", account);
      query.descending("updatedAt");
      query.doesNotMatchKeyInQuery("offerAddress", "offerAddress", finished);
      const result = await query.find();
      setListed(result);
      console.log(listedList);
    }
    fetchListed();
  }, [isPending]);

  useEffect(() => {
    // import similarly to how tx is imported in transfer from searchbar
    async function fetchPayout() {
      const Payout = Moralis.Object.extend("Purchased");
      const query = new Moralis.Query(Payout);
      const Finished = Moralis.Object.extend("Finished");
      const finished = new Moralis.Query(Finished);
      query.equalTo("seller", account);
      query.descending("updatedAt");
      query.doesNotMatchKeyInQuery("offerAddress", "offerAddress", finished);
      const result = await query.find();
      setPayout(result);
      console.log(payoutList);
    }
    fetchPayout();
  }, [isPending]);

  useEffect(() => {
    // import similarly to how tx is imported in transfer from searchbar
    async function fetchFinished() {
      const Finished = Moralis.Object.extend("Finished");
      const query = new Moralis.Query(Finished);
      query.equalTo("seller", account);
      query.descending("updatedAt");
      const result = await query.find();
      setFinished(result);
      console.log(finishedList);
    }
    fetchFinished();
  }, [isPending]);

  return (
    <div style={{ display: "flex", justifyContent: "space-around" }}>
      <div
        style={{
          padding: "15px",
          minWidth: "500px",
          maxWidth: "950px",
          width: "70%",
          justifyContent: "space-around",
        }}
      >
        <h1 style={{ display: "flex", justifyContent: "center" }}>
          Your Contracts
        </h1>
        <div style={styles.Offers}>
          <Skeleton loading={!acceptedList}>
            {acceptedList &&
              acceptedList.map((e) => {
                return (
                  <Card
                    title={
                      <div>
                        Accepted{" "}
                        <PaperClipOutlined
                          onClick={() => {
                            copy(
                              e.attributes.offerAddress,
                              "Contract address copied to clipboard",
                            );
                          }}
                        />
                      </div>
                    }
                    hoverable
                    actions={[
                      <div>
                        <Button
                          type="danger"
                          size="large"
                          onClick={() => {
                            cancelAccepted(e.attributes.offerAddress);
                          }}
                        >
                          Cancel
                        </Button>
                        <MarketSelector
                          setMarket={setMarket}
                          style={{ width: "12%" }}
                        />
                        <Button
                          type="primary"
                          size="large"
                          onClick={() => {
                            console.log(market.name);
                            tinkLinkPayment(
                              market.name,
                              e.attributes.currency,
                              e.attributes.fiat,
                            );
                          }}
                          disabled={!market}
                        >
                          Tink Payment
                        </Button>
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
                          size="large"
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
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-evenly",
                      }}
                    >
                      <Meta
                        title={"Offer"}
                        description={`${String(
                          e.attributes.offer / 10 ** 18,
                        )} MATIC`}
                      />
                      <Meta
                        title={"Price"}
                        description={`${e.attributes.fiat} ${e.attributes.currency}`}
                      />
                      <Meta
                        title={
                          <div>
                            Seller{" "}
                            <PaperClipOutlined
                              onClick={() => {
                                copy(
                                  e.attributes.seller,
                                  "Seller address copied to clipboard",
                                );
                              }}
                            />
                          </div>
                        }
                        description={shortenString(e.attributes.seller, 5)}
                      />
                    </div>
                  </Card>
                );
              })}
          </Skeleton>
        </div>
        <div style={styles.Offers}>
          <Skeleton loading={!purchasedList}>
            {purchasedList &&
              purchasedList.map((e) => {
                return (
                  <Card
                    title={
                      <div>
                        Purchased{" "}
                        <PaperClipOutlined
                          onClick={() => {
                            copy(
                              e.attributes.offerAddress,
                              "Contract address copied to clipboard",
                            );
                          }}
                        />
                      </div>
                    }
                    hoverable
                    actions={[
                      <div>
                        <Button
                          type="primary"
                          size="large"
                          onClick={() => {
                            paymentStatus(e.attributes.offerAddress);
                          }}
                        >
                          Confirm Payment
                          <RightSquareOutlined />
                        </Button>
                        <Button
                          size="large"
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
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-evenly",
                      }}
                    >
                      <Meta
                        title={"Offer"}
                        description={`${String(
                          e.attributes.offer / 10 ** 18,
                        )} MATIC`}
                      />
                      <Meta
                        title={"Price"}
                        description={`${e.attributes.fiat} ${e.attributes.currency}`}
                      />
                      <Meta
                        title={
                          <div>
                            Seller{" "}
                            <PaperClipOutlined
                              onClick={() => {
                                copy(
                                  e.attributes.seller,
                                  "Seller address copied to clipboard",
                                );
                              }}
                            />
                          </div>
                        }
                        description={shortenString(e.attributes.seller, 5)}
                      />
                      <Meta
                        title={
                          <div>
                            Payment ID{" "}
                            <PaperClipOutlined
                              onClick={() => {
                                copy(
                                  e.attributes.paymentId,
                                  "Payment ID copied to clipboard",
                                );
                              }}
                            />
                          </div>
                        }
                        description={shortenString(e.attributes.paymentId, 6)}
                      />
                    </div>
                  </Card>
                );
              })}
          </Skeleton>
        </div>
        <div style={styles.Offers}>
          <Skeleton loading={!sentList}>
            {sentList &&
              sentList.map((e) => {
                return (
                  <Card
                    title={
                      <div>
                        Sent{" "}
                        <PaperClipOutlined
                          onClick={() => {
                            copy(
                              e.attributes.offerAddress,
                              "Contract address copied to clipboard",
                            );
                          }}
                        />
                      </div>
                    }
                    hoverable
                    style={{
                      justifyContent: "flex-start",
                      width: "100%",
                      border: "4px solid #e7eaf3",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Meta
                        title={"Offer"}
                        description={`${String(
                          e.attributes.offer / 10 ** 18,
                        )} MATIC`}
                      />
                      <Meta
                        title={"Price"}
                        description={`${e.attributes.fiat} ${e.attributes.currency}`}
                      />
                      <Meta
                        title={
                          <div>
                            Seller{" "}
                            <PaperClipOutlined
                              onClick={() => {
                                copy(
                                  e.attributes.seller,
                                  "Seller address copied to clipboard",
                                );
                              }}
                            />
                          </div>
                        }
                        description={shortenString(e.attributes.seller, 5)}
                      />
                      <Meta
                        title={
                          <div>
                            Payment ID{" "}
                            <PaperClipOutlined
                              onClick={() => {
                                copy(
                                  e.attributes.paymentId,
                                  "Payment ID copied to clipboard",
                                );
                              }}
                            />
                          </div>
                        }
                        description={shortenString(e.attributes.paymentId, 6)}
                      />
                      <Meta
                        title={"Payment Status"}
                        description={`${String(e.attributes.status).replaceAll(
                          0,
                          "",
                        )}`}
                      />
                    </div>
                  </Card>
                );
              })}
          </Skeleton>
        </div>
      </div>
      <div
        style={{
          padding: "15px",
          minWidth: "500px",
          maxWidth: "950px",
          width: "70%",
          justifyContent: "space-around",
        }}
      >
        <h1 style={{ display: "flex", justifyContent: "center" }}>
          Your Offers
        </h1>
        <div style={styles.Offers}>
          <Skeleton loading={!listedList}>
            {listedList &&
              listedList.map((e) => {
                return (
                  <Card
                    title={
                      <div>
                        Listed{" "}
                        <PaperClipOutlined
                          onClick={() => {
                            copy(
                              e.attributes.seller,
                              "Contract address copied to clipboard",
                            );
                          }}
                        />
                      </div>
                    }
                    hoverable
                    actions={[
                      <div>
                        <Button
                          type="primary"
                          size="large"
                          onClick={() => {
                            relistAccepted(e.attributes.offerAddress);
                          }}
                        >
                          Relist
                        </Button>
                      </div>,
                    ]}
                    style={{
                      justifyContent: "flex-start",
                      width: "100%",
                      border: "4px solid #e7eaf3",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-around",
                      }}
                    >
                      <Meta
                        title={"Offer"}
                        description={`${String(
                          e.attributes.offer / 10 ** 18,
                        )} MATIC`}
                      />
                      <Meta
                        title={"Price"}
                        description={`${e.attributes.fiat} ${e.attributes.currency}`}
                      />
                    </div>
                  </Card>
                );
              })}
          </Skeleton>
        </div>
        <div style={styles.Offers}>
          <Skeleton loading={!payoutList}>
            {payoutList &&
              payoutList.map((e) => {
                return (
                  <Card
                    title={
                      <div>
                        Payout{" "}
                        <PaperClipOutlined
                          onClick={() => {
                            copy(
                              e.attributes.offerAddress,
                              "Contract address copied to clipboard",
                            );
                          }}
                        />
                      </div>
                    }
                    hoverable
                    type="primary"
                    size="large"
                    actions={[
                      <div>
                        <Button
                          onClick={() => {
                            releaseEscrow(e.attributes.offerAddress);
                          }}
                        >
                          Payment Received
                        </Button>
                      </div>,
                    ]}
                    style={{
                      justifyContent: "flex-start",
                      width: "100%",
                      border: "4px solid #e7eaf3",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Meta
                        title={"Offer"}
                        description={`${String(
                          e.attributes.offer / 10 ** 18,
                        )} MATIC`}
                      />
                      <Meta
                        title={"Price"}
                        description={`${e.attributes.fiat} ${e.attributes.currency}`}
                      />
                      <Meta
                        title={
                          <div>
                            Buyer{" "}
                            <PaperClipOutlined
                              onClick={() => {
                                copy(
                                  e.attributes.buyer,
                                  "Buyer address copied to clipboard",
                                );
                              }}
                            />
                          </div>
                        }
                        description={shortenString(e.attributes.buyer, 5)}
                      />
                      <Meta
                        title={
                          <div>
                            Payment ID{" "}
                            <PaperClipOutlined
                              onClick={() => {
                                copy(
                                  e.attributes.paymentId,
                                  "Payment ID copied to clipboard",
                                );
                              }}
                            />
                          </div>
                        }
                        description={e.attributes.paymentId}
                      />
                      <Meta
                        title={"Payment Status"}
                        description={`${String(e.attributes.status).replaceAll(
                          0,
                          "",
                        )}`}
                      />
                    </div>
                  </Card>
                );
              })}
          </Skeleton>
        </div>
        <div style={styles.Offers}>
          <Skeleton loading={!finishedList}>
            {finishedList &&
              finishedList.map((e) => {
                return (
                  <Card
                    title={
                      <div>
                        Sold{" "}
                        <PaperClipOutlined
                          onClick={() => {
                            copy(
                              e.attributes.offerAddress,
                              "Contract address copied to clipboard",
                            );
                          }}
                        />
                      </div>
                    }
                    hoverable
                    style={{
                      justifyContent: "flex-start",
                      width: "100%",
                      border: "4px solid #e7eaf3",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Meta
                        title={"Offer"}
                        description={`${String(
                          e.attributes.offer / 10 ** 18,
                        )} MATIC`}
                      />
                      <Meta
                        title={"Price"}
                        description={`${e.attributes.fiat} ${e.attributes.currency}`}
                      />
                      <Meta
                        title={
                          <div>
                            Buyer{" "}
                            <PaperClipOutlined
                              onClick={() => {
                                copy(
                                  e.attributes.buyer,
                                  "Buyer address copied to clipboard",
                                );
                              }}
                            />
                          </div>
                        }
                        description={shortenString(e.attributes.buyer, 5)}
                      />
                      <Meta
                        title={
                          <div>
                            Payment ID{" "}
                            <PaperClipOutlined
                              onClick={() => {
                                copy(
                                  e.attributes.paymentId,
                                  "Payment ID copied to clipboard",
                                );
                              }}
                            />
                          </div>
                        }
                        description={shortenString(e.attributes.paymentId, 6)}
                      ></Meta>
                      <Meta
                        title={"Payment Status"}
                        description={`${String(e.attributes.status).replaceAll(
                          0,
                          "",
                        )}`}
                      />
                    </div>
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
