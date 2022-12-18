export type Constructor<T> = new (...args: any[]) => T;
export type CallbackType = (...args: any[]) => any;
export type GenericDict = { [name: string]: any };

export interface ClassInterface<InstanceClass> extends Function {
  new (...args: any[]): InstanceClass;
}



