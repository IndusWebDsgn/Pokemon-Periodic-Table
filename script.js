const apiUrl = 'https://pokeapi.co/api/v2/pokemon?limit=150';
const tableContainer = document.getElementById('table-container');

const types = [
  'normal', 'fire', 'water', 'electric', 'grass',
  'ice', 'fighting', 'poison', 'ground', 'flying',
  'psychic', 'bug', 'rock', 'ghost', 'dragon',
  'dark', 'steel', 'fairy'
];
const evolutionStages = {
  unevolved: [],
  firstEvolution: [],
  secondEvolution: []
};

const typeGroups = {};
types.forEach(type => {
  typeGroups[type] = [];
});

async function fetchPokemon() {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    const pokemonList = data.results;

    const detailedPokemon = await Promise.all(
      pokemonList.map(pokemon => fetch(pokemon.url).then(res => res.json()))
    );

    detailedPokemon.forEach(pokemonData => classifyPokemon(pokemonData));

    populateTable();
  } catch (error) {
    console.error('Error fetching Pokémon data:', error);
    tableContainer.innerHTML = `<p>Error fetching Pokémon. Please try again later.</p>`;
  }
}

function classifyPokemon(pokemon) {
  const pokemonTypes = pokemon.types.map(type => type.type.name);
  const baseXP = pokemon.base_experience;

  if (typeGroups[pokemonTypes[0]]) {
    typeGroups[pokemonTypes[0]].push({
      name: pokemon.name,
      sprite: pokemon.sprites.front_default,
      baseXP: baseXP
    });
  }

  if (baseXP < 100) {
    evolutionStages.unevolved.push(pokemon);
  } else if (baseXP < 200) {
    evolutionStages.firstEvolution.push(pokemon);
  } else {
    evolutionStages.secondEvolution.push(pokemon);
  }
}

function populateTable() {
  for (const stage in evolutionStages) {
    const row = document.createElement('div');
    row.className = 'row';

    for (const type in typeGroups) {
      const group = document.createElement('div');
      group.className = 'type-group';
      group.innerHTML = `<h3>${type}</h3>`;


      const pokemonCards = typeGroups[type]
        .filter(pokemon => evolutionStages[stage].some(p => p.name === pokemon.name))
        .sort((a, b) => a.baseXP - b.baseXP);

      pokemonCards.forEach(pokemon => {
        const card = document.createElement('div');
        card.className = 'pokemon-card';
        card.innerHTML = `
          <img src="${pokemon.sprite}" alt="${pokemon.name}">
          <p>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</p>
          <p>XP: ${pokemon.baseXP}</p>
        `;
        group.appendChild(card);
      });

      if (group.childNodes.length > 1) {
        row.appendChild(group);
      }
    }

    tableContainer.appendChild(row);
  }
}

fetchPokemon();