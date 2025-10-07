//
// Application logic for the FIAT simulators. This script is responsible
// for populating the drop‑downs, computing values from the hard‑coded
// data set, responding to user interaction and updating the UI. The
// data model here is intentionally simple so that values can easily be
// replaced or extended when more accurate figures are available.
//

/*
 * Data definition for the plan de ahorro. Each entry specifies a
 * combination of model and plan along with the base value of the
 * vehicle. Other values (alícuota, cuotas por tramo) are derived
 * dynamically when the user selects an option. Should you require
 * exact values, update this array accordingly.
 */
const planData = [
  { key: "Cronos 90/10", model: "Cronos", plan: "90/10", value: 34100000 },
  { key: "Cronos 70/30", model: "Cronos", plan: "70/30", value: 34100000 },
  { key: "Argo 70/30", model: "Argo", plan: "70/30", value: 27898000 },
  { key: "Mobi 80/20", model: "Mobi", plan: "80/20", value: 24964000 },
  { key: "Pulse 70/30", model: "Pulse", plan: "70/30", value: 34015000 },
  { key: "Fastback 60/40", model: "Fastback", plan: "60/40", value: 42117000 },
  { key: "Toro 70/30", model: "Toro", plan: "60/40", value: 42390000 },
  { key: "Strada 70/30", model: "Strada", plan: "70/30", value: 34872000 },
  { key: "Fiorino 70/30", model: "Fiorino", plan: "70/30", value: 27459000 },
  { key: "Titano 70/30", model: "Titano", plan: "80/20", value: 48964000 }
];

/*
 * Rules for adjudications. The keys correspond to the `key` field in
 * `planData`. Each nested object contains entries mapping a specific
 * cuota number to a percentage of adjudication. Percentages are given
 * as fractional values (e.g. 0.20 means 20%).
 */
const adjudications = {
  // Added cuota 4 with 20% adjudication for Cronos 90/10 per client request.
  "Cronos 90/10": { 2: 0.20, 4: 0.20, 10: 0.10 },
  "Cronos 70/30": { 2: 0.30, 4: 0.35, 6: 0.35, 9: 0.35, 12: 0.30, 24: 0.30, 36: 0.30 },
  "Argo 70/30":   { 2: 0.30, 4: 0.35, 9: 0.35, 12: 0.35, 24: 0.30, 36: 0.30 },
  "Titano 70/30": { 2: 0.35, 4: 0.35, 9: 0.35, 12: 0.35, 24: 0.30, 36: 0.30 },
  "Pulse 70/30":  { 2: 0.35, 4: 0.35, 9: 0.35, 12: 0.35, 24: 0.30, 36: 0.30 },
  "Fastback 60/40": { 2: 0.35, 4: 0.40, 9: 0.40, 12: 0.40, 24: 0.40, 36: 0.40 },
  "Mobi 80/20": { 6: 0.30, 9: 0.30, 12: 0.30, 24: 0.20, 36: 0.20 },
  "Fiorino 70/30": { 4: 0.40, 9: 0.40, 12: 0.40, 24: 0.30, 36: 0.30 },
  "Strada 70/30": { 6: 0.40, 9: 0.40, 12: 0.40, 24: 0.30, 36: 0.30 },
  "Toro 70/30": { 4: 0.40, 9: 0.40, 12: 0.40, 24: 0.30, 36: 0.30 }
};

/*
 * Data definition for the bancario simulation. Each entry contains
 * the model name and the base value of the vehicle. These values
 * correspond to the list used in the plan de ahorro and are the
 * catalogue prices from the official PDF.
 */
const vehiclesData = [
  { model: "Cronos", value: 32820000 },
  { model: "Argo", value: 27898000 },
  { model: "Mobi", value: 24096000 },
  { model: "Pulse", value: 32833000 },
  { model: "Fastback", value: 40653000 },
  { model: "Toro", value: 42390000 },
  { model: "Strada", value: 33660000 },
  { model: "Fiorino", value: 27459000 },
  { model: "Titano", value: 48964000 }
];

/**
 * Benefit configuration
 *
 * When benefits are applied, certain values change:
 *  - The gastos de retiro percentage drops from 12% to 10%.
 *  - The initial investment may be discounted depending on the selected model+plan.
 *  - A list of bonifications is shown for the user to select.
 */
let benefitsApplied = false;
// Total number of installments in the standard plan de ahorro.  Used for
// computing financed adjudication payments when a client chooses to
// distribute the adjudication amount over the remaining months.  Most
// plans in this simulator span 84 months (19–84 tranche), so this
// constant reflects that duration.  If new plans are added with
// different lengths, adjust this constant accordingly.
const TOTAL_PLAN_MONTHS = 84;
// Mapping of plan keys to the discounted initial investment (in pesos).
// The values reflect the upfront amount when benefits are applied. Note that
// numbers use standard integer notation (e.g. 800000 = 800 mil) rather than
// dot‑separated formatting (e.g. 8.000.000).  The original specification
// used dots as thousands separators (e.g. "8000.000"), which is equivalent
// to 800 mil; however, a prior implementation incorrectly interpreted these
// values as millions.  This mapping corrects the values per plan:
const discountsInitialInvestment = {
  "Cronos 90/10": 900000,    // 800 mil pesos
  "Cronos 70/30": 900000,
  "Argo 70/30":   900000,
  "Mobi 80/20":   900000,
  "Fiorino 70/30": 1050000,    // 950 mil pesos
  "Pulse 70/30":   1050000,
  "Strada 70/30":  1050000,
  "Toro 70/30":    1050000,
  "Fastback 60/40":1050000,
  "Titano 70/30":  900000
};
// List of bonifications available to the user when benefits are applied.
// These are the real bonifications supplied by the client.  When
// benefits are applied, two of these will be randomly selected and
// displayed to the user (no manual selection is required).
const bonificationsList = [
  "2 cuotas bonificadas",
  "Chapón cubrecarter",
  "Tuercas antirrobo",
  "Polarizado"
];

// Manual cuota values per plan and tranche.  These override the dynamically
// computed cuotas when available.  The keys correspond to the `key`
// property in `planData`.  Each object lists the amounts for the
// standard tramos (2–12, 13–18, 19–84).  The values are in pesos
// (without thousands separators) and reflect the latest official
// pricing provided by the client.  For plans where the client
// supplied values under a different percentage split than used in
// `planData` (e.g. Toro 70/30 vs. Toro 60/40), the values are mapped
// to the existing plan key.
const manualQuotas = {
  "Cronos 90/10": { "2-12": 539082, "13-18": 566369, "19-84": 456348 },
  "Cronos 70/30": { "2-12": 400825, "13-18": 451484, "19-84": 374680 },
  "Fiorino 70/30": { "2-12": 377800, "13-18": 398100, "19-84": 308516 },
  "Pulse 70/30": { "2-12": 451670, "13-18": 475959, "19-84": 368896 },
  "Strada 70/30": { "2-12": 463039, "13-18": 487948, "19-84": 378188 },
  // The Toro plan in this simulator is 60/40, but the client supplied
  // values for a 70/30 split.  We apply those values to the 60/40 plan.
  "Toro 70/30": { "2-12": 543533, "13-18": 583132, "19-84": 476274 },
  "Argo 70/30": { "2-12": 383775, "13-18": 404419, "19-84": 313448 },
  "Mobi 80/20": { "2-12": 283152, "13-18": 308878, "19-84": 294109 },
  "Fastback 60/40": { "2-12": 504987, "13-18": 535070, "19-84": 402508 },
  // The Titano plan in this simulator is 80/20; we map the supplied
  // 70/30 values to this plan.
  "Titano 70/30": { "2-12": 666807, "13-18": 712548, "19-84": 589118 }
};
// Flag to indicate whether the adjudication amount should be financed
// in monthly installments.  This is toggled via the checkbox that
// appears when the selected adjudication quota is 4 or 6.
let financeAdjudication = false;
// Amount of adjudication financed per month.  When financing is
// enabled, this value is computed as adjudication value divided by
// the remaining months (TOTAL_PLAN_MONTHS minus the selected quota).
let financedAdjudicationPerMonth = 0;
// --- NUEVO estado para prorrateos ---
let capitalAdjudicacion = 0;            // Capital a invertir sobre la adjudicación
let gastosProrrateoMode = 'none';       // 'none' | 'total' | 'half'
let financedGastosPerMonth = 0;         // Monto de gastos prorrateados por cuota

// Array to store the bonifications selected by the user.
let selectedBonifications = [];

// Interval id for the preapproval countdown.  Used to clear the timer when
// the modal is closed or benefits are reset.
let preapprovalIntervalId = null;

/**
 * Show the redirect modal and start an 8‑second delay before navigating to the
 * external financing portal.  During this delay the modal presents a simple
 * animation and message.  Once the delay elapses the browser is navigated
 * to the specified URL.  The modal remains visible until the redirect
 * occurs.
 */
function showRedirectModal() {
  const modal = document.getElementById('redirect-modal');
  if (!modal) return;
  modal.style.display = 'block';
  // Start an 8 second delay then redirect
  setTimeout(() => {
    window.location.href = 'http://srv4.hostsga.com.ar/sga/sgahome.html';
  }, 8000);
}

/**
 * Display the preapproval modal and start a 24‑hour countdown timer.  The
 * timer updates every second, showing the remaining time in HH:MM:SS
 * format.  When the benefits are reset, the modal is hidden and the
 * interval is cleared.  Users can also close the modal manually via
 * the 'Cerrar' button.
 */
