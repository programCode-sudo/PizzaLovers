document.addEventListener("DOMContentLoaded", async () => {
    if (!isAuthenticated()) {
        window.location.href = './index.html';
        return;
    }

    const ordersSection = document.getElementById('ordersSection');
    const paginationSection = document.getElementById('paginationSection');
    let currentPage = 1;
    let totalPages = 1;

    async function loadOrders(page = 1) {
        try {
            const response = await apiRequest(`/order_manager/viewOrdersForStatus/?status=Pendiente&page=${page}`, 'GET', null, true);
            console.log('Órdenes obtenidas del backend:', response);

            if (response && response.results && response.results.length > 0) {
                renderOrders(response.results);
                totalPages = Math.ceil(response.count / 10); // Calcula el total de páginas
                renderPagination(totalPages, page); // Asegúrate de pasar la página actual
            } else {
                ordersSection.innerHTML = '<p class="text-center mt-5">No hay órdenes disponibles.</p>';
                paginationSection.innerHTML = '';
            }
        } catch (error) {
            console.error('Error al cargar órdenes:', error);
            Swal.fire('Error', 'No se pudieron cargar las órdenes.', 'error');
        }
    }

    function renderOrders(orders) {
        ordersSection.innerHTML = '';
        orders.forEach(order => {
            const { id, customer_name, address, food_items, status } = order;
            let itemsHTML = '';
            food_items.forEach(item => {
                const name = item.food_item_name;
                const description = item.food_item_description;
                const quantity = item.quantity;
                const imageUrl = 'https://web-production-3c69.up.railway.app'+item.food_item_image; // Obtén la URL de la imagen
    
                // Añadir la imagen al lado del nombre del producto en la tabla
                itemsHTML += `
                    <tr>
                        <td><img src="${imageUrl}" alt="${name}" style="width: 40px; height: 40px; border-radius: 50%;"></td>
                        <td>${name}</td>
                        <td>${description}</td>
                        <td>${quantity}</td>
                    </tr>
                `;
            });
    
            const cliente = customer_name || 'N/A';
            const dir = address || 'N/A';
    
            const article = document.createElement('article');
            article.classList.add('order-card', 'mb-4', 'p-3', 'rounded-3', 'table-responsive');
    
            article.innerHTML = `
                <header class="d-flex justify-content-between mb-3">
                    <span><strong>Id:</strong> ${id}</span>
                    <span><strong>Cliente:</strong> ${cliente}</span>
                    <span><strong>Dirección:</strong> ${dir}</span>
                    <span><strong>Estado:</strong> ${status}</span> <!-- Estado del pedido aquí -->
                </header>
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>Imagen</th> <!-- Cambié "Categoría" por "Imagen" -->
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th>Cantidad</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHTML}
                    </tbody>
                </table>
                <footer class="d-flex justify-content-start gap-3 mt-3">
                    <label>
                        <input type="checkbox" name="order-accepted-${id}">
                        Orden aceptada
                    </label>
                    <label>
                        <input type="checkbox" name="order-preparing-${id}">
                        En preparación
                    </label>
                    <label>
                        <input type="checkbox" name="order-ready-${id}">
                        Orden lista
                    </label>
                </footer>
            `;
    
            ordersSection.appendChild(article);
        });
    }
    

    function renderPagination(totalPages, currentPage) {
        paginationSection.innerHTML = '';

        if (totalPages <= 1) return;

        const paginationList = document.createElement('ul');
        paginationList.classList.add('pagination', 'justify-content-center');

        const prevPage = document.createElement('li');
        prevPage.classList.add('page-item');
        if (currentPage === 1) prevPage.classList.add('disabled');
        prevPage.innerHTML = `<a class="page-link" href="#">Anterior</a>`;
        prevPage.querySelector('a').addEventListener('click', (event) => {
            event.preventDefault();
            if (currentPage > 1) {
                currentPage--;
                loadOrders(currentPage);
            }
        });
        paginationList.appendChild(prevPage);

        for (let page = 1; page <= totalPages; page++) {
            const pageItem = document.createElement('li');
            pageItem.classList.add('page-item');
            if (page === currentPage) pageItem.classList.add('active');
            pageItem.innerHTML = `<a class="page-link" href="#">${page}</a>`;
            pageItem.querySelector('a').addEventListener('click', (event) => {
                event.preventDefault();
                if (page !== currentPage) {
                    currentPage = page;
                    loadOrders(currentPage);
                }
            });
            paginationList.appendChild(pageItem);
        }

        const nextPage = document.createElement('li');
        nextPage.classList.add('page-item');
        if (currentPage === totalPages) nextPage.classList.add('disabled');
        nextPage.innerHTML = `<a class="page-link" href="#">Siguiente</a>`;
        nextPage.querySelector('a').addEventListener('click', (event) => {
            event.preventDefault();
            if (currentPage < totalPages) {
                currentPage++;
                loadOrders(currentPage);
            }
        });
        paginationList.appendChild(nextPage);

        paginationSection.appendChild(paginationList);
    }

    await loadOrders(currentPage);
});
