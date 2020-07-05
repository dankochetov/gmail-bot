export type EnvVarName =
    | 'DB_URL'
    | 'GOOGLE_CLIENT_ID'
    | 'GOOGLE_CLIENT_SECRET'
    | 'PORT';

export type EnvFlagName = never;

export class EnvService {
    static getEnvVar(
        name: EnvVarName | EnvFlagName,
        defaultValue?: string,
    ): string {
        const res = process.env[name] ?? defaultValue;
        if (typeof res === 'undefined') {
            throw new Error(`Environment variable '${name}' is not defined`);
        }
        return res;
    }

    static getEnvFlag(name: EnvFlagName): boolean {
        const str = EnvService.getEnvVar(name, '0');
        return ['1', 'true'].includes(str);
    }
}
