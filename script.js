// ✅ Updated script.js with refining system and full integration

let state = JSON.parse(localStorage.getItem("duneState")) || {
  bases: {},
  selectedBase: null
};

function saveState() {
  localStorage.setItem("duneState", JSON.stringify(state));
}

// Refining recipes (simplified system)
const refiningRecipes = {
  Small: {
    chemical: {
      "Cobalt Paste": { input: { Water: 75 }, output: { "Erythrite Crystal": 3 } },
      "Industrial Lubricant": { input: { Water: 15 }, output: { "Fuel Cell": 8, Silicone: 4, "Spice Residue": 5 } },
      "Low-grade Lubricant": { input: { Water: 4 }, output: { "Fuel Cell": 2, Silicone: 1 } },
      "Med Vehicle Fuel Cell": { input: { Water: 15 }, output: { "Fuel Cell": 45, Silicone: 1 } },
      "Silicone Block": { input: { Water: 50 }, output: { "Flour Sand": 5 } },
      "Small Vehicle Fuel Cell": { input: {}, output: { "Fuel Cell": 1 } }
    },
    ore: {
      "Copper Ingot": { input: {}, output: { "Copper Ore": 4 } },
      "Iron Ingot": { input: { Water: 25 }, output: { "Iron Ore": 5 } },
      "Steel Ingot": { input: { Water: 50 }, output: { "Carbon Ore": 4, "Iron Ingot": 1 } }
    },
    spice: {
      "Spice Melange": { input: { Water: 750 }, output: { "Spice Sand": 1 } }
    }
  },
  Medium: {
    chemical: {
      "Cobalt Paste": { input: { Water: 75 }, output: { "Erythrite Crystal": 2 } },
      "Industrial Lubricant": { input: { Water: 15 }, output: { "Fuel Cell": 6, Silicone: 4, "Spice Residue": 5 } },
      "Large Vehicle Fuel Cell": { input: { Water: 30 }, output: { "Fuel Cell": 80 } },
      "Low-grade Lubricant": { input: { Water: 4 }, output: { "Fuel Cell": 1, Silicone: 1 } },
      "Med Vehicle Fuel Cell": { input: { Water: 15 }, output: { "Fuel Cell": 40, Silicone: 1 } },
      "Silicone Block": { input: { Water: 50 }, output: { "Flour Sand": 3 } },
      "Small Vehicle Fuel Cell": { input: {}, output: { "Fuel Cell": 20 } },
      "Spice-infused Fuel Cell": { input: { Water: 200 }, output: { "Fuel Cell": 30, "Spice Residue": 65, "Irradiated Slag": 3 } },
      "Stravidium Fiber": { input: { Water: 100 }, output: { "Stravidium Mass": 1 } }
    },
    ore: {
      "Aluminum Ingot": { input: { Water: 200 }, output: { "Aluminum Ore": 7 } },
      "Copper Ingot": { input: {}, output: { "Copper Ore": 3 } },
      "Duraluminum Ingot": { input: { Water: 500 }, output: { "Jasmium Crystal": 4, "Aluminum Ingot": 1 } },
      "Iron Ingot": { input: { Water: 25 }, output: { "Iron Ore": 4 } },
      "Plastanium Ingot": { input: { Water: 1250 }, output: { "Titanium Ore": 6, "Stravidium Fiber": 1 } },
      "Plastone": { input: { Water: 50 }, output: { "Basalt Stone": 200, Silicone: 1 } },
      "Steel Ingot": { input: { Water: 50 }, output: { "Carbon Ore": 3, "Iron Ingot": 1 } }
    },
    spice: {
      "Spice Melange x10": { input: { Water: 7000 }, output: { "Spice Sand": 1 } }
    }
  },
  Large: {
    spice: {
      "Spice Melange x200": { input: { Water: 75000 }, output: { "Spice Sand": 1 } }
    }
  }
};

function getAvailableRefiningRecipes(base) {
  const recipes = {};
  const { ore, chemical, spice } = base.refiners;
  if (ore && refiningRecipes[ore]?.ore) Object.assign(recipes, refiningRecipes[ore].ore);
  if (chemical && refiningRecipes[chemical]?.chemical) Object.assign(recipes, refiningRecipes[chemical].chemical);
  if (spice && refiningRecipes[spice]?.spice) Object.assign(recipes, refiningRecipes[spice].spice);
  return recipes;
}

function renderRefiningUI() {
  const container = document.getElementById("refiningUI");
  if (!container || !state.selectedBase) return;

  const base = state.bases[state.selectedBase];
  const available = getAvailableRefiningRecipes(base);
  container.innerHTML = `
    <h3>⚗️ Refining Station</h3>
    <label>Choose Recipe:</label>
    <select id="refineSelect">
      ${Object.keys(available).map(r => `<option value="${r}">${r}</option>`).join("")}
    </select>
    <input id="refineQty" type="number" value="1" min="1" style="width: 60px">
    <button onclick="simulateRefine()">🛠️ Craft</button>
  `;
}

function simulateRefine() {
  const recipeName = document.getElementById("refineSelect").value;
  const qty = parseInt(document.getElementById("refineQty").value);
  const base = state.bases[state.selectedBase];
  const all = getAvailableRefiningRecipes(base);
  const recipe = all[recipeName];
  if (!recipe) return;

  // check inputs
  for (let input in recipe.input) {
    const available = base.resources[input] || 0;
    if (available < recipe.input[input] * qty) {
      alert(`Not enough ${input}`);
      return;
    }
  }

  // deduct input
  for (let input in recipe.input) {
    base.resources[input] -= recipe.input[input] * qty;
  }
  // add output
  for (let output in recipe.output) {
    base.resources[output] = (base.resources[output] || 0) + recipe.output[output] * qty;
  }
  saveState();
  renderBases();
  renderResourceEditor();
  renderRefiningUI();
}
