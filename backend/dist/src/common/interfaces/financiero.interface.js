"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrioridadAlerta = exports.TipoAlerta = exports.TipoFondo = exports.CategoriaTransaccion = exports.TipoTransaccion = void 0;
var TipoTransaccion;
(function (TipoTransaccion) {
    TipoTransaccion["INGRESO"] = "ingreso";
    TipoTransaccion["GASTO"] = "gasto";
})(TipoTransaccion || (exports.TipoTransaccion = TipoTransaccion = {}));
var CategoriaTransaccion;
(function (CategoriaTransaccion) {
    CategoriaTransaccion["ALIMENTACION"] = "alimentacion";
    CategoriaTransaccion["TRANSPORTE"] = "transporte";
    CategoriaTransaccion["ENTRETENIMIENTO"] = "entretenimiento";
    CategoriaTransaccion["SALUD"] = "salud";
    CategoriaTransaccion["EDUCACION"] = "educacion";
    CategoriaTransaccion["HOGAR"] = "hogar";
    CategoriaTransaccion["ROPA"] = "ropa";
    CategoriaTransaccion["TECNOLOGIA"] = "tecnologia";
    CategoriaTransaccion["VIAJES"] = "viajes";
    CategoriaTransaccion["OTROS"] = "otros";
    CategoriaTransaccion["SALARIO"] = "salario";
    CategoriaTransaccion["FREELANCE"] = "freelance";
    CategoriaTransaccion["INVERSIONES"] = "inversiones";
    CategoriaTransaccion["REGALOS"] = "regalos";
})(CategoriaTransaccion || (exports.CategoriaTransaccion = CategoriaTransaccion = {}));
var TipoFondo;
(function (TipoFondo) {
    TipoFondo["REGISTRO"] = "registro";
    TipoFondo["AHORRO"] = "ahorro";
})(TipoFondo || (exports.TipoFondo = TipoFondo = {}));
var TipoAlerta;
(function (TipoAlerta) {
    TipoAlerta["INFO"] = "info";
    TipoAlerta["ADVERTENCIA"] = "advertencia";
    TipoAlerta["ERROR"] = "error";
    TipoAlerta["EXITO"] = "exito";
})(TipoAlerta || (exports.TipoAlerta = TipoAlerta = {}));
var PrioridadAlerta;
(function (PrioridadAlerta) {
    PrioridadAlerta["BAJA"] = "baja";
    PrioridadAlerta["MEDIA"] = "media";
    PrioridadAlerta["ALTA"] = "alta";
})(PrioridadAlerta || (exports.PrioridadAlerta = PrioridadAlerta = {}));
//# sourceMappingURL=financiero.interface.js.map