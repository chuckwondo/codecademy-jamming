import "./Playlist.css";
import React, {Component} from "react";
import {TrackList} from "../TrackList/TrackList";

class Playlist extends Component {
  constructor(props) {
    super(props);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleSave = this.handleSave.bind(this);
  }

  handleNameChange(e) {
    this.props["onNameChange"](e.target.value);
  }

  handleSave(e) {
    this.props["onSave"]();
    e.preventDefault();
  }

  render() {
    return (
      <div className="Playlist">
        <input value={this.props.name} onChange={this.handleNameChange}/>
        <TrackList
          tracks={this.props.tracks}
          onRemove={this.props.onRemove}
          isRemoval={true}
        />
        <a className="Playlist-save" onClick={this.handleSave}>
          SAVE TO SPOTIFY
        </a>
      </div>
    );
  }
}

export default Playlist;
