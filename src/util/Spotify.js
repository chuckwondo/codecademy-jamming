import {join} from "ramda";

const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const redirectUri = "http://localhost:3000/";
let authorization = [];

function buildUrl(url, queryParams) {
  const queryString = Object.entries(queryParams).map(join("=")).join("&");
  return queryString.length > 0 ? `${url}?${queryString}` : url;
}

function matchAll(re, str, matches = []) {
  const match = str.match(re);

  return (match === null)
    ? matches
    : matchAll(re, str.substring(match.index + match[0].length),
      [...matches, match]);
}

function parseParams(paramsString) {
  return matchAll(/([^?#&=]+)=([^?#&=]*)/, paramsString)
    .map(([, name, value]) => ({ [name]: decodeURIComponent(value) }))
    .reduce((params, param) => ({ ...params, ...param }), {});
}

function parseAuthorization(paramsString) {
  const params = parseParams(paramsString);
  return params["access_token"] === undefined
    ? Promise.reject(`No access token: ${paramsString}`)
    : Promise.resolve(params);
}

function clearAuthorization() {
  authorization = [];
}

function setAuthorization(auth) {
  const { token_type, access_token, expires_in } = auth;

  setTimeout(() => clearAuthorization(), parseInt(expires_in) * 1000);
  window.history.pushState(null, "Fetch Access Token", "/");

  return authorization = [token_type, access_token]
}

function authorize(reason) {
  window.location = buildUrl(Spotify.endpoints.authorize, {
    client_id: clientId,
    response_type: "token",
    redirect_uri: redirectUri,
    scope: "playlist-modify-public",
  });

  return Promise.reject(reason);
}

const getAuthorization = () => {
  // Get local reference in case authorization is cleared between the length
  // check and the Promise.resolve invocation.
  const auth = authorization;

  return auth.length === 2
    ? Promise.resolve(auth)
    : parseAuthorization(window.location.hash)
      .then(setAuthorization, authorize);
};

const getRequestHeaders = () =>
  getAuthorization().then(([type, token]) => ({
    Accept: "application/json",
    Authorization: `${type} ${token}`,
    "Content-Type": "application/json",
  }));

const toJsonOrReject = (rejectReason) =>
  (response) => {
    const errorMessage = (json) =>
      json["error_description"] || json["error"]["message"] || "Unknown error";

    return response.json()
      .then(json => response.ok
        ? Promise.resolve(json)
        : Promise.reject(`${rejectReason}: ${errorMessage(json)}`));
  };

const Spotify = {
  endpoints: {
    authorize: "https://accounts.spotify.com/authorize",
    me: "https://api.spotify.com/v1/me",
    playlists: (id) => `https://api.spotify.com/v1/users/${id}/playlists`,
    playlistTracks: (id) => `https://api.spotify.com/v1/playlists/${id}/tracks`,
    search: "https://api.spotify.com/v1/search",
  },

  search: function (term) {
    const queryParams = { q: term, type: "track", limit: 10, };
    const endpoint = buildUrl(this.endpoints.search, queryParams);

    return getRequestHeaders()
      .then(headers => fetch(endpoint, { headers }))
      .then(toJsonOrReject("Authorization failed"))
      .catch(reason => {
        clearAuthorization();
        return Promise.reject(reason);
      });
  },

  savePlaylist: function (name, trackUris) {
    let cachedHeaders;

    return getRequestHeaders()
      .then(headers => cachedHeaders = headers)
      .then(headers => fetch(this.endpoints.me, { headers }))
      .then(toJsonOrReject("Failed to fetch current user"))
      .then(json => fetch(this.endpoints.playlists(json.id), {
        headers: cachedHeaders,
        method: "POST",
        body: JSON.stringify({
          name
        }),
      }))
      .then(toJsonOrReject(`Failed to create playlist '${name}'`))
      .then(json => fetch(this.endpoints.playlistTracks(json.id), {
        headers: cachedHeaders,
        method: "POST",
        body: JSON.stringify({
          uris: trackUris,
        })
      }))
      .then(toJsonOrReject(`Failed to add tracks to playlist '${name}'`))
  }
};

export default Spotify;
