const API = "http://localhost:5000/api";
const token = localStorage.getItem("token");
const currentPage =
    window.location.pathname.split("/").pop();
    

const publicPages = [

    "login.html",

    "register.html"

];

if (!token && !publicPages.includes(currentPage)) {

    window.location.href = "login.html";

}

const user =
    JSON.parse(localStorage.getItem("user"));

const badge =
    document.getElementById("session-user-badge");

if (badge && user) {

    badge.textContent =
        `Welcome, ${user.full_name}`;

}


let allTransactions = [];
let portfolioChart = null;



// ===========================
// Toast Notification
// ===========================

function showToast(message, type = "success") {

    let background;

    switch (type) {
        case "success":
            background = "linear-gradient(to right, #00b09b, #96c93d)";
            break;

        case "error":
            background = "linear-gradient(to right, #ff416c, #ff4b2b)";
            break;

        case "warning":
            background = "linear-gradient(to right, #f7971e, #ffd200)";
            break;

        default:
            background = "#333";
    }

    Toastify({
        text: message,
        duration: 3000,
        gravity: "top",
        position: "right",
        close: true,
        stopOnFocus: true,
        style: {
            background: background
        }
    }).showToast();

}
// ===========================
// Page Load
// ===========================

document.addEventListener("DOMContentLoaded", () => {

    loadDashboard();
    loadAssets();
    loadCostBasisMethod();
    loadPortfolioChart();
    loadPerformanceChart();
    loadAdvisor();

    const recalculateButton = document.getElementById("btn-recalculate-portfolio");

    if (recalculateButton) {
        recalculateButton.addEventListener("click", () => {
            loadDashboard();
            loadAssets();
            loadCostBasisMethod();
            loadPortfolioChart();
            loadPerformanceChart();
            loadAdvisor();

            showToast("Portfolio refreshed successfully.");
        });
    }

    document.querySelectorAll(".method").forEach(card => {

        card.addEventListener("click", () => {

            const method = card.dataset.method;

            updateCostBasisMethod(method);

        });

    });

});

// ===========================
// Dashboard
// ===========================

