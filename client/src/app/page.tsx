import HomeComp from "@/components/home/Home";
import { WebSocketProvider } from "@/context/WebsocketContext";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
       <HomeComp/>
    </main>
  );
}
