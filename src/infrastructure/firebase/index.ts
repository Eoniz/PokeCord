import firebase from 'firebase';
import config from '../config';

const loadFirebase = () => {
    const firebaseConfig = {...config.fb};

    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    const pokemonsCollections = db.collection('pokemons');
    const usersCollections = db.collection('users');
    const wildCollections = db.collection('wild');

    return {
        db,
        usersCollections,
        pokemonsCollections,
        wildCollections
    }
};

const fb = loadFirebase();
export default fb;
