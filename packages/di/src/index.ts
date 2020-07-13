/* eslint-disable @typescript-eslint/no-explicit-any */

export type ObjectType<T = {}> = new (...args: any[]) => T;
export type PrivateReader<T, K> = (d: NonNullable<T>) => K;
export type MethodDecoratorArguments = [
  Record<string, unknown>,
  string | symbol,
  TypedPropertyDescriptor<unknown>
];
export type ObjectUnion<T = {}> = T | ObjectType<T> | InjectionToken<T>;

export interface Options {
  providers: ObjectUnion[];
}
export class InjectionToken<T> {}

let C = new WeakMap();

const safeHandle = <T>(c: ObjectType<T>) =>
  c.prototype && c.prototype.constructor ? new c() : c;

export function get<T>(c: ObjectUnion<T>): T;
export function get<T>(c: ObjectType<T>): T {
  return C.get(c);
}
export function has<T>(c: ObjectUnion<T>): boolean;
export function has<T>(c: ObjectType<T>): boolean {
  return !!C.has(c);
}
export function set<T>(c: T | ObjectType<T>, k?: ObjectUnion<T>): T;
export function set<T>(c: ObjectType<T>, k?: ObjectUnion<T>): T {
  return C.has(c) ? C.get(c) : C.set(k ? k : c, safeHandle(c)).get(k ? k : c);
}

export function remove<T>(c: T | ObjectType<T>): boolean;
export function remove<T>(c: ObjectType<T>) {
  return C.delete(c);
}

export const clear = function() {
  C = new WeakMap();
};

export type Reader<T, K> = (d?: T) => K;
export function Reader<T>(...di: ObjectType<unknown>[]): MethodDecorator {
  return (...[, , desc]: MethodDecoratorArguments) => {
    const o = desc.value as Function;
    desc.value = function(...args: unknown[]) {
      return () => o.apply(this, args)(di.map(p => set(p)));
    };
  };
}
export const Metadata = new WeakMap<
  ObjectUnion,
  Array<[number, ObjectUnion]>
>();

export const defineGetter = (
  target: ObjectUnion,
  name: string | number,
  identifier: ObjectUnion
) =>
  Object.defineProperty(target, name, {
    get: () => set(identifier),
    configurable: true
  });

export function Inject<T>(identifier: ObjectUnion<T>): any;
export function Inject<T>(identifier: ObjectUnion<T>): PropertyDecorator;
export function Inject<T>(identifier: ObjectType<T>): PropertyDecorator {
  return (
    target,
    name: string,
    index?: number,
    params = Metadata.get(target) || []
  ) => {
    if (name) {
      defineGetter(target, name, identifier);
    } else {
      params.push([index, identifier]);
      Metadata.set(target, params);
    }
  };
}

export const defineMetaInjectors = (
  args: any[],
  metadata: [number, ObjectUnion][] = []
) => {
  for (const [index, identifier] of metadata) {
    defineGetter(args, index, identifier);
  }
};

export const getReflection = <T>(Base: Function) =>
  (
    (Reflect['getMetadata'] &&
      (Reflect['getMetadata']('design:paramtypes', Base) as ObjectUnion<
        T
      >[])) ||
    []
  ).map((identifier, index) => [index, identifier]) as [number, ObjectUnion][];

export const createDecorator = (options?: Options) => <
  K extends new (...args: any[]) => {}
>(
  Base: K
) =>
  class extends Base {
    constructor(...args: any[]) {
      args =
        options && options.providers && options.providers.length
          ? options.providers
          : args;
      if (!args.length) {
        defineMetaInjectors(args, getReflection(Base));
        defineMetaInjectors(args, Metadata.get(Base));
      }
      super(...args);
    }
  };

export const Injectable = (options?: Options) => createDecorator(options);
