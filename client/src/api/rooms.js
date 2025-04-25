import axios from './axiosInstance';

export const fetchRooms = () => axios.get('/izba/read');
export const insertRoom = (data) => axios.post('/izba/insert', data);
export const deleteRoom = (id_izba) => axios.post('/izba/delete', { id_izba });
