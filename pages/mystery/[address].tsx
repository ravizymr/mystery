import type { NextPage } from "next";
import { mystery } from "ethereum/contract";
import web3 from "ethereum/web3";
import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  InputGroup,
  Row,
  Spinner,
} from "react-bootstrap";
import Error from "next/error";

const initAddr = "0x0000000000000000000000000000000000000000";

const MysteryPage: NextPage = ({ detail, query, error }: any) => {
  const [ans, setAns] = useState("");
  const [from, setFrom] = useState("");
  const [mysteryData, setMysteryData] = useState<{
    totalBalance: number;
    desc: string;
    winAmount: number;
    triedCount: number;
    min: number;
    manager: string;
    winner: string;
  }>(detail);
  const [trying, setTrying] = useState(false);
  const [network, setNetwork] = useState<string>();

  if (error) {
    return <Error style={{
      height: 'auto'
    }} statusCode={error.statusCode} title={error.message} />
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    getAccount();
    getNetwork();
  }, []);


  const getNetwork = async () => {
    const network = await web3.eth.net.getNetworkType();
    setNetwork(network);
  };
  const getAccount = async () => {
    const [from] = await web3.eth.getAccounts();
    setFrom(from);
  };

  const tryMystery = async (e) => {
    e.preventDefault();
    let tx: any = {
      from,
      value: mysteryData.min,
    };
    const current = mystery(query.address);
    setTrying(true);
    try {
      await current.methods.tryMystery(ans).send(tx);
    } catch (e) {
      console.log(e);
    } finally {
      const data = await current.methods.getSummary().call();
      setMysteryData({ ...data });
      setTrying(false);
    }
  };
  const solved = initAddr !== mysteryData.winner;

  return (
    <Row>
      {trying && (
        <Col lg={12} className="text-center mt-4 mb-2">
          <Spinner animation="border" />
        </Col>
      )}
      <Col>
        <Card className="mt-2">
          <Card.Header>
            <Card.Title className="mb-0 text-break">{mysteryData.desc}</Card.Title>
            {solved && <Card.Text className="mb-0"><small>Answer: </small>fff</Card.Text>}
          </Card.Header>
          <Card.Body>
            <Card.Subtitle>
              {solved ? "Solved" : "Unsolved"} After
            </Card.Subtitle>
            <Card.Text className="mb-2">{mysteryData.triedCount}</Card.Text>
            <Card.Subtitle>balance</Card.Subtitle>
            <Card.Text className="mb-2">
              {web3.utils.fromWei(String(mysteryData.totalBalance), "ether")}
            </Card.Text>
            <Card.Subtitle>Win ETH</Card.Subtitle>
            <Card.Text className="mb-2">
              {web3.utils.fromWei(String(mysteryData.winAmount), "ether")}
            </Card.Text>
            <Card.Subtitle>Min ETH to answer</Card.Subtitle>
            <Card.Text className="mb-0">
              {web3.utils.fromWei(String(mysteryData.min), "ether")}
            </Card.Text>
          </Card.Body>
          <Card.Footer>
            <b>Riddler:</b>{" "}
            {mysteryData.manager == from ? "You" : mysteryData.manager}
          </Card.Footer>
          {from !== mysteryData.manager && !solved && (
            <Card.Footer>
              <Form onSubmit={tryMystery}>
                <Form.Group>
                  <InputGroup>
                    <InputGroup.Text>
                      {web3.utils.fromWei(String(mysteryData.min), "ether")} ETH
                    </InputGroup.Text>
                    <Form.Control
                      placeholder="Guess Mystery"
                      type="text"
                      required
                      value={ans}
                      onChange={(e) => setAns(e.target.value)}
                    />
                    <Button disabled={trying} type="submit">
                      Try Your Luck
                    </Button>
                  </InputGroup>
                </Form.Group>
              </Form>
            </Card.Footer>
          )}
          {solved && (
            <Card.Footer>
              <b>Winner:</b>
              <a
                target="_blank"
                href={`https://${network}.etherscan.io/address/${mysteryData.winner}`} rel="noreferrer"
              >{web3.utils.toChecksumAddress(mysteryData.winner)}
              </a>
            </Card.Footer>
          )}
          {
            <Card.Footer>
              <b>Contract:</b>{" "}
              {
                <a
                  target="_blank"
                  href={`https://${network}.etherscan.io/address/${query.address}`} rel="noreferrer"
                >
                  {query.address}
                </a>
              }
            </Card.Footer>
          }
        </Card>
      </Col>
    </Row>
  );
};

MysteryPage.getInitialProps = async ({ query }) => {
  try {
    const address = query.address || "";
    web3.utils.toChecksumAddress(address as string)
    const currentMystery = mystery(query.address);
    const detail = await currentMystery.methods.getSummary().call();
    return { detail: { ...detail }, query };
  } catch (e) {
    return {
      error: { statusCode: 404, message: 'Mystery not Found!' },
      query
    }
  }
};

export default MysteryPage;
