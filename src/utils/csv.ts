import { writeFile } from 'fs';
import { AsyncParser } from 'json2csv';
import { join } from 'path';
import mkdir from 'mkdirp';

export const exportToCsv = async (data: Array<Record<string, unknown>>) => {
  const filename = `generated-report-${Date.now()}.csv`;
  const asyncParser = new AsyncParser();

  let csv = '';
  return new Promise((res, rej) => {
    asyncParser.processor
      .on('data', (chunk) => (csv += chunk.toString()))
      .on('end', async () => {
        const dir = join(__dirname, '..', 'public', 'reports');
        mkdir(dir).then(() => {
          const filepath = join(dir, filename);
          writeFile(filepath, csv, (err) => {
            if (err) return rej(err);
            res(filename);
          });
        });
      })
      .on('error', (err) => {
        console.error(err);
        rej(err);
      });

    asyncParser.input.push(JSON.stringify(data)); // This data might come from an HTTP request, etc.
    asyncParser.input.push(null);
  });
};
