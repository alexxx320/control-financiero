"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceInfoDecorator = void 0;
const common_1 = require("@nestjs/common");
const crypto = require("crypto");
exports.DeviceInfoDecorator = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const userAgent = request.headers['user-agent'] || 'Unknown';
    const xForwardedFor = request.headers['x-forwarded-for'];
    const ipAddress = (Array.isArray(xForwardedFor) ? xForwardedFor[0] : xForwardedFor?.split(',')[0]) ||
        request.connection.remoteAddress ||
        request.ip ||
        'Unknown';
    let deviceId = request.headers['x-device-id'];
    if (!deviceId) {
        deviceId = crypto
            .createHash('sha256')
            .update(userAgent + ipAddress + (request.headers['accept-language'] || ''))
            .digest('hex')
            .substring(0, 32);
    }
    const fingerprint = crypto
        .createHash('sha256')
        .update([
        userAgent,
        request.headers['accept-language'],
        request.headers['accept-encoding'],
        request.headers['accept'],
        ipAddress
    ].join('|'))
        .digest('hex');
    return {
        deviceId,
        fingerprint,
        userAgent,
        ipAddress: ipAddress.replace('::ffff:', ''),
        location: request.headers['cf-ipcountry'] || undefined
    };
});
//# sourceMappingURL=device-info.decorator.js.map