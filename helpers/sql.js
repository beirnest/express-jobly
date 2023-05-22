const { BadRequestError } = require("../expressError");

/** Accept update data and return sql data needed to update row. 
 *
 *Accepts original data as dataToUpdate and new updates as jsToSql. 
 *
 *Creates object of keys from dataToUpdate and throw error if no data was input
 *
 *Creates map of column keys to be changed from jsToSql and assign them to an index number for SQL data.
 *
 *Returns changes to be made as setCols and join them with commas. Return original data values as values object.
*/

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  //
  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
