const list = document.getElementById("list");
const input = document.getElementById("itemInput");
const addBtn = document.getElementById("addBtn");

let items = JSON.parse(localStorage.getItem("SHOPPING_DATA")) || [];

function save() {
    localStorage.setItem("SHOPPING_DATA", JSON.stringify(items));
}

function render() {
    list.innerHTML = "";

    items.forEach((item, index) => {
        const li = document.createElement("li");
        if (item.done) li.classList.add("done");

        const box = document.createElement("div");
        box.className = "checkbox" + (item.done ? " checked" : "");
        box.onclick = () => toggle(index);

        const text = document.createElement("span");
        text.textContent = item.text;
        text.onclick = () => toggle(index);

        li.append(box, text);
        list.appendChild(li);
    });

    // Auto delete when ALL items are checked
    if (items.length && items.every(i => i.done)) {
        setTimeout(() => {
            items = [];
            save();
            render();
        }, 1000);
    }
}

function addItem() {
    const value = input.value.trim();
    if (!value) return;

    items.push({ text: value, done: false });
    input.value = "";
    save();
    render();
}

function toggle(index) {
    items[index].done = !items[index].done;
    save();
    render();
}

addBtn.onclick = addItem;
input.onkeypress = e => e.key === "Enter" && addItem();

render();