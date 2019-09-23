import "./App.css";
import Playlist from "../PlayList/Playlist";
import React from "react";
import SearchBar from "../SearchBar/SearchBar";
import SearchResults from "../SearchResults/SearchResults";
import Spotify from "../../util/Spotify";
import {
  append,
  applySpec,
  eqProps,
  map,
  none,
  objOf,
  path,
  prop,
  reject,
  when
} from "ramda";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      playlistName: "New Playlist",
      playlistTracks: [],
      searchResults: [],
    };

    [
      "addTrack",
      "clearPlaylist",
      "removeTrack",
      "savePlaylist",
      "search",
      "setState",
      "updatePlaylistName",
    ].forEach(fnName => this[fnName] = this[fnName].bind(this));
  }

  search(term) {
    const toSearchResult = applySpec({
      id: prop("id"),
      name: prop("name"),
      album: path(["album", "name"]),
      artist: path(["artists", 0, "name"]),
      uri: prop("uri"),
    });

    Spotify.search(term)
      .then(path(["tracks", "items"]))
      .then(map(toSearchResult))
      .then(objOf("searchResults"))
      .then(this.setState)
      .catch(console.log.bind(console));
  }

  addTrack(track) {
    const addTrackIfAbsent = when(none(eqProps("id", track)), append(track));

    this.setState({
      playlistTracks: addTrackIfAbsent(this.state.playlistTracks)
    });
  }

  removeTrack(track) {
    this.setState({
      playlistTracks: reject(eqProps("id", track), this.state.playlistTracks)
    });
  }

  updatePlaylistName(name) {
    this.setState({ playlistName: name });
  }

  savePlaylist() {
    const { playlistName, playlistTracks } = this.state;

    Spotify
      .savePlaylist(playlistName, map(prop("uri"), playlistTracks))
      .then(this.clearPlaylist)
      .catch(console.log.bind(console));
  }

  clearPlaylist() {
    this.setState({
      playlistName: "New Playlist",
      playlistTracks: [],
    });
  }

  render() {
    return (
      <div className="App">
        <h1>Ja<span className="highlight">mmm</span>ing</h1>

        <SearchBar onSearch={this.search}/>

        <div className="App-playlist">
          <SearchResults
            searchResults={this.state.searchResults}
            onAdd={this.addTrack}
          />
          <Playlist
            name={this.state.playlistName}
            tracks={this.state.playlistTracks}
            onRemove={this.removeTrack}
            onNameChange={this.updatePlaylistName}
            onSave={this.savePlaylist}
          />
        </div>
      </div>
    );
  }
}

export default App;
