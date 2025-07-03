export declare class HealthController {
    healthCheck(): {
        status: string;
        timestamp: string;
        uptime: number;
        message: string;
        version: string;
        endpoints: {
            api: string;
            auth: string;
            docs: string;
        };
    };
    detailedHealthCheck(): {
        status: string;
        timestamp: string;
        api: string;
        database: string;
        environment: string;
    };
}
