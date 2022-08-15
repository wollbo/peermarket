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
    <>
      <AssetSelector setAsset={setAsset} style={{ width: "20%" }} />
      <Input
        showSearch
        style={{ width: "20%", marginLeft: "10px", marginRight: "10px" }}
        placeHolder="Enter crypto amount"
        onChange={(e) => {
          setAmount(`${e.target.value * 10 ** 18}`);
        }}
      />
      <CurrencySelector setCurrency={setCurrency} style={{ width: "20%" }} />
      <Input
        showSearch
        style={{ width: "20%", marginLeft: "10px" }}
        placeHolder="Enter fiat amount"
        onChange={(e) => {
          setFiat(`${e.target.value}`);
        }}
      />
    </>
  );
}

export default SearchBar;
