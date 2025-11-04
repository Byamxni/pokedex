
class Pokemon {
    number;
    name;
    type;
    types = [];
    photo;
    
    // propriedades para detalhes
    height;
    weight;
    abilities = [];
    stats = {
        hp: 0,
        attack: 0,
        defense: 0,
        specialAttack: 0,
        specialDefense: 0,
        speed: 0
    };
    species;
    moves = [];
    
    // Método para obter cor baseada no tipo (para gradientes)
    getTypeGradient() {
        const gradientMap = {
            normal: 'linear-gradient(135deg, #a6a877, #c8c8a8)',
            grass: 'linear-gradient(135deg, #77c850, #98d8a0)',
            fire: 'linear-gradient(135deg, #ee7f30, #f5ac78)',
            water: 'linear-gradient(135deg, #678fee, #9db7f5)',
            electric: 'linear-gradient(135deg, #f7cf2e, #fae078)',
            ice: 'linear-gradient(135deg, #98d5d7, #bce6e6)',
            ground: 'linear-gradient(135deg, #dfbf69, #e7d9a9)',
            flying: 'linear-gradient(135deg, #a98ff0, #c6b2f5)',
            poison: 'linear-gradient(135deg, #a040a0, #c183c1)',
            fighting: 'linear-gradient(135deg, #bf3029, #d67873)',
            psychic: 'linear-gradient(135deg, #f65687, #f8a8c3)',
            dark: 'linear-gradient(135deg, #725847, #a29288)',
            rock: 'linear-gradient(135deg, #b8a137, #d1c17d)',
            bug: 'linear-gradient(135deg, #a8b720, #d8e0a0)',
            ghost: 'linear-gradient(135deg, #6e5896, #a292bc)',
            steel: 'linear-gradient(135deg, #b9b7cf, #d4d2e7)',
            dragon: 'linear-gradient(135deg, #6f38f6, #9d75f9)',
            fairy: 'linear-gradient(135deg, #f9aec7, #fbcfe1)'
        };
        return gradientMap[this.type] || gradientMap.normal;
    }
    
    // Método para formatar altura (metros)
    getFormattedHeight() {
        return `${this.height / 10} m`;
    }
    
    // Método para formatar peso (kg)
    getFormattedWeight() {
        return `${this.weight / 10} kg`;
    }
    
    // Método para obter habilidades formatadas
    getFormattedAbilities() {
        return this.abilities.map(ability => 
            ability.replace('-', ' ')
        ).join(', ');
    }
}