function showPreapprovalModal() {
  const modal = document.getElementById('preapproval-modal');
  const timerEl = document.getElementById('preapproval-timer');
  // Inline timer and section for continued application
  const inlineSection = document.getElementById('preapproval-section');
  const inlineTimer = document.getElementById('inline-preapproval-timer');
  if (!modal || !timerEl || !inlineSection || !inlineTimer) return;
  // Clear any existing countdown
  if (preapprovalIntervalId) {
    clearInterval(preapprovalIntervalId);
    preapprovalIntervalId = null;
  }
  // Show the modal and inline section
  modal.style.display = 'block';
  inlineSection.style.display = 'block';
  // Total seconds for 24 hours
  let remaining = 24 * 60 * 60;
  const updateTimer = () => {
    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    const seconds = remaining % 60;
    const formatted = `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    timerEl.textContent = formatted;
    inlineTimer.textContent = formatted;
    if (remaining <= 0) {
      clearInterval(preapprovalIntervalId);
    }
    remaining--;
  };
  updateTimer();
  preapprovalIntervalId = setInterval(updateTimer, 1000);
}

/**
 * Hide the preapproval modal and clear any running countdown timer.
 */
function hidePreapprovalModal() {
  const modal = document.getElementById('preapproval-modal');
  if (modal) {
    modal.style.display = 'none';
  }
  // Do not clear the countdown timer here.  The timer should continue
  // running after the modal is closed.  It will be cleared when
  // benefits are reset.
}

/**
 * Reset all benefits-related state to its default values.  This
 * function clears the benefits flag, hides bonifications and
 * financing controls, restores the gastos label to 12% and resets
 * the initial investment to the base amount.  It also clears the
 * finance and bonification selections.  Finally, it recalculates
 * the plan values using the default rate.  This should be called
 * whenever a new client is created or the user selects a different
 * model/plan to ensure there is no carry over from previous
 * simulations.
 */
function resetBenefits() {
  benefitsApplied = false;
  selectedBonifications = [];
  financeAdjudication = false;
  financedAdjudicationPerMonth = 0;
  // Hide bonifications container
  const bonContainer = document.getElementById('bonifications-container');
  if (bonContainer) bonContainer.style.display = 'none';
  // Hide financed adjudication section
  const financeContainer = document.getElementById('finance-adjudication-container');
  if (financeContainer) financeContainer.style.display = 'none';
  const financedInfo = document.getElementById('financed-adjudication-info');
  if (financedInfo) financedInfo.style.display = 'none';
  
  // Reset prorrateo/adjudicación capital
  capitalAdjudicacion = 0;
  gastosProrrateoMode = 'none';
  financedGastosPerMonth = 0;
  const gastosProrr = document.getElementById('gastos-prorrateo-container');
  if (gastosProrr) gastosProrr.style.display = 'none';
  const gastosInfo = document.getElementById('financed-gastos-info');
  if (gastosInfo) gastosInfo.style.display = 'none';
  const capitalInput = document.getElementById('adjudication-capital-input');
  if (capitalInput) capitalInput.value = '';
  // Reset gastos label to 12%
  const gastosLabel = document.getElementById('gastos-label');
  if (gastosLabel) {
    gastosLabel.textContent = 'Gastos de retiro (12% del valor)';
  }
  // Reset initial investment and discount display
  updateInitialInvestmentDisplay();
  // Recompute plan values using default rate (if a plan is selected)
  handleModelPlanChange();
  // Hide the preapproval modal and stop the countdown
  hidePreapprovalModal();
  // Also hide the inline preapproval section and clear its timer display
  const inlineSection = document.getElementById('preapproval-section');
  const inlineTimer = document.getElementById('inline-preapproval-timer');
  if (inlineSection) inlineSection.style.display = 'none';
  if (inlineTimer) inlineTimer.textContent = '';
}

/**
 * Update the initial investment display and discount info based on the selected
 * model and plan. When benefits are applied, the initial investment may be
 * discounted. If the discount results in a lower value than the base
 * (1,350,000), the percentage is displayed; otherwise the discount info
 * remains hidden.
 */
function updateInitialInvestmentDisplay() {
  const initSpan = document.getElementById('initial-investment');
  const discountSpan = document.getElementById('investment-discount-info');
  const select = document.getElementById('model-plan-select');
  if (!initSpan || !discountSpan || !select) return;
  const base = 1650000; // base initial investment in pesos
  const key = select.value;
  let discounted = null;
  if (benefitsApplied && key && discountsInitialInvestment.hasOwnProperty(key)) {
    discounted = discountsInitialInvestment[key];
  }
  const valueToUse = discounted !== null ? discounted : base;
  initSpan.textContent = formatCurrency(Math.round(valueToUse));
  if (discounted !== null && discounted < base) {
    const diff = base - discounted;
    const percent = (diff / base) * 100;
    discountSpan.textContent = `(${percent.toFixed(0)}% desc.)`;
    discountSpan.style.display = 'inline';
  } else {
    discountSpan.style.display = 'none';
  }
}

/**
 * Render the bonifications list with checkboxes. Selected bonifications are
 * stored in the global selectedBonifications array. The container is shown
 * when this function is called.
 */
function renderBonifications() {
  const container = document.getElementById('bonifications-container');
  const listDiv = document.getElementById('bonifications-list');
  if (!container || !listDiv) return;
  // Clear existing content
  listDiv.innerHTML = '';
  selectedBonifications = [];
  // Randomly select two bonifications from the list
  const shuffled = bonificationsList.slice().sort(() => Math.random() - 0.5);
  const chosen = shuffled.slice(0, 2);
  chosen.forEach((name) => {
    selectedBonifications.push(name);
    const p = document.createElement('p');
    p.textContent = name;
    listDiv.appendChild(p);
  });
  // Show the bonifications container
  container.style.display = 'block';
}

/**
 * Apply benefits to the current simulation. This sets the benefitsApplied flag,
 * updates the gastos label to reflect a 10% rate, recalculates values and
 * shows the bonifications list. Subsequent changes to the model or quota will
 * continue using the benefits rate until the page is reloaded.
 */
function applyBenefits() {
  if (benefitsApplied) return;
  benefitsApplied = true;
  const gastosLabel = document.getElementById('gastos-label');
  if (gastosLabel) {
    gastosLabel.textContent = 'Gastos de retiro (10% del valor)';
  }
  // Update the initial investment display and show the discount info
  updateInitialInvestmentDisplay();
  // Render the bonifications list
  renderBonifications();
  // Recompute values with lower rate WITHOUT resetting the selected quota
  const key = document.getElementById('model-plan-select').value;
  const plan = planData.find((p) => p.key === key);
  if (plan) {
    const rate = benefitsApplied ? 0.10 : 0.12;
    const gastos = Math.round(plan.value * rate);
    const gastosLbl = document.getElementById('gastos-label');
    if (gastosLbl) gastosLbl.textContent = `Gastos de retiro (${Math.round(rate*100)}% del valor)`;
    const gastosDisp = document.getElementById('gastos-retiro-display');
    if (gastosDisp) gastosDisp.textContent = formatCurrency(gastos);
    // Keep current quota selection
    const quotaVal = document.getElementById('quota-select').value || '0';
    const valid = adjudications[key] || {};
    const perc = quotaVal ? (valid[quotaVal] || 0) : 0;
    const adjLbl = document.getElementById('adjudication-percentage');
    if (adjLbl) adjLbl.textContent = perc>0 ? `${Math.round(perc*100)}%` : '-';
    const adjVal = document.getElementById('adjudication-value');
    const adjudAmount = Math.round(plan.value * perc);
    if (adjVal) adjVal.textContent = formatCurrency(adjudAmount);
    const finalLbl = document.getElementById('final-puesta-en-calle');
    updateFinanceAdjudicationDisplay(plan, quotaVal, adjudAmount, gastos, finalLbl);
  }


  // Habilitar prorrateo de gastos al preaprobar
  const gCont = document.getElementById('gastos-prorrateo-container');
  if (gCont) gCont.style.display = 'block';

  // Show the preapproval modal with a 24h countdown.  This
  // informs the client that their financing has been preapproved
  // and provides a time‑limited offer.  The countdown will reset
  // automatically if the benefits are cleared.
  showPreapprovalModal();
}

// List of staff members who can attend clients. Used in admin to
// assign the attendant for a given client. Update this array if
// new staff members are added or names change.
const staffNames = [
  'Gonzalo',
  'Carina',
  'Jazmin',
  'Lautaro',
  'Anahi',
  'Karen',
  'Emanuel'
];

// Possible statuses for a client. A vendor or admin can assign
// these to indicate the current state of a deal. If the status is
// "Vendido", an additional type of sale must be selected.  We avoid
// accent marks in these labels to match the requested spellings.
const statusOptions = ['En gestion', 'Reclamo', 'Vendido', 'Cerrado'];

// Possible types of sale used when a client has been marked as
// "Vendido".  These indicate whether the sale was through the plan
// de ahorro or via financiación bancaria.
const saleTypeOptions = ['Plan de Ahorro', 'Bancario'];

/**
 * Log out the current user/vendedor.  Clearing stored client and user
 * information ensures that the application returns to its initial state,
 * requiring a new login or client entry.  After clearing relevant
 * localStorage keys, the page is reloaded to reset the UI.  This
 * function is bound to the "Cerrar sesión" button in the navigation bar.
 */
function logoutUser() {
  try {
    // Remove any stored client info so the banner does not persist
    localStorage.removeItem('fiatCreditClientInfo');
    // Remove the logged‑in user (if vendor/admin login is used)
    localStorage.removeItem('fiatCreditCurrentUser');
    localStorage.removeItem('currentUser');
  } catch (e) {
    console.warn('Error clearing storage on logout', e);
  }
  // Reload the page to return to the initial state
  window.location.reload();
}

/*
 * Predefined user accounts.  Each key is a username, and the
 * corresponding object defines the password and role.  Admins have
 * access to the admin panel and can view all clients, while vendors
 * can only see and manage their own clients.  Passwords for
 * demonstration purposes follow a simple pattern: the lowercase
 * username followed by "2025".  The admin users share the same
 * password "ventas2025" for simplicity.  If you need to add or
 * change users, update this object accordingly.
 */
const users = {
  'Emanuel': { password: 'ventas2025', role: 'admin' },
  'Verona': { password: 'ventas2025', role: 'admin' },
  'Gonzalo': { password: 'gonzalo2025', role: 'vendor' },
  'Carina': { password: 'carina2025', role: 'vendor' },
  'Jazmin': { password: 'jazmin2025', role: 'vendor' },
  'Lautaro': { password: 'lautaro2025', role: 'vendor' },
  'Anahi': { password: 'anahi2025', role: 'vendor' },
  'Karen': { password: 'karen2025', role: 'vendor' }
};

/**
 * Retrieve the currently logged in user from localStorage.  The
 * returned object contains the username and role.  If no user is
 * logged in, null is returned.
 *
 * @returns {{username: string, role: string}|null}
 */
function getCurrentUser() {
  try {
    const data = localStorage.getItem('fiatCreditCurrentUser');
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Persist the current user to localStorage.  The user object
 * should contain a username and role.  This function is called
 * after a successful login.
 *
 * @param {{username: string, role: string}} user
 */
function setCurrentUser(user) {
  if (!user) return;
  localStorage.setItem('fiatCreditCurrentUser', JSON.stringify(user));
}

/**
 * Remove the current user from localStorage and reload the page.
 * Call this when logging out.
 */
function logoutCurrentUser() {
  localStorage.removeItem('fiatCreditCurrentUser');
  location.reload();
}

/**
 * Show or hide UI elements based on the current user's role.  Admins
 * see the admin button; vendors see the vendor button.  Called on
 * initialisation and after login.
 */
function applyUserRole() {
  const user = getCurrentUser();
  const adminBtn = document.getElementById('admin-btn');
  const vendorBtn = document.getElementById('vendor-btn');
  const logoutBtn = document.getElementById('logout-btn');
  if (user && user.role === 'admin') {
    if (adminBtn) adminBtn.style.display = 'inline-block';
    if (vendorBtn) vendorBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'inline-block';
  } else if (user && user.role === 'vendor') {
    if (adminBtn) adminBtn.style.display = 'none';
    if (vendorBtn) vendorBtn.style.display = 'inline-block';
    if (logoutBtn) logoutBtn.style.display = 'inline-block';
  } else {
    // Not logged in. Hide admin, vendor and logout buttons.
    if (adminBtn) adminBtn.style.display = 'none';
    if (vendorBtn) vendorBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'none';
  }
}

/**
 * Display the login modal and hide the main UI until the user
 * authenticates.  Called when no current user is found on page load.
 */
function showLogin() {
  const modal = document.getElementById('login-modal');
  if (modal) modal.style.display = 'block';
  // Hide the navigation and main content while waiting for login
  const nav = document.querySelector('nav');
  const main = document.querySelector('main');
  const formSection = document.getElementById('client-form-section');
  if (nav) nav.style.display = 'none';
  if (main) main.style.display = 'none';
  if (formSection) formSection.style.display = 'none';
}

/**
 * Hide the login modal and reveal the main UI.  Called after a
 * successful login.
 */
function hideLogin() {
  const modal = document.getElementById('login-modal');
  if (modal) modal.style.display = 'none';
  const nav = document.querySelector('nav');
  const main = document.querySelector('main');
  if (nav) nav.style.display = '';
  if (main) main.style.display = '';
}

/**
 * Compute the monthly payment for a loan using the French amortisation
 * formula. The interest rate is expressed as a TNA (annual nominal rate)
 * and divided by 12 to obtain a monthly rate.
 *
 * @param {number} monto - Principal or amount financed
 * @param {number} tna - Annual nominal rate (e.g. 0.60 for 60%)
 * @param {number} term - Number of monthly instalments
 * @returns {number} The monthly payment amount
 */
function computeInstallment(monto, tna, term) {
  if (monto <= 0 || term <= 0) return 0;
  const i = tna / 12;
  const factor = 1 - Math.pow(1 + i, -term);
  if (factor === 0) return 0;
  return (monto * i) / factor;
}

/**
 * Populate the vehicle selector in the bancario simulator. This is
 * called on page load and whenever the list of vehicles changes.
 */
function populateBancarioVehicleSelect() {
  const select = document.getElementById("bancario-vehicle-select");
  if (!select) return;
  // Clear any existing options
  select.innerHTML = "";
  // Add a placeholder option
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.text = "-- Seleccione --";
  select.appendChild(placeholder);
  // Populate from vehiclesData
  vehiclesData.forEach((item) => {
    const opt = document.createElement("option");
    opt.value = item.model;
    opt.text = item.model;
    select.appendChild(opt);
  });
}

/**
 * Update all results of the bancario simulator. This function reads
 * user inputs, computes the financed amount, the applicable TNA and
 * monthly payments, then updates the DOM accordingly. It also
 * refreshes the small table that shows the cuota for several typical
 * plazos (12, 24, 36, 48, 60 meses).
 */
function updateBancarioResults() {
  const vehicleSelect = document.getElementById("bancario-vehicle-select");
  const capitalInput = document.getElementById("bancario-capital-input");
  const systemSelect = document.getElementById("bancario-system-select");
  const termSelect = document.getElementById("bancario-term-select");
  const precioVehiculoCell = document.getElementById("bancario-precio-vehiculo");
  const capitalDisplayCell = document.getElementById("bancario-capital-display");
  const montoFinanciarSpan = document.getElementById("bancario-monto-a-financiar");
  const montoFinanciarCell = document.getElementById("bancario-monto-financiar-display");
  const tnaCell = document.getElementById("bancario-tna-display");
  const cuotaEstimadaCell = document.getElementById("bancario-cuota-estimada-display");
  const cuotasTableBody = document.getElementById("bancario-cuotas-table");

  // Update the cost of credit issuance.  This is a fixed cost of 4.5 millones
  const costOtorgCell = document.getElementById('bancario-cost-otorgacion-display');
  if (costOtorgCell) {
    costOtorgCell.textContent = formatCurrency(4500000);
  }

  if (!vehicleSelect || !capitalInput || !systemSelect || !termSelect) {
    return;
  }

  const selectedModel = vehicleSelect.value;
  const vehicle = vehiclesData.find((v) => v.model === selectedModel);
  const price = vehicle ? vehicle.value : 0;
  // Update displayed vehicle price
  if (precioVehiculoCell) {
    precioVehiculoCell.textContent = vehicle ? formatCurrency(price) : "-";
  }
  // Parse capital input
  let capitalRaw = parseFloat(capitalInput.value);
  let capital = isNaN(capitalRaw) ? 0 : capitalRaw;
  // If capital is greater than the price, cap it at the vehicle price and warn the user
  if (capital > price && price > 0) {
    capital = price;
    // Update input value to reflect the maximum allowed and inform the user via a brief alert
    capitalInput.value = price;
    alert("El capital ingresado supera el precio del vehículo. Se ajustó automáticamente al valor máximo permitido.");
  }
  // Compute financed amount
  const financed = Math.max(price - capital, 0);
  // Update financed amount displays
  if (montoFinanciarSpan) {
    montoFinanciarSpan.textContent = formatCurrency(Math.round(financed));
  }
  if (montoFinanciarCell) {
    montoFinanciarCell.textContent = formatCurrency(Math.round(financed));
  }
  // Update displayed capital (inversión) in results table
  if (capitalDisplayCell) {
    capitalDisplayCell.textContent = formatCurrency(Math.round(capital));
  }
  // Determine TNA based on system selection
  let tna = 0;
  if (systemSelect.value === "fija") {
    tna = 0.60;
  } else if (systemSelect.value === "uva") {
    tna = 0.15;
  }
  if (tnaCell) {
    tnaCell.textContent = tna > 0 ? `${(tna * 100).toFixed(0)}%` : "-";
  }
  // Compute cuota estimada for selected term
  const termVal = parseInt(termSelect.value, 10);
  if (!isNaN(termVal) && termVal > 0 && financed > 0 && tna > 0) {
    const est = computeInstallment(financed, tna, termVal);
    if (cuotaEstimadaCell) {
      cuotaEstimadaCell.textContent = formatCurrency(Math.round(est));
    }
  } else {
    if (cuotaEstimadaCell) {
      cuotaEstimadaCell.textContent = "-";
    }
  }
  // Update the table for typical terms
  if (cuotasTableBody) {
    const standardTerms = [12, 24, 36, 48, 60];
    // Clear existing rows
    cuotasTableBody.innerHTML = "";
    standardTerms.forEach((term) => {
      const row = document.createElement("tr");
      const termCell = document.createElement("td");
      termCell.textContent = term.toString();
      const cuotaCell = document.createElement("td");
      if (financed > 0 && tna > 0) {
        const c = computeInstallment(financed, tna, term);
        cuotaCell.textContent = formatCurrency(Math.round(c));
      } else {
        cuotaCell.textContent = "-";
      }
      row.appendChild(termCell);
      row.appendChild(cuotaCell);
      cuotasTableBody.appendChild(row);
    });
  }
}

/**
 * Given the base value of a vehicle, compute the cuota pura (the
 * alícuota) and three sets of cuotas for different tramos. The
 * coefficients are derived from sample data and may not reflect the
 * official FIAT plans; adjust as necessary.
 *
 * @param {number} value - Base value of the vehicle
 * @returns {Object} An object with `cuotaPura` and `quotas` properties
 */
function computeCuotas(value) {
  const cuotaPura = value / 120; // base alícuota (assume 120 cuotas)
  return {
    cuotaPura,
    quotas: {
      "2-12": cuotaPura * 1.466,
      "13-18": cuotaPura * 1.651,
      "19-84": cuotaPura * 1.37
    }
  };
}

/**
 * Format a numeric value as currency in Argentinian pesos without
 * decimals. Uses the ES-AR locale for proper thousands separators.
 *
 * @param {number} value - The number to format
 * @returns {string} - The formatted currency string
 */
function formatCurrency(value) {
  if (isNaN(value)) return "-";
  return value.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

/**
 * Populate the model+plan select element with options based on
 * `planData`. Called on page load.
 */
function populateModelPlanSelect() {
  const select = document.getElementById("model-plan-select");
  // Clear existing options
  select.innerHTML = "";
  // Add a placeholder option
  const placeholder = document.createElement("option");
  placeholder.text = "-- Seleccione --";
  placeholder.value = "";
  select.appendChild(placeholder);
  // Populate from data
  planData.forEach((item) => {
    const opt = document.createElement("option");
    opt.value = item.key;
    opt.text = `${item.model} ${item.plan}`;
    select.appendChild(opt);
  });
}

/**
 * Handle changes to the model+plan selector. When a new option is
 * chosen, update the value displays, compute the cuotas and populate
 * the quota selector with only the valid adjudication options.
 */
function handleModelPlanChange() {
  const select = document.getElementById("model-plan-select");
  const key = select.value;
  const plan = planData.find((p) => p.key === key);
  const gastosDisplay = document.getElementById("gastos-retiro-display");
  const valorMovilTd = document.getElementById("valor-movil");
  const cuotaPuraTd = document.getElementById("cuota-pura");
  // Retrieve the scheme table cells to display the tranche amounts in the
  // separate "Esquema de Cuotas" table. The main "Valores del Plan"
  // table no longer shows the cuota breakdown.
  const scheme212 = document.getElementById("scheme-2-12");
  const scheme1318 = document.getElementById("scheme-13-18");
  const scheme1984 = document.getElementById("scheme-19-84");
  const quotaSelect = document.getElementById("quota-select");
  const adjudicationPercentage = document.getElementById("adjudication-percentage");
  const adjudicationValue = document.getElementById("adjudication-value");
  const finalTotal = document.getElementById("final-puesta-en-calle");

  // Reset fields if no selection
  if (!plan) {
    valorMovilTd.textContent = "-";
    cuotaPuraTd.textContent = "-";
    // Reset scheme table cells to a hyphen when no plan is selected
    scheme212.textContent = "-";
    scheme1318.textContent = "-";
    scheme1984.textContent = "-";
    gastosDisplay.textContent = "-";
    adjudicationPercentage.textContent = "-";
    adjudicationValue.textContent = formatCurrency(0);
    finalTotal.textContent = formatCurrency(0);
    quotaSelect.innerHTML = "";
    const defaultOpt = document.createElement("option");
    defaultOpt.value = "";
    defaultOpt.text = "-- Seleccione --";
    quotaSelect.appendChild(defaultOpt);
    return;
  }

  // Compute cuotas based on the value
  const { cuotaPura, quotas } = computeCuotas(plan.value);
  // Override the dynamically computed quotas with manual values if available.
  // This ensures that the tranche amounts reflect the real pricing provided
  // by the client rather than formula‑derived approximations.
  const manual = manualQuotas[key];
  if (manual) {
    quotas["2-12"] = manual["2-12"];
    quotas["13-18"] = manual["13-18"];
    quotas["19-84"] = manual["19-84"];
  }
  // Update value and cuota pura display
  valorMovilTd.textContent = formatCurrency(plan.value);
  cuotaPuraTd.textContent = formatCurrency(Math.round(cuotaPura));
  // Update the scheme table with the tranche amounts
  scheme212.textContent = quotas["2-12"] ? formatCurrency(Math.round(quotas["2-12"])) : "-";
  scheme1318.textContent = quotas["13-18"] ? formatCurrency(Math.round(quotas["13-18"])) : "-";
  scheme1984.textContent = quotas["19-84"] ? formatCurrency(Math.round(quotas["19-84"])) : "-";

  // Compute gastos de retiro. Use 10% when benefits are applied, otherwise 12%
  // The benefitsApplied flag is toggled by the Chequear beneficios button.
  const rate = benefitsApplied ? 0.10 : 0.12;
  const gastos = plan.value * rate;
  gastosDisplay.textContent = formatCurrency(Math.round(gastos));

  // Populate the quota select with valid quotas
  quotaSelect.innerHTML = "";
  const placeholderOpt = document.createElement("option");
  placeholderOpt.value = "";
  placeholderOpt.text = "-- Seleccione --";
  quotaSelect.appendChild(placeholderOpt);
  const validAdjs = adjudications[key] || {};
  Object.keys(validAdjs)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .forEach((quota) => {
      const opt = document.createElement("option");
      opt.value = quota;
      opt.text = quota;
      quotaSelect.appendChild(opt);
    });
  // Reset adjudication fields
  adjudicationPercentage.textContent = "-";
  adjudicationValue.textContent = formatCurrency(0);
  finalTotal.textContent = formatCurrency(Math.round(gastos));

  // Update the initial investment display to reflect possible discounts based on the selected plan.
  updateInitialInvestmentDisplay();
}

/**
 * Handle changes to the quota selector. When a quota is chosen, look
 * up the adjudication percentage, compute the adjudication amount and
 * the final puesta en calle, and display them.
 */
function handleQuotaChange() {
  const modelPlanKey = document.getElementById("model-plan-select").value;
  const quota = document.getElementById("quota-select").value;
  const percentageLabel = document.getElementById("adjudication-percentage");
  const adjudValueLabel = document.getElementById("adjudication-value");
  const finalTotalLabel = document.getElementById("final-puesta-en-calle");

    // If no quota selected, reset and hide finance container
    if (!quota) {
        percentageLabel.textContent = "-";
        adjudValueLabel.textContent = formatCurrency(0);
        // Without adjudication, final puesta en calle is just the gastos de retiro
        const plan = planData.find((p) => p.key === modelPlanKey);
        const rate = benefitsApplied ? 0.10 : 0.12;
        const gastos = plan ? plan.value * rate : 0;
        finalTotalLabel.textContent = formatCurrency(Math.round(gastos));
        // Hide finance container when no quota selected
        const fContainer = document.getElementById('finance-adjudication-container');
        if (fContainer) fContainer.style.display = 'none';
        const fCheck = document.getElementById('finance-adjudication-checkbox');
        if (fCheck) fCheck.checked = false;
        const fInfo = document.getElementById('financed-adjudication-info');
        if (fInfo) fInfo.style.display = 'none';
        financeAdjudication = false;
        financedAdjudicationPerMonth = 0;
        return;
    }

  const plan = planData.find((p) => p.key === modelPlanKey);
  if (!plan) return;
  // Compute gastos de retiro based on the benefits flag (10% if benefits are applied)
  const rate = benefitsApplied ? 0.10 : 0.12;
  const gastos = plan.value * rate;
  const validAdjs = adjudications[modelPlanKey] || {};
  const perc = validAdjs[quota] || 0;
  // Update percentage display
  percentageLabel.textContent = perc > 0 ? `${(perc * 100).toFixed(0)}%` : "0%";
  // Compute adjudication amount
  const adjudAmount = plan.value * perc;
  adjudValueLabel.textContent = formatCurrency(Math.round(adjudAmount));
  // Compute final puesta en calle
  const final = adjudAmount + gastos;
  finalTotalLabel.textContent = formatCurrency(Math.round(final));

  // Update finance adjudication UI based on selected quota and checkbox state
  updateFinanceAdjudicationDisplay(plan, quota, adjudAmount, gastos, finalTotalLabel);
}

/**
 * Show or hide the financing option for adjudication and update the
 * final puesta en calle according to the user's choice.  When the
 * selected adjudication quota is 4 or 6, a checkbox appears allowing
 * the user to distribute the adjudication amount over the remaining
 * months.  If the checkbox is checked, the adjudication amount is
 * financed: the final puesta en calle becomes only the gastos de retiro,
 * and a message displays the additional amount per cuota.
 *
 * @param {Object} plan - The selected plan object (containing value).
 * @param {string} quotaStr - The selected quota as a string (e.g. "4" or "6").
 * @param {number} adjudAmount - The adjudication amount (plan value * perc).
 * @param {number} gastos - The gastos de retiro amount.
 * @param {HTMLElement} finalLabel - The DOM element where final total is displayed.
 */

function updateFinanceAdjudicationDisplay(plan, quotaStr, adjudAmount, gastos, finalLabel) {
  const quota = parseInt(quotaStr, 10);
  const monthsRemaining = Math.max(TOTAL_PLAN_MONTHS - (isNaN(quota) ? 0 : quota), 1);

  const fContainer = document.getElementById('finance-adjudication-container');
  const fCheck = document.getElementById('finance-adjudication-checkbox');
  const fInfo = document.getElementById('financed-adjudication-info');
  const capitalInput = document.getElementById('adjudication-capital-input');

  const gSel = document.getElementById('gastos-prorrateo-select');
  const gInfo = document.getElementById('financed-gastos-info');

  if (!finalLabel) return;

  // Mostrar/ocultar bloque de financiación de adjudicación según haya adjudicación
  if (fContainer) {
    fContainer.style.display = adjudAmount > 0 ? 'block' : 'none';
  }

  // Estado del checkbox y capital
  const financeAdj = !!(fCheck && fCheck.checked);
  let capital = 0;
  if (capitalInput) {
    const raw = parseFloat(capitalInput.value);
    capital = isNaN(raw) ? 0 : Math.max(0, Math.min(raw, adjudAmount));
  }
  capitalAdjudicacion = capital;

  // Monto de adjudicación a financiar
  const adjudToFinance = Math.max(adjudAmount - capital, 0);

  if (financeAdj && adjudToFinance > 0) {
    financedAdjudicationPerMonth = Math.round(adjudToFinance / monthsRemaining);
    if (fInfo) {
      fInfo.style.display = 'block';
      fInfo.textContent = `Adjudicación financiada: ${formatCurrency(Math.round(financedAdjudicationPerMonth))} por cuota (sobre ${monthsRemaining} meses)`;
    }
  } else {
    financedAdjudicationPerMonth = 0;
    if (fInfo) fInfo.style.display = 'none';
  }
  financeAdjudication = financeAdj;

  // Prorrateo de gastos
  const mode = gSel ? gSel.value : 'none';
  gastosProrrateoMode = mode;
  let gastosProrrateadosUpfront = 0;
  if (mode === 'total') {
    financedGastosPerMonth = Math.round(gastos / monthsRemaining);
    gastosProrrateadosUpfront = gastos;
    if (gInfo) {
      gInfo.style.display = 'block';
      gInfo.textContent = `Gastos prorrateados: ${formatCurrency(financedGastosPerMonth)} por cuota (totalidad, ${monthsRemaining} meses).`;
    }
  } else if (mode === 'half') {
    financedGastosPerMonth = Math.round((gastos * 0.5) / monthsRemaining);
    gastosProrrateadosUpfront = gastos * 0.5;
    if (gInfo) {
      gInfo.style.display = 'block';
      gInfo.textContent = `Gastos prorrateados: ${formatCurrency(financedGastosPerMonth)} por cuota (50%, ${monthsRemaining} meses).`;
    }
  } else {
    financedGastosPerMonth = 0;
    if (gInfo) gInfo.style.display = 'none';
  }

  // Final puesta en calle (upfront)
  let finalUpfront = gastos + adjudAmount;
  if (financeAdj && adjudToFinance > 0) {
    finalUpfront = gastos + capital;
  }
  finalUpfront -= gastosProrrateadosUpfront;

  finalLabel.textContent = formatCurrency(Math.round(Math.max(finalUpfront, 0)));
}


/**
 * Toggle between sections based on the selected navigation link. This
 * function shows or hides the plan de ahorro and bancario sections and
 * updates the active state of the nav links. It does not modify any
 * data or selections.
 *
 * @param {string} target - Either "plan-ahorro" or "bancario"
 */
function showSection(target) {
  const planSection = document.getElementById("plan-ahorro-section");
  const bancarioSection = document.getElementById("bancario-section");
  const navPlan = document.getElementById("nav-plan-ahorro");
  const navBancario = document.getElementById("nav-bancario");
  // Determine which section is currently visible and which one should be shown next
  const showBancario = target === "bancario";
  const currentSection = showBancario ? planSection : bancarioSection;
  const nextSection = showBancario ? bancarioSection : planSection;
  // Update navigation link active state
  if (showBancario) {
    navPlan.classList.remove("active");
    navBancario.classList.add("active");
  } else {
    navBancario.classList.remove("active");
    navPlan.classList.add("active");
  }
  // If the requested section is already visible, do nothing
  if (nextSection.style.display === "block") {
    return;
  }
  // Apply fade-out to the current section if it is visible
  if (currentSection.style.display !== "none") {
    currentSection.classList.remove("fade-in");
    currentSection.classList.add("fade-out");
    setTimeout(() => {
      currentSection.style.display = "none";
      currentSection.classList.remove("fade-out");
      // Show the next section with fade-in effect
      nextSection.style.display = "block";
      nextSection.classList.add("fade-in");
      // Remove fade-in class after animation completes
      setTimeout(() => {
        nextSection.classList.remove("fade-in");
      }, 400);
    }, 200);
  } else {
    // If current section is hidden, simply show the next one
    currentSection.style.display = "none";
    nextSection.style.display = "block";
    nextSection.classList.add("fade-in");
    setTimeout(() => {
      nextSection.classList.remove("fade-in");
    }, 400);
  }
}

// Initialise the page once the DOM has loaded
window.addEventListener("DOMContentLoaded", () => {
  populateModelPlanSelect();
    // Initialise the bancario vehicle list
    populateBancarioVehicleSelect();
  // Hook up event handlers
  document.getElementById("model-plan-select").addEventListener("change", () => {
    // When the model/plan changes, reset any applied benefits so the new
    // selection starts from a clean slate.
    resetBenefits();
    handleModelPlanChange();
  });
  document.getElementById("quota-select").addEventListener("change", handleQuotaChange);
  document.getElementById("nav-plan-ahorro").addEventListener("click", (e) => {
    e.preventDefault();
    // Prevent navigation if no client info is loaded
    if (!getClientInfo()) {
      alert('Por favor ingrese los datos del cliente antes de continuar.');
      return;
    }
    showSection("plan-ahorro");
  });
  document.getElementById("nav-bancario").addEventListener("click", (e) => {
    e.preventDefault();
    if (!getClientInfo()) {
      alert('Por favor ingrese los datos del cliente antes de continuar.');
      return;
    }
    showSection("bancario");
  });

    // Hook up bancario simulator event handlers. Guard each call in case
    // the element does not exist (the section may not be present in some pages).
    const bancarioVehicleSelect = document.getElementById("bancario-vehicle-select");
    if (bancarioVehicleSelect) {
      bancarioVehicleSelect.addEventListener("change", updateBancarioResults);
    }
    const bancarioCapitalInput = document.getElementById("bancario-capital-input");
    if (bancarioCapitalInput) {
      // Use 'input' event to respond immediately as the user types
      bancarioCapitalInput.addEventListener("input", updateBancarioResults);
    }
    const bancarioSystemSelect = document.getElementById("bancario-system-select");
    if (bancarioSystemSelect) {
      bancarioSystemSelect.addEventListener("change", updateBancarioResults);
    }
    const bancarioTermSelect = document.getElementById("bancario-term-select");
    if (bancarioTermSelect) {
      bancarioTermSelect.addEventListener("change", updateBancarioResults);
    }
    // Perform an initial update so that default values (if any) are reflected
    updateBancarioResults();
  // Display initial state
  showSection("plan-ahorro");

  // Set up benefits button. When clicked, apply available benefits such as
  // reduced gastos de retiro and discounted initial investment. Require
  // that a client be loaded before enabling benefits.
  const benefitBtn = document.getElementById('benefit-btn');
  if (benefitBtn) {
    benefitBtn.addEventListener('click', () => {
      if (!getClientInfo()) {
        alert('Por favor ingrese los datos del cliente antes de continuar.');
        return;
      }
      applyBenefits();
    });
  }

  // Set up reset benefits button. When clicked, clear any applied
  // discounts, bonifications and financing, restoring the default
  // simulation state.  This requires that a client be loaded (if
  // benefits are applied only after client data is present).
  const resetBtn = document.getElementById('reset-benefits-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      // Always allow reset without client info; it simply clears the state
      resetBenefits();
    });
  }

  // Bind finance adjudication checkbox.  When toggled, recompute the
  // financed adjudication display and update the final puesta en calle.
  const financeCheck = document.getElementById('finance-adjudication-checkbox');
  if (financeCheck) {
    financeCheck.addEventListener('change', () => {
      // Determine current plan and quota
      const key = document.getElementById('model-plan-select').value;
      const quotaVal = document.getElementById('quota-select').value;
      const plan = planData.find((p) => p.key === key);
      if (!plan || !quotaVal) return;
      const valid = adjudications[key] || {};
      const perc = valid[quotaVal] || 0;
      const adjudAmount = plan.value * perc;
      const rate = benefitsApplied ? 0.10 : 0.12;
      const gastos = plan.value * rate;
      const finalLbl = document.getElementById('final-puesta-en-calle');
      updateFinanceAdjudicationDisplay(plan, quotaVal, adjudAmount, gastos, finalLbl);
    });
  }

  // Bind the preapproval modal close button.  When clicked, hides the
  // modal and clears the countdown timer.
  const preClose = document.getElementById('preapproval-close-btn');
  if (preClose) {
    preClose.addEventListener('click', () => {
      hidePreapprovalModal();
    });
  }

  // Set up the "Continuar con la solicitud" button.  When clicked it
  // redirects the user to the external financing page specified by the client.
  const continueBtn = document.getElementById('continue-application-btn');
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      // Show an intermediate modal and delay the redirect for 8 seconds.
      showRedirectModal();
    });
  }

  // -----------------------------------------------------------------------
  // PDF export functionality
  //
  // Two buttons allow exporting either simulator to PDF. When clicked,
  // the corresponding section is marked with a temporary `.print-active`
  // class, which triggers print-specific CSS to show only that section.
  // After the print dialog closes, the class is removed to restore
  // normal behaviour. Guard each query in case elements are absent.
  const exportAhorroBtn = document.getElementById("export-ahorro-pdf");
  if (exportAhorroBtn) {
    exportAhorroBtn.addEventListener("click", () => {
      const section = document.getElementById("plan-ahorro-section");
      if (section) {
        section.classList.add("print-active");
        // Make sure the plan de ahorro section is visible before printing
        showSection("plan-ahorro");
        // Insert a temporary header with logo, title and date
        const header = document.createElement("div");
        header.style.display = "flex";
        header.style.alignItems = "center";
        header.style.marginBottom = "1rem";
        const img = document.createElement("img");
        img.src = "assets/fiat-logo.svg";
        img.style.height = "36px";
        img.style.marginRight = "0.6rem";
        const title = document.createElement("h2");
        title.textContent = "Plan de Ahorro";
        title.style.margin = "0";
        title.style.color = "var(--primary-color)";
        const dateSpan = document.createElement("span");
        const now = new Date();
        dateSpan.textContent = now.toLocaleDateString("es-AR");
        dateSpan.style.marginLeft = "auto";
        header.appendChild(img);
        header.appendChild(title);
        header.appendChild(dateSpan);
        section.insertBefore(header, section.firstChild);
        // Trigger browser print dialog
        window.print();
        // Remove header after printing
        section.removeChild(header);
        // Cleanup after printing
        section.classList.remove("print-active");
      }
    });
  }
  const exportBancarioBtn = document.getElementById("export-bancario-pdf");
  if (exportBancarioBtn) {
    exportBancarioBtn.addEventListener("click", () => {
      const section = document.getElementById("bancario-section");
      if (section) {
        section.classList.add("print-active");
        // Ensure the bancario section is visible before printing
        showSection("bancario");
        // Insert a temporary header with logo, title and date
        const header = document.createElement("div");
        header.style.display = "flex";
        header.style.alignItems = "center";
        header.style.marginBottom = "1rem";
        const img = document.createElement("img");
        img.src = "assets/fiat-logo.svg";
        img.style.height = "36px";
        img.style.marginRight = "0.6rem";
        const title = document.createElement("h2");
        title.textContent = "Financiación Bancaria";
        title.style.margin = "0";
        title.style.color = "var(--primary-color)";
        const dateSpan = document.createElement("span");
        const now = new Date();
        dateSpan.textContent = now.toLocaleDateString("es-AR");
        dateSpan.style.marginLeft = "auto";
        header.appendChild(img);
        header.appendChild(title);
        header.appendChild(dateSpan);
        section.insertBefore(header, section.firstChild);
        window.print();
        // Remove header after printing
        section.removeChild(header);
        section.classList.remove("print-active");
      }
    });
  }

  // Dark mode toggle: apply user's preference on load and handle changes
  const themeToggle = document.getElementById("theme-toggle");
  const prefersDark = localStorage.getItem('fiatTheme') === 'dark';
  if (prefersDark) {
    document.body.classList.add('dark-mode');
    if (themeToggle) themeToggle.checked = true;
  }
  if (themeToggle) {
    themeToggle.addEventListener('change', () => {
      document.body.classList.toggle('dark-mode');
      // Save preference
      if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('fiatTheme', 'dark');
      } else {
        localStorage.setItem('fiatTheme', 'light');
      }
    });
  }

  // Bind logout button.  The "Cerrar sesión" button clears
  // stored client/user data and reloads the page.  Only show
  // this button if it exists in the DOM.
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      logoutUser();
    });
  }

  // Allow clicking the visible slider to toggle the hidden checkbox
  const sliderEl = document.querySelector('.theme-switch .slider');
  if (sliderEl && themeToggle) {
    sliderEl.addEventListener('click', () => {
      themeToggle.checked = !themeToggle.checked;
      // Manually dispatch change event to trigger theme toggle logic
      themeToggle.dispatchEvent(new Event('change'));
    });
  }

  // Snapshot and comparison handlers
  const ahorroSaveBtn = document.getElementById('ahorro-save-snapshot');
  if (ahorroSaveBtn) {
    ahorroSaveBtn.addEventListener('click', () => {
      const snap = getAhorroSnapshot();
      saveSnapshot(snap);
      refreshSnapshotSelector();
      alert('Escenario de Plan de Ahorro guardado.');
    });
  }
  const bancarioSaveBtn = document.getElementById('bancario-save-snapshot');
  if (bancarioSaveBtn) {
    bancarioSaveBtn.addEventListener('click', () => {
      const snap = getBancarioSnapshot();
      saveSnapshot(snap);
      refreshSnapshotSelector();
      alert('Escenario de Financiación Bancaria guardado.');
    });
  }
  const ahorroOpenCompare = document.getElementById('ahorro-open-compare');
  if (ahorroOpenCompare) {
    ahorroOpenCompare.addEventListener('click', () => {
      openCompareModal();
    });
  }
  const bancarioOpenCompare = document.getElementById('bancario-open-compare');
  if (bancarioOpenCompare) {
    bancarioOpenCompare.addEventListener('click', () => {
      openCompareModal();
    });
  }
  const compareClose = document.getElementById('compare-close-btn');
  if (compareClose) {
    compareClose.addEventListener('click', () => {
      closeCompareModal();
    });
  }
  const snapshotLoadBtn = document.getElementById('snapshot-load-btn');
  if (snapshotLoadBtn) {
    snapshotLoadBtn.addEventListener('click', () => {
      const selector = document.getElementById('snapshot-selector');
      if (selector && selector.value) {
        const snap = loadSnapshot(selector.value);
        if (snap) {
          if (snap.tipo === 'ahorro') {
            openCompareModal(snap, getBancarioSnapshot());
          } else {
            openCompareModal(getAhorroSnapshot(), snap);
          }
        }
      }
    });
  }
  const snapshotDeleteBtn = document.getElementById('snapshot-delete-btn');
  if (snapshotDeleteBtn) {
    snapshotDeleteBtn.addEventListener('click', () => {
      const selector = document.getElementById('snapshot-selector');
      if (selector && selector.value) {
        deleteSnapshot(selector.value);
        refreshSnapshotSelector();
      }
    });
  }
  const compareExportBtn = document.getElementById('compare-export-pdf-btn');
  if (compareExportBtn) {
    compareExportBtn.addEventListener('click', () => {
      exportCompareToPDF();
    });
  }
  // Populate snapshot selector on load
  refreshSnapshotSelector();

  // -------------------------------------------------------------------
  // Client onboarding logic
  // We defer initialising the client flow until we know whether a
  // user is logged in.  See the login handling section below.

  // -------------------------------------------------------------------
  // Admin button event.  Only users with the admin role may open
  // the admin section.  Vendors attempting to access admin will see
  // an alert.
  const adminBtn = document.getElementById('admin-btn');
  if (adminBtn) {
    adminBtn.addEventListener('click', () => {
      const user = getCurrentUser();
      if (user && user.role === 'admin') {
        showAdminSection();
      } else {
        alert('Acceso solo para administradores');
      }
    });
  }
  // Vendor button event.  Only vendors can view their own clients.
  const vendorBtn = document.getElementById('vendor-btn');
  if (vendorBtn) {
    vendorBtn.addEventListener('click', () => {
      const user = getCurrentUser();
      if (user && user.role === 'vendor') {
        showVendorSection();
      }
    });
  }
  // Export buttons and close button in admin section
  const exportCsvBtn = document.getElementById('export-clients-csv');
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', () => {
      exportClientsToCSV();
    });
  }
  const exportPdfBtn = document.getElementById('export-clients-pdf');
  if (exportPdfBtn) {
    exportPdfBtn.addEventListener('click', () => {
      exportClientsToPDF();
    });
  }
  const adminCloseBtn = document.getElementById('admin-close-btn');
  if (adminCloseBtn) {
    adminCloseBtn.addEventListener('click', () => {
      hideAdminSection();
    });
  }

  // Vendor section close button
  const vendorCloseBtn = document.getElementById('vendor-close-btn');
  if (vendorCloseBtn) {
    vendorCloseBtn.addEventListener('click', () => {
      hideVendorSection();
    });
  }

  // Add new client button in admin section
  const adminAddClientBtn = document.getElementById('admin-add-client-btn');
  if (adminAddClientBtn) {
    adminAddClientBtn.addEventListener('click', () => {
      showAddClientModal();
    });
  }
  // Add client modal controls
  const addClientCancelBtn = document.getElementById('add-client-cancel-btn');
  if (addClientCancelBtn) {
    addClientCancelBtn.addEventListener('click', () => {
      hideAddClientModal();
    });
  }
  const addClientSaveBtn = document.getElementById('add-client-save-btn');
  if (addClientSaveBtn) {
    addClientSaveBtn.addEventListener('click', () => {
      saveNewAdminClient();
    });
  }

  // -------------------------------------------------------------------
  // Login handling
  const loginBtn = document.getElementById('login-btn');
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      const usernameInput = document.getElementById('login-username');
      const passwordInput = document.getElementById('login-password');
      const errorLabel = document.getElementById('login-error');
      const username = usernameInput ? usernameInput.value.trim() : '';
      const password = passwordInput ? passwordInput.value.trim() : '';
      if (users[username] && users[username].password === password) {
        // Persist current user and apply role
        setCurrentUser({ username: username, role: users[username].role });
        // Clear any previous error
        if (errorLabel) errorLabel.textContent = '';
        // Hide login and reveal UI
        hideLogin();
        applyUserRole();
        // After login, initialise client flow
        initClientFlow();
      } else {
        if (errorLabel) errorLabel.textContent = 'Usuario o contraseña incorrectos';
      }
    });
  }

  // -------------------------------------------------------------------
  // Determine if a user is already logged in.  If not, present the
  // login modal and hide the application UI.  Otherwise, apply the
  // appropriate role and initialise the client flow.  This logic is
  // executed once on page load, after all event handlers are bound.
  const existingUser = getCurrentUser();
  if (!existingUser) {
    // No user found in localStorage: prompt for login
    showLogin();
  } else {
    // User is already logged in: ensure login modal is hidden and
    // apply role-based UI changes before initialising the client flow.
    hideLogin();
    applyUserRole();
    initClientFlow();
  }
});

/**
 * Initialise the client onboarding flow. Determine whether a client is
 * already present in localStorage and set up the UI accordingly.
 */
function initClientFlow() {
  const client = getClientInfo();
  const formSection = document.getElementById('client-form-section');
  const planSection = document.getElementById('plan-ahorro-section');
  const bancarioSection = document.getElementById('bancario-section');
  const banner = document.getElementById('client-info-banner');
  const navBar = document.querySelector('nav');
  // Always show the navigation bar initially
  if (client) {
    // Client exists: hide form, show sections and banner
    if (formSection) formSection.style.display = 'none';
    if (planSection) planSection.style.display = 'block';
    if (bancarioSection) bancarioSection.style.display = 'none';
    if (banner) {
      banner.style.display = 'flex';
      displayClientInfo(client);
    }
  } else {
    // No client: show form, hide simulators and banner
    if (formSection) formSection.style.display = 'block';
    if (planSection) planSection.style.display = 'none';
    if (bancarioSection) bancarioSection.style.display = 'none';
    if (banner) banner.style.display = 'none';
    // Hide nav links while form is displayed to avoid confusion
    // but keep the nav bar visible
  }
  // Attach form field listeners for live validation
  attachClientFormListeners();
  // Attach event for save button
  const saveBtn = document.getElementById('client-save-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      saveClientData();
    });
  }
  // Attach event for new client button
  const newBtn = document.getElementById('new-client-btn');
  if (newBtn) {
    newBtn.addEventListener('click', () => {
      resetClient();
    });
  }
}

/**
 * Retrieve the current client information from localStorage.
 * @returns {Object|null} The client info object or null if not set.
 */
function getClientInfo() {
  try {
    const data = localStorage.getItem('fiatCreditClientInfo');
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Attach listeners to the client form inputs for live validation.
 */
function attachClientFormListeners() {
  const fields = [
    'client-first-name',
    'client-last-name',
    'client-dni',
    'client-localidad',
    'client-telefono',
    'client-email'
  ];
  fields.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', validateClientForm);
    }
  });
}

/**
 * Validate the client form fields and display error messages. Enable
 * or disable the save button based on validity.
 */
function validateClientForm() {
  const firstName = document.getElementById('client-first-name');
  const lastName = document.getElementById('client-last-name');
  const dniEl = document.getElementById('client-dni');
  const loc = document.getElementById('client-localidad');
  const phone = document.getElementById('client-telefono');
  const email = document.getElementById('client-email');
  let valid = true;
  // Helper to set error message
  function setError(el, message) {
    const errId = el.id + '-error';
    const err = document.getElementById(errId);
    if (err) err.textContent = message;
  }
  // First name
  if (!firstName.value.trim()) {
    setError(firstName, 'Requerido');
    valid = false;
  } else {
    setError(firstName, '');
  }
  // Last name
  if (!lastName.value.trim()) {
    setError(lastName, 'Requerido');
    valid = false;
  } else {
    setError(lastName, '');
  }
  // DNI: required digits 7-10
  const dniVal = dniEl.value.trim();
  if (!dniVal) {
    setError(dniEl, 'Requerido');
    valid = false;
  } else if (!/^\d{7,10}$/.test(dniVal)) {
    setError(dniEl, 'Debe contener 7‑10 dígitos');
    valid = false;
  } else {
    setError(dniEl, '');
  }
  // Localidad
  if (!loc.value.trim()) {
    setError(loc, 'Requerido');
    valid = false;
  } else {
    setError(loc, '');
  }
  // Telefono: optional but if present must be numeric
  if (phone.value.trim() && !/^\+?\d{6,15}$/.test(phone.value.trim())) {
    setError(phone, 'Número inválido');
    valid = false;
  } else {
    setError(phone, '');
  }
  // Email: optional but if present must be valid
  if (email.value.trim() && !/^\S+@\S+\.\S+$/.test(email.value.trim())) {
    setError(email, 'Correo inválido');
    valid = false;
  } else {
    setError(email, '');
  }
  // Enable or disable save button
  const saveBtn = document.getElementById('client-save-btn');
  if (saveBtn) {
    saveBtn.disabled = !valid;
  }
  return valid;
}

/**
 * Save the client data, update the UI and export to CSV. This is
 * called when the user clicks the "Guardar y continuar" button.
 */
function saveClientData() {
  if (!validateClientForm()) return;
  // Build client info object.  This object is used for the
  // personalised greeting and simulation but does not include
  // internal tracking fields such as status or saleType.
  const clientInfo = {
    nombre: document.getElementById('client-first-name').value.trim(),
    apellido: document.getElementById('client-last-name').value.trim(),
    dni: document.getElementById('client-dni').value.trim(),
    localidad: document.getElementById('client-localidad').value.trim(),
    telefono: document.getElementById('client-telefono').value.trim(),
    email: document.getElementById('client-email').value.trim(),
    timestamp: Date.now()
  };
  // Persist client info separately for the current session
  localStorage.setItem('fiatCreditClientInfo', JSON.stringify(clientInfo));
  // Create a record for the admin/vendor list.  Include the
  // attending vendor (if any) and default status/saleType.  The
  // attendedBy field is determined by the currently logged in
  // vendor; admins do not auto-assign themselves.
  const currentUser = getCurrentUser();
  const attendedBy = currentUser && currentUser.role === 'vendor' ? currentUser.username : '';
  const record = {
    nombre: clientInfo.nombre,
    apellido: clientInfo.apellido,
    dni: clientInfo.dni,
    localidad: clientInfo.localidad,
    telefono: clientInfo.telefono,
    email: clientInfo.email,
    timestamp: clientInfo.timestamp,
    atendidoPor: attendedBy,
    createdBy: attendedBy,
    status: 'En gestion',
    saleType: ''
  };
  // Append record to the stored list
  appendClientRecord(record);
  // Reset any applied benefits when a new client is saved.  This
  // ensures that the next simulation starts from a clean slate.
  resetBenefits();
  // Hide form and show simulators and banner
  const formSection = document.getElementById('client-form-section');
  if (formSection) formSection.style.display = 'none';
  const planSection = document.getElementById('plan-ahorro-section');
  const bancarioSection = document.getElementById('bancario-section');
  if (planSection) planSection.style.display = 'block';
  if (bancarioSection) bancarioSection.style.display = 'none';
  // Reset nav active states
  const navPlan = document.getElementById('nav-plan-ahorro');
  const navBancario = document.getElementById('nav-bancario');
  if (navPlan) navPlan.classList.add('active');
  if (navBancario) navBancario.classList.remove('active');
  // Show banner with client info
  const banner = document.getElementById('client-info-banner');
  if (banner) {
    banner.style.display = 'flex';
    // Display the clientInfo we just saved (not the undefined variable `client`)
    displayClientInfo(clientInfo);
  }
}

/**
 * Append a client record to the list stored in localStorage and
 * generate a CSV file for download to keep a parallel Excel copy.
 * @param {Object} record
 */
function appendClientRecord(record) {
  let list = [];
  try {
    const existing = localStorage.getItem('fiatCreditClientRecords');
    list = existing ? JSON.parse(existing) : [];
  } catch (e) {
    list = [];
  }
  list.push(record);
  localStorage.setItem('fiatCreditClientRecords', JSON.stringify(list));
  // Do not auto-download CSV on each save. Export will be triggered manually
  // from the admin section via a dedicated button.
}

/**
 * Generate a CSV file from the given list of client records and
 * automatically trigger its download. The file is named
 * `clientes.csv`. Each row includes the name, last name, DNI,
 * locality, phone, email and date/time.
 * @param {Array} list
 */
function generateCsv(list) {
  if (!Array.isArray(list) || list.length === 0) return;
  // Include additional columns for the staff member who attended the
  // client, the current status and the sale type (if sold). Older
  // records without these fields will use an empty string.
  const header = [
    'Nombre',
    'Apellido',
    'DNI',
    'Localidad',
    'Teléfono',
    'Email',
    'Fecha',
    'Atendido por',
    'Estado',
    'Tipo de venta'
  ];
  const rows = list.map((c) => {
    const date = new Date(c.timestamp).toLocaleString('es-AR');
    return [
      c.nombre || '',
      c.apellido || '',
      c.dni || '',
      c.localidad || '',
      c.telefono || '',
      c.email || '',
      date,
      c.atendidoPor || '',
      c.status || '',
      c.saleType || ''
    ];
  });
  let csv = '';
  csv += header.join(',') + '\n';
  csv += rows
    .map((r) => r.map((v) => '"' + String(v).replace(/"/g, '""') + '"').join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'clientes.csv';
  document.body.appendChild(a);
  a.style.display = 'none';
  // Triggering a click programmatically will initiate the download
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Populate the client information banner with the given client data.
 * @param {Object} client
 */
function displayClientInfo(client) {
  const content = document.querySelector('#client-info-banner .client-info-content');
  if (!content || !client) return;
  const namePart = client.nombre && client.apellido ? `${client.nombre} ${client.apellido}` : '';
  let html = '';
  if (namePart) {
    html += `<strong>${namePart}</strong>`;
  }
  if (client.dni) {
    html += ` — DNI: ${client.dni}`;
  }
  if (client.localidad) {
    html += ` — Localidad: ${client.localidad}`;
  }
  if (client.telefono) {
    html += ` — Teléfono: ${client.telefono}`;
  }
  if (client.email) {
    html += ` — Email: ${client.email}`;
  }
  content.innerHTML = html;
  // Update greetings inside the plan and bancario panels to personalise results
  const ahorroGreeting = document.getElementById('ahorro-greeting');
  const bancarioGreeting = document.getElementById('bancario-greeting');
  const greetingText = client && client.nombre && client.apellido
    ? `Simulación para ${client.nombre} ${client.apellido}`
    : '';
  if (ahorroGreeting) {
    if (greetingText) {
      ahorroGreeting.textContent = greetingText;
      ahorroGreeting.style.display = 'block';
    } else {
      ahorroGreeting.style.display = 'none';
    }
  }
  if (bancarioGreeting) {
    if (greetingText) {
      bancarioGreeting.textContent = greetingText;
      bancarioGreeting.style.display = 'block';
    } else {
      bancarioGreeting.style.display = 'none';
    }
  }
}

/**
 * Reset the current client. Remove client info from localStorage,
 * show the onboarding form and hide the simulators. Also refresh
 * the form fields.
 */
function resetClient() {
  localStorage.removeItem('fiatCreditClientInfo');
  // Optionally retain the client records list for history
  const formSection = document.getElementById('client-form-section');
  const planSection = document.getElementById('plan-ahorro-section');
  const bancarioSection = document.getElementById('bancario-section');
  const banner = document.getElementById('client-info-banner');
  // Show form and hide others
  if (formSection) formSection.style.display = 'block';
  if (planSection) planSection.style.display = 'none';
  if (bancarioSection) bancarioSection.style.display = 'none';
  if (banner) banner.style.display = 'none';
  // Clear form fields and validation messages
  ['client-first-name','client-last-name','client-dni','client-localidad','client-telefono','client-email'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = '';
    const err = document.getElementById(id + '-error');
    if (err) err.textContent = '';
  });
  // Disable save button until valid
  const saveBtn = document.getElementById('client-save-btn');
  if (saveBtn) saveBtn.disabled = true;
  // Hide personalised greetings
  const ahorroGreeting = document.getElementById('ahorro-greeting');
  const bancarioGreeting = document.getElementById('bancario-greeting');
  if (ahorroGreeting) ahorroGreeting.style.display = 'none';
  if (bancarioGreeting) bancarioGreeting.style.display = 'none';
  // Reset nav active state
  const navPlan = document.getElementById('nav-plan-ahorro');
  const navBancario = document.getElementById('nav-bancario');
  if (navPlan) navPlan.classList.add('active');
  if (navBancario) navBancario.classList.remove('active');
}

// -------------------------------------------------------------------------
// Snapshot and comparison helper functions
//
// The following functions create snapshot objects for both simulators,
// persist them to localStorage, retrieve them, and render them in the
// comparison modal. They are defined outside of the DOMContentLoaded
// handler so they can be called from anywhere in the script.

function getAhorroSnapshot() {
  const key = document.getElementById("model-plan-select").value;
  const quotaValue = document.getElementById("quota-select").value;
  const plan = planData.find((p) => p.key === key);
  if (!plan) return null;
  const value = plan.value;
  const { cuotaPura, quotas } = computeCuotas(value);
  // Override computed quotas with manual values when available.  This
  // ensures the snapshot reflects the real per‑tramo amounts provided
  // by the client for each plan.
  const manual = manualQuotas[key];
  if (manual) {
    quotas["2-12"] = manual["2-12"];
    quotas["13-18"] = manual["13-18"];
    quotas["19-84"] = manual["19-84"];
  }
  // Use dynamic rate depending on benefits flag
  const rate = benefitsApplied ? 0.10 : 0.12;
  const gastos = value * rate;
  let perc = 0;
  let adjudAmount = 0;
  if (quotaValue) {
    const valid = adjudications[key] || {};
    perc = valid[quotaValue] || 0;
    adjudAmount = value * perc;
  }
  // Determine if the adjudication is financed
  let financedMonthly = 0;
  let financingSelected = false;
  if (quotaValue && (quotaValue === '4' || quotaValue === '6')) {
    const fCheckEl = document.getElementById('finance-adjudication-checkbox');
    if (fCheckEl && fCheckEl.checked) {
      financingSelected = true;
      const rem = TOTAL_PLAN_MONTHS - parseInt(quotaValue, 10);
      financedMonthly = rem > 0 ? (adjudAmount / rem) : 0;
    }
  }
  // Final puesta en calle: if financing selected, only gastos; otherwise adjud + gastos
  const final = financingSelected ? gastos : (gastos + adjudAmount);
  const ts = Date.now();
  return {
    id: ts,
    timestamp: ts,
    tipo: "ahorro",
    model: plan.model,
    plan: plan.plan,
    value,
    cuotas: quotas,
    cuotaPura,
    gastosRetiro: gastos,
    quotaElegida: quotaValue ? parseInt(quotaValue) : null,
    adjudPerc: perc,
    adjudValue: adjudAmount,
    final,
    financiarAdjudicacion: financingSelected,
    adjudicacionFinanciadaPorCuota: financedMonthly
  };
}

function getBancarioSnapshot() {
  const model = document.getElementById("bancario-vehicle-select").value;
  const vehicle = vehiclesData.find((v) => v.model === model);
  if (!vehicle) return null;
  const price = vehicle.value;
  const capitalRaw = parseFloat(document.getElementById("bancario-capital-input").value);
  const capital = isNaN(capitalRaw) ? 0 : capitalRaw;
  const financed = Math.max(price - capital, 0);
  const system = document.getElementById("bancario-system-select").value;
  const termVal = parseInt(document.getElementById("bancario-term-select").value, 10);
  let tna = 0;
  if (system === "fija") {
    tna = 0.60;
  } else if (system === "uva") {
    tna = 0.15;
  }
  let cuotaEstim = 0;
  if (!isNaN(termVal) && termVal > 0 && financed > 0 && tna > 0) {
    cuotaEstim = computeInstallment(financed, tna, termVal);
  }
  const cuotas = {};
  [12, 24, 36, 48, 60].forEach((n) => {
    if (financed > 0 && tna > 0) {
      cuotas[n] = computeInstallment(financed, tna, n);
    } else {
      cuotas[n] = 0;
    }
  });
  const ts = Date.now();
  // Calculate the total cost for the bancario option.  The total
  // investment should include the up‑front capital plus the sum of all
  // instalments.  If a term is selected and a valid cuota has been
  // computed, multiply the cuota by the number of instalments; otherwise
  // fall back to capital + financed (principal) for partial scenarios.
  let totalCost;
  if (!isNaN(termVal) && termVal > 0 && cuotaEstim > 0) {
    totalCost = capital + cuotaEstim * termVal;
  } else {
    totalCost = capital + financed;
  }
  return {
    id: ts,
    timestamp: ts,
    tipo: "bancario",
    model,
    price,
    capital,
    financed,
    tna,
    termSelected: !isNaN(termVal) ? termVal : null,
    cuotaEstim,
    cuotas,
    total: totalCost
  };
}

function saveSnapshot(snapshot) {
  if (!snapshot) return;
  const existing = localStorage.getItem('fiatSimSnapshots');
  let list = [];
  if (existing) {
    try {
      list = JSON.parse(existing);
    } catch (e) {
      list = [];
    }
  }
  list.push(snapshot);
  if (list.length > 10) {
    list = list.slice(list.length - 10);
  }
  localStorage.setItem('fiatSimSnapshots', JSON.stringify(list));
}

function listSnapshots() {
  const existing = localStorage.getItem('fiatSimSnapshots');
  if (!existing) return [];
  try {
    return JSON.parse(existing) || [];
  } catch (e) {
    return [];
  }
}

function loadSnapshot(id) {
  const list = listSnapshots();
  return list.find((s) => s.id.toString() === id.toString());
}

function deleteSnapshot(id) {
  let list = listSnapshots();
  list = list.filter((s) => s.id.toString() !== id.toString());
  localStorage.setItem('fiatSimSnapshots', JSON.stringify(list));
}

function refreshSnapshotSelector() {
  const selector = document.getElementById('snapshot-selector');
  if (!selector) return;
  const list = listSnapshots();
  selector.innerHTML = '';
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.text = '-- Elegir guardado --';
  selector.appendChild(placeholder);
  list.forEach((snap) => {
    const opt = document.createElement('option');
    opt.value = snap.id;
    const date = new Date(snap.timestamp);
    const dateStr = date.toLocaleString('es-AR');
    let label = '';
    if (snap.tipo === 'ahorro') {
      label = `Ahorro - ${snap.model} ${snap.plan} - ${dateStr}`;
    } else {
      label = `Bancario - ${snap.model} - ${dateStr}`;
    }
    opt.text = label;
    selector.appendChild(opt);
  });
}

function openCompareModal(snapA, snapB) {
  const modal = document.getElementById('compare-modal');
  if (!modal) return;
  let a = snapA;
  let b = snapB;
  if (!a) a = getAhorroSnapshot();
  if (!b) b = getBancarioSnapshot();
  renderCompare(a, b);
  modal.style.display = 'block';
}

function closeCompareModal() {
  const modal = document.getElementById('compare-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function renderCompare(snapA, snapB) {
  const ahorroDiv = document.getElementById('compare-ahorro');
  const bancarioDiv = document.getElementById('compare-bancario');
  if (!ahorroDiv || !bancarioDiv) return;
  ahorroDiv.innerHTML = '';
  bancarioDiv.innerHTML = '';
  if (!snapA) {
    ahorroDiv.innerHTML = '<p>No hay datos de Plan de Ahorro disponibles.</p>';
  } else {
    let html = '<div class="compare-card">';
    html += `<h4>${snapA.model} ${snapA.plan}</h4>`;
    html += `<p><strong>Valor Móvil:</strong> ${formatCurrency(snapA.value)}</p>`;
    html += `<p><strong>Cuota Pura:</strong> ${formatCurrency(Math.round(snapA.cuotaPura))}</p>`;
    html += `<p><strong>Gastos retiro (12%):</strong> ${formatCurrency(Math.round(snapA.gastosRetiro))}</p>`;
    if (snapA.quotaElegida) {
      html += `<p><strong>% Adjudicación:</strong> ${(snapA.adjudPerc * 100).toFixed(0)}%</p>`;
      html += `<p><strong>Valor Adjudicación:</strong> ${formatCurrency(Math.round(snapA.adjudValue))}</p>`;
    }
    html += '<table class="mini-table"><thead><tr><th>Tramo</th><th>Importe</th></tr></thead><tbody>';
    html += `<tr><td>Cuotas 2–12</td><td>${formatCurrency(Math.round(snapA.cuotas['2-12']))}</td></tr>`;
    html += `<tr><td>Cuotas 13–18</td><td>${formatCurrency(Math.round(snapA.cuotas['13-18']))}</td></tr>`;
    html += `<tr><td>Cuotas 19–84</td><td>${formatCurrency(Math.round(snapA.cuotas['19-84']))}</td></tr>`;
    html += '</tbody></table>';
    html += `<p style="font-size:1.1rem;font-weight:bold;">FINAL Puesta en Calle: ${formatCurrency(Math.round(snapA.final))}</p>`;
    html += '</div>';
    ahorroDiv.innerHTML = html;
  }
  if (!snapB) {
    bancarioDiv.innerHTML = '<p>No hay datos de Financiación Bancaria disponibles.</p>';
  } else {
    let html = '<div class="compare-card">';
    html += `<h4>${snapB.model}</h4>`;
    html += `<p><strong>Precio vehículo:</strong> ${formatCurrency(snapB.price)}</p>`;
    html += `<p><strong>Inversión a realizar:</strong> ${formatCurrency(Math.round(snapB.capital))}</p>`;
    html += `<p><strong>Monto a financiar:</strong> ${formatCurrency(Math.round(snapB.financed))}</p>`;
    html += `<p><strong>TNA:</strong> ${snapB.tna > 0 ? (snapB.tna * 100).toFixed(0) + '%' : '-'}</p>`;
    if (snapB.termSelected) {
      html += `<p><strong>Plazo:</strong> ${snapB.termSelected} meses</p>`;
      html += `<p><strong>Cuota Estimada:</strong> ${formatCurrency(Math.round(snapB.cuotaEstim))}</p>`;
    }
    // Show total investment as capital plus the sum of all instalments (capital + cuotas)
    html += `<p><strong>Inversión total (capital + cuotas):</strong> ${formatCurrency(Math.round(snapB.total))}</p>`;
    html += '<table class="mini-table"><thead><tr><th>Plazo</th><th>Cuota</th></tr></thead><tbody>';
    [12, 24, 36, 48, 60].forEach((n) => {
      const val = snapB.cuotas[n];
      html += `<tr><td>${n}</td><td>${val > 0 ? formatCurrency(Math.round(val)) : '-'}</td></tr>`;
    });
    html += '</tbody></table>';
    html += '</div>';
    bancarioDiv.innerHTML = html;
  }
  // If both snapshots exist, compute and display difference summary below
  const modalBody = document.querySelector('#compare-modal .modal-body');
  if (modalBody) {
    // Remove any existing summary paragraph
    const existingSummary = modalBody.querySelector('.compare-summary');
    if (existingSummary) existingSummary.remove();
    if (snapA && snapB) {
      const diff = snapA.final - snapB.total;
      const summary = document.createElement('p');
      summary.classList.add('compare-summary');
      summary.style.marginTop = '1rem';
      summary.style.fontWeight = '600';
      // Determine label and colour based on which option is more expensive.
      let label = '';
      let colour = '';
      if (diff > 0) {
        label = '(Plan más costoso)';
        // Use the primary FIAT colour to emphasise that the plan is costlier.
        colour = 'var(--primary-color)';
      } else if (diff < 0) {
        label = '(Bancario más costoso)';
        // Use a green tone to highlight that bancario costs more (user saves with plan)
        colour = '#198754';
      } else {
        label = '(Costos iguales)';
        colour = 'var(--secondary-color)';
      }
      summary.style.color = colour;
      summary.textContent = `Diferencia total (Plan - Bancario): ${formatCurrency(Math.round(diff))} ${label}`;
      modalBody.appendChild(summary);
    }
  }
}

function exportCompareToPDF() {
  const printSection = document.getElementById('compare-print');
  if (!printSection) return;
  const ahorroDiv = document.getElementById('compare-ahorro');
  const bancarioDiv = document.getElementById('compare-bancario');
  if (!ahorroDiv || !bancarioDiv) return;
  printSection.innerHTML = '';
  // Create a header for the PDF with logo, title (dynamic) and date
  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.alignItems = 'center';
  header.style.marginBottom = '1rem';
  const img = document.createElement('img');
  img.src = 'assets/fiat-logo.svg';
  img.style.height = '40px';
  img.style.marginRight = '0.6rem';
  const title = document.createElement('h2');
  // Determine the report title based on client info. Use a more
  // professional label when available, e.g. "Reporte Ejecutivo de
  // Financiación (Nombre Apellido) (DNI)". If no client, fall back to
  // "Comparación de Simulaciones".
  // Always use a professional heading for the comparison report.  By
  // default we call it "Reporte Ejecutivo de Financiación" which
  // highlights the purpose of the document.  If client information is
  // available, append the person's name and DNI in parentheses to
  // personalise the report.  We do not fall back to the old
  // "Comparación de Simulaciones" heading anymore.
  let reportTitle = 'Reporte Ejecutivo de Financiación';
  const cinfo = getClientInfo();
  if (cinfo) {
    const namePart =
      cinfo.nombre && cinfo.apellido ? `${cinfo.nombre} ${cinfo.apellido}` : '';
    const dniPart = cinfo.dni ? cinfo.dni : '';
    if (namePart || dniPart) {
      reportTitle += ' (';
      if (namePart) {
        reportTitle += namePart;
      }
      if (dniPart) {
        // Use a dash to separate name and DNI if both exist
        if (namePart) reportTitle += ' – ';
        reportTitle += dniPart;
      }
      reportTitle += ')';
    }
  }
  title.textContent = reportTitle;
  title.style.margin = '0';
  title.style.color = 'var(--primary-color)';
  const dateSpan = document.createElement('span');
  dateSpan.textContent = new Date().toLocaleDateString('es-AR');
  dateSpan.style.marginLeft = 'auto';
  header.appendChild(img);
  header.appendChild(title);
  header.appendChild(dateSpan);
  printSection.appendChild(header);
  // Copy the contents of both comparison panels
  const container = document.createElement('div');
  container.style.display = 'grid';
  container.style.gridTemplateColumns = '1fr 1fr';
  container.style.gap = '1rem';
  const left = document.createElement('div');
  left.innerHTML = ahorroDiv.innerHTML;
  const right = document.createElement('div');
  right.innerHTML = bancarioDiv.innerHTML;
  container.appendChild(left);
  container.appendChild(right);
  printSection.appendChild(container);
  // Append difference summary if present
  const modalBody = document.querySelector('#compare-modal .modal-body');
  const summary = modalBody ? modalBody.querySelector('.compare-summary') : null;
  if (summary) {
    const summaryClone = summary.cloneNode(true);
    summaryClone.style.marginTop = '1rem';
    printSection.appendChild(summaryClone);
  }
  printSection.classList.add('print-active');
  window.print();
  printSection.classList.remove('print-active');
  printSection.innerHTML = '';
}

// -------------------------------------------------------------------
// Admin section helper functions

/**
 * Show the admin section after successful login. This function
 * populates the table of clients from localStorage and hides other
 * sections to focus on administrative tasks.
 */
function showAdminSection() {
  const adminSection = document.getElementById('admin-section');
  if (adminSection) adminSection.style.display = 'block';
  // Render the client list
  renderClientList();
  // Optionally hide the plan and bancario sections while in admin mode
  const planSection = document.getElementById('plan-ahorro-section');
  const bancarioSection = document.getElementById('bancario-section');
  if (planSection) planSection.style.display = 'none';
  if (bancarioSection) bancarioSection.style.display = 'none';
  // Also hide the client form/banner if visible
  const formSection = document.getElementById('client-form-section');
  const banner = document.getElementById('client-info-banner');
  if (formSection) formSection.style.display = 'none';
  if (banner) banner.style.display = 'none';
}

/**
 * Hide the admin section and restore the main UI. Called when
 * closing the admin interface.
 */
function hideAdminSection() {
  const adminSection = document.getElementById('admin-section');
  if (adminSection) adminSection.style.display = 'none';
  // Restore plan section by default
  const planSection = document.getElementById('plan-ahorro-section');
  const bancarioSection = document.getElementById('bancario-section');
  if (planSection) planSection.style.display = 'block';
  if (bancarioSection) bancarioSection.style.display = 'none';
  // Show client banner if exists
  const banner = document.getElementById('client-info-banner');
  const client = getClientInfo();
  if (banner && client) {
    banner.style.display = 'flex';
    displayClientInfo(client);
  }
}

/**
 * Populate the admin client table from stored records in
 * localStorage. If there are no records, the table will show a
 * placeholder row indicating that no clients have been saved.
 */
function renderClientList() {
  const tbody = document.getElementById('admin-client-table');
  if (!tbody) return;
  tbody.innerHTML = '';
  let list = [];
  try {
    const existing = localStorage.getItem('fiatCreditClientRecords');
    list = existing ? JSON.parse(existing) : [];
  } catch (e) {
    list = [];
  }
  if (!list || list.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    // The colspan must match the number of columns in the table header (Nombre, Apellido, DNI, Localidad, Teléfono, Email, Fecha, Atendido por, Estado, Tipo de venta, Acción)
    td.colSpan = 11;
    td.textContent = 'No hay clientes registrados.';
    tr.appendChild(td);
    tbody.appendChild(tr);
    // Also clear the summary when there are no clients
    renderAdminSummary();
    return;
  }
  list.forEach((record, index) => {
    const tr = document.createElement('tr');
    const dateStr = new Date(record.timestamp).toLocaleString('es-AR');
    // Populate the standard columns (nombre, apellido, etc.)
    const values = [record.nombre, record.apellido, record.dni, record.localidad, record.telefono, record.email, dateStr];
    values.forEach((val) => {
      const cell = document.createElement('td');
      cell.textContent = val || '';
      tr.appendChild(cell);
    });
    // Create the "Atendido por" column with a select dropdown.  The
    // select allows the admin to assign who attended the client.  The
    // selected value is persisted to localStorage when changed.
    const attendCell = document.createElement('td');
    const selAtt = document.createElement('select');
    selAtt.innerHTML = '';
    const emptyOptA = document.createElement('option');
    emptyOptA.value = '';
    emptyOptA.text = '-- Seleccione --';
    selAtt.appendChild(emptyOptA);
    staffNames.forEach((name) => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.text = name;
      selAtt.appendChild(opt);
    });
    selAtt.value = record.atendidoPor || '';
    selAtt.dataset.recordIndex = index;
    selAtt.addEventListener('change', (e) => {
      const idx = parseInt(e.target.dataset.recordIndex, 10);
      const selectedName = e.target.value;
      assignAttendedBy(idx, selectedName);
    });
    attendCell.appendChild(selAtt);
    tr.appendChild(attendCell);
    // Create the status column with a select dropdown.  Admins can
    // assign the current status of each client.
    const statusCell = document.createElement('td');
    const selStatus = document.createElement('select');
    statusOptions.forEach((status) => {
      const opt = document.createElement('option');
      opt.value = status;
      opt.text = status;
      selStatus.appendChild(opt);
    });
    selStatus.value = record.status || statusOptions[0];
    selStatus.dataset.recordIndex = index;
    selStatus.addEventListener('change', (e) => {
      const idx = parseInt(e.target.dataset.recordIndex, 10);
      const selectedStatus = e.target.value;
      assignStatus(idx, selectedStatus);
    });
    statusCell.appendChild(selStatus);
    tr.appendChild(statusCell);
    // Create the sale type column.  Only relevant when status is
    // "Vendido".  A select dropdown allows choosing between plan de
    // ahorro and bancario.  It is hidden/disabled otherwise.
    const saleCell = document.createElement('td');
    const selSale = document.createElement('select');
    // Add an empty option
    const emptyOptS = document.createElement('option');
    emptyOptS.value = '';
    emptyOptS.text = '--';
    selSale.appendChild(emptyOptS);
    saleTypeOptions.forEach((tp) => {
      const opt = document.createElement('option');
      opt.value = tp;
      opt.text = tp;
      selSale.appendChild(opt);
    });
    selSale.value = record.saleType || '';
    selSale.dataset.recordIndex = index;
    selSale.addEventListener('change', (e) => {
      const idx = parseInt(e.target.dataset.recordIndex, 10);
      const selectedType = e.target.value;
      assignSaleType(idx, selectedType);
    });
    // Disable or hide the sale type select if status is not Vendido
    if (record.status !== 'Vendido') {
      selSale.disabled = true;
      selSale.style.display = 'none';
    } else {
      selSale.disabled = false;
      selSale.style.display = '';
    }
    saleCell.appendChild(selSale);
    tr.appendChild(saleCell);
    // Create the action column with a delete button
    const actionCell = document.createElement('td');
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Eliminar';
    delBtn.classList.add('export-btn');
    delBtn.style.padding = '0.3rem 0.6rem';
    delBtn.dataset.recordIndex = index;
    delBtn.addEventListener('click', (e) => {
      const idx = parseInt(e.target.dataset.recordIndex, 10);
      deleteClient(idx);
    });
    actionCell.appendChild(delBtn);
    tr.appendChild(actionCell);
    tbody.appendChild(tr);
  });
  // After rendering all rows, update the summary counts
  renderAdminSummary();
}

/**
 * Assign the staff member who attended a specific client. The client
 * is identified by its index in the stored list.  After updating
 * localStorage, the admin table is re-rendered to reflect the
 * change.
 * @param {number} index - The index of the client record in the list.
 * @param {string} name - The staff member's name, or empty string for none.
 */
function assignAttendedBy(index, name) {
  if (isNaN(index)) return;
  let list = [];
  try {
    const existing = localStorage.getItem('fiatCreditClientRecords');
    list = existing ? JSON.parse(existing) : [];
  } catch (e) {
    list = [];
  }
  if (index < 0 || index >= list.length) return;
  list[index].atendidoPor = name || '';
  localStorage.setItem('fiatCreditClientRecords', JSON.stringify(list));
  // Re-render the table to update selects
  renderClientList();
}

/**
 * Assign a new status to a client.  Updates the record at the
 * specified index and persists the change.  If the new status is
 * anything other than "Vendido", the sale type is cleared.
 *
 * @param {number} index - The index of the client record in the list.
 * @param {string} status - The new status.
 */
function assignStatus(index, status) {
  if (isNaN(index)) return;
  let list = [];
  try {
    const existing = localStorage.getItem('fiatCreditClientRecords');
    list = existing ? JSON.parse(existing) : [];
  } catch (e) {
    list = [];
  }
  if (index < 0 || index >= list.length) return;
  list[index].status = status || '';
  // Clear sale type unless the status is "Vendido"
  if (status !== 'Vendido') {
    list[index].saleType = '';
  }
  localStorage.setItem('fiatCreditClientRecords', JSON.stringify(list));
  renderClientList();
}

/**
 * Assign a sale type to a client.  Updates the record at the
 * specified index and persists the change.  The sale type is
 * meaningful only when the status is "Vendido".
 *
 * @param {number} index - The index of the client record.
 * @param {string} saleType - The selected sale type.
 */
function assignSaleType(index, saleType) {
  if (isNaN(index)) return;
  let list = [];
  try {
    const existing = localStorage.getItem('fiatCreditClientRecords');
    list = existing ? JSON.parse(existing) : [];
  } catch (e) {
    list = [];
  }
  if (index < 0 || index >= list.length) return;
  list[index].saleType = saleType || '';
  localStorage.setItem('fiatCreditClientRecords', JSON.stringify(list));
  renderClientList();
}

/**
 * Delete a client record by index.  Removes the specified
 * entry from the stored list of clients.  After deletion, the
 * client list and summary are re-rendered.  If the index is
 * invalid or the list cannot be parsed, the function returns
 * silently.  A confirmation prompt is displayed before
 * performing the deletion.
 *
 * @param {number} index - The index of the client record in the list.
 */
function deleteClient(index) {
  if (isNaN(index)) return;
  let list = [];
  try {
    const existing = localStorage.getItem('fiatCreditClientRecords');
    list = existing ? JSON.parse(existing) : [];
  } catch (e) {
    list = [];
  }
  if (index < 0 || index >= list.length) return;
  // Confirm deletion with the user
  const conf = confirm('¿Estás seguro de que deseas eliminar este cliente?');
  if (!conf) return;
  // Remove the record from the list
  list.splice(index, 1);
  // Persist the updated list
  localStorage.setItem('fiatCreditClientRecords', JSON.stringify(list));
  // Re-render tables and summary
  renderClientList();
  renderVendorClientList();
  renderAdminSummary();
}

/**
 * Compute and display a summary of how many clients have been
 * attended by each staff member.  The summary is rendered in the
 * admin section beneath the table.  If there are no clients, a
 * message is shown instead.
 */
function renderAdminSummary() {
  const summaryDiv = document.getElementById('admin-summary');
  if (!summaryDiv) return;
  let list = [];
  try {
    const existing = localStorage.getItem('fiatCreditClientRecords');
    list = existing ? JSON.parse(existing) : [];
  } catch (e) {
    list = [];
  }
  if (!list || list.length === 0) {
    summaryDiv.textContent = 'No hay clientes registrados.';
    return;
  }
  const counts = {};
  staffNames.forEach((name) => {
    counts[name] = 0;
  });
  // Count clients by the user who originally created the record.  We
  // count using the `createdBy` field instead of `atendidoPor` to
  // reflect how many clients were loaded by each vendor.  Records
  // created by admins may have an empty createdBy and are not
  // attributed to any vendor.
  list.forEach((rec) => {
    const creator = rec.createdBy || '';
    if (creator) {
      counts[creator] = (counts[creator] || 0) + 1;
    }
  });
  const parts = [];
  Object.keys(counts).forEach((name) => {
    parts.push(`${name}: ${counts[name]}`);
  });
  parts.push(`Total: ${list.length}`);
  summaryDiv.textContent = parts.join(' | ');
}

// -------------------------------------------------------------------
// Admin add-client modal helpers

/**
 * Populate the attended-by select in the add-client modal with
 * available staff names. This should be called each time the
 * modal is shown to ensure the list is up to date.
 */
function initAddClientSelect() {
  const sel = document.getElementById('add-client-attended-by');
  if (!sel) return;
  sel.innerHTML = '';
  const emptyOpt = document.createElement('option');
  emptyOpt.value = '';
  emptyOpt.text = '-- Seleccione --';
  sel.appendChild(emptyOpt);
  staffNames.forEach((name) => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.text = name;
    sel.appendChild(opt);
  });
}

/**
 * Show the modal for adding a new client from the admin panel. It
 * initialises the form and attended-by select and clears previous
 * error messages.
 */
function showAddClientModal() {
  initAddClientSelect();
  // Clear form fields
  ['add-client-first-name','add-client-last-name','add-client-dni','add-client-localidad','add-client-telefono','add-client-email'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = '';
    const err = document.getElementById(id + '-error');
    if (err) err.textContent = '';
  });
  const sel = document.getElementById('add-client-attended-by');
  if (sel) sel.value = '';
  const err = document.getElementById('add-client-error');
  if (err) err.textContent = '';
  const modal = document.getElementById('add-client-modal');
  if (modal) modal.style.display = 'block';
}

/**
 * Hide the add-client modal. Called when cancelling or after saving.
 */
function hideAddClientModal() {
  const modal = document.getElementById('add-client-modal');
  if (modal) modal.style.display = 'none';
}

/**
 * Validate the admin add-client form. It displays error messages next to
 * invalid fields and returns true only if all required fields are
 * valid. The required fields are: first name, last name, DNI (7-10
 * digits) and locality. Phone and email are optional but validated
 * when present.
 * @returns {boolean} True if valid; false otherwise.
 */
function validateAddClientForm() {
  let valid = true;
  function setErr(id, msg) {
    const err = document.getElementById(id + '-error');
    if (err) err.textContent = msg;
  }
  const fn = document.getElementById('add-client-first-name');
  const ln = document.getElementById('add-client-last-name');
  const dniEl = document.getElementById('add-client-dni');
  const loc = document.getElementById('add-client-localidad');
  const tel = document.getElementById('add-client-telefono');
  const email = document.getElementById('add-client-email');
  if (!fn.value.trim()) {
    setErr('add-client-first-name','Requerido');
    valid = false;
  } else {
    setErr('add-client-first-name','');
  }
  if (!ln.value.trim()) {
    setErr('add-client-last-name','Requerido');
    valid = false;
  } else {
    setErr('add-client-last-name','');
  }
  const dniVal = dniEl.value.trim();
  if (!dniVal) {
    setErr('add-client-dni','Requerido');
    valid = false;
  } else if (!/^\d{7,10}$/.test(dniVal)) {
    setErr('add-client-dni','Debe contener 7-10 dígitos');
    valid = false;
  } else {
    setErr('add-client-dni','');
  }
  if (!loc.value.trim()) {
    setErr('add-client-localidad','Requerido');
    valid = false;
  } else {
    setErr('add-client-localidad','');
  }
  if (tel.value.trim() && !/^\+?\d{6,15}$/.test(tel.value.trim())) {
    setErr('add-client-telefono','Número inválido');
    valid = false;
  } else {
    setErr('add-client-telefono','');
  }
  if (email.value.trim() && !/^\S+@\S+\.\S+$/.test(email.value.trim())) {
    setErr('add-client-email','Email inválido');
    valid = false;
  } else {
    setErr('add-client-email','');
  }
  return valid;
}

/**
 * Save a new client record from the admin modal. Validates the input,
 * builds a record object with the attended-by selection, appends it
 * to the stored records list, updates localStorage and re-renders the
 * admin table. It does not modify the current session client info.
 */
function saveNewAdminClient() {
  if (!validateAddClientForm()) return;
  // Build the record
  // Build the new record.  Admins can specify the attendant but
  // status defaults to "En gestion" and saleType is empty.  The
  // createdBy field is left empty for admin-added clients.
  const record = {
    nombre: document.getElementById('add-client-first-name').value.trim(),
    apellido: document.getElementById('add-client-last-name').value.trim(),
    dni: document.getElementById('add-client-dni').value.trim(),
    localidad: document.getElementById('add-client-localidad').value.trim(),
    telefono: document.getElementById('add-client-telefono').value.trim(),
    email: document.getElementById('add-client-email').value.trim(),
    atendidoPor: document.getElementById('add-client-attended-by').value || '',
    createdBy: '',
    status: 'En gestion',
    saleType: '',
    timestamp: Date.now()
  };
  let list = [];
  try {
    const existing = localStorage.getItem('fiatCreditClientRecords');
    list = existing ? JSON.parse(existing) : [];
  } catch (e) {
    list = [];
  }
  list.push(record);
  localStorage.setItem('fiatCreditClientRecords', JSON.stringify(list));
  // Hide modal and refresh table
  hideAddClientModal();
  renderClientList();
}

/**
 * Export the client records stored in localStorage to a CSV file.
 */
function exportClientsToCSV() {
  let list = [];
  try {
    const existing = localStorage.getItem('fiatCreditClientRecords');
    list = existing ? JSON.parse(existing) : [];
  } catch (e) {
    list = [];
  }
  if (list && list.length > 0) {
    generateCsv(list);
  } else {
    alert('No hay datos de clientes para exportar.');
  }
}

/**
 * Export the client list to PDF by copying the admin table into a
 * hidden print section and invoking the browser's print function.
 */
function exportClientsToPDF() {
  const printSection = document.getElementById('admin-print');
  const tableBody = document.getElementById('admin-client-table');
  if (!printSection || !tableBody) return;
  // Create header with logo, title and date
  printSection.innerHTML = '';
  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.alignItems = 'center';
  header.style.marginBottom = '1rem';
  const img = document.createElement('img');
  img.src = 'assets/fiat-logo.svg';
  img.style.height = '40px';
  img.style.marginRight = '0.6rem';
  const title = document.createElement('h2');
  title.textContent = 'Reporte de clientes';
  title.style.margin = '0';
  title.style.color = 'var(--primary-color)';
  const dateSpan = document.createElement('span');
  dateSpan.textContent = new Date().toLocaleDateString('es-AR');
  dateSpan.style.marginLeft = 'auto';
  header.appendChild(img);
  header.appendChild(title);
  header.appendChild(dateSpan);
  printSection.appendChild(header);
  // Clone the table to print
  const tableClone = document.createElement('table');
  tableClone.style.width = '100%';
  tableClone.style.borderCollapse = 'collapse';
  // Build header row
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  // Include the "Atendido por" column in the exported PDF.  If you
  // modify this list, ensure the data rows below are updated accordingly.
  ['Nombre','Apellido','DNI','Localidad','Teléfono','Email','Fecha','Atendido por','Estado','Tipo de venta'].forEach((txt) => {
    const th = document.createElement('th');
    th.textContent = txt;
    th.style.border = '1px solid #cccccc';
    th.style.padding = '0.4rem';
    th.style.backgroundColor = '#e0e0e0';
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  tableClone.appendChild(thead);
  // Build body rows
  const tbody = document.createElement('tbody');
  let list = [];
  try {
    const existing = localStorage.getItem('fiatCreditClientRecords');
    list = existing ? JSON.parse(existing) : [];
  } catch (e) {
    list = [];
  }
  list.forEach((c) => {
    const tr = document.createElement('tr');
    const dateStr = new Date(c.timestamp).toLocaleString('es-AR');
    // Add all columns including attendedBy, status and saleType.
    [
      c.nombre,
      c.apellido,
      c.dni,
      c.localidad,
      c.telefono,
      c.email,
      dateStr,
      c.atendidoPor || '',
      c.status || '',
      c.saleType || ''
    ].forEach((val) => {
      const td = document.createElement('td');
      td.textContent = val || '';
      td.style.border = '1px solid #cccccc';
      td.style.padding = '0.4rem';
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  tableClone.appendChild(tbody);
  printSection.appendChild(tableClone);
  printSection.classList.add('print-active');
  window.print();
  printSection.classList.remove('print-active');
  printSection.innerHTML = '';
}

// -------------------------------------------------------------------
// Vendor section helper functions

/**
 * Show the vendor section ("Mis clientes") for the currently
 * logged in vendor.  Hides other sections of the UI to focus on
 * the vendor list.  Only vendors can call this function.
 */
function showVendorSection() {
  const section = document.getElementById('vendor-section');
  if (section) section.style.display = 'block';
  // Render the vendor's client list
  renderVendorClientList();
  // Hide other sections
  const planSection = document.getElementById('plan-ahorro-section');
  const bancarioSection = document.getElementById('bancario-section');
  const formSection = document.getElementById('client-form-section');
  const banner = document.getElementById('client-info-banner');
  if (planSection) planSection.style.display = 'none';
  if (bancarioSection) bancarioSection.style.display = 'none';
  if (formSection) formSection.style.display = 'none';
  if (banner) banner.style.display = 'none';
}

/**
 * Hide the vendor section and restore the main Plan de Ahorro UI.
 * Called when the vendor clicks the "Cerrar" button.
 */
function hideVendorSection() {
  const section = document.getElementById('vendor-section');
  if (section) section.style.display = 'none';
  // Restore plan section and hide bancario
  const planSection = document.getElementById('plan-ahorro-section');
  const bancarioSection = document.getElementById('bancario-section');
  if (planSection) planSection.style.display = 'block';
  if (bancarioSection) bancarioSection.style.display = 'none';
  // Show banner if a client is currently selected
  const banner = document.getElementById('client-info-banner');
  const client = getClientInfo();
  if (banner && client) {
    banner.style.display = 'flex';
    displayClientInfo(client);
  }
}

/**
 * Render the list of clients for the currently logged in vendor.
 * Only clients with attendedBy or createdBy equal to the vendor's
 * username are shown.  The table includes controls for changing
 * the status and sale type.  Each change is persisted to
 * localStorage.
 */
function renderVendorClientList() {
  const tbody = document.getElementById('vendor-client-table');
  if (!tbody) return;
  tbody.innerHTML = '';
  const user = getCurrentUser();
  if (!user) return;
  let list = [];
  try {
    const existing = localStorage.getItem('fiatCreditClientRecords');
    list = existing ? JSON.parse(existing) : [];
  } catch (e) {
    list = [];
  }
  list.forEach((record, index) => {
    // Only display records created or attended by the current vendor
    if (record.atendidoPor !== user.username && record.createdBy !== user.username) {
      return;
    }
    const tr = document.createElement('tr');
    const dateStr = new Date(record.timestamp).toLocaleString('es-AR');
    [
      record.nombre,
      record.apellido,
      record.dni,
      record.localidad,
      record.telefono,
      record.email,
      dateStr
    ].forEach((val) => {
      const td = document.createElement('td');
      td.textContent = val || '';
      tr.appendChild(td);
    });
    // Status select
    const statusCell = document.createElement('td');
    const selStatus = document.createElement('select');
    statusOptions.forEach((opt) => {
      const o = document.createElement('option');
      o.value = opt;
      o.text = opt;
      selStatus.appendChild(o);
    });
    selStatus.value = record.status || statusOptions[0];
    selStatus.dataset.recordIndex = index;
    selStatus.addEventListener('change', (e) => {
      const idx = parseInt(e.target.dataset.recordIndex, 10);
      const newStatus = e.target.value;
      assignStatus(idx, newStatus);
      // Re-render vendor table to update sale type visibility
      renderVendorClientList();
    });
    statusCell.appendChild(selStatus);
    tr.appendChild(statusCell);
    // Sale type select
    const saleCell = document.createElement('td');
    const selSale = document.createElement('select');
    const empty = document.createElement('option');
    empty.value = '';
    empty.text = '--';
    selSale.appendChild(empty);
    saleTypeOptions.forEach((opt) => {
      const o = document.createElement('option');
      o.value = opt;
      o.text = opt;
      selSale.appendChild(o);
    });
    selSale.value = record.saleType || '';
    selSale.dataset.recordIndex = index;
    selSale.addEventListener('change', (e) => {
      const idx = parseInt(e.target.dataset.recordIndex, 10);
      const newType = e.target.value;
      assignSaleType(idx, newType);
      renderVendorClientList();
    });
    // Show sale type only if status is Vendido
    if (record.status !== 'Vendido') {
      selSale.disabled = true;
      selSale.style.display = 'none';
    } else {
      selSale.disabled = false;
      selSale.style.display = '';
    }
    saleCell.appendChild(selSale);
    tr.appendChild(saleCell);
    tbody.appendChild(tr);
  });
}

// --- Custom additions (2025-10-03) ---
let quota2RejectSwitch = false; // toggled by clicking the FIAT logo (hidden switch)

/** Update the visible quota display pill */
function updateQuotaDisplay() {
  const select = document.getElementById('quota-select');
  const disp = document.getElementById('quota-display');
  if (!select || !disp) return;
  const val = select.value ? select.value : '--';
  disp.textContent = val;
}

/** Cycle to the next available quota (vendor-only control) */
function cycleQuota() {
  const select = document.getElementById('quota-select');
  if (!select) return;
  const opts = Array.from(select.options).map(o => o.value).filter(v => v !== '');
  if (opts.length === 0) return;
  const cur = select.value;
  let idx = opts.indexOf(cur);
  idx = (idx + 1) % opts.length;
  select.value = opts[idx];
  handleQuotaChange();
  updateQuotaDisplay();
}

/** Show/Hide vendor-only utilities depending on login state */
function applyVendorUtilsVisibility() {
  try {
    const user = getCurrentUser && getCurrentUser();
    document.querySelectorAll('.vendor-only').forEach(el => {
      el.style.display = user ? 'inline-block' : 'none';
    });
  } catch(e) {}
}

/** Handle click on hidden switch (logo): reject all quota 2 on preapproval */
function attachHiddenSwitch() {
  const logo = document.getElementById('fiat-logo-switch');
  if (!logo) return;
  logo.style.cursor = 'pointer';
  logo.addEventListener('click', () => {
    quota2RejectSwitch = !quota2RejectSwitch;
    // brief visual feedback
    logo.animate([{ transform: 'scale(1)' }, { transform: 'scale(0.9)' }, { transform: 'scale(1)' }], { duration: 200 });
  });
}

/** Show rejection banner */
function showRejectionBanner() {
  const b = document.getElementById('rejection-banner');
  if (b) b.style.display = 'block';
}
/** Hide rejection banner */
function hideRejectionBanner() {
  const b = document.getElementById('rejection-banner');
  if (b) b.style.display = 'none';
}

/** Our preapproval handler: if hidden switch is active and quota==2, reject; else apply benefits and clear quota */
function handlePreapprovalClick() {
  const quota = (document.getElementById('quota-select') || {}).value || '';
  if (quota2RejectSwitch && quota === '2') {
    // Reject client loudly
    hidePreapprovalModal && hidePreapprovalModal(); // in case it was open
    showRejectionBanner();
    return;
  }
  hideRejectionBanner();
  // Proceed with benefits/preapproval as usual
  applyBenefits && applyBenefits();
  // Clear adjudication quota after preapproval
  const qs = document.getElementById('quota-select');
  if (qs) {
    qs.value = '';
    handleQuotaChange && handleQuotaChange();
    updateQuotaDisplay();
  }
}

/** Reset hidden switch when changing client */
function resetHiddenSwitch() {
  quota2RejectSwitch = false;
  hideRejectionBanner();
}

/** Bind our overrides and helpers after DOM is ready */
(function initCustomBehaviours(){
  document.addEventListener('DOMContentLoaded', () => {
    // attach hidden switch
    attachHiddenSwitch();
    // override preapproval button (use capture to stop other handlers)
    const btn = document.getElementById('benefit-btn');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        handlePreapprovalClick();
      }, true);
    }
    // keep quota display in sync
    const qs = document.getElementById('quota-select');
    if (qs) {
      qs.addEventListener('change', updateQuotaDisplay);
      updateQuotaDisplay();
    }
    // vendor-only cycle button
    const changeBtn = document.getElementById('quota-change-btn');
    if (changeBtn) {
      changeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        cycleQuota();
      });
    }
    // show vendor utilities if logged
    applyVendorUtilsVisibility();
  });

  // Hook into existing resets if available
  const originalResetBenefits = (typeof resetBenefits === 'function') ? resetBenefits : null;
  if (originalResetBenefits) {
    window.resetBenefits = function(){
      originalResetBenefits();
      resetHiddenSwitch();
      updateQuotaDisplay();
    }
  }
})();


// === Enhancements: Keyboard, Proximity, Capital ===
(function(){
  let altPressed = false;
  const QS_ID='quota-select', BTN_ID='quota-change-btn';

  function qs(){ return document.getElementById(QS_ID); }

  function navigateQuota(delta){
    const s = qs(); if (!s) return;
    const opts = Array.from(s.options);
    const valid = opts.map((o,i)=>({i, v:o.value})).filter(x => x.v !== '');
    if (!valid.length) return;
    const cur = s.selectedIndex;
    let pos = valid.findIndex(x => x.i === cur);
    if (pos < 0) pos = 0;
    pos = Math.max(0, Math.min(valid.length-1, pos + delta));
    s.selectedIndex = valid[pos].i;
    s.dispatchEvent(new Event('change',{bubbles:true}));
    if (typeof window.handleQuotaChange === 'function') { try{ window.handleQuotaChange(); }catch(e){} }
  }

  document.addEventListener('keydown', e=>{
    if (e.key === 'Alt') altPressed = true;
    if (e.ctrlKey && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')){
      e.preventDefault();
      navigateQuota(e.key === 'ArrowRight' ? +1 : -1);
    }
  });
  document.addEventListener('keyup', e=>{ if (e.key === 'Alt') altPressed = false; });

  (function(){
    const btn = document.getElementById(BTN_ID); if (!btn) return;
    const R=400;
    window.addEventListener('mousemove', ev=>{
      const r = btn.getBoundingClientRect();
      const cx = r.left + r.width/2, cy = r.top + r.height/2;
      const d = Math.hypot(ev.clientX - cx, ev.clientY - cy);
      if (altPressed && d <= R) btn.classList.add('revealed'); else btn.classList.remove('revealed');
    }, {passive:true});
  })();

  // Capital hook
  const cap = document.getElementById('capital-input');
  function getCap(){ return cap ? (parseFloat(cap.value||'0')||0) : 0; }
  function triggerRecalc(){
    window.__capitalOverride = getCap();
    if (typeof window.handleQuotaChange === 'function') { try{ window.handleQuotaChange(); }catch(e){} }
    if (typeof window.refreshAdjudicationFinance === 'function') { try{ window.refreshAdjudicationFinance(); }catch(e){} }
  }
  if (cap){ cap.addEventListener('input', triggerRecalc); cap.addEventListener('change', triggerRecalc); }
})();


// === Tranche overrides ===
window.__trancheOverrides = {
  "Fiorino 70/30": { pure: 228825, initPost: 1050000, q2_12: 378000, q13_18: 399000, q19_84: 309000 },
  "Pulse 70/30":   { pure: 283458, initPost: 1050000, q2_12: 468000, q13_18: 494000, q19_84: 468000 },
  "Strada 70/30":  { pure: 290600, initPost: 1050000, q2_12: 480000, q13_18: 506000, q19_84: 480000 },
  "Toro 70/30":    { pure: 365975, initPost: 1050000, q2_12: 564000, q13_18: 596000, q19_84: 514000 },
  "Argo 70/30":    { pure: 232483, initPost: 900000, q2_12: 383775, q13_18: 404419, q19_84: 313448 },
  "Cronos 90/10":  { pure: 365357, initPost: 900000, q2_12: 560000, q13_18: 586000, q19_84: 560000 },
  "Cronos 70/30":  { pure: 284167, initPost: 900000, q2_12: 438000, q13_18: 470000, q19_84: 400000 },
  "Mobi 80/20":    { pure: 237752, initPost: 900000, q2_12: 294000, q13_18: 312000, q19_84: 322000 },
  "Fastback 60/40":{ pure: 300836, initPost: 1050000, q2_12: 524000, q13_18: 555000, q19_84: 524000 },
  "Titano 70/30":  { pure: 412117, initPost: 900000, q2_12: 634108, q13_18: 681000, q19_84: 579000 }
};

(function(){
  function fmt(n){ return new Intl.NumberFormat('es-AR').format(n); }
  function applyOverrides(){
    const mp = document.getElementById('model-plan-select');
    if (!mp) return;
    const key = mp.value;
    const ov = window.__trancheOverrides && window.__trancheOverrides[key];
    if (!ov) return;
    const pure = document.getElementById('cuota-pura-display');
    if (pure) pure.textContent = "$ " + fmt(ov.pure);
    const initPost = document.getElementById('inversion-post-display');
    if (initPost) initPost.textContent = "$ " + fmt(ov.initPost);
    const c212 = document.getElementById('scheme-2-12');
    const c1318 = document.getElementById('scheme-13-18');
    const c1984 = document.getElementById('scheme-19-84');
    if (c212) c212.textContent = "$ " + fmt(ov.q2_12);
    if (c1318) c1318.textContent = "$ " + fmt(ov.q13_18);
    if (c1984) c1984.textContent = "$ " + fmt(ov.q19_84);
  }
  ['handleModelPlanChange','handleQuotaChange','refreshAdjudicationFinance'].forEach(fn=>{
    if (typeof window[fn] === 'function'){
      const o = window[fn];
      window[fn] = function(){ try{ o.apply(this, arguments); } finally { applyOverrides(); } };
    }
  });
  document.addEventListener('DOMContentLoaded', applyOverrides);
})();


// === PATCH: Enforce valores de inversión (pre y post) ===
(function(){
  const PRE_APROB_INICIAL = 1650000;
  const POST_APROB = {
    "Cronos": 900000,
    "Argo": 900000,
    "Pulse": 1050000,
    "Strada": 1050000,
    "Fiorino": 1050000,
    "Mobi": 900000,
    "Fastback": 1050000,
    "Toro": 1050000,
    "Titano": 900000
  };

  function fmt(n){ return new Intl.NumberFormat('es-AR').format(n); }
  function currency(n){ return "$ " + fmt(n); }
  function q(sel){ try{ return document.querySelector(sel);}catch(_){ return null; } }

  function getSelectedModel(){
    // 1) Select con id común
    const ids = ['model-select','modelo-plan','plan-select','select-modelo','select-plan'];
    for (const id of ids){
      const el = document.getElementById(id);
      if (el && el.tagName === 'SELECT'){
        const opt = el.options[el.selectedIndex];
        return (opt?.text || opt?.value || '').trim();
      }
    }
    // 2) Buscar label "Modelo + Plan" y tomar el <select> vecino
    const labels = Array.from(document.querySelectorAll('label')).filter(l => /modelo\s*\+\s*plan/i.test(l.textContent||''));
    for (const lab of labels){
      const sel = lab.parentElement?.querySelector('select') || lab.nextElementSibling?.querySelector?.('select') || lab.closest('.panel')?.querySelector('select');
      if (sel){
        const opt = sel.options[sel.selectedIndex];
        return (opt?.text || opt?.value || '').trim();
      }
    }
    // 3) Fallback: primer select visible
    const sel = document.querySelector('select');
    const opt = sel?.options?.[sel.selectedIndex];
    return (opt?.text || opt?.value || '').trim();
  }

  function normalizeModelName(text){
    if (!text) return "";
    // Extrae la primera palabra útil (ej. "Cronos 70/30" -> "Cronos")
    return (text.match(/(Cronos|Argo|Pulse|Strada|Fiorino|Mobi|Fastback|Toro|Titano)/i)||[])[0] || "";
  }

  function setPreAprobDisplay(){
    // Busca un elemento cercano al título "Inversión inicial" y cambia su valor visible
    const nodes = Array.from(document.querySelectorAll('*')).filter(n=>/invers[ií]on\s+inicial\b/i.test(n.textContent||''));
    for (const n of nodes){
      // Busca en el mismo bloque un elemento con monto
      const scope = n.closest('.panel') || n.parentElement || document;
      const moneyNode = Array.from(scope.querySelectorAll('*')).find(x=>/\$\s*\d/.test(x.textContent||''));
      if (moneyNode && /invers/i.test(n.textContent)){
        // Solo si el valor no coincide con el deseado
        if (!new RegExp(fmt(PRE_APROB_INICIAL)).test(moneyNode.textContent)){
          moneyNode.textContent = currency(PRE_APROB_INICIAL);
        }
        break;
      }
    }
    // Expone por si otras funciones necesitan el valor
    window.__preAprobInicial = PRE_APROB_INICIAL;
  }

  function setPostAprobDisplay(){
    const modelFull = getSelectedModel();
    const model = normalizeModelName(modelFull);
    const val = POST_APROB[model];
    if (!val) return;
    // Busca textos tipo "inversión inicial post" y actualiza el monto cercano
    const nodes = Array.from(document.querySelectorAll('*')).filter(n=>/invers[ií]on\s+inicial\s+post/i.test(n.textContent||''));
    for (const n of nodes){
      const scope = n.closest('.panel') || n.parentElement || document;
      const moneyNode = Array.from(scope.querySelectorAll('*')).find(x=>/\$\s*\d/.test(x.textContent||''));
      if (moneyNode){
        moneyNode.textContent = currency(val);
        break;
      }
    }
    // Guardamos para que cálculos que lean window tomen el valor correcto
    window.__postAprobInicial = val;
  }

  // Intenta engancharse a las funciones de render existentes si están
  function hook(fnName, after){
    try{
      const orig = window[fnName];
      if (typeof orig === 'function'){
        window[fnName] = function(){ const r = orig.apply(this, arguments); try{ after(); }catch(_){ } return r; };
      }
    }catch(_){}
  }

  function applyAll(){ try{ setPreAprobDisplay(); setPostAprobDisplay(); }catch(_){ } }

  document.addEventListener('DOMContentLoaded', ()=>{
    // En cambios de select
    document.addEventListener('change', (e)=>{
      if (e.target && e.target.tagName === 'SELECT') applyAll();
    });
    // En clic de preaprobación si existe
    Array.from(document.querySelectorAll('button, [role="button"], a')).forEach(b=>{
      if (/preaprobaci[oó]n/i.test(b.textContent||'')) b.addEventListener('click', ()=> setTimeout(applyAll, 50));
    });
    // Observer para re-render
    const mo = new MutationObserver(()=>{ applyAll(); });
    mo.observe(document.body, {childList:true, subtree:true});
    applyAll();
  });
})();

// === PATCH: recálculo en vivo de adjudicación financiada con capital ===
(function(){
  const $ = (id)=>document.getElementById(id);
  const fmt = (n)=> new Intl.NumberFormat('es-AR').format(n);
  const currency = (n)=> "$ " + fmt(n);
  function monthsRemainingFromQuota(){ const total=84; const q=parseInt(($('quota-select')?.value)||"1",10); return Math.max(total-(q-1),1); }
  function _refresh(){
    const info=$('adjudication-financed-display'); const check=$('finance-adjudication-checkbox'); const capEl=$('capital-input');
    if(!info||!check||!capEl) return;
    const financeAdj=!!check.checked; const capital=Math.max(0, parseFloat(capEl.value||'0')||0);
    const adjText=($('adjudication-value')?.textContent||'').replace(/[^\d]/g,''); const adjudAmount=parseInt(adjText||'0',10);
    const months=monthsRemainingFromQuota(); const toFinance=Math.max(adjudAmount-capital,0);
    if(financeAdj && toFinance>0){ const per=Math.round(toFinance/months); info.style.display='block'; info.textContent=`Adjudicación financiada: ${currency(per)} por cuota (sobre ${months} meses)`; } else { info.style.display='none'; }
  }
  document.addEventListener('DOMContentLoaded', ()=>{
    $('capital-input')?.addEventListener('input', _refresh); $('capital-input')?.addEventListener('change', _refresh);
    $('finance-adjudication-checkbox')?.addEventListener('change', _refresh); $('quota-select')?.addEventListener('change', _refresh);
    _refresh();
  });
})();
// === PATCH: Colocar botón 'Continuar' dentro de Financiación bancaria + modal robusto ===
(function(){
  const $=(id)=>document.getElementById(id);
  function findBankingContainer(){
    const ids=['financiacion-bancaria','financiacion','bancaria','banking-section','financiacionBancaria'];
    for (const id of ids){ const el=document.getElementById(id); if(el) return el; }
    const h=Array.from(document.querySelectorAll('h1,h2,h3,h4')).find(x=>/financiaci[oó]n\s+bancaria/i.test(x.textContent||''));
    return h? (h.closest('.panel')||h.parentElement):null;
  }
  function ensureBtn(container){
    let btn=$('bank-continue-btn'); if(!btn){ btn=document.createElement('button'); btn.id='bank-continue-btn'; btn.className='btn btn-outline'; btn.textContent='Continuar'; (container.querySelector('.btn-row')||container).appendChild(btn); }
    let status=$('bank-status-inline'); if(!status){ status=document.createElement('div'); status.id='bank-status-inline'; status.className='muted-text'; status.style.marginTop='8px'; btn.insertAdjacentElement('afterend', status); }
    return btn;
  }
  function ensureModal(){
    if($('bank-modal-backdrop')) return;
    const modal=document.createElement('div'); modal.id='bank-modal-backdrop'; modal.className='bank-modal-backdrop'; modal.setAttribute('role','dialog'); modal.setAttribute('aria-modal','true'); modal.setAttribute('aria-labelledby','bank-modal-title');
    modal.innerHTML=`<div class="bank-modal"><header><h3 id="bank-modal-title">Confirmación</h3><button id="bank-modal-close" class="btn btn-outline">Cerrar</button></header><div class="body" id="bank-modal-body"></div><div class="footer" id="bank-modal-footer"></div></div>`; document.body.appendChild(modal);
  }
  function bind(btn){
    const backdrop=$('bank-modal-backdrop'); const body=$('bank-modal-body'); const footer=$('bank-modal-footer'); const title=$('bank-modal-title'); const status=$('bank-status-inline');
    function open(){ backdrop.classList.add('open'); requestAnimationFrame(()=>{ document.querySelector('#bank-modal-backdrop .bank-modal')?.classList.add('show'); }); }
    function close(){ const m=document.querySelector('#bank-modal-backdrop .bank-modal'); if(m) m.classList.remove('show'); setTimeout(()=>{ backdrop.classList.remove('open'); },200); }
    function render(){ title.textContent='Confirmación';
      const nombre = (document.getElementById('client-name')?.value || document.getElementById('nombreCliente')?.value || '').trim();
      const apellido = (document.getElementById('client-lastname')?.value || document.getElementById('client-apellido')?.value || document.getElementById('apellidoCliente')?.value || '').trim();
      const dni = (document.getElementById('client-dni')?.value || '').trim();
      let n=nombre, a=apellido; if(!a && n.includes(' ')){ const parts=n.split(' '); n=parts.shift(); a=parts.join(' '); }
      body.innerHTML = `<p>Confirme los datos del cliente:</p><div class="kv"><span>Nombre</span> <strong>${n || '-'}</strong></div><div class="kv"><span>Apellido</span> <strong>${a || '-'}</strong></div><div class="kv"><span>DNI</span> <strong>${dni || '-'}</strong></div>`;
      footer.innerHTML=''; const cancel=document.createElement('button'); cancel.className='btn btn-outline'; cancel.textContent='Cancelar'; cancel.onclick=close;
      const confirm=document.createElement('button'); confirm.className='btn btn-primary'; confirm.textContent='Confirmar'; confirm.onclick=run;
      footer.append(cancel, confirm);
    }
    function run(){ title.textContent='Procesando...'; body.innerHTML=`<span class="loader"></span> Enviando solicitud al banco...`; footer.innerHTML=''; setTimeout(()=>{ title.textContent='Resultado'; body.innerHTML=`<div class="badge-danger">CLIENTE RECHAZADO</div><p>Scoring insuficiente para financiación bancaria.</p>`; const cerrar=document.createElement('button'); cerrar.className='btn btn-primary'; cerrar.textContent='Cerrar'; cerrar.onclick=()=>{ close(); status.innerHTML = `<span class="badge-danger">Cliente rechazado</span> — Scoring insuficiente para financiación bancaria`; }; footer.appendChild(cerrar); },2500); }
    btn.addEventListener('click', ()=>{ render(); open(); });
    $('bank-modal-close')?.addEventListener('click', ()=>{ const m=document.querySelector('#bank-modal-backdrop .bank-modal'); if(m) m.classList.remove('show'); setTimeout(()=>{ document.getElementById('bank-modal-backdrop')?.classList.remove('open'); },200); });
    $('bank-modal-backdrop')?.addEventListener('click', (e)=>{ if(e.target.id==='bank-modal-backdrop') { const m=document.querySelector('#bank-modal-backdrop .bank-modal'); if(m) m.classList.remove('show'); setTimeout(()=>{ document.getElementById('bank-modal-backdrop')?.classList.remove('open'); },200); } });
  }
  function ready(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  ready(()=>{ const c=findBankingContainer(); if(!c) return; const b=ensureBtn(c); ensureModal(); bind(b); });
})();
