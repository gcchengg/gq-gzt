export const getQueryStringGcc = (name) =>
  new URLSearchParams(window.location.search).get(name);

export const getUserInfo = () => ({ loginName: "hezhen", name: "何震" });

export const nanoid = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const uniqBy = (list, key) =>
  Array.from(new Map(list.map((item) => [item[key], item])).values());
