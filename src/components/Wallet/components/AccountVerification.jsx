import { Input, Button } from "antd";
import { BankOutlined, RightSquareOutlined } from "@ant-design/icons";
import { useState } from "react";

async function sendAccountRequest(accountId) {
  alert("Request sent");
  //const recipient = "SE2023668362587681437762";
  const baseUrl = "/account"; // has been set as proxy
  const data = {
    id: accountId,
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
  return responseData;
}

export default function AccountVerification() {
  // replace with Account list, should be placed in Escrow file
  // Reads from Moralis database for accounts/report id associated with address 0x
  // Should only be one report id per account! remove old
  // Needs to update upon tink callback...
  const [id, setId] = useState();

  return (
    <div>
      <Input
        size="large"
        prefix={<BankOutlined />}
        onChange={(e) => {
          setId(`${e.target.value}`);
          console.log(id);
        }}
      ></Input>
      <Button
        onClick={() => {
          id === "" ? alert("Paste the report id.") : sendAccountRequest(id);
        }}
      >
        <RightSquareOutlined />
      </Button>
    </div>
  );
}
