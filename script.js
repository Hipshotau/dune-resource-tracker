let state = JSON.parse(localStorage.getItem("duneState")) || {
  bases: {
    "Arrakis North": { resources: {}, refiners: [] },
    "Arrakis South": { resources: {}, refiners: [] },
    "Spice Ridge": { resources: {}, refiners: [] },
    "Deep Dunes": { resources: {}, refiners: [] },
  },
  selectedBase: "Arrakis North"
};

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
  const totals = {};

  for (let baseName in state.bases) {
    const base = state.bases[baseName];
    for (let res in base.resources) {
      totals[res] = (totals[res] || 0) + base.resources[res];
    }
  }

  const table = document.createElement("table");
  for (let key in totals) {
    const row = document.createElement("tr");
    row.innerHTML = `<td><strong>${key}</strong></td><td>${totals[key]}</td>`;
    table.appendChild(row);
  }
  container.innerHTML = "<h2>Resource Totals</h2>";
  container.appendChild(table);
}

// Init if on index.html
if (window.location.pathname.endsWith("index.html") || window.location.pathname === "/") {
  updateBaseSelect();
  renderResourceEditor();
}
