/// <reference types='codeceptjs' />
type steps_file = typeof import('./steps_file');
type JsonExtendedHelper = import('./helpers/json-extended-helper');
type ChaiWrapper = import('codeceptjs-chai');

declare namespace CodeceptJS {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface SupportObject { I: I, current: any; }
  interface Methods extends REST, JSONResponse, JsonExtendedHelper, ChaiWrapper { }
  interface I extends ReturnType<steps_file>, WithTranslation<Methods> { }
  namespace Translation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface Actions { }
  }
}
