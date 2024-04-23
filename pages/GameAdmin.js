import { useRouter } from "next/navigation";
import { useState } from "react";
import { v4 as uuid } from "uuid";
import Link from "next/link";
import { Didact_Gothic } from "next/font/google";
import { useCookies } from "react-cookie";

const DOMAIN =
  "https://connect-four-web-3u2skgh4w-aidanlanden22s-projects.vercel.app/";
export default function GameAdmin() {
  const router = useRouter();
  const [cookies, setCookie] = useCookies(["userId"]);
  const [gameId, setGameId] = useState(null);
  function generateGameId() {
    setGameId(uuid());
  }
  function goToRoute() {
    router.push({ pathname: DOMAIN, query: { gameId: gameId } });
  }

  return (
    <>
      {gameId ? DOMAIN + gameId : ""}
      <button onClick={generateGameId} disabled={gameId}>
        Generate Link
      </button>
      <button disabled={!gameId} onClick={goToRoute}>
        Go to game
      </button>
    </>
  );
}
