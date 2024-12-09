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

    let assignedOrders = [];
    let selectedOrderId = null;

    // Verificar autenticación
    if (!isAuthenticated()) {
        window.location.href = './index.html';
        return;
    } else {
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
    }

    // Por defecto, cargar pedidos disponibles al inicio
    await cargarPedidosDisponibles();

    iniciarSesionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        try {
            await login(username, password);
            if (isAuthenticated()) {
                loginBtn.style.display = 'none';
                logoutBtn.style.display = 'inline-block';

                const loginModal = new bootstrap.Modal(document.getElementById('modalIniciarSesion'));
                loginModal.hide();
                window.location.reload();
            } else {
                Swal.fire('Error', 'Error en el inicio de sesión.', 'error');
            }
        } catch (error) {
            Swal.fire('Error', `Error: ${error.message}`, 'error');
        }
    });

    logoutBtn.addEventListener('click', () => {
        logout();
        loginBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
        notificationIcon.style.display = 'none';
        notificationCount.textContent = '0';
        ordersTableBody.innerHTML = '';
    });

    statusSwitch.addEventListener('change', async () => {
        const isOnline = statusSwitch.checked ? 1 : 0;
        try {
            await apiRequest('/delivery_person/changeIsOnline/', 'POST', { is_online: isOnline }, true);
            Swal.fire('Éxito', `Ahora estás ${isOnline === 1 ? 'online' : 'offline'}.`, 'success');
        } catch (error) {
            console.error('Error al cambiar estado online:', error);
            Swal.fire('Error', 'No se pudo cambiar el estado online.', 'error');
            // Revertir el switch
            statusSwitch.checked = !statusSwitch.checked;
        }
    });

    pedidosDisponiblesBtn.addEventListener('click', async () => {
        await cargarPedidosDisponibles();
    });

    pedidoAsignadoBtn.addEventListener('click', async () => {
        await cargarPedidosAsignados();
    });

    cambiarEstadoBtn.addEventListener('click', async () => {
        if (!selectedOrderId) {
            Swal.fire('Atención', 'No se ha seleccionado ningún pedido.', 'warning');
            return;
        }
        const nuevoEstado = statusSelect.value;
        if (!nuevoEstado) {
            Swal.fire('Atención', 'Seleccione un nuevo estado.', 'warning');
            return;
        }
        try {
            await apiRequest(`/delivery_person/changeOrderStatus/${selectedOrderId}/`, 'POST', { status: nuevoEstado }, true);
            Swal.fire('Éxito', `Estado del pedido ${selectedOrderId} actualizado a ${nuevoEstado}.`, 'success');
            await cargarPedidosAsignados();
            selectedOrderId = null;
            statusSelect.value = "";
        } catch (error) {
            console.error('Error al cambiar estado:', error);
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
            // Este endpoint debe devolver un array con los pedidos asignados
            const response = await apiRequest('/delivery_person/viewOrders/', 'GET', null, true);
            // Según lo mostrado, response es un array directo
            console.log("Pedidos asignados:", response);
            assignedOrders = response;

            mostrarPedidosAsignados();
            const asignadoModal = new bootstrap.Modal(document.getElementById('pedidoAsignadoModal'));
            asignadoModal.show();
        } catch (error) {
            console.error('Error al cargar pedidos asignados:', error);
            Swal.fire('Error', 'No se pudieron cargar los pedidos asignados.', 'error');
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

        const seleccionarBtns = assignedOrdersContainer.querySelectorAll('.seleccionar-pedido');
        seleccionarBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                selectedOrderId = btn.getAttribute('data-id');
                Swal.fire('Seleccionado', `Pedido ${selectedOrderId} seleccionado. Ahora puedes cambiar su estado.`, 'info');
            });
        });
    }
});
