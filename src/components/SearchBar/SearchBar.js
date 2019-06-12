import React, {Component} from 'react';
import './SearchBar.css';

class SearchBar extends Component {
  constructor(props) {
    super(props);

    const term = sessionStorage.getItem("spotifySearchTerm") || "";
    const bindThis = (fnName) => this[fnName] = this[fnName].bind(this);

    sessionStorage.removeItem("spotifySearchTerm");

    this.state = { term };

    [
      "handleSearch",
      "handleTermChange",
    ].forEach(bindThis);

    if (term.length > 0) {
      this.props["onSearch"](term);
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const term = this.state.term;
    sessionStorage.setItem("spotifySearchTerm", term);
  }

  handleTermChange(e) {
    this.setState({ term: e.target.value });
  }

  handleSearch(e) {
    this.props["onSearch"](this.state.term);
    e.preventDefault();
  }

  render() {
    return (
      <div className="SearchBar">
        <input
          placeholder="Enter A Song, Album, or Artist"
          value={this.state.term}
          onChange={this.handleTermChange}
        />
        <a onClick={this.handleSearch}>SEARCH</a>
      </div>
    );
  }
}

export default SearchBar;
