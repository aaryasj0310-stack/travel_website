const database = require('../config/database');

const mapCategory = (row) => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  displayOrder: row.display_order,
  isActive: Boolean(row.is_active)
});

const findAllActive = async () => {
  const rows = await database.query(
    `SELECT id, name, slug, display_order, is_active
     FROM budget_categories
     WHERE is_active = TRUE
     ORDER BY display_order ASC`
  );

  return rows.map(mapCategory);
};

module.exports = {
  findAllActive
};
