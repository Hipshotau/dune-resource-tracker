let state = JSON.parse(localStorage.getItem("duneState")) || {
  bases: {
    "Arrakis North": { resources: {}, refiners: [] },
    "Arrakis South": { resources: {}, refiners: [] },
    "Spice Ridge": { resources: {}, refiners: [] },
    "Deep Dunes": { resources: {}, refiners: [] },
  },
  selectedBase: "Arrakis North"
};

function preloadRecipes() {
  if (localStorage.getItem("duneState")) return; // Don't overwrite user data

  const state = {
    bases: {},
    selectedBase: null,
    resources: [],
    recipes: []
  };

  const recipes = [
    {
      name: "Advanced Fremen Deathstill",
      inputs: "1 Body",
      outputs: "45000 Water",
      tier: 6
    },
    {
      name: "Fremen Deathstill",
      inputs: "1 Body",
      outputs: "25000 Water",
      tier: 5
    },
    {
      name: "Spice Melange (Small)",
      inputs: "Spice Sand",
      outputs: "1 Spice Melange",
      tier: 3
    },
    {
      name: "Spice Melange (Medium)",
      inputs: "Spice Sand x10",
      outputs: "10 Spice Melange",
      tier: 3
    },
    {
      name: "Spice Melange (Large)",
      inputs: "Spice Sand x200",
      outputs: "200 Spice Melange",
      tier: 3
    },
    {
      name: "Aluminum Ingot (Large)",
      inputs: "200 Water, 4 Aluminum Ore",
      outputs: "1 Aluminum Ingot",
      tier: 4
    },
    {
      name: "Copper Ingot (Large)",
      inputs: "2 Copper Ore",
      outputs: "1 Copper Ingot",
      tier: 1
    },
    {
      name: "Steel Ingot (Large)",
      inputs: "50 Water, 2 Carbon Ore, 1 Iron Ingot",
      outputs: "1 Steel Ingot",
      tier: 3
    },
    {
      name: "Stravidium Fiber",
      inputs: "100 Water, 1 Stravidium Mass",
      outputs: "1 Stravidium Fiber",
      tier: 6
    },
    {
      name: "Plastanium Ingot",
      inputs: "1250 Water, 4 Titanium Ore, 1 Stravidium Fiber",
      outputs: "1 Plastanium Ingot",
      tier: 6
    },
    {
      name: "Lubricant (Low Grade)",
      inputs: "4 Fuel Cell, 5 Spice Residue",
      outputs: "5 Low-grade Lubricant",
      tier: 3
    },
    {
      name: "Industrial Lubricant",
      inputs: "15 Water, 8 Fuel Cell, 4 Silicone Block",
      outputs: "10 Industrial-grade Lubricant",
      tier: 5
    },
    {
      name: "Silicone Block",
      inputs: "50 Water, 5 Flour Sand",
      outputs: "1 Silicone Block",
      tier: 2
    },
    {
      name: "Cobalt Paste",
      inputs: "75 Water, 2 Erythrite Crystal",
      outputs: "1 Cobalt Paste",
      tier: 3
    }
  ];

  state.recipes = recipes;
  localStorage.setItem("duneState", JSON.stringify(state));
}


function saveState() {
  localStorage.setItem("duneState", JSON.stringify(state));
}

function addBase() {
  const name = prompt("Enter new base name:");
  if (!name || state.bases[name]) return;
  state.bases[name] = { resources: {}, refiners: [] };
  state.selectedBase = name;
  updateBaseSelect();
  renderResourceEditor();
  saveState();
}

function updateBaseSelect() {
  const select = document.getElementById("baseSelect");
  if (!select) return;
  select.innerHTML = "";
  for (let base in state.bases) {
    const opt = document.createElement("option");
    opt.value = opt.textContent = base;
    if (base === state.selectedBase) opt.selected = true;
    select.appendChild(opt);
  }
  select.onchange = () => {
    state.selectedBase = select.value;
    renderResourceEditor();
    renderRefineryList(); // <-- Add this
    saveState();
  };
}


function renderResourceEditor() {
  const container = document.getElementById("resourceEditor");
  if (!container || !state.selectedBase) return;

  container.innerHTML = "";
  const base = state.bases[state.selectedBase];
  const resources = base.resources;

  for (let key in resources) {
    const div = document.createElement("div");
    div.innerHTML = `
      <strong>${key}:</strong>
      <input type="number" value="${resources[key]}" onchange="updateResource('${key}', this.value)">
      <button onclick="deleteResource('${key}')">❌</button>
    `;
    container.appendChild(div);
  }

  const newDiv = document.createElement("div");
  newDiv.innerHTML = `
    <input id="newResourceName" placeholder="Resource name">
    <input id="newResourceQty" type="number" placeholder="Quantity">
    <button onclick="addResource()">+ Add Resource</button>
  `;
  container.appendChild(newDiv);
}

