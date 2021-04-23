import logo from './logo.svg';
import './App.css';
import { db } from "./services/firebase"
import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import { Bar } from 'react-chartjs-2';

function App() {
  return (
    <Router>
      <div>
        <Switch>
          <Route exact path="/">
            <Choice />
          </Route>
          <Route path="/admin">
            <Admin />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

const session_id = 1;

class Choice extends React.Component {
  constructor(props) {

    var isChoiceActiveString = localStorage.getItem('isChoiceActive')
    console.log(localStorage.getItem('isChoiceActive'));
    var prevChoiceName = localStorage.getItem('activeChoicename')
    console.log(localStorage.getItem('activeChoicename'));

    var isChoiceActive = true;
    if (isChoiceActiveString == 'false') {
      isChoiceActive = false
    }

    super(props);
    this.state = {
      session_id: session_id,
      isChoiceActive: isChoiceActive,
      current_choice_name: 'choice 0',
      options: ["option 1", "option 2"],
      results: [0, 0],
    }
    this.getCurrentOptions(1)
    this.getCurrentResults();
  }

  buttonBackgroundColors = [
    'white', '#5784CB'
  ]

  getOption(i) {
    const options = this.state.options;
    return options[i];
  }

  getCurrentOptions() {
    let ref = db.ref("sessions/" + this.state.session_id + "/");
    ref.on("value", snapshot => {
      const info = snapshot.val();
      var current_choice_name = info['choice-name']
      var prevChoiceName = localStorage.getItem('activeChoicename')

      if (prevChoiceName == current_choice_name) {
        this.setState({
          start_timestamp: info['start-timestamp'],
          end_timestamp: info['start-timestamp'],
          current_choice_name: current_choice_name,
          options: [info['choices'][0], info['choices'][1]],
        });
      }
      else {
        localStorage.setItem('isChoiceActive', 'true')
        localStorage.setItem('activeChoicename', current_choice_name)
        this.setState({
          start_timestamp: info['start-timestamp'],
          end_timestamp: info['start-timestamp'],
          current_choice_name: current_choice_name,
          options: [info['choices'][0], info['choices'][1]],
          isChoiceActive: true,
        });
      }
    });
  };

  getCurrentResults() {
    let ref = db.ref("responses");
    ref.on("value", snapshot => {

      var results = [0, 0]

      var current_choice_name = this.state.current_choice_name

      snapshot.forEach(function (snapshot) {
        const resp = snapshot.val()
        if (resp['choice-name'] != null && resp['choice-name'] === current_choice_name && resp['session-id'] === session_id) {
          results[resp['answer']] += 1;
        }
      });

      var backgroundColor = ['rgba(255,99,132,0.2)', 'rgba(255,99,132,0.6)']
      var hoverBackgroundColor = ['rgba(255,99,132,0.4)', 'rgba(255,99,132,1)']

      if (results[0] > results[1]) {
        backgroundColor.reverse()
        hoverBackgroundColor.reverse()
      }
      else if (results[0] === results[1]) {
        backgroundColor[0] = backgroundColor[1]
        hoverBackgroundColor[0] = hoverBackgroundColor[1]
      }

      this.setState({
        results: results,
        plotBackgroundColor: backgroundColor,
        plotHoverBackgroundColor: hoverBackgroundColor
      });
    });
  };

  sendResponse(answer) {
    localStorage.setItem('isChoiceActive', 'false')
    console.log(localStorage.getItem('isChoiceActive'));
    this.setState({
      isChoiceActive: false,
    })
    let ref = db.ref("responses/");
    ref.push({
      "answer": answer,
      "choice-name": this.state.current_choice_name,
      "timestamp": Date.now(),
      "session-id": this.state.session_id,
    });
  };

  getResponses() {
    let ref = db.ref("sessions/");
    ref.on("value", snapshot => {
      const state = snapshot.val();
      this.setState({
        options: [state[0], state[1]],
      });
    });
  };

  ChoiceDiv = () => (
    <div>
      <p id="prompt" data-text="Choose">Choose</p>
      <label id="left" for="switch" class="button">
        <button class="button" onClick={() => this.sendResponse(0)}>
          <div class="glitch" data-text={this.getOption(0)}>{this.getOption(0)}</div>
        </button>
      </label>
      <label id="right" for="switch" class="button">
        <button class="button" onClick={() => this.sendResponse(1)}>
          <div class="glitch" data-text={this.getOption(1)}>{this.getOption(1)}</div>
        </button>
      </label>
    </div>
  )

  ResultsDiv = () => (
    <div>
      <p>Results</p>
      <Bar
        data={{
          labels: this.state.options,
          datasets: [
            {
              label: '# of Votes',
              backgroundColor: this.state.plotBackgroundColor,
              borderColor: 'rgba(255,99,132,1)',
              borderWidth: 1,
              hoverBackgroundColor: this.state.plotHoverBackgroundColor,
              hoverBorderColor: 'rgba(255,99,132,1)',
              data: this.state?.results,
              font: {
                size: 50
              }
            }
          ]
        }}
        width={1200}
        height={50}
        options={{
          fontSize: 40,
          maintainAspectRatio: false,
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true,
                fontSize: 40
              }
            }],
            xAxes: [{
              ticks: {
                fontSize: 30
              }
            }]
          }
        }}
      />
    </div>
  )

  render() {
    return (
      <div className="Choice">
        <header className="Choice-header">
          {this.state.isChoiceActive ? <this.ChoiceDiv /> : <this.ResultsDiv />}
        </header>
      </div>
    );
  }
}