async function loadDashboard() {

    try {

        const response = await fetch(`${API}/dashboard`, {
    headers: {
        Authorization: `Bearer ${token}`
    }
});
        const result = await response.json();

        console.log("Dashboard:", result);

        if (!result.success) return;

        const summary = result.data.summary;

        document.getElementById("portfolio-value").textContent =
            `$${Number(summary.totalCurrentValue).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;

        document.getElementById("daily-change").textContent =
            `$${Number(summary.totalInvestment).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;

        document.getElementById("unrealized-pl").textContent =
            `$${Number(summary.totalUnrealizedPL).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;

        document.getElementById("estimated-tax").textContent =
            `$${Number(summary.taxLiability).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;

        document.querySelector("#portfolio-value-card .indicator").textContent =
            "Live Portfolio Snapshot";

        document.querySelector("#daily-change-card .indicator").textContent =
            "Total Investment";

        document.querySelector("#profit-loss-card .indicator").textContent =
            "Current Unrealized Profit/Loss";

    }
    catch (err) {

        console.error("Dashboard Error:", err);

    }

}

// ===========================
// Assets
// ===========================

async function loadAssets() {

    try {

        const response = await fetch(`${API}/assets`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const result = await response.json();

        console.log(JSON.stringify(result, null, 2));

        if (!result.success) return;

        const tbody =
            document.querySelector("#holdings-table tbody");

        // Dashboard doesn't exist on other pages
        if (!tbody) return;

        tbody.innerHTML = "";

        result.data.forEach(asset => {

    tbody.innerHTML += `
    <tr>

        <td>${asset.asset_symbol}</td>

        <td>${Number(asset.total_quantity).toFixed(8)}</td>

        <td>$${Number(asset.average_cost).toLocaleString(undefined,{
            minimumFractionDigits:2,
            maximumFractionDigits:2
        })}</td>

        <td>$${Number(asset.current_price).toLocaleString(undefined,{
            minimumFractionDigits:2,
            maximumFractionDigits:2
        })}</td>

        <td>$${Number(asset.current_value).toLocaleString(undefined,{
            minimumFractionDigits:2,
            maximumFractionDigits:2
        })}</td>

        <td class="${
            Number(asset.unrealized_pl) >= 0
                ? "text-green"
                : "text-red"
        }">

            $${Number(asset.unrealized_pl).toLocaleString(undefined,{
                minimumFractionDigits:2,
                maximumFractionDigits:2
            })}

        </td>

    </tr>
    `;

});

    }
    catch (err) {

        console.error("Assets Error:", err);

    }

}
// ===========================
// Load Current Cost Basis Method
// ===========================

async function loadCostBasisMethod() {

    try {

        const response = await fetch(`${API}/settings`, {
    headers: {
        Authorization: `Bearer ${token}`
    }
});;
        const result = await response.json();

        console.log("Settings:", result);

        if (!result.success) return;

        const currentMethod = result.data.cost_basis_method;

        document.querySelectorAll(".method").forEach(card => {
            card.classList.remove("active");
        });

        const activeCard = document.querySelector(
            `.method[data-method="${currentMethod}"]`
        );

        if (activeCard) {
            activeCard.classList.add("active");
        }

        document.getElementById("active-method-indicator").textContent =
            `Formula: ${currentMethod}`;

    }
    catch (err) {

        console.error("Settings Error:", err);

    }

}

// ===========================
// Update Cost Basis Method
// ===========================

async function updateCostBasisMethod(method) {

    try {

        const response = await fetch(`${API}/settings`, {

            method: "PUT",

            headers: {
                "Content-Type": "application/json",
                 Authorization: `Bearer ${token}`
            },

            body: JSON.stringify({
                method
            })

        });

        const result = await response.json();

        if (!result.success) {

            alert(result.message);

            return;

        }

        showToast(`Cost Basis Method changed to ${method}`);

        loadCostBasisMethod();
        loadDashboard();
        loadAssets();
        loadPortfolioChart();
        loadPerformanceChart();
        loadTaxReport();

    }
    catch (err) {

        console.error("Update Method Error:", err);

    }

}
// ===========================
// Tax Analytics
// ===========================

document.addEventListener("DOMContentLoaded", () => {

    const taxSummary = document.getElementById("capital-gains-summary");

    if (taxSummary) {

        loadTaxReport();

        loadTaxMethod();

    }

});

// ---------------------------
// Load Tax Report
// ---------------------------

async function loadTaxReport() {

    try {

        const response = await fetch(`${API}/tax`, {
    headers: {
        Authorization: `Bearer ${token}`
    }
});;

        const result = await response.json();

        console.log("Tax Report:", result);

        if (!result.success) return;

        const report = result.data;

        document.getElementById("st-gains").textContent =
            `$${Number(report.shortTermCapitalGain).toFixed(2)}`;

        document.getElementById("lt-gains").textContent =
            `$${Number(report.longTermCapitalGain).toFixed(2)}`;

        document.getElementById("wash-sales-deferred").textContent =
            `$${Number(report.washSaleDeferred).toFixed(2)}`;

        document.getElementById("net-taxable-gains").textContent =
            `$${Number(report.netRealizedGain).toFixed(2)}`;
        // ===============================
        // Populate Disposal Lots Table
        // ===============================

        const tbody =
            document.querySelector("#disposal-lots-table tbody");

        tbody.innerHTML = "";

        if (
            !report.realizedLots ||
            report.realizedLots.length === 0
        ) {

            tbody.innerHTML = `
            <tr class="placeholder-row">

                <td colspan="8"
                    style="text-align:center;">

                    No realized transactions found.

                </td>

            </tr>
            `;

        }
        else {

            report.realizedLots.forEach(lot => {

                tbody.innerHTML += `

                <tr>

                    <td>${lot.id}</td>

                    <td>${lot.asset_symbol}</td>

                    <td>--</td>

                    <td>
                        ${
                            new Date(
                                lot.sale_date
                            ).toLocaleDateString()
                        }
                    </td>

                    <td>
                        $${Number(
                            lot.proceeds
                        ).toLocaleString()}
                    </td>

                    <td>
                        $${Number(
                            lot.cost_basis
                        ).toLocaleString()}
                    </td>

                    <td class="${
                        Number(lot.realized_gain)>=0
                        ? "text-green"
                        : "text-red"
                    }">

                        $${Number(
                            lot.realized_gain
                        ).toLocaleString()}

                    </td>

                    <td>

                        Short-Term

                    </td>

                </tr>

                `;

            });

        }

    }
    catch (err) {

        console.error(err);

    }

}

// ---------------------------
// Load Current Method
// ---------------------------

async function loadTaxMethod() {

    try {

        const response = await fetch(`${API}/settings`, {
    headers: {
        Authorization: `Bearer ${token}`
    }
});;

        const result = await response.json();

        if (!result.success) return;

        document.getElementById("report-method-select").value =
            result.data.cost_basis_method;

    }
    catch (err) {

        console.error(err);

    }

}

// ---------------------------
// Change Method
// ---------------------------

const reportMethod = document.getElementById("report-method-select");

if (reportMethod) {

    reportMethod.addEventListener("change", async function () {

        try {

            const response = await fetch(`${API}/settings`, {

                method: "PUT",

                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },

                body: JSON.stringify({

                    method: this.value

                })

            });

            const result = await response.json();

            if (!result.success) {

                alert(result.message);

                return;

            }

            showToast(`Accounting method changed to ${this.value}`);

            loadTaxReport();

        }
        catch (err) {

            console.error(err);

        }

    });

}


// ===========================
// Portfolio Pie Chart
// ===========================

async function loadPortfolioChart() {

    try {

        const response = await fetch(`${API}/dashboard`, {
    headers: {
        Authorization: `Bearer ${token}`
    }
});;
        const result = await response.json();

        if (!result.success) return;

        const assets = result.data.assets;

        const labels = assets.map(asset => asset.asset_symbol);

        const values = assets.map(asset => Number(asset.current_value));

        const canvas = document.getElementById("portfolioChart");

        if (!canvas) return;

        const ctx = canvas.getContext("2d");

        if (portfolioChart) {
            portfolioChart.destroy();
        }

        portfolioChart = new Chart(ctx, {
            type: "pie",

            data: {
                labels: labels,
                datasets: [{
                    label: "Portfolio Allocation",
                    data: values,
                    backgroundColor: [
                        "#f7931a", // BTC
                        "#627eea", // ETH
                        "#14f195", // SOL
                        "#8247e5"  // MATIC
                    ],
                    borderColor: "#ffffff",
                    borderWidth: 2
                }]
            },

            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: "bottom"
                    },
                    title: {
                        display: true,
                        text: "Current Portfolio Allocation"
                    }
                }
            }
        });

    } catch (err) {

        console.error("Chart Error:", err);

    }

}


// ===========================
// Transactions
// ===========================

document.addEventListener("DOMContentLoaded", () => {

    const transactionForm = document.getElementById("transaction-form");

    if (transactionForm) {

        loadTransactions();

        transactionForm.addEventListener("submit", saveTransaction);

        const searchBox = document.getElementById("search-transaction");

        if (searchBox) {

            searchBox.addEventListener("keyup", () => {

                const keyword = searchBox.value.toUpperCase();

                const filtered = allTransactions.filter(tx =>
                    tx.asset_symbol.includes(keyword)
                );

                renderTransactions(filtered);

            });

        }
        const exportBtn = document.getElementById("btn-export-csv");

        if (exportBtn) {
            exportBtn.addEventListener("click", exportTransactionsCSV);
        }

    }

});

// ---------------------------
// Load Transactions
// ---------------------------

