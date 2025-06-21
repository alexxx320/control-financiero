export declare class HealthController {
    healthCheck(): {
        status: string;
        timestamp: string;
        uptime: number;
        message: string;
    };
    detailedHealthCheck(): {
        status: string;
        timestamp: string;
        uptime: number;
        environment: string;
        version: string;
        services: {
            database: string;
            auth: string;
        };
    };
}
