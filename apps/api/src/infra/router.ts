type RouteMeta = {
    method: 'get' | 'post';
    path: string;
    handler: Function;
    authRequired?: boolean;
};

export const RouteRegistry = {
    routes: [] as RouteMeta[],

    get(path: string) {
        return function (...args: any[]) {
            const descriptor = args.length === 3 ? args[2] : undefined;
            if (!descriptor) throw new Error('Invalid decorator usage');
            RouteRegistry.routes.push({ method: 'get', path, handler: descriptor.value });
        };
    },

    post(path: string) {
        return function (...args: any[]) {
            const descriptor = args.length === 3 ? args[2] : undefined;
            if (!descriptor) throw new Error('Invalid decorator usage');
            RouteRegistry.routes.push({ method: 'post', path, handler: descriptor.value });
        };
    },

    authorize() {
        return function (...args: any[]) {
            const descriptor = args.length === 3 ? args[2] : undefined;
            if (!descriptor) throw new Error('Invalid decorator usage');
            const route = RouteRegistry.routes.find(r => r.handler === descriptor.value);
            if (route) route.authRequired = true;
        };
    }
};