function updateResource(key, value) {
  state.bases[state.selectedBase].resources[key] = parseInt(value) || 0;
  saveState();
}

function deleteResource(key) {
  delete state.bases[state.selectedBase].resources[key];
  renderResourceEditor();
  saveState();
}

function addResource() {
  const name = document.getElementById("newResourceName").value;
  const qty = parseInt(document.getElementById("newResourceQty").value);
  if (!name || isNaN(qty)) return;
  state.bases[state.selectedBase].resources[name] = qty;
  renderResourceEditor();
  saveState();
}

function renderTotalSummary() {
  const container = document.getElementById("summary");
  const chartCanvas = document.getElementById("stockpileChart");
  const totals = {};

  for (let baseName in state.bases) {
    const base = state.bases[baseName];
    for (let res in base.resources) {
      totals[res] = (totals[res] || 0) + base.resources[res];
    }
  }

  // Render table
  const table = document.createElement("table");
  for (let key in totals) {
    const row = document.createElement("tr");
    row.innerHTML = `<td><strong>${key}</strong></td><td>${totals[key]}</td>`;
    table.appendChild(row);
  }
  container.innerHTML = "<h2>Resource Totals</h2>";
  container.appendChild(table);

  // Render chart
  const labels = Object.keys(totals);
  const data = Object.values(totals);

  new Chart(chartCanvas, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Total Stockpile",
        data: data,
        backgroundColor: "rgba(255, 204, 0, 0.6)",
        borderColor: "rgba(255, 204, 0, 1)",
        borderWidth: 1
      }]
    },
    options: {
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: "#fff" },
          grid: { color: "#333" }
        },
        x: {
          ticks: { color: "#fff" },
          grid: { color: "#333" }
        }
      }
    }
  });
}

