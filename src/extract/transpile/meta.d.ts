export interface ITranspilerWrapper {
  isAvailable: () => boolean;
  transpile: (
    pSource: string,
    pFileName?: string,
    pTranspilerOptions?: any
  ) => string;
}

export function getWrapper(pExtension, pTranspileOptions): ITranspilerWrapper;

export interface IAvailableExtension {
  extension: string;
  avaialble: boolean;
}
export const scannableExtensions: IAvailableExtension;

export const allExtensions: string[];

export interface IAvailableTranspiler {
  name: string;
  version: string;
  available: boolean;
}

export function getAvailableTranspilers(): IAvailableTranspiler[];
