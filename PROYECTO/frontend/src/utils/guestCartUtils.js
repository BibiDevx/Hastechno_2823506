// src/utils/guestCartUtils.js
import { v4 as uuidv4 } from 'uuid'; // Instala uuid: npm install uuid

const GUEST_ID_KEY = 'guest_cart_id';

export const getOrCreateGuestId = () => {
  let guestId = localStorage.getItem(GUEST_ID_KEY);
  if (!guestId) {
    guestId = uuidv4();
    localStorage.setItem(GUEST_ID_KEY, guestId);
  }
  return guestId;
};

export const removeGuestId = () => {
  localStorage.removeItem(GUEST_ID_KEY);
};
