"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FondosModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const fondos_service_1 = require("./fondos.service");
const fondos_controller_1 = require("./fondos.controller");
const fondo_schema_1 = require("./schemas/fondo.schema");
const transaccion_schema_1 = require("../transacciones/schemas/transaccion.schema");
let FondosModule = class FondosModule {
};
exports.FondosModule = FondosModule;
exports.FondosModule = FondosModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: fondo_schema_1.Fondo.name, schema: fondo_schema_1.FondoSchema },
                { name: transaccion_schema_1.Transaccion.name, schema: transaccion_schema_1.TransaccionSchema }
            ])
        ],
        controllers: [fondos_controller_1.FondosController],
        providers: [fondos_service_1.FondosService],
        exports: [fondos_service_1.FondosService],
    })
], FondosModule);
//# sourceMappingURL=fondos.module.js.map