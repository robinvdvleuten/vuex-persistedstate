import { Store, MutationPayload } from 'vuex';

export default function createPersistedState(options?: Options): any;

interface Options {
    storage?: Storage;
    key?: string;
    paths?: string[];
    reducer?: (state: any, paths: string[]) => object;
    subscriber?: (store: typeof Store) => (handler: () => void) => void;
    getState?: (key: string, storage: Storage) => any;
    setState?: (key: string, state: typeof Store, storage: Storage) => void;
    filter?: (mutation: MutationPayload) => boolean;
}
