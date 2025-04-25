const ziakDao = require('../dao/ziakDao');
const kartaDAO = require('../dao/kartaDAO');
const stravaDAO = require('../dao/stravaDAO');

exports.getAll = async () => {
  return await ziakDao.getAll();
};

exports.insert = async (studentData) => {
  try {
    const result = await ziakDao.insert(studentData);
    return result;
  } catch (error) {
    console.error('Error in ziakService.insert:', error);
    throw error;
  }
};

exports.remove = async (id_ziak) => {
  try {
    const result = await ziakDao.remove(id_ziak);
    return { status: 200, message: { message: 'Delete successful' } };
  } catch (error) {
    console.error('Error during student deletion:', error);
    return { status: 500, message: { message: 'Error during student deletion' } };
  }
};

exports.getAdditional = async (id_ziak) => {
  try {
    const karta = await kartaDAO.getKartaByStudentId(id_ziak);
    const strava = await stravaDAO.getStravaByStudentId(id_ziak);
    return { karta, strava };
  } catch (error) {
    console.error('Error fetching additional student data:', error);
    throw error;
  }
};

exports.updateRoom = async (id_ziak, id_izba) => {
  try {
    const result = await ziakDao.updateRoom(id_ziak, id_izba);
    return { success: true, message: 'Izba úspešne zmenená' };
  } catch (error) {
    console.error('Error in ziakService.updateRoom:', error);
    throw error;
  }
};
