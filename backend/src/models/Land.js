const { database } = require('../config/db');

const getAllLands = async () => {
    const query = {
      sql: 'SELECT * FROM Lands'
    };
    const [rows] = await database.run(query);
    return rows.map(row => row.toJSON());
};

const getLandById = async (landId, transaction = database) => {
    const query = {
        sql: 'SELECT * FROM Lands WHERE land_id = @landId',
        params: { landId }
    };
    const [rows] = await transaction.run(query);
    if (rows.length === 0) return null;
    return rows[0].toJSON();
};

const insertManyLands = async (lands) => {
    const mutations = lands.map(land => ({
        land_id: land.land_id,
        owner_id: land.owner_id || null,
        price: land.price,
        status: land.status || 'available',
        version: land.version || 0
    }));
    await database.table('Lands').insert(mutations);
}

const deleteManyLands = async () => {
   await database.runTransactionAsync(async (transaction) => {
       await transaction.runUpdate({
           sql: 'DELETE FROM Lands WHERE true'
       });
       await transaction.commit();
   });
};

module.exports = {
    getAllLands,
    getLandById,
    insertManyLands,
    deleteManyLands
};
