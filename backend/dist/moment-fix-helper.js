function formatearMesAño(mes, año) {
    const fecha = new Date(año, mes - 1, 1);
    return fecha.toLocaleDateString('es-ES', {
        month: 'long',
        year: 'numeric'
    });
}
function formatearMes(mes) {
    const fecha = new Date(2023, mes - 1, 1);
    return fecha.toLocaleDateString('es-ES', {
        month: 'long'
    });
}
//# sourceMappingURL=moment-fix-helper.js.map