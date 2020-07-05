import { EntityManager, getManager } from 'typeorm';
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel';

interface PostgresError extends Error {
    code: string;
}

export function isPostgresError(e: Error): e is PostgresError {
    return 'code' in e;
}

export async function transactionWithRetry<T>(
    isolationLevel: IsolationLevel,
    fn: (manager: EntityManager) => Promise<T>,
    {
        retriesLeft = 5,
        manager,
    }: {
        retriesLeft?: number;
        manager?: EntityManager;
    } = {},
): Promise<T> {
    const transactionPromise = (async () => {
        if (manager) {
            return fn(manager);
        }
        return getManager().transaction(isolationLevel, fn);
    })();

    return transactionPromise.catch(async (error: Error) => {
        if (
            /*
                Set of conditions for retrying the transaction
                We should only retry Postgres errors related to transactions concurrency
             */
            retriesLeft > 1 &&
            /*
                Error class 40 — Transaction Rollback
                https://www.postgresql.org/docs/9.6/errcodes-appendix.html
             */
            isPostgresError(error) &&
            error.code.startsWith('40')
        ) {
            return transactionWithRetry(isolationLevel, fn, {
                manager,
                retriesLeft: retriesLeft - 1,
            });
        }

        throw error;
    });
}

export async function serializableTransactionWithRetry<T>(
    fn: (manager: EntityManager) => Promise<T>,
    {
        manager,
        retries,
    }: {
        manager?: EntityManager;
        retries?: number;
    } = {},
): Promise<T> {
    return transactionWithRetry('SERIALIZABLE', fn, {
        manager,
        retriesLeft: retries,
    });
}
