import { Input } from "antd";
import { useState, useEffect } from "react";
import CurrencySelector from "components/Wallet/components/CurrencySelector";
import AssetSelector from "components/Wallet/components/AssetSelector";

function SearchBar({ setOptions }) {
  const [asset, setAsset] = useState();
  const [amount, setAmount] = useState();
  const [currency, setCurrency] = useState();
  const [fiat, setFiat] = useState();
  /* add this equivalent and relay to Market 
  useEffect(() => {
    asset && amount && receiver ? setTx({ amount, receiver, asset }) : setTx();
  }, [asset, amount, receiver]);
  */

  useEffect(() => {
    asset || amount || currency || fiat
      ? setOptions({ asset, amount, currency, fiat })
      : setOptions();
  }, [asset, amount, currency, fiat]);

  return (
    // temporary solution with AssetSelector - uses buyers list of cryptos
    // get available assets by searching through every listed asset class later on
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        maxWidth: "455px",
        width: "100%",
        gap: "12px",
      }}
    >
      <div>
        <AssetSelector setAsset={setAsset} style={{ width: "175px" }} />
        <CurrencySelector
          setCurrency={setCurrency}
          style={{ width: "175px" }}
        />
      </div>
      <div>
        <Input
          showSearch
          size="large"
          style={{ width: "70%" }}
          placeHolder="Enter crypto amount"
          onChange={(e) => {
            setAmount(`${e.target.value * 10 ** 18}`);
          }}
        />
        <Input
          showSearch
          size="large"
          style={{ width: "70%" }}
          placeHolder="Enter fiat amount"
          onChange={(e) => {
            setFiat(`${e.target.value}`);
          }}
        />
      </div>
    </div>
  );
}

export default SearchBar;
