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

import baby_yoda from './images/baby_yoda.jpeg'
import chandler_oppenheimer from './images/chandler_oppenheimer.webp'
import christine_sage from './images/christine_sage.png'
import david_brian_alley from './images/david_brian_alley.jpg'
import helen_garcia_alton from './images/helen_garcia_alton.jpeg'
import jacob_frye from './images/jacob_frye.jpg'
import lacuna_title from './images/lacuna_title.png'

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
          <Route path="/bios">
            <Bios />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

const session_id = 2;

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

      var backgroundColor = ['rgba(128, 147, 166,0.2)', 'rgba(128, 147, 166,0.6)']
      var hoverBackgroundColor = ['rgba(128, 147, 166,0.4)', 'rgba(128, 147, 166,1)']

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

  WaitingDiv = () => (
    <div id="waitingDiv">
    </div >
  )

  ClosingDiv = () => (
    <div id="closingDiv">
      <p id="prompt" data-text="Thanks for watching!">Thanks for watching!</p>
      <a href="bios" id="bios-link">View the Production Team</a>
    </div >
  )

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
              borderColor: 'rgba(128, 147, 166,1)',
              borderWidth: 1,
              hoverBackgroundColor: this.state.plotHoverBackgroundColor,
              hoverBorderColor: 'rgba(128, 147, 166,1)',
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

  getCorrectPage(choicename, isChoiceActive) {
    if (choicename === "begin") {
      return < this.WaitingDiv />
    }
    else if (choicename === "end") {
      return < this.ClosingDiv />
    }
    else if (isChoiceActive) {
      return <this.ChoiceDiv />
    }
    else {
      return <this.ResultsDiv />
    }
  }

  render() {
    return (
      <div className="Choice">
        <header className="Choice-header">
          {this.getCorrectPage(this.state.current_choice_name, this.state.isChoiceActive)}
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
      current_choice_name: 'choice 0',
      options: ["option 1", "option 2"],
      results: [0, 0],
      allResults: [],
      choices: [],
    }
    this.getChoices();
    this.getCurrentOptions(1)
    // this.getCurrentResults();
    this.getAllCurrentResults();
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
      // this.getCurrentResults();
      this.getAllCurrentResults();
    });
  };

  // getCurrentResults() {
  //   let ref = db.ref("responses");
  //   ref.on("value", snapshot => {

  //     var results = [0, 0]

  //     var current_choice_name = this.state.current_choice_name

  //     snapshot.forEach(function (snapshot) {
  //       const resp = snapshot.val()
  //       if (resp['choice-name'] != null && resp['choice-name'] === current_choice_name && resp['session-id'] === session_id) {
  //         results[resp['answer']] += 1;
  //       }
  //     });

  //     var backgroundColor = ['rgba(128, 147, 166,0.2)', 'rgba(128, 147, 166,0.6)']
  //     var hoverBackgroundColor = ['rgba(128, 147, 166,0.4)', 'rgba(128, 147, 166,1)']

  //     if (results[0] > results[1]) {
  //       backgroundColor.reverse()
  //       hoverBackgroundColor.reverse()
  //     }
  //     else if (results[0] === results[1]) {
  //       backgroundColor[0] = backgroundColor[1]
  //       hoverBackgroundColor[0] = hoverBackgroundColor[1]
  //     }

  //     this.setState({
  //       results: results,
  //       plotBackgroundColor: backgroundColor,
  //       plotHoverBackgroundColor: hoverBackgroundColor
  //     });
  //   });
  // };

  getAllCurrentResults() {
    let ref = db.ref("responses");
    ref.on("value", snapshot => {

      var allResults = []
      console.log(this.state.choices.length)
      if (this.state.choices.length === 0) return;
      for (var i = 0; i < this.state.choices.length; i++) {
        allResults.push([0, 0])
      }
      console.log(allResults)

      snapshot.forEach(function (snapshot) {
        const resp = snapshot.val()
        if (resp['choice-name'] != null && resp['session-id'] === session_id) {
          var num = parseInt(resp['choice-name'][resp['choice-name'].length - 1]);
          console.log(num)
          allResults[num][resp['answer']] += 1
          // if (resp['choice-name'] in allResults) {
          //   allResults[resp['choice-name']][resp['answer']] += 1;
          // }
          // else {
          //   allResults[resp['choice-name']] = [0, 0]
          //   allResults[resp['choice-name']][resp['answer']] += 1;
          // }
        }
      });

      console.log(allResults)

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

  createBarChart(i, allResults) {
    return <Bar
      data={{
        labels: this.state.choices == [] ? this.state.options : this.state.choices[i].choices,
        datasets: [
          {
            label: '# of Votes for choice ' + i,
            backgroundColor: this.state.plotBackgroundColor,
            borderColor: 'rgba(128, 147, 166,1)',
            borderWidth: 1,
            hoverBackgroundColor: this.state.plotHoverBackgroundColor,
            hoverBorderColor: 'rgba(128, 147, 166,1)',
            data: allResults[i],
            font: {
              size: 25
            }
          }
        ]
      }}
      width={800}
      height={300}
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
  }

  getResultsCharts(allResults) {
    var charts = []
    console.log(allResults)
    for (var i = 0; i < allResults.length; i++) {
      charts.push(<div class="grid-item">{this.createBarChart(i, allResults)}</div>)
    }
    return charts
  }

  ResultsDiv = () => (
    <div>
      <div className="grid-container">
        {this.getResultsCharts(this.state.allResults)}
      </div>

    </div>
  )

  createChoiceButton(i) {
    return <button className="choice" onClick={() => this.setChoice(i)}>
      {this.state.choices[i].name}
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

class Bios extends React.Component {
  render() {
    return (
      <div className="Bios">
        <header className="Bios-header">
        </header>
        <div className="Bios-body">
          <div id="bios">
            <p id="bios-title">Lacuna Production Team</p>
            <div id="bio">
              <p id="title">Director, Producer, Story Idea, Director of Photography, Editor, VFX, Sound Design - Chandler Oppenheimer</p>
              <div>
                <a href="https://www.Oppenheimeraudio.com/"><img src={chandler_oppenheimer} /></a>
                <p id="description">Chandler is currently earning their Masters for Theatrical Sound & Digital Media Design at the University of Tennessee. Recently was Sound Designer for Clarence Brown Theatre’s productions of Blithe Spirit, Exit Pursued by a Bear, and Detroit ‘67 as well as Utah Shakespeare Festival’s production of Every Brilliant Thing. Projections Designer for UT Opera’s Carmen and Clarence Brown Theatre’s canceled production of A Gentlemen’s Guide to Love and Murder. Chandler was also Director of Photography and Video Editor for A Christmas Memory and Video Editor for Clarence Brown Theatre’s virtual production of Airness. They will continue finding new inventive ways to tell compelling stories that can reach wider audiences.</p>
              </div>
            </div>
            <div id="bio">
              <p id="title">Playwright - Artie Kaye</p>
              <div>
                <p id="description">Artie Kaye has written all of their life, having created many short stories, film scripts, and one act plays. This is their first full length play. Bolstered by the enjoyment of this project, they've begun work on their first video game script.</p>
              </div>
            </div>
            <div id="bio">
              <p id="title">Protagonist - Christine Sage</p>
              <div>
                <img src={christine_sage} />
                <p id="description">Christine Sage is delighted to be part of this creative production. At the CBT she recently played Ruth in Blithe Spirit and Mrs. Cratchit in A Christmas Carol. She comes from Los Angeles, where she won an Ovation Award for her performance in Shakespeare’s The Tempest. In California she is a company member with The Porters of Hellsgate and Sacred Fools Theater. She’d like to thank her parents as well as all the teachers who have helped her grow as an artist and as a person.</p>
              </div>
            </div>
            <div id="bio">
              <p id="title">Antagonist - David Brian Alley</p>
              <div>
                <img src={david_brian_alley} />
                <p id="description">David has been a professional actor since 1990 and joined the UT Theatre faculty as an Artist-in-Residence in 2001. Now a Senior Lecturer, he teaches Acting and Play Analysis in the Undergraduate program, and performs regularly with the Clarence Brown Theatre Company.  He also coaches dialect.
                David holds an MFA in Theatre-Performance and a BA in Theatre from UT, as well as an AA in Acting from the American Academy of Dramatic Arts in Los Angeles. He also studied at South Coast Repertory’s Professional Conservatory in Costa Mesa, CA.
David earned his Actor’s Equity Card at the Mark Taper Forum in Los Angeles in 1990, where he worked with the Taper’s Improvisational Theatre Project, and also appeared as an Attendant in the West Coast Premiere of Miss Evers’ Boys. In Chicago, he appeared with House Team Faulty Wiring at the iO Theatre for a two-year run, where he played, on occasion, with Tina Fey and Amy Poehler. David has performed in 55 productions at the CBT with King Charles III, The 39 Steps, Santaland Diaries, Titus Andronicus, ‘Art’, Stones in His Pockets, Copenhagen, and Moonlight & Magnolias being among his favorites. Regionally, David has performed at PlayMakers Repertory in Chapel Hill, NC. Film: Light from Light; The Heart is Deceitful; Gina: An Actress Age 29 (which won the 2001 Short Film Jury Award at the Sundance Film Festival); Something, Anything.  TV:  Women of the Movement (ABC); Snapped; It’s a Miracle; Unsolved Mysteries.</p>
              </div>
            </div>
            <div id="bio">
              <p id="title">Lighting Design and PA - Helen Garcia-Alton</p>
              <div>
                <a href="https://www.helengarcia-alton.com"><img src={helen_garcia_alton} /></a>
                <p id="description">Helen Garcia-Alton is a third-year graduate candidate in Lighting Design at the University of Tennessee, Knoxville. Recent designs include: The Hacking of Nezar Scorge (52nd Street New Horizons Theatre), Persephone (GO! Contemporary Dance Works) and Forging Ahead (GO! Contemporary Dance Works). Thank you Chandler, for the trust, and the opportunity to work in a new medium. </p>
              </div>
            </div>
            <div id="bio">
              <p id="title">Web Application Programmer - Jacob Frye</p>
              <div>
                {/* <img src={jacob_frye} /> */}
                <p id="description">Jacob Frye is a professional software developer, working for Neaera Consulting and Virginia Tech Transportation Institute. Recent website/development projects include creating a Work Zone Data Collection Tool, developing a data processing network in AWS, developing a mobile survey app for the Arapaho Nation Tribe, and updating a forecasting web application for New Belgium Brewing. </p>
              </div>
            </div>
            <div id="bio">
              <p id="title">Additional Voices - Michael Najman</p>
            </div>
            <div id="bio">
              <p id="title">Prop Prosthetic - DJ Pike</p>
            </div>
            <p id="title">Special Thanks to Joe Payne, Bill Miller, Owl, various Discord servers.</p>
          </div>
        </div>
      </div>
    );
  }
}






export default App;
