import { useEffect } from "react";
import { createMachine, assign } from "xstate";
import { useMachine } from "@xstate/react";
import { Pokemon } from "./types";
import Encounter from "./Components/Encounter";
import "./App.css";

interface PokemonContext {
  pokemon: Pokemon | null;
}

const fetchMachine = createMachine<PokemonContext>({
  id: "Poke API",
  initial: "idle",
  context: {
    pokemon: null,
  },
  states: {
    idle: {
      on: {
        FETCH: "loading",
      },
    },
    loading: {
      invoke: {
        id: "fetchPokemon",
        src: (context, event) =>
          fetch("https://pokeapi.co/api/v2/pokemon/1/").then((data) =>
            data.json()
          ),
        onDone: {
          target: "resolved",
          actions: assign({
            pokemon: (_, event) => event.data,
          }),
        },
        onError: "rejected",
      },
      on: {
        CANCEL: "idle",
      },
    },
    resolved: {
      type: "final",
    },
    rejected: {
      on: {
        FETCH: "loading",
      },
    },
  },
});

function App() {
  const [current, send] = useMachine(fetchMachine);
  useEffect(() => {
    send("FETCH");
  }, [send]);
  const resolved = current.matches("resolved");
  const loading = current.matches("loading");
  const { pokemon } = current.context;
  if (!resolved || !pokemon) {
    return null;
  }
  const playerPokemon = {
    ...pokemon,
    currentHp: 10,
    maxHp: 10,
  };
  const challengerPokemon = {
    ...pokemon,
    currentHp: 10,
    maxHp: 10,
  };
  return (
    <div className="h-screen bg-gradient-to-t from-blue-500 to-green-500">
      {loading && "Loading..."}
      {resolved && pokemon && (
        <Encounter
          playerPokemon={playerPokemon}
          challengerPokemon={challengerPokemon}
        />
      )}
    </div>
  );
}

export default App;
