import firebase from 'firebase';
import config from '../config';

const loadFirebase = () => {
    const firebaseConfig = {...config.fb};

    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    const pokemonsCollections = db.collection('pokemons');
    const usersCollections = db.collection('users');
    const encountersCollections = db.collection('encounters');
    const settingsCollections = db.collection('config');

    return {
        db,
        usersCollections,
        pokemonsCollections,
        encountersCollections,
        settingsCollections
    }
};

const fb = loadFirebase();
export default fb;
