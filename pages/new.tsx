import React, { useState } from "react";
import type { NextPage } from "next";
import { Form, Button, Card, Spinner } from "react-bootstrap";

import web3 from "ethereum/web3";
import { factory } from "ethereum/contract";
import { useRouter } from "next/router";
import { useStateContext } from "context/state";

const Home: NextPage = () => {
  const router = useRouter();
  const [desc, setDesc] = useState("");
  const [ans, setAns] = useState("");
  const [winProfit, setWinProfit] = useState("50");
  const [minAmountToAnswer, setMinAmountToAnswer] = useState("0.001");
  const [loading, setLoading] = useState(false);
  const { account } = useStateContext();

  const createMystery = async (e: any) => {
    e.preventDefault();
    try {
      let tx: any = {
        from: account,
        value: web3.utils.toWei(minAmountToAnswer, "ether"),
      };
      setLoading(true);
      const { events } = await factory.methods
        .createMystery(
          desc,
          ans,
          winProfit,
          web3.utils.toWei(minAmountToAnswer, "ether")
        )
        .send(tx);
      const mysteryAddress = events.MysteryCreated.returnValues[0];
      router.push(`/mystery/${mysteryAddress}`);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false)
    }
  };
  return (
    <Card className="mt-4">
      <Card.Header>Create a Mystery!</Card.Header>
      <Form onSubmit={createMystery}>
        <Card.Body>
          <Form.Group className="mb-2">
            <Form.Label className="mb-0">Add Description for mystery</Form.Label>
            <Form.Control
              as="textarea"
              required
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
            <Form.Text>Add Mystery Information!</Form.Text>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label className="mb-0">Answer</Form.Label>
            <Form.Control
              type="text"
              required
              value={ans}
              onChange={(e) => setAns(e.target.value)}
            />
            <Form.Text>Mystery!</Form.Text>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label className="mb-0">Winner % from Total</Form.Label>
            <Form.Control
              required
              type="number"
              min={50}
              max={100}
              value={winProfit}
              onChange={(e) => setWinProfit(e.target.value)}
            />
            <Form.Text>Winning Price for winner from total Balance, Remaining Will be yours!</Form.Text>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label className="mb-0">Min ETH to Answer</Form.Label>
            <Form.Control
              required
              type="number"
              min={0}
              step={0.001}
              value={minAmountToAnswer}
              onChange={(e) => {
                setMinAmountToAnswer(e.target.value);
              }}
            />
            <Form.Text>Cost to Solve the Mystery!</Form.Text>
          </Form.Group>
        </Card.Body>
        <Card.Footer className="text-center">
          <Button size="sm" type="submit" disabled={loading}>
            {loading ? <Spinner size="sm" animation="border" /> : 'Create A Mystery !'}
          </Button>
        </Card.Footer>
      </Form>
    </Card>
  );
};

export default Home;
