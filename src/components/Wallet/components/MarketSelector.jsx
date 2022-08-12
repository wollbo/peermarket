import { Select } from "antd";
import { useMemo } from "react";

export default function MarketSelector({ setMarket, style }) {
  const currencies = useMemo(() => {
    return [
      {
        name: "AT",
        symbol: "🇦🇹",
      },
      {
        name: "EE",
        symbol: "🇪🇪",
      },
      {
        name: "FI",
        symbol: "🇫🇮",
      },
      {
        name: "FR",
        symbol: "🇫🇷",
      },
      {
        name: "DE",
        symbol: "🇩🇪",
      },
      {
        name: "IT",
        symbol: "🇮🇹",
      },
      {
        name: "NL",
        symbol: "🇳🇱",
      },
      {
        name: "NO",
        symbol: "🇳🇴",
      },
      {
        name: "PT",
        symbol: "🇵🇹",
      },
      {
        name: "ES",
        symbol: "🇪🇸",
      },
      {
        name: "SE",
        symbol: "🇸🇪",
      },
      {
        name: "UK",
        symbol: "🇬🇧",
      },
    ];
  });

  function handleChange(value) {
    const currency = currencies.find((currency) => currency.name === value);
    setMarket(currency);
  }

  return (
    <Select onChange={handleChange} size="large" style={style}>
      {currencies &&
        currencies.map((item) => {
          console.log(item);
          return (
            <Select.Option value={item["name"]} key={item["name"]}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  gap: "8px",
                }}
              >
                <p>{item.symbol}</p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "90%",
                  }}
                >
                  <p>{item.name}</p>
                </div>
              </div>
            </Select.Option>
          );
        })}
    </Select>
  );
}
