import { Pokemon } from "../types";
import { createMachine, assign, send } from "xstate";

interface Context {
  playerPokemon: Pokemon;
  challengerPokemon: Pokemon;
  message: string;
}

// The events that the machine handles
type EncounterEvent =
  | { type: "ACTION" }
  | { type: "NEXT_ACTION" }
  | { type: "NEXT_ROUND" }
  | { type: "FIGHT" }
  | { type: "RUN" }
  | {
      type: "MOVE_SELECTED";
      attacker: Pokemon;
      target: Pokemon;
      attack: number;
      power: number;
    };

type EncounterTypestate = {
  value:
    | "encounter"
    | "actionSelection"
    | "moveSelection"
    | "roundResultPlayer"
    | "roundResultChallenger"
    | "win"
    | "loss";
  context: Context;
};

export const createEncounterMachine = ({
  message,
  playerPokemon,
  challengerPokemon,
}: Context) => {
  return createMachine<Context, EncounterEvent, EncounterTypestate>(
    {
      id: "encounter",
      initial: "encounter",
      context: {
        message,
        playerPokemon,
        challengerPokemon,
      },
      states: {
        encounter: {
          on: {
            NEXT_ACTION: "actionSelection",
          },
        },
        actionSelection: {
          on: {
            FIGHT: "moveSelection",
            RUN: "encounter",
          },
        },
        moveSelection: {
          on: {
            MOVE_SELECTED: {
              target: "roundResultPlayer",
              actions: assign((_context, event) => {
                const { damage, message } = calculateDamage(
                  event.attacker,
                  event.target,
                  event.attack,
                  event.power
                );
                return {
                  challengerPokemon: {
                    ...event.target,
                    currentHp: event.target.currentHp - damage,
                  },
                  message: message,
                };
              }),
            },
          },
        },
        roundResultPlayer: {
          on: {
            MOVE_SELECTED: [
              {
                cond: "challengerIsDefeated",
                target: "win",
                actions: send("WIN"),
              },
              {
                target: "roundResultChallenger",
                actions: assign((_context, event) => {
                  const { damage, message } = calculateDamage(
                    event.attacker,
                    event.target,
                    event.attack,
                    event.power
                  );
                  return {
                    playerPokemon: {
                      ...event.target,
                      currentHp: event.target.currentHp - damage,
                    },
                    message: message,
                  };
                }),
              },
            ],
          },
        },
        roundResultChallenger: {
          on: {
            NEXT_ROUND: [
              {
                cond: "playerIsDefeated",
                target: "loss",
                actions: send("LOSS"),
              },
              {
                target: "moveSelection",
              },
            ],
          },
        },
        win: {
          type: "final",
        },
        loss: {
          type: "final",
        },
      },
    },
    /**
     * Configuration object
     */
    {
      guards: {
        playerIsDefeated: ({ playerPokemon }) => {
          return playerPokemon.currentHp <= 0;
        },
        challengerIsDefeated: ({ challengerPokemon }) => {
          return challengerPokemon.currentHp <= 0;
        },
      },
    }
  );
};

function calculateDamage(
  attacker: Pokemon,
  target: Pokemon,
  attack: number,
  power: number
) {
  const rand = (Math.random() * 38 + 217) / 255;
  const damage = Math.round(
    ((attack * power) /
      ((target?.stats.find((s) => s.stat.name === "defense")?.base_stat || 0) *
        50) +
      2) *
      rand
  );
  const message = `${attacker.name.toLocaleUpperCase()} attacks ${target.name.toLocaleUpperCase()} for ${damage} damage!`;
  return {
    damage: damage,
    message: message,
  };
}
