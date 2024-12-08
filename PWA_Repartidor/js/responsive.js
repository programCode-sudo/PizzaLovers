document.addEventListener("DOMContentLoaded", () => {
  const adjustLayout = () => {
    const isSmallScreen = window.innerWidth < 768;

    // Cambiar clase o estilos para pantallas pequeñas
    if (isSmallScreen) {
      document.querySelectorAll('.container-fluid, .container').forEach(container => {
        container.classList.add('px-3');
      });

      document.querySelectorAll('.btn-custom').forEach(button => {
        button.classList.add('btn-sm');
      });
    } else {
      document.querySelectorAll('.container-fluid, .container').forEach(container => {
        container.classList.remove('px-3');
      });

      document.querySelectorAll('.btn-custom').forEach(button => {
        button.classList.remove('btn-sm');
      });
    }
  };

  // Ajustar el diseño al cargar y al cambiar el tamaño
  adjustLayout();
  window.addEventListener("resize", adjustLayout);
});

