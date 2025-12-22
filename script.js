let list = JSON.parse(localStorage.getItem("checklist")) || [];
const input = document.getElementById("itemInput");
const ul = document.getElementById("list");
const installBtn = document.getElementById("installBtn");
let deferredPrompt;

function save(){
localStorage.setItem("checklist", JSON.stringify(list));
}

function render(){
ul.innerHTML = "";
list.forEach((item, i) => {
const li = document.createElement("li");
if(item.checked) li.classList.add("checked");

const cb = document.createElement("input");
cb.type = "checkbox";
cb.checked = item.checked;
cb.style.marginRight = "12px";

cb.onchange = () => {
item.checked = cb.checked;
save();
checkAll();
render();
};

li.appendChild(cb);
li.append(item.text);
ul.appendChild(li);
});
}

function checkAll(){
if(list.length > 0 && list.every(i => i.checked)){
list = [];
save();
render();
}
}

input.addEventListener("keypress", e => {
if(e.key === "Enter" && input.value.trim()){
list.push({text: input.value, checked: false});
input.value = "";
save();
render();
}
});

window.addEventListener("beforeinstallprompt", e => {
e.preventDefault();
deferredPrompt = e;
installBtn.hidden = false;
});

installBtn.addEventListener("click", async () => {
if(deferredPrompt){
deferredPrompt.prompt();
await deferredPrompt.userChoice;
deferredPrompt = null;
installBtn.hidden = true;
}
});

if("serviceWorker" in navigator){
navigator.serviceWorker.register("service-worker.js");
}

render();