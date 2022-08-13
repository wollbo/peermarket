import {
  EuroCircleOutlined,
  PoundCircleOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import { Select } from "antd";
import { useMemo } from "react";

export default function CurrencySelector({ setCurrency, style }) {
  const currencies = useMemo(() => {
    return [
      {
        name: "EUR",
        symbol: <EuroCircleOutlined />,
      },
      {
        name: "GBP",
        symbol: <PoundCircleOutlined />,
      },
      {
        name: "SEK",
        symbol: <CrownOutlined />,
      },
    ];
  });

  function handleChange(value) {
    const currency = currencies.find((currency) => currency.name === value);
    setCurrency(currency);
  }

  return (
    <Select onChange={handleChange} size="large" style={style}>
      {currencies &&
        currencies.map((item) => {
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
