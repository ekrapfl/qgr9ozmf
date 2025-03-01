import {
  localStorageStrategy,
  providePersistState,
} from '@ngrx-addons/persist-state';
import { includeKeys } from '@ngrx-addons/common';
import { provideSyncState } from '@ngrx-addons/sync-state';
import {
  createAction,
  createFeature,
  createReducer,
  on,
  provideState,
} from '@ngrx/store';

export const globalAction = createAction('[All] Global Action');

const state = { a: 0 };

export const feature = createFeature({
  name: 'someFeature',
  reducer: createReducer(
    state,
    on(globalAction, (state) => {
      console.log('Reducer A');
      return {
        ...state,
        a: state.a + 1,
      };
    })
  ),
});

export const featureAProviders = [
  provideState(feature),
  providePersistState({
    key: feature.name,
    states: [
      {
        storage: localStorageStrategy,
        storageKey: "feature@store",
      },
    ],
  }),
  provideSyncState<typeof state>({
    key: feature.name,
    states: [
      {
        // Neither of these settings seem to make a difference, really.
        // The issue persists with either, both, or neither of these settings enabled.
        source: (state$) => state$.pipe(includeKeys(['a'])),
        // skip: 0,
      },
    ],
  }),
];
