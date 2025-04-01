const shopContent = document.getElementById("shopContent");
const verCarrito = document.getElementById("verCarrito");
const modalContainer = document.getElementById("modal-container");
const cantidadCarrito = document.getElementById("cantidadCarrito");



let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

const getProducts = async () => {
try {
    const response = await fetch("data.json");
    if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
}

    const data = await response.json();
    data.forEach((producto) => {
    let content = document.createElement("div");
    content.className = "card";
    content.innerHTML = `
                <img src="${producto.img}">
                <h3>${producto.nombre}</h3>
                <p class="price">${producto.precio} $</p>
            `;
    shopContent.append(content);
    const comprar = document.createElement("button");
    comprar.innerText = "comprar";
    comprar.className = "comprar";

    content.append(comprar);

    comprar.addEventListener("click", () => {
    Toastify({
                text: "Producto añadido al carrito",
                duration: 2000,
                gravity: "bottom",
                position: "right",
                backgroundColor: "#ffb3c6"
}).showToast();

const repeat = carrito.some((repeatProducto) => repeatProducto.id === producto.id);

if (repeat) {carrito.map((prod) => {
    if (prod.id === producto.id) {
    prod.cantidad++;
}});} else {
carrito.push({ ...producto });
}

carritoCounter();
saveLocal();
            });
        });
    } catch (error) {
    console.error("Error al cargar los productos:", error);
    shopContent.innerHTML = `<p class="error">Error al cargar los productos. Por favor intenta nuevamente.</p>`;
}
};


getProducts()

const mostrarAgradecimiento = (modalContainer) => {
    modalContainer.innerHTML = "";
    modalContainer.style.display = "flex";

    const agradecimientoContent = document.createElement("div");
    agradecimientoContent.className = "modal-content";
    agradecimientoContent.innerHTML = `
        <h2>¡Gracias por tu compra!</h2>
        <p>Vuelve pronto por más delicias.</p>
        <button class="confiCerrar" id="cerrarAgradecimiento">Cerrar</button>
    `;
    modalContainer.append(agradecimientoContent);

    const cerrarBtn = agradecimientoContent.querySelector("#cerrarAgradecimiento");
    cerrarBtn.addEventListener("click", () => {
        Toastify({
            text: "Hasta la proxima hora del postre!",
            duration: 2000,
            gravity: "bottom",
            position: "right",
            backgroundColor: "#ffb3c6"
        }).showToast();
        modalContainer.style.display = "none";
    });
};

const pagarCarrito = (total, modalContainer) => {
    modalContainer.innerHTML = "";
    modalContainer.style.display = "flex";

    const pagoHeader = document.createElement("div");
    pagoHeader.className = "modal-header";
    pagoHeader.innerHTML = `<h1 class="modal-header-title">Pago</h1>`;
    modalContainer.append(pagoHeader);

    const modalButton = document.createElement("h1");
    modalButton.innerText = "❌";
    modalButton.className = "modal-header-button";
    modalButton.addEventListener("click", () => {
        modalContainer.style.display = "none";
        pintarCarrito();
    });
    pagoHeader.append(modalButton);

    const pagoContent = document.createElement("div");
    pagoContent.className = "modal-content";
    pagoContent.innerHTML = `
        <h3>Total a pagar: $${total}</h3>
        <div class="pago-form">
            <label for="montoIngresado">Ingrese el monto:</label>
            <input type="number" id="montoIngresado" min="${total}" step="100" required>
            <button class="confiPago" id="confirmarPago">Confirmar Pago</button>
            <div id="resultadoPago"></div>
        </div>
    `;
    modalContainer.append(pagoContent);

    const montoIngresado = pagoContent.querySelector("#montoIngresado");
    const confirmarPago = pagoContent.querySelector("#confirmarPago");
    const resultadoPago = pagoContent.querySelector("#resultadoPago");

    confirmarPago.addEventListener("click", () => {
        const monto = parseFloat(montoIngresado.value);
        
        if (isNaN(monto) || monto < total) {
            resultadoPago.innerHTML = `<p style="color: red;">El monto ingresado es insuficiente. Por favor ingrese al menos $${total}</p>`;
            return;
        }

        const vuelto = monto - total;
        resultadoPago.innerHTML = `
            <div style="margin-top: 20px;">
                <p style="color: pink;">Pago realizado con éxito!</p>
                <p>Monto recibido: $${monto}</p>
                <p>Total de la compra: $${total}</p>
                <p>Vuelto: $${vuelto}</p>
            </div>
            <button class="confiFin" id="finalizarCompra" style="margin-top: 15px;">Finalizar</button>
        `;

        const finalizarCompra = resultadoPago.querySelector("#finalizarCompra");
        finalizarCompra.addEventListener("click", () => {
            carrito = [];
            saveLocal();
            carritoCounter();
            mostrarAgradecimiento(modalContainer);
        });
    });
};

