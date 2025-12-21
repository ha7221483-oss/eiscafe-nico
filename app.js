const list = document.getElementById("list");
const input = document.getElementById("itemInput");
const addBtn = document.getElementById("addBtn");

let items = JSON.parse(localStorage.getItem("shopping-list-items")) || [];

function save() {
    localStorage.setItem("shopping-list-items", JSON.stringify(items));
}

function render() {
    list.innerHTML = "";
    items.forEach((item, index) => {
        const li = document.createElement("li");
        if (item.done) li.classList.add("done");

        const cb = document.createElement("div");
        cb.className = "checkbox" + (item.done ? " checked" : "");
        cb.onclick = () => toggleItem(index);

        li.appendChild(cb);
        li.append(item.text);
        list.appendChild(li);
    });

    // Automatisches Löschen, wenn alles erledigt ist (deine Logik)
    if (items.length > 0 && items.every(i => i.done)) {
        setTimeout(() => {
            items = [];
            save();
            render();
        }, 800);
    }
}

function addItem() {
    const text = input.value.trim();
    if (text) {
        items.push({ text, done: false });
        input.value = "";
        save();
        render();
    }
}

// Event Listeners
addBtn.onclick = addItem;
input.onkeypress = (e) => { if (e.key === "Enter") addItem(); };

render();