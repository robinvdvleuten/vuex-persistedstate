import { Store, MutationPayload } from 'vuex';

interface Options {
    key?: string;
    paths?: string[];
    reducer?: (state: any, paths: string[]) => object;
    subscriber?: (store: typeof Store) => (handler: () => void) => void;
    storage?: Storage;
    getState?: (key: string, storage: Storage) => any;
    setState?: (key: string, state: typeof Store, storage: Storage) => void;
    filter?: (mutation: MutationPayload) => boolean;
}

export default function createPersistedState(options?: Options): any;
