import { PokemonDB } from "./pokemon";
import { PokemonEvolutionDB } from "./pokemon_evolution";
import { SpeciesDB } from "./species";

export class LocalDB {
    static pokemons: PokemonDB = new PokemonDB();
    static species: SpeciesDB = new SpeciesDB();
    static pokemonEvolution: PokemonEvolutionDB = new PokemonEvolutionDB();
}