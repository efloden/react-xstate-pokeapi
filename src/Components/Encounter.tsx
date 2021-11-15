import { useState } from "react";
import { useMachine } from "@xstate/react";
import { createEncounterMachine } from "../Machines/EncounterMachine";
import { Pokemon } from "../types";
import HealthBar from "./HealthBar";

interface EncounterProps {
  playerPokemon: Pokemon;
  challengerPokemon: Pokemon;
}

function Encounter(props: EncounterProps) {
  const [
    {
      matches,
      context: { message, playerPokemon, challengerPokemon },
    },
    send,
  ] = useMachine(
    createEncounterMachine({
      message: `Wild ${props.challengerPokemon.name.toLocaleUpperCase()} appeared!`,
      playerPokemon: props.playerPokemon,
      challengerPokemon: props.challengerPokemon,
    })
  );

  return (
    <div className="lg:w-1/2 lg:m-auto">
      {/* Players */}
      <div>
        <div className="flex items-start">
          <div className="flex-initial p-6 m-6 bg-white rounded-xl shadow-md flex items-center space-x-4 whitespace-nowrap">
            <div className="text-xl font-medium text-black">
              <span>{challengerPokemon.name.toLocaleUpperCase()}</span>{" "}
              <span>Lv2</span>
              <HealthBar
                percent={Math.round(
                  (challengerPokemon.currentHp / challengerPokemon.maxHp) * 100
                )}
              />
            </div>
          </div>
          <img
            className="h-96 w-96 object-cover overflow-hidden"
            src={challengerPokemon.sprites.front_default}
            alt="Pokemon Sprite"
          />
        </div>
        <div className="flex items-end">
          <img
            className="h-96 w-96 object-cover"
            src={playerPokemon.sprites.back_default}
            alt="Pokemon Sprite"
          />
          <div className="flex-initial p-6 m-6 bg-white rounded-xl shadow-md flex items-center space-x-4 whitespace-nowrap">
            <div className="text-xl font-medium text-black">
              <span>{playerPokemon.name.toLocaleUpperCase()}</span>{" "}
              <span>Lv2</span>
              <HealthBar
                percent={Math.round(
                  (playerPokemon.currentHp / playerPokemon.maxHp) * 100
                )}
              />
            </div>
          </div>
        </div>
      </div>
      {matches("encounter") && (
        <div
          onClick={() => send("NEXT_ACTION")}
          className="px-6 py-10 max-w bg-gray-500 rounded-xl shadow-md flex items-center space-x-4 cursor-pointer"
        >
          <div className="text-xl font-medium text-white">{message}</div>
        </div>
      )}
      {matches("actionSelection") && (
        <div className="p-6 max-w bg-white rounded-xl shadow-md flex items-center space-x-4">
          <div className="text-xl font-medium text-gray-500">
            What will {playerPokemon.name.toLocaleUpperCase()} do?
          </div>
          <div className="p-6 max-w bg-white rounded-xl shadow-md flex items-center space-x-4">
            <button onClick={() => send("FIGHT")}>Fight</button>
            <button>Run</button>
          </div>
        </div>
      )}
      {matches("moveSelection") && (
        <div className="p-6 max-w bg-white rounded-xl shadow-md flex items-center space-x-4">
          <div className="flex gap-8">
            <div className="grid grid-cols-2 gap-4">
              {playerPokemon.moves.slice(0, 4).map((move, i) => (
                <button
                  key={i}
                  className="group whitespace-nowrap"
                  onClick={() =>
                    send("MOVE_SELECTED", {
                      attacker: playerPokemon,
                      target: challengerPokemon,
                      attack: 1,
                      power: 1,
                    })
                  }
                >
                  <span className="opacity-0 group-hover:opacity-100">ᐅ</span>{" "}
                  {move.move.name}
                </button>
              ))}
            </div>
            <div>
              PP 20/20
              <br />
              TYPE/GRASS
            </div>
          </div>
        </div>
      )}
      {matches("roundResultPlayer") && (
        <div
          onClick={() =>
            send("MOVE_SELECTED", {
              attacker: challengerPokemon,
              target: playerPokemon,
              attack: 1,
              power: 1,
            })
          }
          className="px-6 py-10 max-w bg-gray-500 rounded-xl shadow-md flex items-center space-x-4 cursor-pointer"
        >
          <div className="text-xl font-medium text-white">{message}</div>
        </div>
      )}
      {matches("roundResultChallenger") && (
        <div
          onClick={() => send("NEXT_ROUND")}
          className="px-6 py-10 max-w bg-gray-500 rounded-xl shadow-md flex items-center space-x-4 cursor-pointer"
        >
          <div className="text-xl font-medium text-white">{message}</div>
        </div>
      )}
      {matches("win") && (
        <div className="px-6 py-10 max-w bg-gray-500 rounded-xl shadow-md flex items-center space-x-4 cursor-pointer">
          <div className="text-xl font-medium text-white">
            Foe {challengerPokemon.name.toLocaleUpperCase()} fainted!
          </div>
        </div>
      )}
      {matches("loss") && (
        <div className="px-6 py-10 max-w bg-gray-500 rounded-xl shadow-md flex items-center space-x-4 cursor-pointer">
          <div className="text-xl font-medium text-white">
            {playerPokemon.name.toLocaleUpperCase()} fainted!
          </div>
        </div>
      )}

      {/* <div className="flex flex-shrink-0">
            {pokemon?.stats.map((s) => (
              <div className="flex flex-shrink-0 text-sm items-center px-2">
                <div className="bg-gray-400 text-gray-600 px-2 py-1 rounded-l-md">
                  {s.stat.name}
                </div>
                <div className="bg-gray-500 text-green-100 px-2 py-1 rounded-r-md">
                  {s.base_stat}
                </div>
              </div>
            ))}
          </div> */}
    </div>
  );
}

export default Encounter;
