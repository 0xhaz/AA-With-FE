"use client";
import { useEffect, useState } from "react";
import { Log } from "viem";
import { useContractEvent, usePublicClient } from "wagmi";
import ChatMessage from "./ChatMessage";

const chatterjson = require("../../../chatter-contracts/out/Chatter.sol/Chatter.json");
const chatterAddress = "0xb2E5e772602f98688A0902e7F02b277B28257AD0";

export default function MessageHistory() {
  const [messages, setMessages] = useState<Log[]>();
  const publicClient = usePublicClient();

  useEffect(() => {
    setMessages([]);

    publicClient
      .getContractEvents({
        address: chatterAddress,
        abi: chatterjson.abi,
        eventName: "Message",
        fromBlock: BigInt(10441012),
        toBlock: "latest",
      })
      .then(setMessages);
  }, []);

  useContractEvent({
    address: chatterAddress,
    abi: chatterjson.abi,
    eventName: "Message",
    listener(logs) {
      setMessages(oldMessages => {
        return oldMessages ? [...oldMessages, ...logs] : logs;
      });
    },
  });

  return (
    <div className="flex flex-col gap-2 w-full">
      {messages?.map((logmsg, i) => (
        <div key={i}>
          <ChatMessage
            address={logmsg?.args?.sender}
            message={logmsg?.args?.message}
          />
        </div>
      ))}
    </div>
  );
}
