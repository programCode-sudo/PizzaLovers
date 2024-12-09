// delivery.js

document.addEventListener('DOMContentLoaded', async () => {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const notificationIcon = document.getElementById('notificationIcon');
    const notificationCount = document.getElementById('notificationCount');
    const pedidosDisponiblesBtn = document.getElementById('pedidosDisponiblesBtn');
    const pedidoAsignadoBtn = document.getElementById('pedidoAsignadoBtn');
    const ordersTableBody = document.getElementById('ordersTableBody');
    const statusSwitch = document.getElementById('statusSwitch');
    const iniciarSesionForm = document.getElementById('iniciarSesionForm');

    const assignedOrdersContainer = document.getElementById('assignedOrdersContainer');
    const cambiarEstadoBtn = document.getElementById('cambiarEstadoBtn');
    const statusSelect = document.getElementById('statusSelect');

    let assignedOrders = []; // Pedidos asignados al repartidor
    let selectedOrderId = null; // Pedido seleccionado para cambiar estado

    // Verificar autenticación al cargar
    if (!isAuthenticated()) {
        window.location.href = './index.html';
        return;
    } else {
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
    }

    // Cargar pedidos disponibles al iniciar
    await cargarPedidosDisponibles();

    // Evento de inicio de sesión
    iniciarSesionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        try {
            await login(username, password);
            if (isAuthenticated()) {
                // Éxito al iniciar sesión
                loginBtn.style.display = 'none';
                logoutBtn.style.display = 'inline-block';

                // Cerrar modal de inicio de sesión
                const loginModal = new bootstrap.Modal(document.getElementById('modalIniciarSesion'));
                loginModal.hide();

                // Refrescar la página para cargar los pedidos
                window.location.reload();
            } else {
                Swal.fire('Error', 'Error en el inicio de sesión. Por favor, intenta nuevamente.', 'error');
            }
        } catch (error) {
            Swal.fire('Error', `Error: ${error.message}`, 'error');
        }
    });

    // Cerrar sesión
    logoutBtn.addEventListener('click', () => {
        logout();
        loginBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
        notificationIcon.style.display = 'none';
        notificationCount.textContent = '0';
        ordersTableBody.innerHTML = '';
    });

    // Cambio online/offline
    statusSwitch.addEventListener('change', async () => {
        const isOnline = statusSwitch.checked ? 1 : 0;
        try {
            await apiRequest('/delivery_person/changeIsOnline/', 'POST', { is_online: isOnline }, true);
            console.log('Estado is_online actualizado:', isOnline);
            Swal.fire('Éxito', 'Estado actualizado correctamente.', 'success');
        } catch (error) {
            console.error('Error al cambiar estado online:', error);
            Swal.fire('Error', 'Error al cambiar estado. Intenta nuevamente.', 'error');
            // Revertir el switch
            statusSwitch.checked = !isOnline;
        }
    });

    // Pedidos disponibles: obtener todos los pedidos
    pedidosDisponiblesBtn.addEventListener('click', async () => {
        await cargarPedidosDisponibles();
    });

    // Pedido asignado: obtener pedidos asignados al repartidor
    pedidoAsignadoBtn.addEventListener('click', async () => {
        await cargarPedidosAsignados();
    });

    // Cambiar estado del pedido seleccionado
    cambiarEstadoBtn.addEventListener('click', async () => {
        if (!selectedOrderId) {
            Swal.fire('Atención', 'No se ha seleccionado ningún pedido.', 'warning');
            return;
        }
        const nuevoEstado = statusSelect.value; // Entregado o Cancelado
        if (!nuevoEstado) {
            Swal.fire('Atención', 'Por favor, seleccione un nuevo estado.', 'warning');
            return;
        }
        try {
            await apiRequest(`/delivery_person/changeOrderStatus/${selectedOrderId}/`, 'POST', { status: nuevoEstado }, true);
            Swal.fire('Éxito', `Estado del pedido ${selectedOrderId} actualizado a ${nuevoEstado}.`, 'success');
            await cargarPedidosAsignados(); // refrescar la lista
            selectedOrderId = null;
            // Resetear el combo box
            statusSelect.value = "";
        } catch (error) {
            console.error('Error al cambiar estado del pedido:', error);
            Swal.fire('Error', 'No se pudo cambiar el estado del pedido.', 'error');
        }
    });

    async function cargarPedidosDisponibles() {
        try {
            const response = await apiRequest('/order_manager/viewAllOrders/', 'GET', null, true);
            const pedidos = response.results;
            mostrarPedidosEnTabla(pedidos);
        } catch (error) {
            console.error('Error al cargar pedidos disponibles:', error);
            Swal.fire('Error', 'No se pudieron cargar los pedidos disponibles.', 'error');
        }
    }

    async function cargarPedidosAsignados() {
        try {
            const response = await apiRequest('/delivery_person/viewOrders/', 'GET', null, true);
            assignedOrders = response.results; // Suponiendo que este endpoint retorna {results: [...]}

            // Mostrar pedidos en el modal
            mostrarPedidosAsignados();
            // Abrir el modal
            const asignadoModal = new bootstrap.Modal(document.getElementById('pedidoAsignadoModal'));
            asignadoModal.show();
        } catch (error) {
            console.error('Error al cargar pedidos asignados:', error);
            if (error.response && error.response.status === 401) {
                Swal.fire('No Autorizado', 'Debe iniciar sesión para ver sus pedidos asignados.', 'error');
                window.location.href = './index.html';
            } else {
                Swal.fire('Error', 'No se pudieron cargar los pedidos asignados.', 'error');
            }
        }
    }

    function mostrarPedidosEnTabla(pedidos) {
        ordersTableBody.innerHTML = '';
        if (!pedidos || pedidos.length === 0) {
            ordersTableBody.innerHTML = '<tr><td colspan="4">No hay pedidos disponibles.</td></tr>';
            return;
        }

        pedidos.forEach(pedido => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${pedido.id}</td>
                <td>${pedido.customer_name || ''}</td>
                <td>${pedido.address || ''}</td>
                <td>${pedido.customer_phone || ''}</td>
            `;
            ordersTableBody.appendChild(tr);
        });
    }

    function mostrarPedidosAsignados() {
        assignedOrdersContainer.innerHTML = '';
        if (!assignedOrders || assignedOrders.length === 0) {
            assignedOrdersContainer.innerHTML = '<p>No hay pedidos asignados.</p>';
            return;
        }

        assignedOrders.forEach(pedido => {
            const div = document.createElement('div');
            div.classList.add('pedido-asignado', 'mb-3', 'p-3', 'border', 'rounded');

            div.innerHTML = `
                <p><strong>ID Orden:</strong> ${pedido.id}</p>
                <p><strong>Nombre Cliente:</strong> ${pedido.customer_name || ''}</p>
                <p><strong>Dirección:</strong> ${pedido.address || ''}</p>
                <p><strong>Teléfono:</strong> ${pedido.customer_phone || ''}</p>
                <p><strong>Estado Actual:</strong> ${pedido.status || ''}</p>
                <button class="btn btn-sm btn-outline-primary seleccionar-pedido" data-id="${pedido.id}">Seleccionar</button>
            `;

            assignedOrdersContainer.appendChild(div);
        });

        // Asignar eventos a los botones de seleccionar
        const seleccionarBtns = assignedOrdersContainer.querySelectorAll('.seleccionar-pedido');
        seleccionarBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                selectedOrderId = btn.getAttribute('data-id');
                Swal.fire('Seleccionado', `Pedido ${selectedOrderId} seleccionado. Ahora puedes cambiar su estado.`, 'info');
            });
        });
    }

});
