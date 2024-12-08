document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector(".table-container tbody");
  const categoryFilter = document.getElementById("categoryFilter");
  const apiURL = "http://web-production-3c69.up.railway.app/menu_manager/getFoodItems/";
  const addOrderButton = document.querySelector(".btn-red");
  const orderContainer = document.querySelector("article");
  const finalizarCompraButton = document.getElementById("finalizar-compra");

  let foodItems = []; // Para almacenar los datos de la API

  // Función para cargar los datos de la API
  async function loadFoodItems() {
      try {
          const response = await fetch(apiURL);
          if (!response.ok) throw new Error(`Error en la petición: ${response.statusText}`);
          foodItems = await response.json();
          renderTable(foodItems); // Renderiza los datos inicialmente
      } catch (error) {
          console.error("Error al cargar los food items:", error);
          tableBody.innerHTML = `<tr><td colspan="6">Error al cargar los datos</td></tr>`;
      }
  }

  // Función para renderizar la tabla según los datos
  function renderTable(items) {
      tableBody.innerHTML = ""; // Limpia la tabla
      items.forEach((item) => {
          const row = document.createElement("tr");
          row.innerHTML = `
              <td>${item.id}</td>
              <td>${item.category}</td>
              <td>${item.name}</td>
              <td>${item.description}</td>
              <td>$${item.unitPrice.toFixed(2)}</td>
              <td><img src="${item.image_url}" alt="${item.name}" class="img-thumbnail" loading="lazy"></td>
              <td>
                  <div class="quantity-container">
                      <button class="quantity-text decrease" aria-label="Disminuir Cantidad">-</button>
                      <span class="quantity-number-table">0</span>
                      <button class="quantity-text increase" aria-label="Aumentar Cantidad">+</button>
                  </div>
              </td>
          `;
          tableBody.appendChild(row);
      });

      if (items.length === 0) {
          tableBody.innerHTML = `<tr><td colspan="6">No hay resultados para la categoría seleccionada.</td></tr>`;
      }

      addQuantityEventListeners();
  }

  // Función para filtrar por categoría
  function filterByCategory(category) {
      const filteredItems = category === "all"
          ? foodItems
          : foodItems.filter((item) => item.category.toLowerCase() === category);
      renderTable(filteredItems);
  }

  // Evento de cambio en el filtro
  categoryFilter.addEventListener("change", (event) => {
      filterByCategory(event.target.value.toLowerCase());
  });

  // Función para manejar los eventos de cantidad
  function addQuantityEventListeners() {
      document.querySelectorAll(".quantity-text.decrease").forEach((button) => {
          button.addEventListener("click", () => {
              const quantityElement = button.nextElementSibling;
              const quantity = Math.max(parseInt(quantityElement.textContent, 10) - 1, 0);
              quantityElement.textContent = quantity;
          });
      });

      document.querySelectorAll(".quantity-text.increase").forEach((button) => {
          button.addEventListener("click", () => {
              const quantityElement = button.previousElementSibling;
              const quantity = parseInt(quantityElement.textContent, 10) + 1;
              quantityElement.textContent = quantity;
          });
      });
  }


  // Función para manejar el botón "Añadir Pedido"
  // Función para manejar el botón "Añadir Pedido"
  addOrderButton.addEventListener("click", () => {
      const rows = tableBody.querySelectorAll("tr");
      const orderItems = []; // Para almacenar los pedidos seleccionados

      rows.forEach((row) => {
          const quantityElement = row.querySelector(".quantity-number-table");
          const quantity = parseInt(quantityElement.textContent, 10);

          if (quantity > 0) {
              const id = parseInt(row.children[0].textContent.replace("$",""));
              const name = row.children[2].textContent;
              const price = parseFloat(row.children[4].textContent.replace("$", ""));
              const imageSrc = row.children[5].querySelector("img").src;

              orderItems.push({
                  id,
                  name,
                  quantity,
                  price,
                  imageSrc,
              });
          }
      });

      // Guardar en el localStorage
      localStorage.setItem("orderItems", JSON.stringify(orderItems));
      console.log(orderItems);

      renderOrderItems();
  });


  function updateSubtotal(items) {
      const subtotalElement = document.querySelector(".d-flex.justify-content-between.mb-4.pb-2.border-bottom.border-dark p:first-child");  // Aquí debe estar el elemento donde deseas mostrar el subtotal
      const totalElement = document.querySelector(".d-flex.justify-content-between.mt-3 p:last-child");  // Total
  
      if (items.length > 0) {
          // Calcular el subtotal sumando el precio de todos los artículos
          const subtotal = items.reduce((total, item) => total + item.quantity * item.price, 0);
          subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
          totalElement.textContent = `$${subtotal.toFixed(2)}`;
      } else {
          subtotalElement.textContent = "$0.00"; // Si no hay productos, muestra $0.00
          totalElement.textContent = "$0.00";
      }
  }
  
  
  function renderOrderItems() {
      const orderList = orderContainer.querySelector(".order-list");
  
      // Obtener los artículos del carrito desde localStorage
      const orderItems = JSON.parse(localStorage.getItem('orderItems')) || []; // Si no hay elementos, usar un array vacío
  
      // Limpiar pedidos previos
      orderList.innerHTML = "";
  
      if (orderItems.length > 0) {
          orderItems.forEach((item) => {
              const orderItem = document.createElement("div");
              orderItem.classList.add("d-flex", "align-items-center", "mb-3", "p-3", "card-producto", "position-relative");
  
              orderItem.innerHTML = `
                  <img src="${item.imageSrc}" alt="${item.name}" class="img-producto me-3">
                  <section>
                      <p class="mb-1 fw-bold">${item.name}</p>
                      <p class="mb-0 text-muted">x${item.quantity}</p>
                  </section>
                  <p class="ms-auto mb-0 fw-bold">$${(item.quantity * item.price).toFixed(2)}</p>
              `;
  
              orderList.appendChild(orderItem);
          });
  
          // Actualizar el subtotal después de agregar los artículos
          updateSubtotal(orderItems);
      } else {
          orderList.innerHTML = "<p>No hay productos en el pedido.</p>";
          updateSubtotal([]);  // Mostrar el subtotal en 0 cuando no hay artículos
      }
  }
  
  
  finalizarCompraButton.addEventListener("click", async () => {
      const orderItems = JSON.parse(localStorage.getItem("orderItems")) || [];
      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const phone = document.getElementById("phone").value;
      const address = document.getElementById("address").value;
  
      // Verifica si los campos están completos
      if (!name || !email || !phone || !address) {
          alert("Por favor, complete todos los campos del formulario.");
          return;
      }
  
      // Recolectar los items del pedido desde la variable orderItems
      const foodItems = orderItems.map(item => ({
          food_item_id: item.id, // El id del platillo
          quantity: item.quantity // La cantidad del platillo
      }));
  
      // Estructura del cuerpo de la petición
      const requestBody = {
          customer_name: name,
          customer_email: email,
          customer_phone: phone,
          address: address,
          description: "Pedido realizado desde la tienda en línea", // Puedes ajustar la descripción según lo que necesites
          food_items: foodItems
      };
  
      try {
          // Realizar la petición POST
          const response = await fetch('https://web-production-3c69.up.railway.app/order_manager/createOrder/', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(requestBody)
          });
  
          // Verifica si la petición fue exitosa
          if (response.ok) {
              const data = await response.json();
              console.log('Pedido creado con éxito:', data);
              alert("Tu pedido ha sido realizado exitosamente.");
              localStorage.removeItem("orderItems");

          } else {
              const errorData = await response.json();
              console.error('Error al crear el pedido:', errorData);
              alert("Hubo un problema al realizar el pedido. Intenta nuevamente.");
          }
      } catch (error) {
          console.error('Error en la conexión con la API:', error);
          alert("Error en la conexión con el servidor.");
      }
  });

  // Inicializa la carga de datos
  loadFoodItems();
  renderOrderItems()
});

