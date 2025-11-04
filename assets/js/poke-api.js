
const pokeApi = {}

// Função para converter detalhes da API para nosso modelo
function convertPokeApiDetailToPokemon(pokeDetail) {
    const pokemon = new Pokemon()
    pokemon.number = pokeDetail.id
    pokemon.name = pokeDetail.name

    const types = pokeDetail.types.map((typeSlot) => typeSlot.type.name)
    const [type] = types

    pokemon.types = types
    pokemon.type = type

    // Imagem com fallback
    pokemon.photo = pokeDetail.sprites.other.dream_world.front_default 
                   || pokeDetail.sprites.other['official-artwork'].front_default
                   || pokeDetail.sprites.front_default

    // Novos dados para detalhes
    pokemon.height = pokeDetail.height
    pokemon.weight = pokeDetail.weight
    
    // Habilidades
    pokemon.abilities = pokeDetail.abilities.map((abilitySlot) => abilitySlot.ability.name)
    
    // Stats
    pokemon.stats.hp = pokeDetail.stats.find((stat) => stat.stat.name === 'hp').base_stat
    pokemon.stats.attack = pokeDetail.stats.find((stat) => stat.stat.name === 'attack').base_stat
    pokemon.stats.defense = pokeDetail.stats.find((stat) => stat.stat.name === 'defense').base_stat
    pokemon.stats.specialAttack = pokeDetail.stats.find((stat) => stat.stat.name === 'special-attack').base_stat
    pokemon.stats.specialDefense = pokeDetail.stats.find((stat) => stat.stat.name === 'special-defense').base_stat
    pokemon.stats.speed = pokeDetail.stats.find((stat) => stat.stat.name === 'speed').base_stat
    
    // Moves (primeiros 10)
    pokemon.moves = pokeDetail.moves.slice(0, 10).map((moveSlot) => moveSlot.move.name)

    return pokemon
}

// Função para buscar detalhes de um Pokémon
pokeApi.getPokemonDetail = (pokemon) => {
    return fetch(pokemon.url)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            return response.json()
        })
        .then(convertPokeApiDetailToPokemon)
        .catch((error) => {
            console.error('Erro ao buscar detalhes do Pokémon:', error)
            return null
        })
}

// Função para buscar lista de Pokémon
pokeApi.getPokemons = (offset = 0, limit = 20) => {
    const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`

    return fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            return response.json()
        })
        .then((jsonBody) => jsonBody.results)
        .then((pokemons) => pokemons.map(pokeApi.getPokemonDetail))
        .then((detailRequests) => Promise.all(detailRequests))
        .then((pokemonsDetails) => pokemonsDetails.filter(pokemon => pokemon !== null))
        .catch((error) => {
            console.error('Falha ao carregar Pokémon:', error)
            return []
        })
}

// Função para buscar um Pokémon por ID (para detalhes)
pokeApi.getPokemonById = (id) => {
    const url = `https://pokeapi.co/api/v2/pokemon/${id}`
    return fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            return response.json()
        })
        .then(convertPokeApiDetailToPokemon)
        .catch((error) => {
            console.error('Erro ao buscar Pokémon por ID:', error)
            return null
        })
}

// Função para buscar todos os tipos de Pokémon
pokeApi.getPokemonTypes = () => {
    const url = 'https://pokeapi.co/api/v2/type?limit=20'
    return fetch(url)
        .then(response => response.json())
        .then(jsonBody => jsonBody.results.filter(type => 
            !['shadow', 'unknown'].includes(type.name)
        ))
        .catch(error => {
            console.error('Erro ao buscar tipos:', error)
            return []
        })
}