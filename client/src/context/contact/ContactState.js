import { useReducer } from 'react';
import uuid from 'uuid';
import ContactContext from './contactContext';
import contactReducer from './contactReducer';
import {
  ADD_CONTACT,
  DELETE_CONTACT,
  SET_ALERT,
  SET_CURRENT,
  CLEAR_CURRENT,
  UPDAT_CONTACT,
  FILTER_CONTACTS,
  CLEAR_FILTER,
} from './../types';

const ContactState = (props) => {
  const initalState = {
    contacts: [
      {
        _id: '6141a48e5a27a9bdd84d220d',
        user: '614192b1e831cf3736a36569',
        name: 'Second guy',
        email: 'second@gmail.com',
        phone: '111-111-111',
        type: 'personal',
        date: '2021-09-15T07:45:18.291Z',
        __v: 0,
      },
      {
        _id: '6141a46f5a27a9bdd84d220b',
        user: '614192b1e831cf3736a36569',
        name: 'First guy',
        email: 'first@gmail.com',
        phone: '999-999-999',
        type: 'professional',
        date: '2021-09-15T07:44:47.945Z',
        __v: 0,
      },
    ],
  };

  const [state, dispatch] = useReducer(contactReducer, initalState);

  return (
    <ContactContext.Provider value={{ contacts: state.contacts }}>
      {props.children}
    </ContactContext.Provider>
  );
};

export default ContactState;
