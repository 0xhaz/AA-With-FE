import React, { useState } from "react";
import {
  useContractEvent,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";

const chatterjson = require("../../../chatter-contracts/out/Chatter.sol/Chatter.json");
const chatterAddress = "0xb2E5e772602f98688A0902e7F02b277B28257AD0";

export default function SendMessage() {
  const [message, setMessage] = useState<string>("");

  const { config, error } = usePrepareContractWrite({
    address: chatterAddress,
    abi: chatterjson.abi,
    functionName: "sendMessage",
    args: [message],
  });
  const { write, data } = useContractWrite(config);

  function sendMessage() {
    if (message && message.length > 0) {
      write?.();
    }
  }

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
    onSettled() {
      setMessage("");
    },
  });
  return (
    <div className="flex w-full p-5 border-t-2">
      <input
        type="text"
        value={message}
        onChange={e => setMessage(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            sendMessage();
          }
        }}
        placeholder="Hi there..."
        className="border border-gray-200 rounded-l-md p-2 text-gray-600 focus:outline-none focus:placeholder-gray-300 w-full"
      />
      <button
        onClick={e => {
          e.preventDefault(), sendMessage();
        }}
        type="button"
        className="px-4 py-3 bg-blue-500 rounded-r-lg ease-in-out hover:bg-blue-300"
      >
        📩
      </button>
    </div>
  );
}
