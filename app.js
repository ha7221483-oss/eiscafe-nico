const list=document.getElementById("list");
const input=document.getElementById("input");
let items=JSON.parse(localStorage.getItem("data"))||[];

function save(){localStorage.setItem("data",JSON.stringify(items));}

function render(){
list.innerHTML="";
items.forEach((i,n)=>{
let li=document.createElement("li");
let b=document.createElement("div");
b.className="box"+(i.done?" done":"");
b.onclick=()=>toggle(n);
let s=document.createElement("span");
s.textContent=i.text;
s.onclick=()=>toggle(n);
if(i.done)li.classList.add("done");
li.append(b,s);
list.append(li);
});
}

function add(){
if(!input.value)return;
items.push({text:input.value,done:false});
input.value="";
save();render();
}

function toggle(n){
items[n].done=!items[n].done;
save();render();
}

render();
