import firebase from 'firebase';

const config = {
    apiKey: "AIzaSyAuolhD4wrSJRK-p56Z5PRqO-Tfox7XnL0",
    authDomain: "chandler-pilot.firebaseapp.com",
    projectId: "chandler-pilot",
    storageBucket: "chandler-pilot.appspot.com",
    messagingSenderId: "946915974826",
    appId: "1:946915974826:web:52d200895de798882c7ad3",
    measurementId: "G-5TGVK8VQQW"
};
firebase.initializeApp(config);
export const auth = firebase.auth;
export const db = firebase.database();