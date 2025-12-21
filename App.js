const list = document.getElementById("list");
const input = document.getElementById("itemInput");

let items = JSON.parse(localStorage.getItem("items")) || [];

function save() {
  localStorage.setItem("items", JSON.stringify(items));
}

function render() {
  list.innerHTML = "";

  items.forEach((item, index) => {
    const li = document.createElement("li");
    if (item.done) li.classList.add("done");

    const box = document.createElement("div");
    box.className = "checkbox";
    if (item.done) box.classList.add("checked");

    box.onclick = () => toggleItem(index);

    li.appendChild(box);
    li.append(item.text);
    list.appendChild(li);
  });

  /* ALLES erledigt → automatisch löschen */
  if (items.length > 0 && items.every(i => i.done)) {
    setTimeout(() => {
      items = [];
      save();
      render();
    }, 800);
  }
}

function addItem() {
  if (!input.value.trim()) return;

  items.push({
    text: input.value,
    done: false
  });

  input.value = "";
  save();
  render();
}

function toggleItem(index) {
  items[index].done = !items[index].done;
  save();
  render();
}

render();