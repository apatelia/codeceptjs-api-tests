/// <reference types='codeceptjs' />
type steps_file = typeof import('./steps_file');

declare namespace CodeceptJS {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface SupportObject { I: I, current: any; }
  interface Methods extends REST, JSONResponse { }
  interface I extends ReturnType<steps_file>, WithTranslation<Methods> { }
  namespace Translation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface Actions { }
  }
}