async function loadTransactions() {

    try {

        const response = await fetch(`${API}/transactions`, {
    headers: {
        Authorization: `Bearer ${token}`
    }
});;
        const result = await response.json();

        if (!result.success) return;
        allTransactions = result.data;

        const tbody = document.getElementById("transaction-history");

        tbody.innerHTML = "";

        if (result.data.length === 0) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align:center;">
                        No Transactions Found
                    </td>
                </tr>
            `;

            return;

        }

        renderTransactions(allTransactions);

    }
    catch (err) {

        console.error(err);

    }

}

function renderTransactions(transactions) {

    const tbody = document.getElementById("transaction-history");

    if (!tbody) return;

    tbody.innerHTML = "";

    if (transactions.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align:center;">
                    No Transactions Found
                </td>
            </tr>
        `;

        return;

    }

    transactions.forEach(tx => {

        tbody.innerHTML += `
            <tr>
                <td>${tx.id}</td>
                <td>${new Date(tx.transaction_date).toLocaleString()}</td>
                <td>${tx.asset_symbol}</td>
                <td>${tx.transaction_type}</td>
                <td>${tx.quantity}</td>
                <td>$${Number(tx.unit_price).toFixed(2)}</td>
                <td>$${Number(tx.network_fee).toFixed(2)}</td>
                <td>Completed</td>
                <td>
                    <button onclick="editTransaction(${tx.id})">
                        Edit
                    </button>

                    <button onclick="deleteTransaction(${tx.id})">
                        Delete
                    </button>
                </td>
            </tr>
        `;

    });

}

// ---------------------------
// Save Transaction
// ---------------------------

async function saveTransaction(e) {

    e.preventDefault();
    const btn = document.getElementById("submit-transaction-btn");

btn.disabled = true;
btn.textContent = "Saving...";

    const id = document.getElementById("transaction-id").value;

    const transaction = {

        asset_symbol:
            document.getElementById("tx-asset-symbol").value,

        transaction_type:
            document.getElementById("tx-operation-type").value,

        quantity:
            Number(document.getElementById("tx-quantity").value),

        unit_price:
            Number(document.getElementById("tx-price").value),

        network_fee:
            Number(document.getElementById("tx-fees").value),

        transaction_date:
            document.getElementById("tx-timestamp").value

    };

    try {

        let response;

        if (id) {

            response = await fetch(`${API}/transactions/${id}`, {

                method: "PUT",

                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                    
                },

                body: JSON.stringify(transaction)

            });

        } else {

            response = await fetch(`${API}/transactions`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },

                body: JSON.stringify(transaction)

            });

        }

        const result = await response.json();

        if (!result.success) {

            showToast(result.message);
            btn.disabled = false;
            btn.textContent = id ? "Update Transaction" : "Add Transaction";

            return;

        }

        showToast(id ? "Transaction Updated!" : "Transaction Added!");

        document.getElementById("transaction-form").reset();

        document.getElementById("transaction-id").value = "";

        btn.disabled = false;
        btn.textContent = "Add Transaction";

        loadTransactions();
        loadDashboard();
        loadAssets();
        loadPortfolioChart();
        loadPerformanceChart();
        loadTaxReport();

    }
    catch (err) {

    console.error(err);

    showToast("Failed to save transaction.", "error");

    btn.disabled = false;
    btn.textContent = id ? "Update Transaction" : "Add Transaction";

}

}

// ---------------------------
// Edit Transaction
// ---------------------------

async function editTransaction(id) {

    try {

        const response =
            await fetch(`${API}/transactions/${id}`, {

                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }

            });

        const result = await response.json();

        if (!result.success) return;

        const tx = result.data;

        document.getElementById("transaction-id").value = tx.id;

        document.getElementById("tx-asset-symbol").value =
            tx.asset_symbol;

        document.getElementById("tx-operation-type").value =
            tx.transaction_type;

        document.getElementById("tx-quantity").value =
            tx.quantity;

        document.getElementById("tx-price").value =
            tx.unit_price;

        document.getElementById("tx-fees").value =
            tx.network_fee;

        document.getElementById("tx-timestamp").value =
            tx.transaction_date.substring(0,16);

        document.getElementById("submit-transaction-btn").textContent =
            "Update Transaction";

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }
    catch (err) {

        console.error(err);

    }

}

// ---------------------------
// Delete Transaction
// ---------------------------

async function deleteTransaction(id) {

    const result = await Swal.fire({

        title: "Delete Transaction?",

        text: "You won't be able to undo this action.",

        icon: "warning",

        showCancelButton: true,

        confirmButtonColor: "#d33",

        cancelButtonColor: "#3085d6",

        confirmButtonText: "Yes, Delete",

        cancelButtonText: "Cancel"

    });

    if (!result.isConfirmed) return;

    try {

        const response =
            await fetch(`${API}/transactions/${id}`, {

                method: "DELETE",
                headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
    }

            });

        const result = await response.json();

        if (!result.success) {

            showToast(result.message);

            return;

        }

        Swal.fire({

    icon: "success",

    title: "Deleted!",

    text: "Transaction deleted successfully.",

    timer: 1500,

    showConfirmButton: false

});

        loadTransactions();
        loadDashboard();
        loadAssets();
        loadPortfolioChart();
        loadPerformanceChart();
        loadTaxReport();

    }
    catch (err) {

    console.error(err);

    Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Failed to delete transaction."
    });

}

}


// ===========================
// Portfolio Performance Chart
// ===========================

let performanceChart = null;

async function loadPerformanceChart() {

    try {

       const response =
    await fetch(`${API}/dashboard/history`, {

        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }

    });
        const result =
            await response.json();

        if (!result.success) return;

        const labels = result.data.map(item =>
            new Date(item.date).toLocaleDateString()
            );

        const values =
            result.data.map(item => Number(item.value));

        const canvas =
            document.getElementById("performanceChart");

        if (!canvas) return;

        const ctx =
            canvas.getContext("2d");

        if (performanceChart) {

            performanceChart.destroy();

        }

        performanceChart =
            new Chart(ctx, {

                type: "line",

                data: {

                    labels,

                    datasets: [

                        {

                            label: "Portfolio Value",

                            data: values,

                            fill: false,

                            tension: 0.4,

                            borderWidth: 3

                        }

                    ]

                },

                options: {

                    responsive: true,

                    plugins: {

                        legend: {

                            position: "top"

                        }

                    }

                }

            });

    }

    catch (err) {

        console.error(err);

    }

}
// ===========================
// Risk Management
// ===========================

