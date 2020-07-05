import { AxiosRequestConfig } from 'axios';
import {
    Reducer,
    useCallback,
    useDebugValue,
    useEffect,
    useReducer,
    useRef,
} from 'react';
import {
    Actions,
    createActionCreators,
    createReducerFunction,
    ImmerReducer,
} from 'immer-reducer';
import { castDraft } from 'immer';

import instance from '../api/instance';

export default function useRequest<TResponse>(config: AxiosRequestConfig) {
    const configRef = useRef(config);

    useDebugValue(
        configRef.current,
        (c) => `Request(${c.method ?? ''} ${c.url ?? ''})`,
    );

    const [state, dispatch] = useReducer<
        Reducer<State<TResponse>, Actions<typeof RequestReducer>>
    >(reducer, initialState);

    const perform = useCallback(
        (
            data?: unknown,
            { removeOldData = false }: { removeOldData?: boolean } = {},
        ) => {
            (async () => {
                dispatch(actions.setInProgress({ removeOldData }));
                const curConfig = configRef.current;
                if (data) {
                    curConfig.data = data;
                }
                const response = await instance.request<TResponse>(curConfig);
                dispatch(actions.setFulfilled(response.data));
            })().catch((e) => {
                dispatch(actions.setRejected(e));
            });
        },
        [configRef],
    );

    useEffect(() => {
        configRef.current = config;
    }, [config]);

    return {
        state,
        perform,
    } as const;
}

export type State<T> =
    | {
          status: 'PENDING';
          data?: T;
          error?: Error;
      }
    | {
          status: 'IN_PROGRESS';
          data?: T;
          error?: Error;
      }
    | {
          status: 'FULFILLED';
          data: T;
          error?: Error;
      }
    | {
          status: 'REJECTED';
          data?: T;
          error: Error;
      };

const initialState: State<any> = {
    status: 'PENDING',
};

class RequestReducer<T> extends ImmerReducer<State<T>> {
    setInProgress({ removeOldData }: { removeOldData: boolean }) {
        this.draftState.status = 'IN_PROGRESS';
        if (removeOldData) {
            this.draftState.data = undefined;
        }
    }

    setFulfilled(data: T) {
        this.draftState.status = 'FULFILLED';
        this.draftState.data = castDraft(data);
    }

    setRejected(e: Error) {
        this.draftState.status = 'REJECTED';
        this.draftState.error = e;
    }
}

const actions = createActionCreators(RequestReducer);
const reducer = createReducerFunction(RequestReducer, initialState);
