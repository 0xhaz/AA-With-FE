import { useAccount } from "wagmi";
import JazziconImage from "./JazziconImage";

export default function ChatMessage({
  address,
  message,
}: {
  address: string;
  message: string;
}) {
  const { address: connectedAddress } = useAccount();
  return (
    <div
      className={[
        "flex flex-row gap-2",
        connectedAddress == address ? "justify-end" : "",
      ].join(" ")}
    >
      <JazziconImage
        address={address}
        className={[
          "w-6 h-6 rounded-full",
          address == connectedAddress ? "order-2" : "",
        ].join(" ")}
      />
      <div
        className={[
          "px-4 py-2 rounded-lg",
          connectedAddress == address
            ? "rounded-br-none bg-blue-600 text-white"
            : "rounded-bl-none bg-gray-300 text-gray-700",
        ].join(" ")}
      >
        {message}
      </div>
    </div>
  );
}