document.addEventListener("DOMContentLoaded", () => {

    const riskTable = document.getElementById("risk-table-body");

    if (riskTable) {

        loadRiskAnalysis();

    }

});

async function loadRiskAnalysis() {

    try {

        const response = await fetch(`${API}/risk`, {

    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
    }

});

        const result = await response.json();

        console.log("Risk Analysis:", result);

        if (!result.success) return;

        renderRiskTable(result.data);

        updateRiskSummary(result.data);

    }

    catch (err) {

        console.error("Risk Error:", err);

    }

}


function renderRiskTable(data) {

    const tbody =
        document.getElementById("risk-table-body");

    tbody.innerHTML = "";

    data.forEach(asset => {

        let color = "#2ecc71";

        if (asset.risk_level === "MEDIUM")
            color = "#f1c40f";

        if (asset.risk_level === "HIGH")
            color = "#e74c3c";

        tbody.innerHTML += `

        <tr>

            <td>${asset.asset_symbol}</td>

            <td>$${Number(asset.investment).toFixed(2)}</td>

            <td>$${Number(asset.current_value).toFixed(2)}</td>

            <td>$${Number(asset.profit_loss).toFixed(2)}</td>

            <td>${asset.profit_loss_percent}%</td>

            <td style="color:${color};font-weight:bold;">
                ${asset.risk_level}
            </td>

        </tr>

        `;

    });

}


function updateRiskSummary(data) {

    const total =
        data.length;

    const high =
        data.filter(x => x.risk_level === "HIGH").length;

    const medium =
        data.filter(x => x.risk_level === "MEDIUM").length;

    const low =
        data.filter(x => x.risk_level === "LOW").length;

    document.getElementById("risk-summary").innerHTML = `

        <p>Total Assets : ${total}</p>

        <p>High Risk Assets : ${high}</p>

        <p>Medium Risk Assets : ${medium}</p>

        <p>Low Risk Assets : ${low}</p>

    `;

}
// ===========================
// Export Transactions to CSV
// ===========================

function exportTransactionsCSV() {

    if (allTransactions.length === 0) {

        showToast("No transactions to export.");

        return;

    }

    let csv =
        "ID,Date,Asset,Type,Quantity,Unit Price,Network Fee\n";

    allTransactions.forEach(tx => {

        csv +=
            `${tx.id},` +
            `${new Date(tx.transaction_date).toLocaleString()},` +
            `${tx.asset_symbol},` +
            `${tx.transaction_type},` +
            `${tx.quantity},` +
            `${tx.unit_price},` +
            `${tx.network_fee}\n`;

    });

    const blob = new Blob([csv], {
        type: "text/csv"
    });

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = "transactions.csv";

    a.click();

    window.URL.revokeObjectURL(url);

}


// ===========================
// Smart Portfolio Advisor
// ===========================

document.addEventListener("DOMContentLoaded", () => {

    const advisorContainer = document.getElementById("advisor-container");

    if (advisorContainer) {
        loadPortfolioAdvice();
    }

});

async function loadPortfolioAdvice() {

    try {

        const response = await fetch(`${API}/advisor`, {

    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
    }

});

        const result = await response.json();

        console.log("Advisor:", result);

        const container = document.getElementById("advisor-container");

        if (!result.success) {

            container.innerHTML =
                "<p>Unable to load recommendations.</p>";

            return;

        }

        container.innerHTML = "";

        result.data.forEach(asset => {

            let color = "#2ecc71";

            if (asset.recommendation === "SELL")
                color = "#e74c3c";

            if (asset.recommendation === "REDUCE")
                color = "#f39c12";

            if (asset.recommendation === "HOLD")
                color = "#3498db";

            container.innerHTML += `

                <div class="glass" style="margin-bottom:20px;padding:20px;">

                    <h3>${asset.asset_symbol}</h3>

                    <p><strong>Investment:</strong>
                    $${Number(asset.investment).toFixed(2)}</p>

                    <p><strong>Current Value:</strong>
                    $${Number(asset.current_value).toFixed(2)}</p>

                    <p><strong>Allocation:</strong>
                    ${asset.allocation}%</p>

                    <p><strong>Profit/Loss:</strong>
                    $${asset.profit_loss}</p>

                    <p>
                        <strong>Recommendation:</strong>

                        <span style="color:${color};font-weight:bold;">
                            ${asset.recommendation}
                        </span>

                    </p>

                    <p>${asset.reason}</p>

                </div>

            `;

        });

    }

    catch (err) {

        console.error("Advisor Error:", err);

        document.getElementById("advisor-container").innerHTML =
            "<p>Unable to connect to server.</p>";

    }

}

// ===========================
// Performance Analytics
// ===========================

document.addEventListener("DOMContentLoaded", () => {

    const performancePage = document.getElementById("totalInvestment");

    if (performancePage) {
        loadPerformanceAnalysis();
    }

});

