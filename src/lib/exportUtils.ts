/**
 * Export data array to CSV file with UTF-8 BOM support for Microsoft Excel
 */
export function exportToCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  // Add UTF-8 Byte Order Mark (BOM) so Excel properly detects UTF-8 characters
  const BOM = "\uFEFF";
  
  const csvContent = rows.map((row) => {
    return row
      .map((val) => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      })
      .join(",");
  });

  const fullCsv = BOM + [headers.map((h) => `"${h}"`).join(","), ...csvContent].join("\r\n");

  const blob = new Blob([fullCsv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
