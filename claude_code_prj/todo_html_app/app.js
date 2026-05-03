const STORAGE_KEY = "todo-flow-items-v1";

const form = document.querySelector("#todo-form");
const input = document.querySelector("#todo-input");
const list = document.querySelector("#todo-list");
const countLabel = document.querySelector("#todo-count");
const clearCompletedBtn = document.querySelector("#clear-completed");
const filterButtons = document.querySelectorAll(".filter-btn");
const todoTemplate = document.querySelector("#todo-item-template");

let todos = loadTodos();
let currentFilter = "all";

render();

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = input.value.trim();
  if (!text) {
    return;
  }

  todos.unshift({
    id: crypto.randomUUID(),
    text,
    done: false
  });

  input.value = "";
  persistTodos();
  render();
});

clearCompletedBtn.addEventListener("click", () => {
  todos = todos.filter((todo) => !todo.done);
  persistTodos();
  render();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    render();
  });
});

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(isTodoItem);
  } catch {
    return [];
  }
}

function isTodoItem(item) {
  return item && typeof item.id === "string" && typeof item.text === "string" && typeof item.done === "boolean";
}

function persistTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function visibleTodos() {
  if (currentFilter === "active") {
    return todos.filter((todo) => !todo.done);
  }
  if (currentFilter === "completed") {
    return todos.filter((todo) => todo.done);
  }
  return todos;
}

function render() {
  list.textContent = "";
  const filteredTodos = visibleTodos();

  if (filteredTodos.length === 0) {
    const emptyNode = document.createElement("li");
    emptyNode.className = "todo-item";
    emptyNode.textContent = "当前没有任务。";
    list.appendChild(emptyNode);
  } else {
    filteredTodos.forEach((todo) => list.appendChild(renderTodo(todo)));
  }

  const activeCount = todos.filter((todo) => !todo.done).length;
  countLabel.textContent = `剩余 ${activeCount} 项`;
  clearCompletedBtn.disabled = todos.every((todo) => !todo.done);
}

function renderTodo(todo) {
  const fragment = todoTemplate.content.cloneNode(true);
  const item = fragment.querySelector(".todo-item");
  const checkbox = fragment.querySelector(".todo-check");
  const text = fragment.querySelector(".todo-text");
  const deleteBtn = fragment.querySelector(".delete-btn");

  checkbox.checked = todo.done;
  text.textContent = todo.text;
  if (todo.done) {
    item.classList.add("done");
  }

  checkbox.addEventListener("change", () => {
    todos = todos.map((entry) =>
      entry.id === todo.id ? { ...entry, done: checkbox.checked } : entry
    );
    persistTodos();
    render();
  });

  deleteBtn.addEventListener("click", () => {
    todos = todos.filter((entry) => entry.id !== todo.id);
    persistTodos();
    render();
  });

  return fragment;
}
