const products = [
  {id:"butterscotch",name:"Butterscotch Bliss",desc:"Golden crunch · 500 ml",price:180,emoji:"🍨",tag:"FAN FAVOURITE",tone:"cream"},
  {id:"chocolate",name:"Belgian Chocolate",desc:"Rich cocoa · 500 ml",price:220,emoji:"🍫",tag:"RICH & CREAMY",tone:"choco"},
  {id:"mango",name:"Mango Magic",desc:"Sunny mango · 500 ml",price:190,emoji:"🥭",tag:"SEASONAL JOY",tone:"mango"},
  {id:"strawberry",name:"Strawberry Dream",desc:"Berry smooth · 500 ml",price:200,emoji:"🍓",tag:"A LITTLE BLUSH",tone:"berry"}
];
const cart = {};
const money = n => new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(n);
const productGrid = document.getElementById("productGrid");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartHeadingCount = document.getElementById("cartHeadingCount");
const subtotalEl = document.getElementById("subtotal");
const totalEl = document.getElementById("total");
const checkoutButton = document.getElementById("checkoutButton");
const checkoutModal = document.getElementById("checkoutModal");
const toast = document.getElementById("toast");

productGrid.innerHTML = products.map(p => `
  <article class="product-card">
    <div class="product-visual ${p.tone}"><span class="product-tag">${p.tag}</span><span class="food-art" aria-hidden="true">${p.emoji}</span></div>
    <div class="product-info"><div class="product-meta"><div><h3>${p.name}</h3><p>${p.desc}</p></div><span class="product-price">${money(p.price)}</span></div>
      <button class="add-button" data-add="${p.id}" aria-label="Add ${p.name} to cart">Add to cart <span>＋</span></button>
    </div>
  </article>`).join("");

function showToast(message){
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(()=>toast.classList.remove("show"),2400);
}
function countItems(){return Object.values(cart).reduce((sum,item)=>sum+item.qty,0)}
function renderCart(){
  const count = countItems();
  const subtotal = Object.values(cart).reduce((sum,item)=>sum+item.qty*item.price,0);
  cartCount.textContent = count;
  cartHeadingCount.textContent = ` (${count})`;
  subtotalEl.textContent = money(subtotal);
  totalEl.textContent = money(subtotal);
  checkoutButton.disabled = count===0;
  const items = Object.values(cart);
  if(!items.length){
    cartItems.innerHTML = `<div class="empty-cart"><span>♡</span><h3>Your cart is looking a little empty.</h3><p>Let’s fix that with something delicious.</p><a class="button button-dark" href="#products">Browse flavours ↗</a></div>`;
    return;
  }
  cartItems.innerHTML = items.map(item=>`
    <div class="cart-row">
      <div class="cart-thumb">${item.emoji}</div>
      <div><div class="cart-product-name">${item.name}</div><div class="cart-product-price">${money(item.price)} each</div>
        <div class="qty-control"><button type="button" data-qty="${item.id}" data-change="-1" aria-label="Decrease quantity">−</button><span>${item.qty}</span><button type="button" data-qty="${item.id}" data-change="1" aria-label="Increase quantity">＋</button></div>
      </div>
      <div class="cart-row-end"><strong>${money(item.price*item.qty)}</strong><button class="remove-button" data-remove="${item.id}">Remove</button></div>
    </div>`).join("");
}
document.addEventListener("click",e=>{
  const add=e.target.closest("[data-add]");
  const qty=e.target.closest("[data-qty]");
  const remove=e.target.closest("[data-remove]");
  if(add){
    const p=products.find(item=>item.id===add.dataset.add);
    if(p){if(!cart[p.id])cart[p.id]={...p,qty:0};cart[p.id].qty++;renderCart();showToast(`${p.name} added to your cart`);}
  }
  if(qty){
    const id=qty.dataset.qty;
    if(cart[id]){cart[id].qty+=Number(qty.dataset.change);if(cart[id].qty<=0)delete cart[id];renderCart();}
  }
  if(remove){delete cart[remove.dataset.remove];renderCart();showToast("Item removed from your cart");}
});
checkoutButton.addEventListener("click",()=>{
  if(!countItems())return;
  checkoutModal.hidden=false;
  document.body.style.overflow="hidden";
  document.getElementById("customerName").focus();
});
function closeCheckout(){checkoutModal.hidden=true;document.body.style.overflow="";}
document.getElementById("closeModal").addEventListener("click",closeCheckout);
checkoutModal.addEventListener("click",e=>{if(e.target===checkoutModal)closeCheckout()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!checkoutModal.hidden)closeCheckout()});
document.getElementById("checkoutForm").addEventListener("submit",e=>{
  e.preventDefault();
  if(!countItems())return;
  const form=new FormData(e.currentTarget);
  const name=String(form.get("name")||"").trim();
  const phone=String(form.get("phone")||"").trim();
  const email=String(form.get("email")||"").trim();
  const location=String(form.get("location")||"").trim();
  if(!name||!phone||!location){showToast("Please complete your name, phone and delivery address.");return;}
  const orderLines=Object.values(cart).map(item=>`• ${item.name} × ${item.qty} — ${money(item.price*item.qty)}`).join("\n");
  const total=Object.values(cart).reduce((sum,item)=>sum+item.price*item.qty,0);
  const message=[
    "🍦 *NEW MILKYMIST ORDER*",
    "",
    `*Name:* ${name}`,
    `*Customer phone:* ${phone}`,
    `*Email:* ${email||"Not provided"}`,
    `*Delivery location:* ${location}`,
    "",
    "*Order items:*",
    orderLines,
    "",
    `*Total:* ${money(total)}`,
    "",
    "Please confirm availability and delivery. Thank you!"
  ].join("\n");
  const whatsappURL=`https://wa.me/919390248114?text=${encodeURIComponent(message)}`;
  const opened=window.open(whatsappURL,"_blank","noopener,noreferrer");
  if(!opened){window.location.href=whatsappURL;}
  closeCheckout();
  showToast("WhatsApp opened with your order. Press Send to place it.");
});
const menuToggle=document.getElementById("menuToggle");
const nav=document.getElementById("nav");
menuToggle.addEventListener("click",()=>{
  const isOpen=nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded",String(isOpen));
  menuToggle.setAttribute("aria-label",isOpen?"Close navigation":"Open navigation");
});
nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{nav.classList.remove("open");menuToggle.setAttribute("aria-expanded","false")}));
document.getElementById("year").textContent=new Date().getFullYear();
window.addEventListener("load",()=>setTimeout(()=>document.getElementById("welcome").classList.add("hide"),2000));
renderCart();
