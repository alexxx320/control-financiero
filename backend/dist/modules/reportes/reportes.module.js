"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const reportes_service_1 = require("./reportes.service");
const dashboard_service_1 = require("./dashboard.service");
const reportes_controller_1 = require("./reportes.controller");
const dashboard_controller_1 = require("./dashboard.controller");
const fondo_schema_1 = require("../fondos/schemas/fondo.schema");
const transaccion_schema_1 = require("../transacciones/schemas/transaccion.schema");
const fondos_module_1 = require("../fondos/fondos.module");
let ReportesModule = class ReportesModule {
};
exports.ReportesModule = ReportesModule;
exports.ReportesModule = ReportesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: fondo_schema_1.Fondo.name, schema: fondo_schema_1.FondoSchema },
                { name: transaccion_schema_1.Transaccion.name, schema: transaccion_schema_1.TransaccionSchema },
            ]),
            (0, common_1.forwardRef)(() => fondos_module_1.FondosModule),
        ],
        controllers: [
            reportes_controller_1.ReportesController,
            dashboard_controller_1.DashboardController,
        ],
        providers: [reportes_service_1.ReportesService, dashboard_service_1.DashboardService],
        exports: [reportes_service_1.ReportesService, dashboard_service_1.DashboardService],
    })
], ReportesModule);
//# sourceMappingURL=reportes.module.js.map