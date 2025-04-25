const kartaDAO = require('../dao/kartaDAO');

exports.getKartaByStudentId = async (id_ziak) => {
  if (!id_ziak) {
    throw new Error('Student ID is required');
  }
  return await kartaDAO.getKartaByStudentId(id_ziak);
};

exports.deleteKartaByStudentId = async (id_ziak) => {
  if (!id_ziak) {
    throw new Error('Student ID is required');
  }
  return await kartaDAO.deleteKartaByStudentId(id_ziak);
};

exports.insertKarta = async (data) => {
  const { id_ziak, cislo, platnost_do, stav = 'Aktívna' } = data;
  
  if (!id_ziak || !cislo || !platnost_do) {
    throw new Error('ID študenta, číslo karty a platnosť sú povinné polia');
  }
  
  // Validate expiration date is in the future
  const expDate = new Date(platnost_do);
  if (expDate <= new Date()) {
    throw new Error('Dátum platnosti musí byť v budúcnosti');
  }
  
  return await kartaDAO.insertKarta(id_ziak, cislo, platnost_do, stav);
};

exports.updateKartaStatus = async (id_karta, stav) => {
  if (!id_karta || !stav) {
    throw new Error('ID karty a stav sú povinné polia');
  }
  
  // Validate status values
  const validStatuses = ['Aktívna', 'Blokovaná', 'Expirovaná'];
  if (!validStatuses.includes(stav)) {
    throw new Error('Neplatný stav karty');
  }
  
  return await kartaDAO.updateKartaStatus(id_karta, stav);
};
