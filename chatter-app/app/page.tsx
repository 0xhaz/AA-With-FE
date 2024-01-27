"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import MessageHistory from "./components/MessageHistory";
import SendMessage from "./components/SendMessage";
import ScrollableBox from "./components/ScrollableBox";

export default function Home() {
  return (
    <main className="container max-w-xl mx-auto py-3 h-screen">
      <div>
        <ConnectButton />
        {/* <ScrollableBox className="flex flex-col overflow-y-auto w-full"> */}
        <MessageHistory />
        {/* </ScrollableBox> */}
        <SendMessage />
      </div>
    </main>
  );
}