async function loadPerformanceAnalysis() {

    try {

        const response = await fetch(`${API}/performance`, {

    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
    }

});
        const result = await response.json();

        console.log("Performance:", result);

        if (!result.success) return;

        const data = result.data;

        if (data.length === 0) return;

        let totalInvestment = 0;
        let totalCurrentValue = 0;
        let totalProfit = 0;

        const labels = [];
        const investments = [];
        const currentValues = [];

        data.forEach(asset => {

            totalInvestment += Number(asset.investment);
            totalCurrentValue += Number(asset.current_value);
            totalProfit += Number(asset.profit_loss);

            labels.push(asset.asset_symbol);
            investments.push(Number(asset.investment));
            currentValues.push(Number(asset.current_value));

        });

        const roi =
            totalInvestment === 0
                ? 0
                : (totalProfit / totalInvestment) * 100;

        document.getElementById("totalInvestment").textContent =
            `$${totalInvestment.toLocaleString(undefined,{maximumFractionDigits:2})}`;

        document.getElementById("currentValue").textContent =
            `$${totalCurrentValue.toLocaleString(undefined,{maximumFractionDigits:2})}`;

        document.getElementById("profitLoss").textContent =
            `$${totalProfit.toLocaleString(undefined,{maximumFractionDigits:2})}`;

        document.getElementById("returnPercentage").textContent =
            `${roi.toFixed(2)}%`;

        //----------------------------
        // Growth Chart
        //----------------------------

        const growthCanvas = document.getElementById("growthChart");

        if (growthCanvas) {

            new Chart(growthCanvas, {

                type: "line",

                data: {

                    labels,

                    datasets: [{
                        label: "Current Value",
                        data: currentValues,
                        borderWidth: 3,
                        fill: false
                    }]

                }

            });

        }

        //----------------------------
        // Allocation Chart
        //----------------------------

        const allocationCanvas =
            document.getElementById("allocationChart");

        if (allocationCanvas) {

            new Chart(allocationCanvas, {

                type: "pie",

                data: {

                    labels,

                    datasets: [{

                        data: currentValues

                    }]

                }

            });

        }

        //----------------------------
        // Comparison Chart
        //----------------------------

        const comparisonCanvas =
            document.getElementById("comparisonChart");

        if (comparisonCanvas) {

            new Chart(comparisonCanvas, {

                type: "bar",

                data: {

                    labels,

                    datasets: [

                        {
                            label: "Investment",
                            data: investments
                        },

                        {
                            label: "Current Value",
                            data: currentValues
                        }

                    ]

                }

            });

        }

        //----------------------------
        // Insights
        //----------------------------

        const best =
            data.reduce((a,b)=>
                Number(a.profit_loss)>Number(b.profit_loss)?a:b);

        const worst =
            data.reduce((a,b)=>
                Number(a.profit_loss)<Number(b.profit_loss)?a:b);

        const highest =
            data.reduce((a,b)=>
                Number(a.current_value)>Number(b.current_value)?a:b);

        const lowest =
            data.reduce((a,b)=>
                Number(a.current_value)<Number(b.current_value)?a:b);

        document.getElementById("bestAsset").textContent =
            best.asset_symbol;

        document.getElementById("worstAsset").textContent =
            worst.asset_symbol;

        document.getElementById("highestAllocation").textContent =
            highest.asset_symbol;

        document.getElementById("lowestAllocation").textContent =
            lowest.asset_symbol;

    }

    catch(err){

        console.error("Performance Error:", err);

    }

}


document.addEventListener("DOMContentLoaded", () => {
    const links = document.querySelectorAll("nav a");
    const currentPage = window.location.pathname.split("/").pop();

    links.forEach(link => {
        if (link.getAttribute("href") === currentPage) {
            link.classList.add("active");
        }
    });
});

// ===========================
// AI Advisor Page
// ===========================

async function loadAdvisor() {
    const container = document.getElementById("advisor-container");

    if (!container) return;

    try {
        const response = await fetch(`${API}/advisor`, {

    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
    }

});
        const result = await response.json();

        if (!result.success) {
            container.innerHTML = "Failed to load recommendations.";
            return;
        }

        container.innerHTML = result.data.map(item => `
            <div class="advisor-card">
                <h3>${item.asset_symbol}</h3>
                <p><b>Recommendation:</b> ${item.recommendation}</p>
                <p><b>Reason:</b> ${item.reason}</p>
                <p><b>Allocation:</b> ${item.allocation}%</p>
            </div>
        `).join("");

    } catch (err) {
        console.error(err);
        container.innerHTML = "Error loading advisor data.";
    }
}


// ===========================
// Register User
// ===========================

const registerForm = document.getElementById("register-form");

if (registerForm) {

    registerForm.addEventListener("submit", registerUser);

}

async function registerUser(e) {

    e.preventDefault();
    console.log("Register button clicked");

    const user = {

        full_name: document.getElementById("register-name").value,

        email: document.getElementById("register-email").value,

        password: document.getElementById("register-password").value

    };

    try {

        const response = await fetch(`${API}/auth/register`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(user)

        });

        const result = await response.json();

        if (!result.success) {

            showToast(result.message, "error");

            return;

        }

        showToast("Registration Successful!");

        window.location.href = "login.html";

    }

    catch (err) {

        console.error(err);

        showToast("Something went wrong.", "error");

    }

}

// ===========================
// Login User
// ===========================

const loginForm = document.getElementById("login-form");

if (loginForm) {

    loginForm.addEventListener("submit", loginUser);

}

async function loginUser(e) {

    e.preventDefault();

    const user = {

        email: document.getElementById("login-email").value,

        password: document.getElementById("login-password").value

    };

    try {

        const response = await fetch(`${API}/auth/login`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(user)

        });

        const result = await response.json();

        if (!result.success) {

            showToast(result.message, "error");

            return;

        }

        // Save JWT Token
        localStorage.setItem("token", result.data.token);

        // Save User Details
        localStorage.setItem(
            "user",
            JSON.stringify(result.data.user)
        );

        showToast("Login Successful!");

        window.location.href = "index.html";

    }

    catch (err) {

        console.error(err);

        showToast("Login Failed.", "error");

    }

}


// ===========================
// Logout
// ===========================

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", logout);

}

async function logout() {

    const result = await Swal.fire({

        title: "Logout?",

        text: "Are you sure you want to logout?",

        icon: "question",

        showCancelButton: true,

        confirmButtonColor: "#d33",

        cancelButtonColor: "#3085d6",

        confirmButtonText: "Logout",

        cancelButtonText: "Cancel"

    });

    if (!result.isConfirmed) return;

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    Swal.fire({

        icon: "success",

        title: "Logged Out",

        text: "You have been logged out successfully.",

        timer: 1500,

        showConfirmButton: false

    });

    setTimeout(() => {

        window.location.href = "login.html";

    }, 1500);

}


