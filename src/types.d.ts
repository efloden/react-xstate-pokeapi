import { Pokemon as PokeNodePokemon } from "pokenode-ts";

interface Pokemon extends PokeNodePokemon {
  currentHp: number
  maxHp: number
}