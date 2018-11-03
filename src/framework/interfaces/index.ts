export type ActionType = string;
export type ActionPayload = string | object | number;

export interface IAction {
  type: ActionType;
  payload: ActionPayload;
}

export interface Callback {
  (payload: ActionPayload): void;
}

export interface IHandler {
  [key: string]: Array<Callback>;
}