// ===========================
// Logged In User
// ===========================

document.addEventListener("DOMContentLoaded", () => {

    const badge = document.getElementById("session-user-badge");

    if (!badge) return;

    const user = JSON.parse(localStorage.getItem("user"));

    if (user) {
        badge.textContent = `Welcome, ${user.full_name}`;
    }

});


// ===========================
// Protect Pages
// ===========================

document.addEventListener("DOMContentLoaded", () => {

    const token = localStorage.getItem("token");

    const publicPages = [
        "login.html",
        "register.html"
    ];

    const currentPage =
        window.location.pathname.split("/").pop();

    if (!token && !publicPages.includes(currentPage)) {

        window.location.href = "login.html";

    }

});

// ===========================
// Welcome User
// ===========================

document.addEventListener("DOMContentLoaded", () => {

    const greeting = document.getElementById("welcome-user");

    if (!greeting) return;

    const user = JSON.parse(localStorage.getItem("user"));

    if (user) {
        greeting.innerHTML = `
Good to see you again,
<strong>${user.full_name}</strong> 👋
`;
    }

});

// ===========================
// Display Logged-in User
// ===========================

document.addEventListener("DOMContentLoaded", () => {

    const badge = document.getElementById("session-user-badge");

    if (!badge) return;

    const user = JSON.parse(localStorage.getItem("user"));

    if (user) {

        badge.textContent = `Welcome, ${user.full_name}`;

    } else {

        badge.textContent = "Guest";

    }

});

// ===========================
// Logout
// ===========================

document.addEventListener("DOMContentLoaded", () => {

    const logoutBtn = document.getElementById("logoutBtn");

    if (!logoutBtn) return;

    logoutBtn.addEventListener("click", async () => {

        const result = await Swal.fire({

            title: "Logout?",

            text: "Are you sure you want to logout?",

            icon: "question",

            showCancelButton: true,

            confirmButtonText: "Logout",

            cancelButtonText: "Cancel"

        });

        if (!result.isConfirmed) return;

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "login.html";

    });

});


// ===========================
// Theme Toggle
// ===========================

const themeBtn = document.getElementById("themeToggle");

// Load saved theme
if (localStorage.getItem("theme") === "light") {

    document.body.classList.add("light-theme");

    if (themeBtn) {

        themeBtn.textContent = "☀️ Light";

    }

}

if (themeBtn) {

    themeBtn.addEventListener("click", () => {

        document.body.classList.toggle("light-theme");

        if (document.body.classList.contains("light-theme")) {

            localStorage.setItem("theme", "light");

            themeBtn.textContent = "☀️ Light";

        } else {

            localStorage.setItem("theme", "dark");

            themeBtn.textContent = "🌙 Dark";

        }

    });

}

// ===========================
// Export Tax Report PDF
// ===========================

document.addEventListener("DOMContentLoaded", () => {

    const btn = document.getElementById("exportPdfBtn");

    if (btn) {

        btn.addEventListener("click", exportTaxPDF);

    }

});

async function exportTaxPDF() {

    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF();

    pdf.setFontSize(22);

    pdf.text("CryptoVault Alpha", 20, 20);

    pdf.setFontSize(16);

    pdf.text("Tax Analytics Report", 20, 35);

    pdf.setFontSize(11);

    pdf.text(
        `Generated : ${new Date().toLocaleString()}`,
        20,
        45
    );

    pdf.line(20,50,190,50);

    pdf.text(
        "Short-Term Gains : " +
        document.getElementById("st-gains").innerText,
        20,
        65
    );

    pdf.text(
        "Long-Term Gains : " +
        document.getElementById("lt-gains").innerText,
        20,
        75
    );

    pdf.text(
        "Wash Sales : " +
        document.getElementById("wash-sales-deferred").innerText,
        20,
        85
    );

    pdf.text(
        "Net Taxable Gains : " +
        document.getElementById("net-taxable-gains").innerText,
        20,
        95
    );

    pdf.save("CryptoVault-Tax-Report.pdf");

}

// =========================================
// Global Variables
// =========================================

let recognition = null;
let isListening = false;
let isSpeaking = false;
let currentSpeech = null;

// =========================================
// Load Chat History
// =========================================

async function loadChatHistory() {

    const token = localStorage.getItem("token");

    const history =
        document.getElementById("historyList");

    const chat =
        document.getElementById("chatWindow");

    if (!history || !chat) return;

    history.innerHTML = "";

    try {

        const response = await fetch(
            "http://localhost:5000/api/ai/history",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!data.success) return;

        // Show welcome only if there is no history
        if (data.data.length === 0) {

            chat.innerHTML = `
                <div class="ai-message">
                    👋 Welcome to CryptoVault AI Assistant.<br><br>
                    Ask me anything about your portfolio.
                </div>
            `;

            return;
        }

        history.innerHTML = "";

        data.data.forEach(item => {

    history.innerHTML += `
        <div class="chat-history-item">

            <span
                onclick="openChat(
                    \`${item.question.replace(/`/g,"\\`")}\`,
                    \`${item.response.replace(/`/g,"\\`")}\`
                )">

                ${item.question}

            </span>

            <button
                class="delete-chat-btn"
                onclick="deleteChat('${item.id}')">

                🗑

            </button>

        </div>
    `;

});

    }
    catch (err) {

        console.error("History Error:", err);

    }

}

// =========================================
// Typewriter Animation
// =========================================

async function typeWriter(element, text) {

    element.innerHTML = "";

    const words = text.split(" ");

    let current = "";

    for (let i = 0; i < words.length; i++) {

        current += words[i] + " ";

        element.innerHTML =
            marked.parse(current);

        element.scrollIntoView({
            behavior: "smooth",
            block: "end"
        });

        await new Promise(resolve =>
            setTimeout(resolve, 28)
        );

    }

}

