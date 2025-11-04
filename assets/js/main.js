
// Elementos DOM
const pokemonList = document.getElementById('pokemonList')
const loadMoreButton = document.getElementById('loadMoreButton')
const pokemonDetailModal = document.getElementById('pokemonDetail')
const backButton = document.getElementById('backButton')
const favoriteDetailButton = document.getElementById('favoriteDetailButton')
const filterButton = document.getElementById('filterButton')
const favoritesButton = document.getElementById('favoritesButton')
const typeFilter = document.getElementById('typeFilter')
const filterGrid = document.querySelector('.filter-grid')
const generationButton = document.getElementById('generationButton')

// Configurações de Gerações
const generations = {
    '1': { limit: 151, offset: 0, name: 'Kanto' },
    '2': { limit: 100, offset: 151, name: 'Johto' },
    '3': { limit: 135, offset: 251, name: 'Hoenn' },
    '4': { limit: 107, offset: 386, name: 'Sinnoh' },
    '5': { limit: 156, offset: 493, name: 'Unova' },
    '6': { limit: 72, offset: 649, name: 'Kalos' },
    '7': { limit: 88, offset: 721, name: 'Alola' },
    '8': { limit: 96, offset: 809, name: 'Galar' },
    '9': { limit: 120, offset: 905, name: 'Paldea' }
}

// Variáveis Globais
let currentGeneration = '1'
let maxRecords = generations[currentGeneration].limit
let offset = generations[currentGeneration].offset
const limit = 20
let currentFilter = 'all'
let favorites = JSON.parse(localStorage.getItem('pokedexFavorites')) || []

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    loadPokemonItems(offset, limit)
    initTypeFilter()
    initEventListeners()
})

// Event Listeners
function initEventListeners() {
    // Botão Load More
    loadMoreButton.addEventListener('click', () => {
        offset += limit
        const currentGenData = generations[currentGeneration]
        const qtdRecordsWithNextPage = offset + limit

        if (qtdRecordsWithNextPage >= currentGenData.offset + currentGenData.limit) {
            const newLimit = (currentGenData.offset + currentGenData.limit) - offset
            loadPokemonItems(offset, newLimit)
            loadMoreButton.style.display = 'none'
        } else {
            loadPokemonItems(offset, limit)
        }
    })

    // Botão de voltar no modal
    backButton.addEventListener('click', closePokemonDetail)

    // Botão de favoritos no modal
    favoriteDetailButton.addEventListener('click', toggleFavorite)

    // Botão de filtro
    filterButton.addEventListener('click', toggleTypeFilter)

    // Botão de favoritos no header
    favoritesButton.addEventListener('click', showFavorites)

    // Botão de geração
    generationButton.addEventListener('click', showGenerationSelector)

    // Fechar modal ao clicar no overlay
    pokemonDetailModal.addEventListener('click', (e) => {
        if (e.target.classList.contains('detail-overlay')) {
            closePokemonDetail()
        }
    })

    // Navegação por tabs
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const tabName = e.target.getAttribute('data-tab')
            switchTab(tabName)
        })
    })
}

// Carregar itens Pokémon
function loadPokemonItems(offset, limit) {
    pokeApi.getPokemons(offset, limit).then((pokemons = []) => {
        const filteredPokemons = currentFilter === 'all' 
            ? pokemons 
            : filterPokemonsByType(pokemons)
        
        const newHtml = filteredPokemons.map(convertPokemonToLi).join('')
        pokemonList.innerHTML += newHtml
        
        addPokemonCardListeners()
    })
}

// Converter Pokémon para HTML
function convertPokemonToLi(pokemon) {
    const isFavorite = favorites.includes(pokemon.number)
    const favoriteClass = isFavorite ? 'favorited' : ''
    
    return `
        <li class="pokemon ${pokemon.type}" data-id="${pokemon.number}">
            <div class="favorite-indicator ${favoriteClass}">♥</div>
            <span class="number">#${pokemon.number.toString().padStart(3, '0')}</span>
            <span class="name">${pokemon.name}</span>

            <div class="detail">
                <ol class="types">
                    ${pokemon.types.map((type) => `<li class="type ${type}">${type}</li>`).join('')}
                </ol>

                <img src="${pokemon.photo}" alt="${pokemon.name}">
            </div>
        </li>
    `
}

// Adicionar listeners aos cards
function addPokemonCardListeners() {
    document.querySelectorAll('.pokemon').forEach(card => {
        card.addEventListener('click', (e) => {
            const pokemonId = e.currentTarget.getAttribute('data-id')
            openPokemonDetail(pokemonId)
        })
    })
}