class Admin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      session_id: session_id,
      isChoiceActive: true,
      current_choice_name: ['choice 0'],
      options: ["option 1", "option 2"],
      results: [0, 0],
      choices: [],
    }
    this.getChoices();
    this.getCurrentOptions(1)
    this.getCurrentResults();
  }

  buttonBackgroundColors = [
    'white', '#5784CB'
  ]

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
        options: [info['choices'][0], info['choices'][1]],
        isChoiceActive: true,
      });
    });
  };

  getCurrentResults() {
    let ref = db.ref("responses");
    ref.on("value", snapshot => {

      var results = [0, 0]

      var current_choice_name = this.state.current_choice_name

      snapshot.forEach(function (snapshot) {
        const resp = snapshot.val()
        if (resp['choice-name'] != null && resp['choice-name'] === current_choice_name && resp['session-id'] === session_id) {
          results[resp['answer']] += 1;
        }
      });

      var backgroundColor = ['rgba(255,99,132,0.2)', 'rgba(255,99,132,0.6)']
      var hoverBackgroundColor = ['rgba(255,99,132,0.4)', 'rgba(255,99,132,1)']

      if (results[0] > results[1]) {
        backgroundColor.reverse()
        hoverBackgroundColor.reverse()
      }
      else if (results[0] === results[1]) {
        backgroundColor[0] = backgroundColor[1]
        hoverBackgroundColor[0] = hoverBackgroundColor[1]
      }

      this.setState({
        results: results,
        plotBackgroundColor: backgroundColor,
        plotHoverBackgroundColor: hoverBackgroundColor
      });
    });
  };

  getAllCurrentResults() {
    let ref = db.ref("responses");
    ref.once("value", snapshot => {

      var allResults = {}

      snapshot.forEach(function (snapshot) {
        const resp = snapshot.val()
        if (resp['choice-name'] != null && resp['session-id'] === session_id) {
          if (resp['choice-name'] in allResults) {
            allResults[resp['choice-name']][resp['answer']] += 1;
          }
          else {
            allResults[resp['choice-name']] = [0, 0]
            allResults[resp['choice-name']][resp['answer']] += 1;
          }
        }
      });

      this.setState({
        allResults: allResults,
      });
    });
  };

  getChoices() {
    var choices = []

    db.ref("choices").on("value", snapshot => {
      const resp = snapshot.val()

      Object.keys(resp).forEach(key => {
        choices.push({ name: key, choices: [resp[key][0], resp[key][1]] })
      });

      this.setState({
        choices: choices
      })
    });
  }

  // choices = [
  //   {},
  //   { name: "choice1", choices: ["Let Shinto salvage the pod", "Retain ownership of the pod"] },
  //   { name: "choice2", choices: ["Offer to work with Arthur", "Offer to work with Shinto"] },
  //   { name: "choice3", choices: ["Discuss solution with Shinto", "Bring solution to Claire"] }
  // ]
  setChoice(i) {
    let ref = db.ref("sessions/" + this.state.session_id + "/");
    ref.set({
      "choice-active": false,
      "choice-name": this.state.choices[i].name,
      "choices": {
        0: this.state.choices[i].choices[0],
        1: this.state.choices[i].choices[1],
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
        options: [state[0], state[1]],
      });
    });
  };

  ResultsDiv = () => (
    <div>
      <p>Results</p>
      <Bar
        data={{
          labels: this.state.options,
          datasets: [
            {
              label: '# of Votes',
              backgroundColor: this.state.plotBackgroundColor,
              borderColor: 'rgba(255,99,132,1)',
              borderWidth: 1,
              hoverBackgroundColor: this.state.plotHoverBackgroundColor,
              hoverBorderColor: 'rgba(255,99,132,1)',
              data: this.state?.results,
              font: {
                size: 50
              }
            }
          ]
        }}
        width={1200}
        height={50}
        options={{
          fontSize: 40,
          maintainAspectRatio: false,
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true,
                fontSize: 40
              }
            }],
            xAxes: [{
              ticks: {
                fontSize: 30
              }
            }]
          }
        }}
      />
    </div>
  )

  createChoiceButton(i) {
    return <button className="choice" onClick={() => this.setChoice(i)}>
      Set Choice {i + 1}
    </button>
  }

  getButtons() {
    var buttons = []
    for (var i = 0; i < this.state.choices.length; i++) {
      buttons.push(this.createChoiceButton(i))
    }
    return buttons
  }

  render() {
    return (
      <div className="Choice">
        <header className="Choice-header">
          <p>results: {JSON.stringify(this.state.results)}</p>
          <p>current choice name: {this.state.current_choice_name}</p>
          <this.ResultsDiv />
          <div>
            {/* {JSON.stringify(this.state.choices)} */}
            {this.getButtons()}
          </div>

          {/* <button className="choice" onClick={() => this.setChoice(1)}>
            Set Choice 1
          </button>
          <button className="choice" onClick={() => this.setChoice(2)}>
            Set Choice 2
          </button>
          <button className="choice" onClick={() => this.setChoice(3)}>
            Set Choice 3
          </button> */}
        </header>
      </div>
    );
  }
}






export default App;
