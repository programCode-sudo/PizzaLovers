// shippingManager.js

document.addEventListener("DOMContentLoaded", async () => {
    if (!isAuthenticated()) {
        window.location.href = './index.html';
        return;
    }

    const ordersSection = document.getElementById('ordersSection');
    const paginationSection = document.getElementById('paginationSection');
    let currentPage = 1;
    let totalPages = 1;
    let orders = [];

    // Estados disponibles
    const estadosDisponibles = ["Pendiente", "Cocina", "Listo", "Delivery", "Entregado", "Cancelado"];

    async function loadOrders(page = 1) {
        try {
            // Obtener todos los pedidos sin filtrar, según documentación
            const response = await apiRequest(`/order_manager/viewAllOrders/?page=${page}`, 'GET', null, true);
            console.log('Órdenes obtenidas del backend:', response);

            if (response && response.results && response.results.length > 0) {
                orders = response.results;
                renderOrders(orders);
                totalPages = Math.ceil(response.count / 10); // Ajustar si el backend devuelve count y paginación
                renderPagination(totalPages, page);
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
            const { id, customer_name, address, food_items, status, created_at } = order;
            let itemsHTML = '';
            food_items.forEach(item => {
                const name = item.food_item_name || '';
                const description = item.food_item_description || '';
                const quantity = item.quantity;
                const imageUrl = 'https://web-production-3c69.up.railway.app'+(item.food_item_image || '');
    
                itemsHTML += `
                    <tr>
                        <td><img src="${imageUrl}" alt="${name}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;"></td>
                        <td>${name}</td>
                        <td>${description}</td>
                        <td>${quantity}</td>
                    </tr>
                `;
            });

            const fecha = created_at ? new Date(created_at).toLocaleDateString() : 'N/A';
            const cliente = customer_name || 'N/A';
            const dir = address || 'N/A';

            // Crear select con estados
            const selectEstado = document.createElement('select');
            selectEstado.classList.add('form-select', 'form-select-sm', 'w-auto');
            estadosDisponibles.forEach(est => {
                const option = document.createElement('option');
                option.value = est;
                option.textContent = est;
                if (est === status) option.selected = true;
                selectEstado.appendChild(option);
            });

            // Botón para cambiar estado
            const btnCambiarEstado = document.createElement('button');
            btnCambiarEstado.classList.add('btn', 'btn-sm', 'btn-primary', 'ms-2');
            btnCambiarEstado.textContent = 'Cambiar estado';
            btnCambiarEstado.addEventListener('click', async () => {
                const nuevoEstado = selectEstado.value;
                await cambiarEstadoPedido(id, nuevoEstado);
            });

            const article = document.createElement('article');
            article.classList.add('order-card', 'mb-4', 'p-3', 'rounded-3', 'table-responsive');
            article.innerHTML = `
                <header class="d-flex justify-content-between mb-3">
                    <span><strong>ID:</strong> ${id}</span>
                    <span><strong>Cliente:</strong> ${cliente}</span>
                    <span><strong>Dirección:</strong> ${dir}</span>
                    <span><strong>Fecha:</strong> ${fecha}</span>
                </header>
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>Imagen</th>
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th>Cantidad</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHTML}
                    </tbody>
                </table>
                <footer class="d-flex align-items-center gap-2 mt-3">
                    <span><strong>Estado actual:</strong></span>
                </footer>
            `;

            const footer = article.querySelector('footer');
            footer.appendChild(selectEstado);
            footer.appendChild(btnCambiarEstado);

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

    async function cambiarEstadoPedido(pedido_id, nuevoEstado) {
        try {
            // Endpoint para cambiar estado del pedido
            // Basándonos en la documentación anterior se usó:
            // POST /order_dispatcher/updateStatus/{pedido_id}/
            // Body: { "status": "NuevoEstado" }
            await apiRequest(`/order_dispatcher/updateStatus/${pedido_id}/`, 'POST', {status: nuevoEstado}, true);
            Swal.fire('Éxito', 'El estado del pedido ha sido actualizado.', 'success');
            // Recargar la lista de pedidos para reflejar el cambio
            await loadOrders(currentPage);
        } catch (error) {
            console.error('Error al cambiar estado del pedido:', error);
            Swal.fire('Error', 'No se pudo cambiar el estado del pedido.', 'error');
        }
    }

    await loadOrders(currentPage);
});