// Abrir detalhes do Pokémon
function openPokemonDetail(pokemonId) {
    pokeApi.getPokemonById(pokemonId).then(pokemon => {
        if (pokemon) {
            updateDetailModal(pokemon)
            pokemonDetailModal.classList.remove('hidden')
            document.body.style.overflow = 'hidden'
        }
    })
}

// Fechar detalhes
function closePokemonDetail() {
    pokemonDetailModal.classList.add('hidden')
    document.body.style.overflow = 'auto'
}

// Atualizar modal de detalhes
function updateDetailModal(pokemon) {
    // Informações básicas
    document.querySelector('.detail-name').textContent = pokemon.name
    document.querySelector('.detail-number').textContent = `#${pokemon.number.toString().padStart(3, '0')}`
    
    // Tipos
    const typesContainer = document.querySelector('.detail-types')
    typesContainer.innerHTML = pokemon.types.map(type => 
        `<span class="type ${type}">${type}</span>`
    ).join('')
    
    // Imagem
    const img = document.querySelector('.detail-image')
    img.src = pokemon.photo
    img.alt = pokemon.name
    
    // Botão de favoritos
    favoriteDetailButton.classList.toggle('favorited', favorites.includes(pokemon.number))
    
    // Tab About
    document.querySelector('.detail-height').textContent = pokemon.getFormattedHeight()
    document.querySelector('.detail-weight').textContent = pokemon.getFormattedWeight()
    document.querySelector('.detail-abilities').textContent = pokemon.getFormattedAbilities()
    document.querySelector('.detail-species').textContent = pokemon.name
    
    // Tab Stats
    updateStatsTab(pokemon)
    
    // Tab Moves
    updateMovesTab(pokemon)
    
    // Aplicar gradiente de fundo baseado no tipo
    const modal = document.querySelector('.detail-content')
    modal.style.background = pokemon.getTypeGradient()
}

// Atualizar tab de stats
function updateStatsTab(pokemon) {
    const statsContainer = document.querySelector('.stats-list')
    const stats = pokemon.stats
    
    statsContainer.innerHTML = `
        <div class="stat-item">
            <span class="stat-name">HP</span>
            <div class="stat-bar-container">
                <div class="stat-bar" style="width: ${(stats.hp / 255) * 100}%"></div>
            </div>
            <span class="stat-value">${stats.hp}</span>
        </div>
        <div class="stat-item">
            <span class="stat-name">Attack</span>
            <div class="stat-bar-container">
                <div class="stat-bar" style="width: ${(stats.attack / 255) * 100}%"></div>
            </div>
            <span class="stat-value">${stats.attack}</span>
        </div>
        <div class="stat-item">
            <span class="stat-name">Defense</span>
            <div class="stat-bar-container">
                <div class="stat-bar" style="width: ${(stats.defense / 255) * 100}%"></div>
            </div>
            <span class="stat-value">${stats.defense}</span>
        </div>
        <div class="stat-item">
            <span class="stat-name">Sp. Atk</span>
            <div class="stat-bar-container">
                <div class="stat-bar" style="width: ${(stats.specialAttack / 255) * 100}%"></div>
            </div>
            <span class="stat-value">${stats.specialAttack}</span>
        </div>
        <div class="stat-item">
            <span class="stat-name">Sp. Def</span>
            <div class="stat-bar-container">
                <div class="stat-bar" style="width: ${(stats.specialDefense / 255) * 100}%"></div>
            </div>
            <span class="stat-value">${stats.specialDefense}</span>
        </div>
        <div class="stat-item">
            <span class="stat-name">Speed</span>
            <div class="stat-bar-container">
                <div class="stat-bar" style="width: ${(stats.speed / 255) * 100}%"></div>
            </div>
            <span class="stat-value">${stats.speed}</span>
        </div>
    `
}

// Atualizar tab de moves
function updateMovesTab(pokemon) {
    const movesContainer = document.querySelector('.moves-list')
    movesContainer.innerHTML = pokemon.moves.map(move => 
        `<div class="move-item">${move.replace('-', ' ')}</div>`
    ).join('')
}

// Alternar entre tabs
function switchTab(tabName) {
    // Remover active de todos os botões e panes
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'))
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'))
    
    // Adicionar active ao botão e pane selecionados
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active')
    document.getElementById(tabName).classList.add('active')
}

// Sistema de Favoritos
function toggleFavorite() {
    const pokemonId = parseInt(document.querySelector('.detail-number').textContent.replace('#', ''))
    const index = favorites.indexOf(pokemonId)
    
    if (index > -1) {
        favorites.splice(index, 1)
        favoriteDetailButton.classList.remove('favorited')
    } else {
        favorites.push(pokemonId)
        favoriteDetailButton.classList.add('favorited')
    }
    
    localStorage.setItem('pokedexFavorites', JSON.stringify(favorites))
    updateFavoriteIndicators()
}