// =========================================
// Speak AI Response
// =========================================

function speak(text) {

    // Stop any previous speech
    window.speechSynthesis.cancel();

    const btn =
        document.getElementById("voiceButton");

    currentSpeech =
        new SpeechSynthesisUtterance(text);

    currentSpeech.lang = "en-US";
    currentSpeech.rate = 1;
    currentSpeech.pitch = 1;
    currentSpeech.volume = 1;

    isSpeaking = true;

    if (btn) {

        btn.innerHTML = "🔊";
        btn.classList.add("listening");

    }

    currentSpeech.onend = function () {

        isSpeaking = false;

        if (btn) {

            btn.innerHTML = "🎤";
            btn.classList.remove("listening");

        }

    };

    currentSpeech.onerror = function () {

        isSpeaking = false;

        if (btn) {

            btn.innerHTML = "🎤";
            btn.classList.remove("listening");

        }

    };

    window.speechSynthesis.speak(currentSpeech);

}


// =========================================
// Stop AI Voice
// =========================================

function stopSpeaking() {

    window.speechSynthesis.cancel();

    isSpeaking = false;

    const btn =
        document.getElementById("voiceButton");

    if (btn) {

        btn.innerHTML = "🎤";
        btn.classList.remove("listening");

    }

}


// =========================================
// Voice Button Action
// =========================================

function voiceAction() {

    // If AI is speaking → Stop it
    if (isSpeaking) {

        stopSpeaking();
        return;

    }

    // Otherwise start microphone
    startListening();

}


// =========================================
// Speech Recognition
// =========================================

function startListening() {

    if (
        !("webkitSpeechRecognition" in window) &&
        !("SpeechRecognition" in window)
    ) {

        alert("Speech Recognition is not supported in this browser.");

        return;

    }

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    recognition =
        new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    const btn =
        document.getElementById("voiceButton");

    isListening = true;

    if (btn) {

        btn.innerHTML = "🎙️";
        btn.classList.add("listening");

    }

    recognition.start();

    recognition.onresult = function (event) {

        const transcript =
            event.results[0][0].transcript;

        document.getElementById("question").value =
            transcript;

    };

    recognition.onend = function () {

        isListening = false;

        if (btn) {

            btn.innerHTML = "🎤";
            btn.classList.remove("listening");

        }

    };

    recognition.onerror = function () {

        isListening = false;

        if (btn) {

            btn.innerHTML = "🎤";
            btn.classList.remove("listening");

        }

    };

}


// =========================================
// Ask AI
// =========================================

async function askAI() {

    const questionBox = document.getElementById("question");
    const question = questionBox.value.trim();

    if (question === "") return;

    stopSpeaking();

    const chat = document.getElementById("chatWindow");

    // User Message
    const userDiv = document.createElement("div");
    userDiv.className = "user-message";
    userDiv.textContent = question;
    chat.appendChild(userDiv);

    questionBox.value = "";

    // AI Thinking
    const loading = document.createElement("div");
    loading.className = "ai-thinking";
    loading.id = "loading";

    loading.innerHTML = `
        <div class="thinking-avatar">🤖</div>

        <div class="thinking-content">

            <div class="thinking-title">
                CryptoVault AI
            </div>

            <div class="thinking-text">
                Analyzing your portfolio...
            </div>

            <div class="thinking-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>

        </div>
    `;

    chat.appendChild(loading);
    chat.scrollTop = chat.scrollHeight;

    try {

        const token = localStorage.getItem("token");

        const response = await fetch(
            "http://localhost:5000/api/ai/chat",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: question
                })
            }
        );

        const data = await response.json();

        document.getElementById("loading")?.remove();

        const answer = data.success ? data.response : data.message;

        // AI Response Container
        const aiContainer = document.createElement("div");
        aiContainer.className = "ai-container";

        // AI Message
       

    // Main AI Card
    const aiCard = document.createElement("div");

    aiCard.className = "ai-message";

    // AI Text
    const aiText = document.createElement("div");

    aiCard.appendChild(aiText);

    chat.appendChild(aiCard);

    // Typewriter animation
    await typeWriter(aiText, answer);

    // Action Buttons
    const actions = document.createElement("div");

    actions.className = "message-actions";

    actions.dataset.response = answer;

    actions.innerHTML = `
    <button onclick="copyResponse(this)">
    📋 Copy
    </button>

    <button onclick="speakAgain(this)">
    🔊 Read
    </button>

    <button onclick="likeResponse(this)">
    👍
    </button>

    <button onclick="dislikeResponse(this)">
    👎
    </button>
    `;

    aiCard.appendChild(actions);

    // Speak automatically
    speak(answer);

            chat.scrollTop = chat.scrollHeight;

            await loadChatHistory();

        }
        catch (err) {

            console.error(err);

            document.getElementById("loading")?.remove();

            const aiDiv = document.createElement("div");

            aiDiv.className = "ai-message";

            aiDiv.innerHTML = `
                <b>Unable to connect to AI.</b><br><br>
                Please make sure the backend server is running.
            `;

            chat.appendChild(aiDiv);

            chat.scrollTop = chat.scrollHeight;

        }

    }

    // =========================================
    // Logout
    // =========================================

    function logout() {

        stopSpeaking();

        localStorage.removeItem("token");

        window.location.href = "login.html";

    }

    // =========================================
    // Theme
    // =========================================

    function toggleTheme() {

        document.body.classList.toggle("light-theme");

    }

    // =========================================
    // Open Previous Chat
    // =========================================

    function openChat(question, response) {

        stopSpeaking();

        const chat = document.getElementById("chatWindow");

        chat.innerHTML = "";

        const userDiv = document.createElement("div");

        userDiv.className = "user-message";

        userDiv.textContent = question;

        chat.appendChild(userDiv);

        const aiContainer = document.createElement("div");

        aiContainer.className = "ai-container";

        const aiDiv = document.createElement("div");

        aiDiv.className = "ai-message";

        aiDiv.innerHTML = marked.parse(response);

        aiContainer.appendChild(aiDiv);

        const actions = document.createElement("div");

        actions.className = "message-actions";

        actions.dataset.response = response;

        actions.innerHTML = `
            <button onclick="copyResponse(this)">📋 Copy</button>

            <button onclick="speakAgain(this)">🔊 Read</button>

            <button onclick="likeResponse(this)">👍</button>

            <button onclick="dislikeResponse(this)">👎</button>
        `;

        aiContainer.appendChild(actions);

        chat.appendChild(aiContainer);

        chat.scrollTop = chat.scrollHeight;

    }

    // =========================================
    // Auto Resize Textarea
    // =========================================

    function autoResize(textarea) {

        textarea.style.height = "60px";

        textarea.style.height = textarea.scrollHeight + "px";

    }

    // =========================================
    // Copy Response
    // =========================================

    function copyResponse(button) {

        const text = button.parentElement.dataset.response;

        navigator.clipboard.writeText(text);

        button.innerHTML = "✅ Copied";

        setTimeout(() => {

            button.innerHTML = "📋 Copy";

        }, 1500);

    }

    // =========================================
    // Read Again
    // =========================================

    function speakAgain(button) {

        const text = button.parentElement.dataset.response;

        speak(text);

    }

    // =========================================
    // Like
    // =========================================

    function likeResponse(button) {

        button.innerHTML = "💚";

    }

    // =========================================
    // Dislike
    // =========================================

    function dislikeResponse(button) {

        button.innerHTML = "💔";

    }

    // =========================================
