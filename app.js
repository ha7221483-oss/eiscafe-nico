const list = document.getElementById("list");
const input = document.getElementById("itemInput");
const addBtn = document.getElementById("addBtn");

// Daten aus dem Speicher laden
let items = JSON.parse(localStorage.getItem("ShoppingData_V3")) || [];

function saveAndRender() {
    localStorage.setItem("ShoppingData_V3", JSON.stringify(items));
    render();
}

function render() {
    list.innerHTML = "";
    items.forEach((item, index) => {
        const li = document.createElement("li");
        if (item.done) li.classList.add("done");

        const cb = document.createElement("div");
        cb.className = "checkbox" + (item.done ? " checked" : "");
        cb.onclick = () => toggleItem(index);

        const text = document.createElement("span");
        text.innerText = item.text;
        text.style.flex = "1";
        text.onclick = () => toggleItem(index);

        li.appendChild(cb);
        li.appendChild(text);
        list.appendChild(li);
    });

    // Löschfunktion: Wenn alles abgehakt ist, nach 1,2 Sek leeren
    if (items.length > 0 && items.every(i => i.done)) {
        setTimeout(() => {
            items = [];
            saveAndRender();
        }, 1200);
    }
}

function addItem() {
    const val = input.value.trim();
    if (val) {
        items.push({ text: val, done: false });
        input.value = "";
        saveAndRender();
    }
}

function toggleItem(index) {
    items[index].done = !items[index].done;
    saveAndRender();
}

addBtn.onclick = addItem;
input.onkeypress = (e) => { if (e.key === "Enter") addItem(); };

render();