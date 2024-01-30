"use client";
import { useEffect, useState } from "react";
import MessageHistory from "../components/MessageHistory";
import SendMessage from "../components/SendMessage";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Presets, Client } from "userop";
import {
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { useEtherSigner } from "../lib/ether";
import { encodeFunctionData } from "viem";
import { Builder } from "userop/dist/preset";
import { SimpleAccount } from "abstractionkit";

const rpcUrl = `https://api.stackup.sh/v1/node/${process.env.NEXT_PUBLIC_STACKUP_API}`;
const paymasterUrl = `https://api.stackup.sh/v1/paymaster/${process.env.NEXT_PUBLIC_STACKUP_PAYMASTER}`;
const chatterjson = require("../../../chatter-contracts/out/Chatter.sol/Chatter.json");
const chatterAddress = "0xb2E5e772602f98688A0902e7F02b277B28257AD0";

export default function StackupExample() {
  const [connectedAddress, setConnectedAddress] = useState<
    `0x${string}` | undefined
  >();
  const [useSmartWallet, setUseSmartWallet] = useState<boolean>(false);
  const [builder, setBuilder] = useState<Presets.Builder.SimpleAccount>();
  const { address } = useAccount();

  const signer = useEtherSigner();

  useEffect(() => {
    console.log("useSmartWallet", useSmartWallet);
    if (useSmartWallet && signer) {
      setConnectedAddress(undefined);
      const paymasterContext = { type: "payg" };
      const paymasterMiddleware = Presets.Middleware.verifyingPaymaster(
        paymasterUrl,
        paymasterContext
      );
      const opts =
        paymasterUrl === ""
          ? {}
          : {
              paymasterMiddleware: paymasterMiddleware,
            };
      Presets.Builder.SimpleAccount.init(signer, rpcUrl, opts).then(builder => {
        const smartWalletAddress = builder.getSender();
        console.log(
          `Account address: ${address} with smart wallet address: ${smartWalletAddress}`
        );
        setConnectedAddress(smartWalletAddress as `0x${string}`);
        setBuilder(builder);
      });
    } else {
      setConnectedAddress(address);
    }
  }, [useSmartWallet]);

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
      if (useSmartWallet) {
        if (builder) {
          const value = "0";

          const callTo = [chatterAddress];
          const data = encodeFunctionData({
            abi: chatterjson.abi,
            functionName: "sendMessage",
            args: ["message"],
          });
          const callData = [data];
          Client.init(rpcUrl).then(async client => {
            const res = await client.sendUserOperation(
              builder.executeBatch(callTo, callData),
              {
                onBuild: op => console.log("Signed UserOperation", op),
              }
            );

            // Return receipt
            console.log(`UserOpHash: ${res.userOpHash}`);
            console.log("Waiting for transaction...");
            const ev = await res.wait();
            console.log(`Transaction hash: ${ev?.transactionHash ?? null}`);
            console.log(
              `View here:  https://jiffyscan.xyz/userOpHash/${res.userOpHash}`
            );
          });
        }
      } else {
        write?.();
      }
    }
  }

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
    onSettled() {
      setMessage("");
    },
  });

  return (
    <main className="container max-w-xl mx-auto">
      <div className="flex flex-col h-screen justify-between gap-5">
        <div className="flex flex-col gap-5 py-5">
          <div className="flex justify-between items-center">
            <ConnectButton />
            <div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={useSmartWallet}
                  className="sr-only peer"
                  onChange={() => setUseSmartWallet(!useSmartWallet)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                  Smart Wallet
                </span>
              </label>
            </div>
          </div>
          <div className="flex justify-between items-center">
            Account:{connectedAddress}
          </div>
        </div>
        <MessageHistory address={connectedAddress} />
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
      </div>
    </main>
  );
}
