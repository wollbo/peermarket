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
    justifyContent: "flex-start",
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
      params: { paymentId },
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
          type: "function"
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
        handler({
          message: "There was an error",
          description: error.message,
        });
      },
    });
  }
  */
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
      query.equalTo("buyer", account);
      query.descending("updatedAt");
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
      query.equalTo("buyer", account);
      query.descending("updatedAt");
      query.doesNotMatchKeyInQuery(
        "offerAddress",
        "offerAddress",
        acceptedList,
      ); // unsure if this works
      const result = await query.find();
      setPurchased(result);
      console.log(purchasedList);
    }
    fetchPurchased();
  }, []);

  return (
    <div style={{ padding: "15px", maxWidth: "1030px", width: "100%" }}>
      <h1>Your Contracts</h1>
      <div style={styles.Offers}>
        <Skeleton loading={!acceptedList}>
          {acceptedList &&
            acceptedList.map((e) => {
              return (
                <Card
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
  );
}

export default Contracts;
