"use client";
import { useEffect, useState } from "react";
import { Log } from "viem";
import { useBlockNumber, useContractEvent, usePublicClient } from "wagmi";
import ChatMessage from "./ChatMessage";

const chatterjson = require("../../../chatter-contracts/out/Chatter.sol/Chatter.json");
const chatterAddress = "0xb2E5e772602f98688A0902e7F02b277B28257AD0";

export default function MessageHistory({
  address,
}: {
  address: `0x${string}` | undefined;
}) {
  const [messages, setMessages] = useState<Log[]>();
  const publicClient = usePublicClient();
  const { data: blocknumber } = useBlockNumber();

  useEffect(() => {
    setMessages([]);

    if (blocknumber) {
      publicClient
        .getContractEvents({
          address: chatterAddress,
          abi: chatterjson.abi,
          eventName: "Message",
          fromBlock: blocknumber - BigInt(100),
          toBlock: "latest",
        })
        .then(setMessages);
    }
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
            connectedAddress={address}
          />
        </div>
      ))}
    </div>
  );
}
