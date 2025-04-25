const stravaDAO = require('../dao/stravaDAO');

exports.getStravaByStudentId = async (id_ziak) => {
  if (!id_ziak) {
    throw new Error('Student ID is required');
  }
  return await stravaDAO.getStravaByStudentId(id_ziak);
};

exports.deleteStravaByStudentId = async (id_ziak) => {
  if (!id_ziak) {
    throw new Error('Student ID is required');
  }
  return await stravaDAO.deleteStravaByStudentId(id_ziak);
};

exports.insertStrava = async (data) => {
  const { id_ziak, typ, zaciatok, koniec, stav = 1 } = data;
  
  if (!id_ziak || !typ || !zaciatok || !koniec) {
    throw new Error('Missing required fields');
  }
  
  // Basic validation
  const startDate = new Date(zaciatok);
  const endDate = new Date(koniec);
  
  if (startDate > endDate) {
    throw new Error('Start date must be before end date');
  }
  
  return await stravaDAO.insertStrava(id_ziak, typ, zaciatok, koniec, stav);
};
