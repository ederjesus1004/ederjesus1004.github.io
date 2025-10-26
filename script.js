// Data Storage
let currentUser = null
const users = JSON.parse(localStorage.getItem("educabooks_users")) || []
const products = [
  { id: 1, name: "Cuaderno A4", emoji: "📓", price: 12.5, description: "Cuaderno de 100 hojas" },
  { id: 2, name: "Lápiz HB", emoji: "✏️", price: 2.0, description: "Lápiz de grafito" },
  { id: 3, name: "Lapicero Azul", emoji: "🖊️", price: 3.5, description: "Lapicero de tinta azul" },
  { id: 4, name: "Borrador", emoji: "🧹", price: 1.5, description: "Borrador de caucho" },
  { id: 5, name: "Resaltador", emoji: "🖍️", price: 4.0, description: "Resaltador fluorescente" },
  { id: 6, name: "Regla 30cm", emoji: "📏", price: 5.0, description: "Regla de plástico" },
  { id: 7, name: "Corrector", emoji: "✒️", price: 6.0, description: "Corrector líquido" },
  { id: 8, name: "Folder", emoji: "📁", price: 2.5, description: "Folder de cartulina" },
]
let cart = JSON.parse(localStorage.getItem("educabooks_cart")) || []
const purchases = JSON.parse(localStorage.getItem("educabooks_purchases")) || []
const comments = JSON.parse(localStorage.getItem("educabooks_comments")) || []
const chatMessages = []

const demoUser = {
  id: 1,
  name: "Usuario Demo",
  email: "email@test.com",
  password: "123456",
  phone: "+51 999 999 999",
}

if (!users.find((u) => u.email === demoUser.email)) {
  users.push(demoUser)
  localStorage.setItem("educabooks_users", JSON.stringify(users))
}

// Auth Functions
document.getElementById("loginForm").addEventListener("submit", (e) => {
  e.preventDefault()
  const email = document.getElementById("loginEmail").value
  const password = document.getElementById("loginPassword").value

  const user = users.find((u) => u.email === email && u.password === password)
  if (user) {
    currentUser = user
    localStorage.setItem("educabooks_currentUser", JSON.stringify(user))
    showApp()
  } else {
    alert("Email o contraseña incorrectos")
  }
})

document.getElementById("registerForm").addEventListener("submit", (e) => {
  e.preventDefault()
  const name = document.getElementById("registerName").value
  const email = document.getElementById("registerEmail").value
  const password = document.getElementById("registerPassword").value
  const phone = document.getElementById("registerPhone").value

  if (users.find((u) => u.email === email)) {
    alert("Este email ya está registrado")
    return
  }

  const newUser = {
    id: users.length + 1,
    name,
    email,
    password,
    phone,
  }

  users.push(newUser)
  localStorage.setItem("educabooks_users", JSON.stringify(users))
  currentUser = newUser
  localStorage.setItem("educabooks_currentUser", JSON.stringify(newUser))
  showApp()
})

// Auth Tabs
document.querySelectorAll(".auth-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    const tabName = tab.dataset.tab
    document.querySelectorAll(".auth-tab").forEach((t) => t.classList.remove("active"))
    document.querySelectorAll(".auth-form").forEach((f) => f.classList.remove("active"))
    tab.classList.add("active")
    document.getElementById(tabName + "Form").classList.add("active")
  })
})

// Show App
function showApp() {
  document.getElementById("authModal").classList.remove("active")
  document.getElementById("mainApp").classList.remove("hidden")
  document.getElementById("userName").textContent = currentUser.name
  loadProducts()
  loadPurchases()
  loadComments()
  initChat()
}

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  currentUser = null
  localStorage.removeItem("educabooks_currentUser")
  location.reload()
})

// Navigation
document.querySelectorAll(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const page = btn.dataset.page
    if (page === "cart") {
      goToPage("cart")
    } else if (page === "checkout") {
      goToPage("checkout")
    } else {
      goToPage(page)
    }
  })
})

function goToPage(page) {
  document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"))
  document.querySelectorAll(".nav-btn").forEach((b) => b.classList.remove("active"))

  if (page === "checkout") {
    document.getElementById("checkoutPage").classList.add("active")
  } else {
    document.getElementById(page + "Page").classList.add("active")
    document.querySelector(`[data-page="${page}"]`)?.classList.add("active")
  }
}

// Products
function loadProducts() {
  const grid = document.getElementById("productsGrid")
  grid.innerHTML = products
    .map(
      (product) => `
        <div class="product-card">
            <div class="product-emoji">${product.emoji}</div>
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-price">S/ ${product.price.toFixed(2)}</div>
                <div class="product-description">${product.description}</div>
                <div class="product-actions">
                    <button class="btn-add" onclick="addToCart(${product.id})">Agregar</button>
                </div>
            </div>
        </div>
    `,
    )
    .join("")
}

