const { PrismaClient } = require("@prisma/client");

const srcDb = new PrismaClient({
  datasources: {
    db: { url: "mysql://Ashwin:HjFzMtqUciOlv8wK3PFpSBIqj@mariadb-163077-0.cloudclusters.net:19986/agr_jewel" }
  }
});

const dstDb = new PrismaClient({
  datasources: {
    db: { url: "mysql://Ashwin:HjFzMtqUciOlv8wK3PFpSBIqj@mariadb-163077-0.cloudclusters.net:19986/agrE" }
  }
});

async function migrateData() {
  console.log("==================================================");
  console.log(" Starting Data Migration: agr_jewel ---> agrE");
  console.log("==================================================");

  try {
    const tablesResult = await srcDb.$queryRawUnsafe("SHOW TABLES");
    const tableKey = Object.keys(tablesResult[0])[0];
    const tables = tablesResult
      .map(row => row[tableKey])
      .filter(name => !name.startsWith("_prisma"));

    console.log(`Found ${tables.length} tables to copy.`);

    await dstDb.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 0;");

    for (const table of tables) {
      const rows = await srcDb.$queryRawUnsafe(`SELECT * FROM \`${table}\``);
      console.log(`\nProcessing table: ${table} (${rows.length} rows)`);

      if (rows.length === 0) continue;

      await dstDb.$executeRawUnsafe(`TRUNCATE TABLE \`${table}\``);

      // Get target table columns to ignore extra legacy columns
      const targetColsResult = await dstDb.$queryRawUnsafe(`SHOW COLUMNS FROM \`${table}\``);
      const targetCols = new Set(targetColsResult.map(c => c.Field));

      const columns = Object.keys(rows[0]).filter(c => targetCols.has(c));
      const colsEscaped = columns.map(c => `\`${c}\``).join(", ");

      const batchSize = 50;
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        const valueStrings = [];

        for (const row of batch) {
          const values = columns.map(col => {
            const val = row[col];
            if (val === null || val === undefined) return "NULL";
            if (typeof val === "number" || typeof val === "boolean") return val;
            if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
            if (typeof val === "object") return `'${JSON.stringify(val).replace(/\\/g, "\\\\").replace(/'/g, "''")}'`;
            return `'${String(val).replace(/\\/g, "\\\\").replace(/'/g, "''")}'`;
          });
          valueStrings.push(`(${values.join(", ")})`);
        }

        const insertQuery = `INSERT INTO \`${table}\` (${colsEscaped}) VALUES ${valueStrings.join(", ")}`;
        await dstDb.$executeRawUnsafe(insertQuery);
      }
      console.log(`  ✔ Successfully copied ${rows.length} records into ${table}.`);
    }

    await dstDb.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 1;");
    console.log("\n==================================================");
    console.log(" ✅ MIGRATION SUCCESSFUL! agrE is now fully populated.");
    console.log("==================================================");
  } catch (err) {
    console.error("\n❌ Migration failed with error:", err);
  } finally {
    await srcDb.$disconnect();
    await dstDb.$disconnect();
  }
}

migrateData();