const pintarCarrito = () => {
    modalContainer.innerHTML = "";
    modalContainer.style.display = "flex";

    const modalHeader = document.createElement("div");
    modalHeader.className = "modal-header";
    modalHeader.innerHTML = `<h1 class="modal-header-title">Total de compra</h1>`;
    modalContainer.append(modalHeader);

    const modalButton = document.createElement("h1");
    modalButton.innerText = "❌";
    modalButton.className = "modal-header-button";
    modalButton.addEventListener("click", () => {
        modalContainer.style.display = "none";
    });

    modalHeader.append(modalButton);

    if (carrito.length === 0) {
        const carritoVacio = document.createElement("div");
        carritoVacio.className = "modal-content";
        carritoVacio.innerHTML = `<p>Tu carrito está vacío</p>`;
        modalContainer.append(carritoVacio);
    } else {
        carrito.forEach((producto) => {
            let carritoContent = document.createElement("div");
            carritoContent.className = "modal-content";
            carritoContent.innerHTML = `
                <img src="${producto.img}"> 
                <h3>${producto.nombre}</h3>
                <p>$${producto.precio}</p>
                <span class="restar"> - </span>
                <p>Cantidad: ${producto.cantidad}</p>
                <span class="sumar"> + </span>
                <p>Total: $${producto.cantidad * producto.precio}</p>
                <span class="delete-product">Eliminar</span>
            `;
            modalContainer.append(carritoContent);

            let restar = carritoContent.querySelector(".restar");
            restar.addEventListener("click", () => {
                if (producto.cantidad !== 1) producto.cantidad--;
                saveLocal();
                pintarCarrito();
            });

            let sumar = carritoContent.querySelector(".sumar");
            sumar.addEventListener("click", () => {
                producto.cantidad++;
                saveLocal();
                pintarCarrito();
            });

            let eliminar = carritoContent.querySelector(".delete-product");
            eliminar.addEventListener("click", () => {
                eliminarProducto(producto.id);
            });
        });

        const total = carrito.reduce((acc, el) => acc + el.precio * el.cantidad, 0);
        const totalCompra = document.createElement("div");
        totalCompra.className = "total-content";
        totalCompra.innerHTML = `Total a pagar: $${total}`;
        modalContainer.append(totalCompra);

        const pagarButton = document.createElement("button");
        pagarButton.innerText = "Pagar";
        pagarButton.className = "pagar";
        pagarButton.addEventListener("click", () => pagarCarrito(total, modalContainer));
        modalContainer.append(pagarButton);
    }
};

verCarrito.addEventListener("click", pintarCarrito);

const eliminarProducto = (id) => {
    const foundId = carrito.find((element) => element.id === id);
    carrito = carrito.filter((carritoId) => carritoId !== foundId);
    carritoCounter();
    saveLocal();
    pintarCarrito();
};

const carritoCounter = () => {
    cantidadCarrito.style.display = carrito.length > 0 ? "block" : "none";
    const carritoLength = carrito.length;
    localStorage.setItem("carritoLength", JSON.stringify(carritoLength));
    cantidadCarrito.innerText = JSON.parse(localStorage.getItem("carritoLength"));
};

carritoCounter();

const saveLocal = () => {
    localStorage.setItem("carrito", JSON.stringify(carrito));
};