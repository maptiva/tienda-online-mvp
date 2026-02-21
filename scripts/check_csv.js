import fs from 'fs';
import { parse } from 'csv-parse/sync';

const filePath = '../prod_ruwaq_edit.csv';

try {
    const fileContent = fs.readFileSync(filePath, 'utf8');

    const records = parse(fileContent, {
        delimiter: ';',
        columns: false,
        skip_empty_lines: true
    });

    console.log(`Leídas ${records.length} filas del archivo.`);

    if (records.length > 0) {
        // Tomar las primeras 5 filas para revisar cómo se ven
        console.log('\n--- MUESTRA DE LAS PRIMERAS 5 FILAS ---');
        records.slice(0, 5).forEach((row, index) => {
            console.log(`\nFila ${index + 1}:`);
            console.log(`1. Categoría: ${row[0]}`);
            console.log(`2. Producto: ${row[1]}`);
            console.log(`3. Descripción: ${row[2]}`);
            console.log(`4. Precio: ${row[3]}`);
            // mostrar si hay más celdas no vacías
            const extraCols = row.slice(4).filter(col => col.trim() !== '');
            if (extraCols.length > 0) {
                console.log(`Extras no vacíos:`, extraCols);
            }
        });

        // Contar cuántos tienen descripción vacía
        const sinDesc = records.filter(r => r[2] === undefined || r[2].trim() === '').length;
        console.log(`\n--- ESTADÍSTICAS ---`);
        console.log(`Filas con descripción vacía: ${sinDesc}`);

    }

} catch (err) {
    console.error('Error al leer el archivo:', err.message);
}
