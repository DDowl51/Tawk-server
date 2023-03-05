function filter<Type extends Object>(
  obj: Type,
  ...allowedFields: (keyof Type)[]
) {
  const newObj: Partial<Type> = {};

  for (const key in obj) {
    if (allowedFields.includes(key) && obj.hasOwnProperty(key)) {
      newObj[key] = obj[key];
    }
  }

  return newObj;
}

export default filter;
