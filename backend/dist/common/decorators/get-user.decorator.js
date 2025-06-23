"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUser = void 0;
const common_1 = require("@nestjs/common");
exports.GetUser = (0, common_1.createParamDecorator)((property, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return property ? user?.[property] : user;
});
//# sourceMappingURL=get-user.decorator.js.map