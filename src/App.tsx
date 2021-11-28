import { useEffect } from "react";
import { useMachine } from "@xstate/react";
import { pokemonMachine } from "./Machines/pokemonMachine";
import Encounter from "./Components/Encounter";
import "./App.css";

function App() {
  const [p1, send1] = useMachine(pokemonMachine);
  const [p2, send2] = useMachine(pokemonMachine);
  useEffect(() => {
    send1("FETCH", { id: 1 });
  }, [send1]);
  useEffect(() => {
    send2("FETCH", { id: 25 });
  }, [send2]);
  const resolved1 = p1.matches("resolved");
  const loading1 = p1.matches("loading");
  const resolved2 = p2.matches("resolved");
  const loading2 = p2.matches("loading");
  return (
    <div className="h-screen bg-gradient-to-t from-blue-500 to-green-500">
      {(loading1 || loading2) && "Loading..."}
      {resolved1 && resolved2 && p1.context.pokemon && p2.context.pokemon && (
        <Encounter
          playerPokemon={p1.context.pokemon}
          challengerPokemon={p2.context.pokemon}
        />
      )}
    </div>
  );
}

export default App;