function updateFavoriteIndicators() {
    document.querySelectorAll('.pokemon').forEach(card => {
        const pokemonId = parseInt(card.getAttribute('data-id'))
        const indicator = card.querySelector('.favorite-indicator')
        if (indicator) {
            indicator.classList.toggle('favorited', favorites.includes(pokemonId))
        }
    })
}

// Sistema de Filtro
function initTypeFilter() {
    const types = ['all', 'normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy']
    
    filterGrid.innerHTML = types.map(type => `
        <button class="type-filter-btn ${type} ${type === 'all' ? 'active' : ''}" data-type="${type}">
            ${type === 'all' ? 'All' : type}
        </button>
    `).join('')
    
    // Event listeners para filtros
    document.querySelectorAll('.type-filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const selectedType = e.target.getAttribute('data-type')
            setFilter(selectedType)
        })
    })
}

function setFilter(type) {
    currentFilter = type
    
    // Atualizar UI dos botões
    document.querySelectorAll('.type-filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-type') === type)
    })
    
    // Aplicar filtro
    applyFilter()
}

function applyFilter() {
    offset = generations[currentGeneration].offset
    pokemonList.innerHTML = ''
    loadMoreButton.style.display = 'block'
    
    if (currentFilter === 'all') {
        loadPokemonItems(offset, limit)
    } else {
        loadFilteredPokemons()
    }
}

function filterPokemonsByType(pokemons) {
    if (currentFilter === 'all') return pokemons
    return pokemons.filter(pokemon => 
        pokemon.types.includes(currentFilter) || pokemon.type === currentFilter
    )
}

function loadFilteredPokemons() {
    // Carrega um número maior para ter chance de encontrar do tipo
    pokeApi.getPokemons(0, 50).then((pokemons = []) => {
        const filteredPokemons = filterPokemonsByType(pokemons)
        const html = filteredPokemons.map(convertPokemonToLi).join('')
        pokemonList.innerHTML = html
        addPokemonCardListeners()
        
        // Se não encontrou pokémons, tenta carregar mais
        if (filteredPokemons.length === 0) {
            loadMoreButton.click()
        }
    })
}

function toggleTypeFilter() {
    typeFilter.classList.toggle('hidden')
}

function showFavorites() {
    if (favorites.length === 0) {
        alert('You have no favorite Pokémon yet!')
        return
    }
    
    setFilter('all')
    offset = 0
    pokemonList.innerHTML = ''
    
    // Carregar apenas favoritos
    const favoritePromises = favorites.map(id => pokeApi.getPokemonById(id))
    Promise.all(favoritePromises).then(favoritePokemons => {
        const validPokemons = favoritePokemons.filter(pokemon => pokemon !== null)
        const html = validPokemons.map(convertPokemonToLi).join('')
        pokemonList.innerHTML = html
        addPokemonCardListeners()
        
        loadMoreButton.style.display = 'none'
    })
}

// Sistema de Gerações
function showGenerationSelector() {
    // Remove selector anterior se existir
    const existingSelector = document.querySelector('.generation-selector')
    if (existingSelector) {
        existingSelector.remove()
        return
    }
    
    const selector = document.createElement('div')
    selector.className = 'generation-selector'
    selector.innerHTML = `
        <div class="generation-options">
            <h3>Selecionar Geração</h3>
            ${Object.entries(generations).map(([gen, data]) => `
                <button class="gen-option ${gen === currentGeneration ? 'active' : ''}" 
                        data-gen="${gen}">
                    Gen ${gen} - ${data.name} (${data.limit} Pokémon)
                </button>
            `).join('')}
        </div>
    `
    
    document.querySelector('.header').appendChild(selector)
    
    // Event listeners para as opções
    selector.querySelectorAll('.gen-option').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const selectedGen = e.target.getAttribute('data-gen')
            setGeneration(selectedGen)
            selector.remove()
        })
    })
    
    // Fechar ao clicar fora
    setTimeout(() => {
        document.addEventListener('click', function closeSelector(e) {
            if (!selector.contains(e.target) && e.target.id !== 'generationButton') {
                selector.remove()
                document.removeEventListener('click', closeSelector)
            }
        })
    }, 100)
}

function setGeneration(gen) {
    currentGeneration = gen
    const genData = generations[gen]
    
    maxRecords = genData.limit
    offset = genData.offset
    
    // Atualiza texto do botão
    generationButton.textContent = `Gen ${gen}`
    
    // Reseta e recarrega
    resetAndReload()
}

function resetAndReload() {
    offset = generations[currentGeneration].offset
    pokemonList.innerHTML = ''
    loadMoreButton.style.display = 'block'
    loadPokemonItems(offset, limit)
}