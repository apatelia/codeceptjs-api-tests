/// <reference types='codeceptjs' />
type StepsFile = typeof import('./steps_file');
type ApiHelper = import('./helpers/api-helper');
type ChaiWrapper = import('codeceptjs-chai');

declare namespace CodeceptJS {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/naming-convention
  interface SupportObject { I: I, current: any; }
  interface Methods extends REST, JSONResponse, ApiHelper, ChaiWrapper { }
  interface I extends ReturnType<StepsFile>, WithTranslation<Methods> { }
  namespace Translation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface Actions { }
  }
}
