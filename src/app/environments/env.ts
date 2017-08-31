import { Injectable } from '@angular/core';

@Injectable()
export class Env {
  private productionState: boolean;

  setProductionState (state: boolean) {
    this.productionState = state;
  }

  isInProduction(): boolean {
    console.log ('Production state is now ' + this.productionState);
    return this.productionState;
  }
}
