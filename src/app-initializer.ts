import { inject, Injectable, OnDestroy } from "@angular/core";
import { Actions, ofType } from "@ngrx/effects";
import { InitializationStrategy } from "@ngrx-addons/common";
import { storeRehydrateAction } from "@ngrx-addons/persist-state";
import { filter, first, firstValueFrom, Observable, ReplaySubject } from "rxjs";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Strategy for waiting to sync state until we tell it we are ready.
 * We don't want to start syncing state from another tab or pushing state to another tab
 * until we have sorted out our own tab state initially.
 * That means we don't start syncing until after the app is initialized and state rehydrated.
 */
@Injectable({ providedIn: "root" })
export class ManualSyncInitialization extends InitializationStrategy implements OnDestroy {
  private initialized$ = new ReplaySubject<void>(1);

  public when(): Observable<void> {
    return this.initialized$.pipe(first());
  }

  /**
   * Mark strategy as initialized,
   * typically called after state rehydration is complete.
   */
  public startSyncing(): void {
    console.log("ManualSyncInitialization: startSyncing");
    this.initialized$.next();
  }

  public ngOnDestroy(): void {
    this.initialized$.complete();
  }
}

/**
 * Strategy for rehydrating state exactly when we tell it to.
 */
@Injectable({ providedIn: "root" })
export class ManualRehydration extends InitializationStrategy implements OnDestroy {
  private actions$ = inject(Actions);
  private initialized$ = new ReplaySubject<void>(1);

  public when(): Observable<void> {
    return this.initialized$.pipe(first());
  }

  /**
   * Mark strategy as initialized,
   * kick off rehydration of the store from the storage mechanism,
   * and wait for features to be fully rehydrated.
   */
  public async rehydrate(): Promise<void> {
    const hydrated = this.waitForHydration();

    console.log("ManualRehydration: ready to rehydrate");
    this.initialized$.next();

    await hydrated;
  }

  public ngOnDestroy(): void {
    this.initialized$.complete();
  }

  private async waitForHydration() {
    // Setup a promise immediately (before awaiting the manually fetched persisted state).
    // This way, there is no opportunity for the action to have fired before we start listening.
    const featureRehydrated$ = firstValueFrom(
      this.actions$.pipe(
        ofType(storeRehydrateAction),
        filter(({ features }) => "someFeature" in features)
      )
    );

    const persistedState = localStorage.getItem("feature@store");

    // The persist-state plugin won't fire a
    // rehydrate action if there is nothing in the DB.
    if (!persistedState) return;

    // Only await the promise now that we know it will resolve.
    await featureRehydrated$;
  }
}

export const appInitializer = async () => {
  const manualRehydrationStrategy = inject(ManualRehydration);
  const manualSyncInitialization = inject(ManualSyncInitialization);

  await sleep(2000);

  await manualRehydrationStrategy.rehydrate();
  manualSyncInitialization.startSyncing();
};
