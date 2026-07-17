const request = async (url, options = {}) => {
  const response = await fetch(url, options);
  const contentType = response.headers.get("content-type") || "";

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.blob();
};

const appendParams = (url, params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, value);
    }
  });
  const query = searchParams.toString();
  return query ? `${url}${url.includes("?") ? "&" : "?"}${query}` : url;
};

const client = (config) =>
  request(appendParams(config.url, config.params), {
    method: config.method || "get",
  });

client.get = (url, config = {}) => request(appendParams(url, config.params));

client.post = (url, data) =>
  request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data || {}),
  });

export default client;
