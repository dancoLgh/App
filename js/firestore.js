const firebaseConfig = {
  apiKey: "AIzaSyD1Fi30--0GFHnDtDMawZQKjyII2o4NgGA",
  authDomain: "kinecontrol-e1fa4.firebaseapp.com",
  projectId: "kinecontrol-e1fa4",
  storageBucket: "kinecontrol-e1fa4.appspot.com",
  messagingSenderId: "597980844561",
  appId: "1:597980844561:web:06b093ae78c14143ccd7b0",
  measurementId: "G-82ZBXB2DTC",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = firebase.firestore();
export { firebaseConfig, db };
