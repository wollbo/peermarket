import React, { useState, useEffect } from "react";
import { useMoralis, useWeb3ExecuteFunction } from "react-moralis";
import { Card, Tooltip, Skeleton, notification } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import SearchBar from "./components/SearchBar";

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

function Market() {
  const { Moralis } = useMoralis();
  const [isPending, setIsPending] = useState(false);
  const [options, setOptions] = useState();
  const [offersList, setOffers] = useState();
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
  };

  const getPayment = async function (escrowAddress) {
    const options = {
      chain: "mumbai",
      address: escrowAddress,
      function_name: "getPayment",
      abi: [
        {
          inputs: [],
          name: "getPayment",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
      ],
      params: {},
    };
    setIsPending(true);
    const payment = await Moralis.Web3API.native.runContractFunction(options);
    return payment;
  };

  const getLinkAllowance = async function (account, contract) {
    const options = {
      chain: "mumbai",
      address: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
      function_name: "allowance",
      abi: [
        {
          inputs: [
            {
              internalType: "address",
              name: "owner",
              type: "address",
            },
            {
              internalType: "address",
              name: "spender",
              type: "address",
            },
          ],
          name: "allowance",
          outputs: [
            {
              internalType: "uint256",
              name: "remaining",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
      ],
      params: { owner: account, spender: contract },
    };
    const allowance = await Moralis.Web3API.native.runContractFunction(options);
    return allowance;
  };

  const accept = async function (escrowAddress) {
    let options = {
      contractAddress: escrowAddress,
      functionName: "accept",
      abi: [
        {
          inputs: [],
          name: "accept",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
      ],
      params: {},
    };
    console.log(escrowAddress);
    await contractProcessor.fetch({
      params: options,
      onSuccess: () => {
        handler({
          message: "Offer accepted!",
          description: `Accepted offer ${escrowAddress} to your Contracts`,
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

  async function setAllowance(escrowAddress, value) {
    let options = {
      contractAddress: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
      functionName: "approve",
      abi: [
        {
          inputs: [
            {
              internalType: "address",
              name: "spender",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "value",
              type: "uint256",
            },
          ],
          name: "approve",
          outputs: [
            {
              internalType: "bool",
              name: "success",
              type: "bool",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
      params: {
        spender: escrowAddress,
        value: String(value),
      },
    };
    await contractProcessor.fetch({
      params: options,
      onSuccess: () => {
        handler({
          message: "Allowance set!",
          description: `Allowance increased to ${value / 10 ** 18} LINK`,
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

  async function acceptContract(escrowAddress) {
    if (account && isAuthenticated) {
      const payment = await getPayment(escrowAddress);
      console.log(payment);
      const allowance = await getLinkAllowance(account, escrowAddress);
      console.log(allowance);
      if (allowance >= payment) {
        await accept(escrowAddress);
      } else {
        const diff = payment - allowance;
        console.log(diff);
        await setAllowance(escrowAddress, diff);
      }
    }
    // else return antd notification - you need to connect first!!
  }

  useEffect(() => {
    // import similarly to how tx is imported in transfer from searchbar
    async function fetchOffers() {
      const Listed = Moralis.Object.extend("Listed");
      const query = new Moralis.Query(Listed);
      const Accepted = Moralis.Object.extend("Accepted");
      const accepted = new Moralis.Query(Accepted);
      /* this throws recursion errors
      {
        options.currency && query.equalTo("currency", options.currency);
      } // show all currencies if no currency selected
      */
      {
        options.fiat && query.lessThanOrEqualTo("fiat", options.fiat);
      }
      {
        options.amount && query.lessThanOrEqualTo("offer", options.amount);
      }
      query.descending("offer");
      //query.greaterThan("createdAt", accepted);
      query.doesNotMatchKeyInQuery("offerAddress", "offerAddress", accepted); //createdAt can perhaps replace this
      const result = await query.find();
      setOffers(result);
      console.log(offersList);
    }
    fetchOffers();
  }, [options]);

  return (
    <div style={{ padding: "15px", maxWidth: "1030px", width: "100%" }}>
      <SearchBar setOptions={setOptions} />
      <h1>PeerMarket offers</h1>
      <div style={styles.Offers}>
        <Skeleton loading={!offersList}>
          {offersList &&
            offersList.map((e) => {
              return (
                <Card
                  hoverable
                  actions={[
                    <Tooltip title="Purchase">
                      <ShoppingCartOutlined
                        loading={isPending}
                        onClick={() =>
                          acceptContract(e.attributes.offerAddress)
                        }
                      />
                    </Tooltip>,
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

export default Market;
