import logo from './logo.svg';
import './App.css';
import { db } from "./services/firebase"
import React from 'react';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      session_id: 1,
      current_choice_name: ['choice 0'],
      options: ["option 1", "option 2"],
      results: []
    }
    this.getCurrentOptions(1)
    this.getCurrentResults();
  }

  getOption(i) {
    const options = this.state.options;
    return options[i];
  }

  getCurrentOptions() {
    let ref = db.ref("sessions/" + this.state.session_id + "/");
    ref.on("value", snapshot => {
      const info = snapshot.val();
      this.setState({
        start_timestamp: info['start-timestamp'],
        end_timestamp: info['start-timestamp'],
        current_choice_name: info['choice-name'],
        options: [info['choices'][0], info['choices'][1]]
      });
    });
  };

  getCurrentResults() {
    let ref = db.ref("responses");
    ref.on("value", snapshot => {

      var results = {
        "choice1": { choices: ["Let Shinto salvage the pod", "Retain ownership of the pod"], results: [0, 0] },
        "choice2": { choices: ["Offer to work with Arthur", "Offer to work with Shinto"], results: [0, 0] },
        "choice3": { choices: ["Discuss solution with Shinto", "Bring solution to Claire"], results: [0, 0] }
      };

      snapshot.forEach(function (snapshot) {
        const resp = snapshot.val()
        if (resp['choice-name'] != null) {
          results[resp['choice-name']]['results'][resp['answer']] += 1;
        }
      });

      this.setState({
        results: JSON.stringify(results),
      });
    });
  };

  sendResponse(answer) {
    let ref = db.ref("responses/");
    ref.push({
      "answer": answer,
      "choice-name": this.state.current_choice_name,
      "timestamp": Date.now(),
      "session-id": this.state.session_id
    });
  };

  choices = [
    {},
    { name: "choice1", choices: ["Let Shinto salvage the pod", "Retain ownership of the pod"] },
    { name: "choice2", choices: ["Offer to work with Arthur", "Offer to work with Shinto"] },
    { name: "choice3", choices: ["Discuss solution with Shinto", "Bring solution to Claire"] }
  ]
  setChoice(i) {
    let ref = db.ref("sessions/" + this.state.session_id + "/");
    ref.set({
      "choice-active": false,
      "choice-name": this.choices[i].name,
      "choices": {
        0: this.choices[i].choices[0],
        1: this.choices[i].choices[1]
      },
      "start-timestamp": 0,
      "end-timestamp": 0
    });
  };

  getResponses() {
    let ref = db.ref("sessions/");
    ref.on("value", snapshot => {
      const state = snapshot.val();
      this.setState({
        options: [state[0], state[1]]
      });
    });
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          {/* <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a> */}
          <p>results: {this.state.results}</p>
          <p>current choice name: {this.state.current_choice_name}</p>
          <p>What will you choose??</p>
          <button onClick={() => this.sendResponse(0)}>
            {this.getOption(0)}
          </button>
          <button onClick={() => this.sendResponse(1)}>
            {this.getOption(1)}
          </button>
        </header>

        <button onClick={() => this.setChoice(1)}>
          Set Choice 1
        </button>
        <button onClick={() => this.setChoice(2)}>
          Set Choice 2
        </button>
        <button onClick={() => this.setChoice(3)}>
          Set Choice 3
        </button>
      </div>
    );
  }
}

export default App;
