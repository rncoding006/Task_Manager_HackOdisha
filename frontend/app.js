
const API = "http://localhost:5000/api";

document.addEventListener("DOMContentLoaded", () => {
  // elements
  const taskInput = document.getElementById("task-input");
  const addTaskBtn = document.getElementById("add-task-btn");
  const taskList = document.getElementById("task-list");

  const expenseAmount = document.getElementById("expense-amount");
  const expenseCategory = document.getElementById("expense-category");
  const addExpenseBtn = document.getElementById("add-expense-btn");
  const expenseList = document.getElementById("expense-list");

  const ctx = document.getElementById("expense-chart").getContext("2d");
  let pieChart = null;

  // fetch & render
  async function fetchTasks(){
    try {
      const res = await fetch(${API}/tasks);
      const data = await res.json();                  
      renderTasks(data || []);
    } catch (err) {
      console.error(err);
      taskList.innerHTML = <li class="muted">Unable to load tasks (backend down?)</li>;
    }
  }

  async function fetchExpenses(){
    try {
      const res = await fetch(${API}/expenses);
      const data = await res.json();
      renderExpenses(data || []);
      updateChart(data || []);
    } catch (err) {
      console.error(err);
      expenseList.innerHTML = <li class="muted">Unable to load expenses (backend down?)</li>;
    }
  }

  function renderTasks(tasks){
    if(!tasks.length) taskList.innerHTML = <li class="meta">No tasks yet</li>;
    else taskList.innerHTML = tasks.map(t => `
      <li data-id="${t.id}">
        <div>
          <strong>${escapeHtml(t.title)}</strong>
        </div>
        <div>
          <button class="icon-btn" data-action="delete">❌</button>
        </div>
      </li>
    `).join("");
  }

  function renderExpenses(expenses){
    if(!expenses.length) expenseList.innerHTML = <li class="meta">No expenses yet</li>;
    else expenseList.innerHTML = expenses.map(e => `
      <li data-id="${e.id}">
        <div>
          <strong>${escapeHtml(e.category)}</strong>
          <div class="meta">₹ ${Number(e.amount)}</div>
        </div>
      </li>
    `).join("");
  }

  function updateChart(expenses){
    const categories = [...new Set(expenses.map(e => e.category))];
    const amounts = categories.map(cat => expenses.filter(e => e.category === cat).reduce((s, x) => s + Number(x.amount), 0));
    const data = {
      labels: categories,
      datasets: [{ data: amounts }]
    };

    if(pieChart) pieChart.destroy();
    pieChart = new Chart(ctx, {
      type: 'pie',
      data,
      options: {
        plugins: { legend: { position: 'bottom' } },
        maintainAspectRatio: false
      }
    });
  }

  // actions
  addTaskBtn.addEventListener("click", async () => {
    const title = taskInput.value.trim();
    if(!title) return alert("Enter a task");
    await fetch(${API}/tasks, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ title })
    });
    taskInput.value = "";
    fetchTasks();
  });

  addExpenseBtn.addEventListener("click", async () => {
    const amount = expenseAmount.value.trim();
    const category = expenseCategory.value.trim() || "Other";
    if(!amount || isNaN(amount)) return alert("Enter a valid amount");
    await fetch(${API}/expenses, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ amount: Number(amount), category })
    });
    expenseAmount.value = "";
    expenseCategory.value = "";
    fetchExpenses();
  });

  // delegate delete task
  taskList.addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if(!btn) return;
    const li = e.target.closest("li");
    const id = li?.dataset?.id;
    if(btn.dataset.action === "delete"){
      if(!confirm("Delete this task?")) return;
      await fetch(${API}/tasks/${id}, { method: "DELETE" });
      fetchTasks();
    }
  });

  // helpers
  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, (m) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;" }[m]));
  }

  // initial load
  fetchTasks();
  fetchExpenses();
});


