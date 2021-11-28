import { createMachine, assign } from "xstate";
import { Pokemon } from "../types";

interface PokemonContext {
    pokemon: Pokemon | null;
  }
  
export const pokemonMachine = createMachine<PokemonContext>({
  id: "pokemon",
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
          fetch(`https://pokeapi.co/api/v2/pokemon/${event.id}/`).then((data) =>
            data.json()
          ),
        onDone: {
          target: "resolved",
          actions: assign({
            pokemon: (_, event) => {
                return {
                    ...event.data,
                    currentHp: 10,
                    maxHp: 10,
                }
            },
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