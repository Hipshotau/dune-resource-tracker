let state = JSON.parse(localStorage.getItem("duneState")) || {
  bases: {},
  selectedBase: null
};

// Save changes to localStorage
function saveState() {
  localStorage.setItem("duneState", JSON.stringify(state));
}

// Add a new base
function addBase() {
  const name = prompt("Enter new base name:");
  if (!name || state.bases[name]) return;
  state.bases[name] = {
    resources: {},
    refiners: {
      ore: "",
      chemical: "",
      spice: "",
      deathstill: {
        type: "",
        count: 0
      }
    }
  };
  state.selectedBase = name;
  updateBaseSelect();
  renderResourceEditor();
  renderRefineryList();
  saveState();
}

// Remove currently selected base
function removeBase() {
  if (!state.selectedBase) return;
  delete state.bases[state.selectedBase];
  state.selectedBase = Object.keys(state.bases)[0] || null;
  updateBaseSelect();
  renderResourceEditor();
  renderRefineryList();
  saveState();
}

// Update the dropdown of base names
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
    renderRefineryList();
    saveState();
  };
}

// Render list of resources for selected base
function renderResourceEditor() {
  const container = document.getElementById("resourceEditor");
  if (!container || !state.selectedBase) return;

  const base = state.bases[state.selectedBase];
  const resources = base.resources;
  container.innerHTML = "<h3>📦 Resources</h3>";

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

// Add a new resource to current base
function addResource() {
  const name = document.getElementById("newResourceName").value.trim();
  const qty = parseInt(document.getElementById("newResourceQty").value);
  if (!name || isNaN(qty)) return;
  state.bases[state.selectedBase].resources[name] = qty;
  renderResourceEditor();
  saveState();
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

// Render refinery & deathstill settings
function renderRefineryList() {
  const container = document.getElementById("refinerySettings");
  if (!container || !state.selectedBase) return;

  const base = state.bases[state.selectedBase];
  if (!base.refiners) {
    base.refiners = {
      ore: "",
      chemical: "",
      spice: "",
      deathstill: { type: "", count: 0 }
    };
  }

  container.innerHTML = `
    <h3>⚙️ Refinery Setup</h3>
    <label>Ore Refinery:
      <select onchange="updateRefinery('ore', this.value)">
        <option value="">Select</option>
        <option value="Small" ${base.refiners.ore === 'Small' ? 'selected' : ''}>Small</option>
        <option value="Medium" ${base.refiners.ore === 'Medium' ? 'selected' : ''}>Medium</option>
        <option value="Large" ${base.refiners.ore === 'Large' ? 'selected' : ''}>Large</option>
      </select>
    </label>
    <br/>
    <label>Chemical Refinery:
      <select onchange="updateRefinery('chemical', this.value)">
        <option value="">Select</option>
        <option value="Small" ${base.refiners.chemical === 'Small' ? 'selected' : ''}>Small</option>
        <option value="Medium" ${base.refiners.chemical === 'Medium' ? 'selected' : ''}>Medium</option>
        <option value="Large" ${base.refiners.chemical === 'Large' ? 'selected' : ''}>Large</option>
      </select>
    </label>
    <br/>
    <label>Spice Refinery:
      <select onchange="updateRefinery('spice', this.value)">
        <option value="">Select</option>
        <option value="Basic" ${base.refiners.spice === 'Basic' ? 'selected' : ''}>Basic</option>
        <option value="Upgraded" ${base.refiners.spice === 'Upgraded' ? 'selected' : ''}>Upgraded</option>
      </select>
    </label>
    <br/>
    <label>Deathstill Type:
      <select onchange="updateDeathstillType(this.value)">
        <option value="">Select</option>
        <option value="Fremen" ${base.refiners.deathstill.type === 'Fremen' ? 'selected' : ''}>Fremen</option>
        <option value="Advanced Fremen" ${base.refiners.deathstill.type === 'Advanced Fremen' ? 'selected' : ''}>Advanced Fremen</option>
      </select>
    </label>
    <br/>
    <label>Number of Deathstills:
      <input type="number" value="${base.refiners.deathstill.count}" onchange="updateDeathstillCount(this.value)">
    </label>
  `;
}

function updateRefinery(type, value) {
  state.bases[state.selectedBase].refiners[type] = value;
  saveState();
}

function updateDeathstillType(value) {
  state.bases[state.selectedBase].refiners.deathstill.type = value;
  saveState();
}

function updateDeathstillCount(count) {
  state.bases[state.selectedBase].refiners.deathstill.count = parseInt(count) || 0;
  saveState();
}

// Called on dashboard.html to render the total chart and breakdown
function renderTotalSummary(withChart = false) {
  const container = document.getElementById("baseBreakdown") || document.getElementById("summary");
  if (!container) return;

  const totals = {};
  const baseSections = [];

  for (let baseName in state.bases) {
    const base = state.bases[baseName];
    const resources = base.resources;

    const sorted = Object.entries(resources).sort((a, b) => b[1] - a[1]);

    const baseCol = document.createElement("div");
    baseCol.className = "base-column";
    baseCol.innerHTML = `<h3>${baseName}</h3>`;

    sorted.forEach(([res, qty]) => {
      totals[res] = (totals[res] || 0) + qty;
      const div = document.createElement("div");
      div.innerHTML = `<strong>${res}:</strong> ${qty}`;
      baseCol.appendChild(div);
    });

    baseSections.push(baseCol);
  }

  if (container.id === "summary") {
    const table = document.createElement("table");
    for (let res in totals) {
      const row = document.createElement("tr");
      row.innerHTML = `<td><strong>${res}</strong></td><td>${totals[res]}</td>`;
      table.appendChild(row);
    }
    container.innerHTML = "<h2>Resource Totals</h2>";
    container.appendChild(table);
  } else {
    container.innerHTML = "";
    baseSections.forEach(section => container.appendChild(section));
  }

  if (withChart && typeof Chart !== "undefined") {
    const ctx = document.getElementById("stockpileChart").getContext("2d");
    const sortedTotals = Object.entries(totals).sort((a, b) => b[1] - a[1]);
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: sortedTotals.map(x => x[0]),
        datasets: [{
          label: "Total Stockpile",
          data: sortedTotals.map(x => x[1]),
          backgroundColor: 'rgba(0,255,255,0.2)',
          borderColor: 'cyan',
          borderWidth: 2
        }]
      },
      options: {
        scales: {
          y: { beginAtZero: true }
        },
        plugins: {
          legend: { labels: { color: '#fff' } }
        }
      }
    });
  }
}

// Init (used in index.html or dashboard.html)
if (window.location.pathname.includes("index.html") || window.location.pathname === "/") {
  updateBaseSelect();
  renderResourceEditor();
  renderRefineryList();
}
