var proto = Object.create(null, {
  constructor: {
    value: undefined,
    enumerable: false,
    writable: true
  }
});

export default function EmptyObject() {}
EmptyObject.prototype = proto;