// Cart Functions
function addToCart(productId) {
  const product = products.find((p) => p.id === productId)
  const cartItem = cart.find((c) => c.id === productId)

  if (cartItem) {
    cartItem.quantity++
  } else {
    cart.push({ ...product, quantity: 1 })
  }

  localStorage.setItem("educabooks_cart", JSON.stringify(cart))
  updateCartUI()
  alert("Producto agregado al carrito")
}

function updateCartUI() {
  const cartItems = document.getElementById("cartItems")
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const igv = subtotal * 0.18
  const total = subtotal + igv

  if (cart.length === 0) {
    cartItems.innerHTML = '<p style="text-align: center; color: var(--text-light);">Tu carrito está vacío</p>'
  } else {
    cartItems.innerHTML = cart
      .map(
        (item) => `
            <div class="cart-item">
                <div class="cart-item-emoji">${item.emoji}</div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">S/ ${item.price.toFixed(2)}</div>
                    <div class="cart-item-quantity">
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">−</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                        <button class="remove-btn" onclick="removeFromCart(${item.id})">Eliminar</button>
                    </div>
                </div>
            </div>
        `,
      )
      .join("")
  }

  document.getElementById("subtotal").textContent = `S/ ${subtotal.toFixed(2)}`
  document.getElementById("igv").textContent = `S/ ${igv.toFixed(2)}`
  document.getElementById("total").textContent = `S/ ${total.toFixed(2)}`
}

function updateQuantity(productId, change) {
  const item = cart.find((c) => c.id === productId)
  if (item) {
    item.quantity += change
    if (item.quantity <= 0) {
      removeFromCart(productId)
    } else {
      localStorage.setItem("educabooks_cart", JSON.stringify(cart))
      updateCartUI()
    }
  }
}

function removeFromCart(productId) {
  cart = cart.filter((c) => c.id !== productId)
  localStorage.setItem("educabooks_cart", JSON.stringify(cart))
  updateCartUI()
}

function goToCheckout() {
  if (cart.length === 0) {
    alert("Tu carrito está vacío")
    return
  }
  goToPage("checkout")
}

// Payment
function selectPayment(method) {
  document.querySelectorAll(".payment-option").forEach((opt) => opt.classList.remove("selected"))
  event.target.closest(".payment-option").classList.add("selected")

  const paymentInfo = document.getElementById("paymentInfo")
  const paymentDetails = document.getElementById("paymentDetails")

  if (method === "yape") {
    paymentInfo.innerHTML = `
            <strong>Pago por Yape</strong><br>
            Número: +51 999 123 456<br>
            Referencia: EB-${Date.now()}<br>
            Monto: S/ ${getTotalAmount().toFixed(2)}<br><br>
            <small>Envía el comprobante al WhatsApp después de pagar</small>
        `
  } else {
    paymentInfo.innerHTML = `
            <strong>Pago por Plin</strong><br>
            Número: +51 987 654 321<br>
            Referencia: EB-${Date.now()}<br>
            Monto: S/ ${getTotalAmount().toFixed(2)}<br><br>
            <small>Envía el comprobante al WhatsApp después de pagar</small>
        `
  }

  paymentDetails.classList.remove("hidden")
}

function getTotalAmount() {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  return subtotal * 1.18
}

function completePayment() {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const igv = subtotal * 0.18
  const total = subtotal + igv

  const purchase = {
    id: "EB-" + Date.now(),
    date: new Date().toLocaleDateString("es-PE"),
    items: [...cart],
    subtotal,
    igv,
    total,
    status: "Completado",
  }

  purchases.push(purchase)
  localStorage.setItem("educabooks_purchases", JSON.stringify(purchases))

  cart = []
  localStorage.setItem("educabooks_cart", JSON.stringify(cart))

  alert("¡Compra realizada exitosamente! Tu recibo ha sido guardado.")
  goToPage("purchases")
  loadPurchases()
}

