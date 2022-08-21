import { Card, Timeline, Typography } from "antd";
import React from "react";
//import { useMoralis } from "react-moralis";

const { Text } = Typography;

const styles = {
  title: {
    fontSize: "20px",
    fontWeight: "700",
  },
  text: {
    fontSize: "16px",
  },
  card: {
    boxShadow: "0 0.5rem 1.2rem rgb(189 197 209 / 20%)",
    border: "1px solid #e7eaf3",
    borderRadius: "0.5rem",
  },
  timeline: {
    marginBottom: "-45px",
  },
};

export default function QuickStart() {
  //const { Moralis } = useMoralis();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-around",
        gap: "10px",
      }}
    >
      <Card
        style={styles.card}
        title={
          <>
            🇹 <Text strong>Tink Instructions</Text>
          </>
        }
      >
        <Timeline mode="left" style={styles.timeline}>
          <Timeline.Item dot="🔗">
            <Text style={styles.text}>Press Tink Link </Text>
          </Timeline.Item>
          <Timeline.Item dot="🏦">
            <Text style={styles.text}>Choose Tink Demo Bank </Text>
          </Timeline.Item>
          <Timeline.Item dot="📖">
            <Text style={styles.text}>Select Open Banking </Text>
          </Timeline.Item>
          <Timeline.Item dot="🔑">
            <Text style={styles.text}>Select Password and OTP </Text>
          </Timeline.Item>
          <Timeline.Item dot="🔡">
            <Text style={styles.text}>Login, OTP Method: Text input </Text>
          </Timeline.Item>
          <Timeline.Item dot="🗒️">
            <Text style={styles.text}> OTP: Enter number below input </Text>
          </Timeline.Item>
          <Timeline.Item dot="📒">
            <Text style={styles.text}> Select account to pay from </Text>
          </Timeline.Item>
        </Timeline>
      </Card>
      <Card
        style={styles.card}
        title={
          <>
            📒 <Text strong>Seller Credentials</Text>
          </>
        }
      >
        <Timeline mode="left" style={styles.timeline}>
          <Timeline.Item dot="🇫🇮">
            <Text code style={styles.text}>
              FI: u80628915 / puv375
            </Text>
          </Timeline.Item>
          <Timeline.Item dot="🇫🇷">
            <Text code style={styles.text}>
              FR: u98563939 / ene512
            </Text>
          </Timeline.Item>
          <Timeline.Item dot="🇩🇪">
            <Text code style={styles.text}>
              DE: u98235448 / cdz248
            </Text>
          </Timeline.Item>
          <Timeline.Item dot="🇮🇹">
            <Text code style={styles.text}>
              IT: u51613239 / cty440
            </Text>
          </Timeline.Item>
          <Timeline.Item dot="🇳🇱">
            <Text code style={styles.text}>
              NL: u48874162 / idz429
            </Text>
          </Timeline.Item>
          <Timeline.Item dot="🇳🇴">
            <Text code style={styles.text}>
              NO: u91804362 / szd875
            </Text>
          </Timeline.Item>
          <Timeline.Item dot="🇵🇹">
            <Text code style={styles.text}>
              PT: u51613239 / cty440
            </Text>
          </Timeline.Item>
          <Timeline.Item dot="🇪🇸">
            <Text code style={styles.text}>
              ES: u82144157 / ymm529
            </Text>
          </Timeline.Item>
          <Timeline.Item dot="🇸🇪">
            <Text code style={styles.text}>
              SE: u27678322 / vrh343
            </Text>
          </Timeline.Item>
          <Timeline.Item dot="🇬🇧">
            <Text code style={styles.text}>
              UK: u30315772 / ndg370
            </Text>
          </Timeline.Item>
        </Timeline>
      </Card>
      <div>
        <Card
          style={styles.card}
          title={
            <>
              📒 <Text strong>Buyer Credentials</Text>
            </>
          }
        >
          <Timeline mode="left" style={styles.timeline}>
            <Timeline.Item dot="🇦🇹">
              <Text code style={styles.text}>
                AT: u37836153 / idv243
              </Text>
            </Timeline.Item>
            <Timeline.Item dot="🇪🇪">
              <Text code style={styles.text}>
                EE: u45530588 / jkw063
              </Text>
            </Timeline.Item>
            <Timeline.Item dot="🇫🇷">
              <Text code style={styles.text}>
                FR: u77894411 / mzw990
              </Text>
            </Timeline.Item>
            <Timeline.Item dot="🇩🇪">
              <Text code style={styles.text}>
                DE: u83188312 / zhx571
              </Text>
            </Timeline.Item>
            <Timeline.Item dot="🇮🇹">
              <Text code style={styles.text}>
                IT: u42389294 / fog735
              </Text>
            </Timeline.Item>
            <Timeline.Item dot="🇳🇱">
              <Text code style={styles.text}>
                NL: u31617430 / xnf660
              </Text>
            </Timeline.Item>
            <Timeline.Item dot="🇳🇴">
              <Text code style={styles.text}>
                NO: u47509183 / pgs057
              </Text>
            </Timeline.Item>
            <Timeline.Item dot="🇵🇹">
              <Text code style={styles.text}>
                PT: u16025013 / jvq103
              </Text>
            </Timeline.Item>
            <Timeline.Item dot="🇪🇸">
              <Text code style={styles.text}>
                ES: u89609866 / bst827
              </Text>
            </Timeline.Item>
            <Timeline.Item dot="🇸🇪">
              <Text code style={styles.text}>
                SE: u58697449 / rjg121
              </Text>
            </Timeline.Item>
            <Timeline.Item dot="🇬🇧">
              <Text code style={styles.text}>
                GB: u83646180 / rlf446
              </Text>
            </Timeline.Item>
          </Timeline>
        </Card>
      </div>
    </div>
  );
}