// Load Portfolio Holdings Table
// =========================================

async function loadPortfolioTable() {

    const token = localStorage.getItem("token");

    const tbody =
        document.querySelector("#holdings-table tbody");

    if (!tbody) return;

    try {

        const response = await fetch(
            "http://localhost:5000/api/dashboard",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!data.success) return;

        const assets = data.data.assets;
        // ================================
        // Portfolio Summary
        // ================================

        document.getElementById("total-assets").textContent =
            assets.length;
            let largest = assets[0];

            assets.forEach(asset => {

                if (
                    Number(asset.current_value) >
                    Number(largest.current_value)
                ) {

                    largest = asset;

                }

            });

            document.getElementById("largest-holding").textContent =
                largest.asset_symbol;
                let totalInvestment = 0;

            let totalCurrentValue = 0;

            assets.forEach(asset => {

                totalInvestment +=
                    Number(asset.total_investment);

                totalCurrentValue +=
                    Number(asset.current_value);

            });

            const roi =
                totalInvestment === 0
                    ? 0
                    : (
                        (
                            totalCurrentValue -
                            totalInvestment
                        ) /
                        totalInvestment
                    ) * 100;

            document.getElementById("portfolio-roi").textContent =
                roi.toFixed(2) + "%";
            let best = assets[0];

            assets.forEach(asset => {

                if (
                    Number(asset.unrealized_pl) >
                    Number(best.unrealized_pl)
                ) {

                    best = asset;

                }

            });

            document.getElementById("best-performer").textContent =
                best.asset_symbol;

        tbody.innerHTML = "";

        if (!assets || assets.length === 0) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center;padding:25px;">
                        No Assets Found
                    </td>
                </tr>
            `;

            return;

        }

        assets.forEach(asset => {

            const profit =
                Number(asset.unrealized_pl);

            const row = `

                <tr>

                    <td>
                        ${asset.asset_symbol}
                    </td>

                    <td>
                        ${Number(asset.total_quantity).toFixed(4)}
                    </td>

                    <td>
                        $${Number(asset.total_investment).toFixed(2)}
                    </td>

                    <td>
                        $${Number(asset.current_price).toFixed(2)}
                    </td>

                    <td style="
                        color:${profit>=0 ? '#00ffae' : '#ff4d4d'};
                        font-weight:bold;
                    ">
                        $${profit.toFixed(2)}
                    </td>

                    <td>
                        ${
                            profit >= 0
                            ? "🟢 Profit"
                            : "🔴 Loss"
                        }
                    </td>

                </tr>

            `;

            tbody.innerHTML += row;

        });

    }

    catch(err){

        console.error(err);

    }

}

    // =========================================
    // Page Load
    // =========================================

    window.addEventListener("DOMContentLoaded", () => {
        loadPortfolioTable();

        loadChatHistory();

        const question = document.getElementById("question");

        if (question) {

            question.addEventListener("keydown", function (e) {

                if (e.key === "Enter" && !e.shiftKey) {

                    e.preventDefault();

                    askAI();

                }

            });

            question.addEventListener("input", function () {

                autoResize(this);

            });

        }

    });

    // =========================================
    // Stop voice on page close
    // =========================================

    window.addEventListener("beforeunload", () => {

        stopSpeaking();

    });

    // =========================================
    // Stop voice when tab changes
    // =========================================

    document.addEventListener("visibilitychange", () => {

        if (document.hidden) {

            stopSpeaking();

        }

    });

    // =========================================
// Delete Chat
// =========================================

async function deleteChat(id) {

    console.log("Deleting chat:", id);

    const token = localStorage.getItem("token");

    const result = await Swal.fire({
    title: "Delete Chat?",
    text: "This conversation will be permanently deleted.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ef4444",
    cancelButtonColor: "#64748b",
    confirmButtonText: "🗑 Delete",
    cancelButtonText: "Cancel",
    background: "#0f172a",
    color: "#ffffff",
    reverseButtons: true
});

if (!result.isConfirmed) {
    return;
}

    try {

        const response = await fetch(
            `http://localhost:5000/api/ai/history/${id}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (data.success) {

            await loadChatHistory();

        Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Chat deleted successfully.",
            timer: 1400,
            showConfirmButton: false,
            background: "#0f172a",
            color: "#ffffff"
        });

        } else {

            alert(data.message);

        }

    }
    catch (err) {

        console.error(err);

        Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Unable to delete chat.",
        background: "#0f172a",
        color: "#ffffff"
    });

    }

}