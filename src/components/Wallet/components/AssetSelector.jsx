import { useNativeBalance } from "react-moralis";
import { Image, Select } from "antd";
import { useMemo } from "react";

// removed erc20 tokens due to memory leak, rebuild properly later
export default function AssetSelector({ setAsset, style }) {
  const { data: nativeBalance, nativeToken } = useNativeBalance();

  const fullBalance = useMemo(() => {
    if (!(nativeBalance && nativeToken)) return null;
    return [
      {
        balance: nativeBalance.balance,
        decimals: nativeToken.decimals,
        name: nativeToken.name,
        symbol: nativeToken.symbol,
        token_address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      },
    ];
  }, [nativeBalance, nativeToken]);

  function handleChange(value) {
    const token = fullBalance.find((token) => token.token_address === value);
    setAsset(token);
  }

  return (
    <Select
      defaultActiveFirstOption
      onChange={handleChange}
      size="large"
      style={style}
    >
      {fullBalance &&
        fullBalance.map((item) => {
          return (
            <Select.Option
              value={item["token_address"]}
              key={item["token_address"]}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  gap: "8px",
                }}
              >
                <Image
                  src={
                    item.logo ||
                    "https://etherscan.io/images/main/empty-token.png"
                  }
                  alt="nologo"
                  width="24px"
                  height="24px"
                  preview={false}
                  style={{ borderRadius: "15px" }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "90%",
                  }}
                >
                  <p>{item.symbol}</p>
                </div>
              </div>
            </Select.Option>
          );
        })}
    </Select>
  );
}
