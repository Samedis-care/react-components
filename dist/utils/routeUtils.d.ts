export declare const doesRouteMatch: (route: string, path: string, exact?: boolean, strict?: boolean) => boolean;
export declare const extractRouteParameters: (route: string, path: string, exact?: boolean, strict?: boolean) => Record<string, string>;
export declare const insertRouteParameters: (route: string, params: Record<string, string>) => string;
