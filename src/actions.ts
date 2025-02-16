import { ReadLog } from './db.ts';

export const ACTIONS = {
  GET_PAGE_DATA: 'GET_PAGE_DATA',
  OPEN_LOG: 'OPEN_LOG',
} as const;

type ActionNames = keyof typeof ACTIONS;

export type ActionBase<T extends ActionNames, P = undefined> = P extends undefined ? {
  type: T;
} : {
  type: T;
  payload: P;
};

export type Action = ActionBase<'OPEN_LOG', ReadLog> | ActionBase<'GET_PAGE_DATA'>;

