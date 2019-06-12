import React, {Component} from "react";
import "./Track.css";

export class Track extends Component {
  constructor(props) {
    super(props);
    this.addTrack = this.addTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
  }

  addTrack() {
    this.props.onAdd(this.props.track);
  }

  removeTrack() {
    this.props.onRemove(this.props.track);
  }

  render() {
    const [onClickHandler, buttonText] = this.props.isRemoval
      ? [this.removeTrack, "-"]
      : [this.addTrack, "+"];

    return (
      <div className="Track">
        <div className="Track-information">
          <h3>{this.props.track.name}</h3>
          <p>{this.props.track.artist} | {this.props.track.album}</p>
        </div>
        <a className="Track-action" onClick={onClickHandler}>
          {buttonText}
        </a>
      </div>
    );
  }
}