function renderBaseStockpiles() {
  const container = document.getElementById("baseStockpiles");
  if (!container) return;

  container.innerHTML = "<h2>Base Stockpiles</h2>";

  const important = [
    "Granite", "Plastone", "Duraluminum Ingot", "Aluminum Ingot",
    "Cobalt Paste", "Silicone Block", "Flour Sand", "Spice Sand",
    "Spice Melange", "Plastanium Ingot", "Iron Ingot", "Steel Ingot",
    "Basalt", "Iron Ore", "Carbon Ore", "Aluminum Ore",
    "Erythrite Crystal", "Jasmium Crystal", "Plant Fiber", "Agave Seeds",
    "Water", "Copper Ingot", "Copper Ore"
  ];

  for (let baseName in state.bases) {
    const base = state.bases[baseName];
    const div = document.createElement("div");
    div.className = "resource-card";
    div.innerHTML = `<h3>${baseName}</h3>`;

    const table = document.createElement("table");
    const sorted = Object.entries(base.resources || {})
      .filter(([name]) => important.includes(name))
      .sort((a, b) => b[1] - a[1]);

    sorted.forEach(([name, qty]) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${name}</td>
        <td>
          <input type="number" value="${qty}" 
            onchange="updateBaseResource('${baseName}', '${name}', this.value)">
        </td>`;
      table.appendChild(row);
    });

    div.appendChild(table);
    container.appendChild(div);
  }
}

function updateBaseResource(baseName, resName, value) {
  state.bases[baseName].resources[resName] = parseInt(value) || 0;
  saveState();
}


// Default refining data
if (!state.resources) state.resources = [];
if (!state.recipes) state.recipes = [];

function addResource() {
  const input = document.getElementById("newResource");
  const name = input.value.trim();
  if (!name || state.resources.includes(name)) return;
  state.resources.push(name);
  input.value = "";
  saveState();
  renderResources();
}

function renderResources() {
  const list = document.getElementById("resourceList");
  if (!list) return;
  list.innerHTML = "";
  state.resources.forEach((res, i) => {
    const div = document.createElement("div");
    div.innerHTML = `
      ${res}
      <button onclick="removeResource(${i})">❌</button>
    `;
    list.appendChild(div);
  });
}

function removeResource(index) {
  state.resources.splice(index, 1);
  saveState();
  renderResources();
}

function addRecipe() {
  const name = document.getElementById("recipeName").value.trim();
  const inputs = document.getElementById("recipeInputs").value.trim();
  const outputs = document.getElementById("recipeOutputs").value.trim();

  if (!name || !inputs || !outputs) return;

  state.recipes.push({ name, inputs, outputs });
  document.getElementById("recipeName").value = "";
  document.getElementById("recipeInputs").value = "";
  document.getElementById("recipeOutputs").value = "";

  saveState();
  renderRecipes();
}

function renderRecipes() {
  const list = document.getElementById("recipeList");
  if (!list) return;
  list.innerHTML = "";
  state.recipes.forEach((recipe, i) => {
    const div = document.createElement("div");
    div.className = "resource-card";
    div.innerHTML = `
      <strong>${recipe.name}</strong>
      <div class="recipe">🔹 Inputs: ${recipe.inputs}</div>
      <div class="recipe">🔸 Outputs: ${recipe.outputs}</div>
      <button onclick="removeRecipe(${i})">❌ Delete</button>
    `;
    list.appendChild(div);
  });

  populateCraftDropdown();  // <-- refresh dropdowns
}

function removeBase() {
  if (confirm(`Delete base "${state.selectedBase}"?`)) {
    delete state.bases[state.selectedBase];
    const first = Object.keys(state.bases)[0];
    state.selectedBase = first || null;
    updateBaseSelect();
    renderResourceEditor();
    renderRefineryList();
    saveState();
  }
}

function renderRefineryList() {
  const container = document.getElementById("refineryList");
  if (!container || !state.selectedBase) return;

  const base = state.bases[state.selectedBase];
  container.innerHTML = `<h3>Refineries at ${state.selectedBase}</h3>`;

  const list = document.createElement("ul");
  base.refiners.forEach((r, i) => {
    const li = document.createElement("li");
    li.textContent = r;
    const delBtn = document.createElement("button");
    delBtn.textContent = "❌";
    delBtn.onclick = () => {
      base.refiners.splice(i, 1);
      renderRefineryList();
      saveState();
    };
    li.appendChild(delBtn);
    list.appendChild(li);
  });

  const input = document.createElement("input");
  input.placeholder = "Add refinery (e.g. Medium Ore Refinery)";
  const btn = document.createElement("button");
  btn.textContent = "➕";
  btn.onclick = () => {
    if (input.value.trim()) {
      base.refiners.push(input.value.trim());
      input.value = "";
      renderRefineryList();
      saveState();
    }
  };

  container.appendChild(list);
  container.appendChild(input);
  container.appendChild(btn);
}


function removeRecipe(index) {
  state.recipes.splice(index, 1);
  saveState();
  renderRecipes();
}

function populateCraftDropdown() {
  const select = document.getElementById("craftRecipe");
  if (!select || !state.recipes) return;
  select.innerHTML = "";
  state.recipes.forEach((recipe, index) => {
    const opt = document.createElement("option");
    opt.value = index;
    opt.textContent = recipe.name;
    select.appendChild(opt);
  });
}

function simulateCraft() {
  const base = state.bases[state.selectedBase];
  const recipeIndex = parseInt(document.getElementById("craftRecipe").value);
  const qty = parseInt(document.getElementById("craftQty").value) || 1;
  const recipe = state.recipes[recipeIndex];

  const inputList = parseIngredients(recipe.inputs);
  const totalRequired = {};

  for (let item of inputList) {
    totalRequired[item.name] = (totalRequired[item.name] || 0) + item.qty * qty;
  }

  // Check availability
  for (let name in totalRequired) {
    const available = base.resources[name] || 0;
    if (available < totalRequired[name]) {
      alert(`❌ Not enough ${name}. Need ${totalRequired[name]}, have ${available}.`);
      return;
    }
  }

  // Deduct inputs
  for (let name in totalRequired) {
    base.resources[name] -= totalRequired[name];
  }

  // Add outputs
  const outputList = parseIngredients(recipe.outputs);
  for (let item of outputList) {
    base.resources[item.name] = (base.resources[item.name] || 0) + item.qty * qty;
  }

  alert(`✅ Crafted ${qty}x ${recipe.name}`);
  saveState();
  renderResourceEditor();
}

function parseIngredients(text) {
  return text.split(",").map(s => {
    const parts = s.trim().split(" ");
    const qty = parseInt(parts[0]) || 1;
    const name = parts.slice(1).join(" ");
    return { name, qty };
  });
}


// Init if on index.html
if (window.location.pathname.endsWith("index.html") || window.location.pathname === "/") {
  updateBaseSelect();
  renderResourceEditor();
}