// Purchases
function loadPurchases() {
  const list = document.getElementById("purchasesList")
  if (purchases.length === 0) {
    list.innerHTML = '<p style="text-align: center; color: var(--text-light);">No tienes compras aún</p>'
    return
  }

  list.innerHTML = purchases
    .map(
      (purchase) => `
        <div class="purchase-card">
            <div class="purchase-header">
                <div>
                    <div class="purchase-id">Pedido ${purchase.id}</div>
                    <div class="purchase-date">${purchase.date}</div>
                </div>
                <div class="purchase-status">${purchase.status}</div>
            </div>
            <div class="purchase-items">
                ${purchase.items
                  .map(
                    (item) => `
                    <div class="purchase-item">
                        <span>${item.emoji} ${item.name} x${item.quantity}</span>
                        <span>S/ ${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `,
                  )
                  .join("")}
            </div>
            <div class="purchase-total">
                <span>Total:</span>
                <span>S/ ${purchase.total.toFixed(2)}</span>
            </div>
            <button class="receipt-btn" onclick="downloadReceipt('${purchase.id}')">📄 Descargar Recibo</button>
        </div>
    `,
    )
    .join("")
}

function downloadReceipt(purchaseId) {
  const purchase = purchases.find((p) => p.id === purchaseId)
  const receipt = `
EDUCABOOKS - RECIBO DE COMPRA
================================
Pedido: ${purchase.id}
Fecha: ${purchase.date}
Cliente: ${currentUser.name}
Email: ${currentUser.email}
Teléfono: ${currentUser.phone}

PRODUCTOS:
${purchase.items.map((item) => `${item.emoji} ${item.name} x${item.quantity} - S/ ${(item.price * item.quantity).toFixed(2)}`).join("\n")}

RESUMEN:
Subtotal: S/ ${purchase.subtotal.toFixed(2)}
IGV (18%): S/ ${purchase.igv.toFixed(2)}
TOTAL: S/ ${purchase.total.toFixed(2)}

Estado: ${purchase.status}
Gracias por tu compra en EducaBooks
    `

  const element = document.createElement("a")
  element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(receipt))
  element.setAttribute("download", `recibo-${purchase.id}.txt`)
  element.style.display = "none"
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}

// Forum/Comments
function loadComments() {
  const list = document.getElementById("commentsList")
  if (comments.length === 0) {
    list.innerHTML = '<p style="text-align: center; color: var(--text-light);">Sé el primero en comentar</p>'
    return
  }

  list.innerHTML = comments
    .map(
      (comment) => `
        <div class="comment-card">
            <div class="comment-header">
                <div class="comment-author">${comment.author}</div>
                <div class="comment-date">${comment.date}</div>
            </div>
            <div class="comment-text">${comment.text}</div>
            <div class="comment-rating">⭐ ${comment.rating}/5</div>
        </div>
    `,
    )
    .join("")
}

function addComment() {
  const text = document.getElementById("commentText").value
  if (!text.trim()) {
    alert("Por favor escribe un comentario")
    return
  }

  const comment = {
    author: currentUser.name,
    text,
    date: new Date().toLocaleDateString("es-PE"),
    rating: Math.floor(Math.random() * 2) + 4,
  }

  comments.push(comment)
  localStorage.setItem("educabooks_comments", JSON.stringify(comments))
  document.getElementById("commentText").value = ""
  loadComments()
  alert("Comentario publicado")
}

// Chatbox
function initChat() {
  const responses = [
    "¿En qué puedo ayudarte?",
    "Tenemos los mejores útiles universitarios",
    "Nuestro horario es de 8am a 8pm",
    "Aceptamos Yape y Plin",
    "Entregamos en 24 horas en Lima",
    "Puedes contactarnos al +51 999 123 456",
    "Gracias por tu interés en EducaBooks",
  ]

  window.chatResponses = responses
}

function sendMessage() {
  const input = document.getElementById("chatInput")
  const message = input.value.trim()

  if (!message) return

  const messagesDiv = document.getElementById("chatMessages")

  // User message
  const userMsg = document.createElement("div")
  userMsg.className = "chat-message user"
  userMsg.innerHTML = `<p>${message}</p>`
  messagesDiv.appendChild(userMsg)

  input.value = ""
  messagesDiv.scrollTop = messagesDiv.scrollHeight

  // Bot response
  setTimeout(() => {
    const botMsg = document.createElement("div")
    botMsg.className = "chat-message bot"
    const randomResponse = window.chatResponses[Math.floor(Math.random() * window.chatResponses.length)]
    botMsg.innerHTML = `<p>${randomResponse}</p>`
    messagesDiv.appendChild(botMsg)
    messagesDiv.scrollTop = messagesDiv.scrollHeight
  }, 500)
}

function toggleChat() {
  const messages = document.getElementById("chatMessages")
  messages.style.display = messages.style.display === "none" ? "flex" : "none"
}

// Initialize
window.addEventListener("load", () => {
  const savedUser = localStorage.getItem("educabooks_currentUser")
  if (savedUser) {
    currentUser = JSON.parse(savedUser)
    showApp()
  }
  updateCartUI()
})
