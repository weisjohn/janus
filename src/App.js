
import "./App.css";
import { Button, Card, Colors, Elevation } from "@blueprintjs/core";
import React from "react";

import Header from './Header'

export class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
    this.handleButtonClick = this.handleButtonClick.bind(this);
  }

  handleButtonClick() {
    this.setState({
      count: this.state.count + 1
    });
  }

  // start counting
  componentDidMount() {
    let that = this;
    setInterval(() => {
      // randomly skip counting
      if (!!(Math.random() > 0.5)) return;
      that.setState({
        count: this.state.count + 1,
      });
    }, 1e3);
  }

  render() {

    let { count } = this.state;
    let background = (count % 3 === 0) ? Colors.GREEN1:
      (count % 2 === 0) ? Colors.BLUE1 : Colors.RED1;

    return (
      <div className="App">
        <Header />

        <div className="App-body">
          <Card
            style={({ background })}
            className={`App-state`}
            interactive={true}
            elevation={Elevation.TWO}
          >
            <pre>{JSON.stringify(this.state)}</pre>
          </Card>
          <div />
          <Button
            className="bp3-intent-primary"
            intent="success"
            icon="plus"
            onClick={this.handleButtonClick}
            text={`Count`}
          ></Button>
        </div>
      </div>
    );
  }
}

export default App;
