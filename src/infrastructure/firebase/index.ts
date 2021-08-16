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
    const inventoriesCollections = db.collection("inventories");

    return {
        db,
        usersCollections,
        pokemonsCollections,
        encountersCollections,
        settingsCollections,
        inventoriesCollections
    }
};

const fb = loadFirebase();
export default fb;
