const PDFDocument = require('pdfkit');

/**
 * Generate Inventory Report PDF
 */
const generateInventoryPDF = (products, filters = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(20).fillColor('#2c3e50').text('INVENTORY REPORT', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor('#7f8c8d').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown(1.5);

      // Filters Applied
      if (Object.keys(filters).filter(k => filters[k]).length > 0) {
        doc.fontSize(12).fillColor('#34495e').text('Filters Applied:', { underline: true });
        Object.entries(filters).forEach(([key, value]) => {
          if (value) {
            doc.fontSize(10).fillColor('#7f8c8d').text(`• ${key}: ${value}`);
          }
        });
        doc.moveDown();
      }

      // Summary Statistics
      const totalItems = products.length;
      const totalQty = products.reduce((sum, p) => sum + p.quantity, 0);
      const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.price), 0);
      const lowStock = products.filter(p => p.quantity > 0 && p.quantity <= p.minStockLevel).length;
      const outOfStock = products.filter(p => p.quantity === 0).length;

      doc.fontSize(14).fillColor('#2c3e50').text('Summary', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor('#34495e');
      doc.text(`Total Products: ${totalItems}`);
      doc.text(`Total Stock Quantity: ${totalQty.toLocaleString()}`);
      doc.text(`Total Inventory Value: $${totalValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
      doc.text(`Low Stock Items: ${lowStock}`);
      doc.text(`Out of Stock Items: ${outOfStock}`);
      doc.moveDown(2);

      // Product Table
      doc.fontSize(14).fillColor('#2c3e50').text('Product Details', { underline: true });
      doc.moveDown();

      const tableTop = doc.y;
      const headers = ['SKU', 'Product Name', 'Category', 'Qty', 'Price', 'Value', 'Status'];
      const colWidths = [60, 140, 80, 40, 50, 60, 60];
      let xPos = 50;

      // Table Headers
      doc.fontSize(9).fillColor('#fff');
      doc.rect(50, tableTop, 490, 20).fill('#34495e');
      
      xPos = 50;
      headers.forEach((header, i) => {
        doc.text(header, xPos + 5, tableTop + 5, { width: colWidths[i], align: 'left' });
        xPos += colWidths[i];
      });

      // Table Rows
      let yPos = tableTop + 25;
      doc.fillColor('#2c3e50');

      products.forEach((product, index) => {
        if (yPos > 720) {
          doc.addPage();
          yPos = 50;
          
          // Repeat headers on new page
          doc.fontSize(9).fillColor('#fff');
          doc.rect(50, yPos - 25, 490, 20).fill('#34495e');
          xPos = 50;
          headers.forEach((header, i) => {
            doc.text(header, xPos + 5, yPos - 20, { width: colWidths[i], align: 'left' });
            xPos += colWidths[i];
          });
          doc.fillColor('#2c3e50');
        }

        // Alternate row color
        if (index % 2 === 0) {
          doc.rect(50, yPos - 5, 490, 20).fillOpacity(0.05).fill('#bdc3c7').fillOpacity(1);
        }

        xPos = 50;
        const stockStatus = product.quantity === 0 ? 'Out' : 
                           product.quantity <= product.minStockLevel ? 'Low' : 'OK';
        
        const rowData = [
          product.sku,
          product.name.substring(0, 22),
          product.category.substring(0, 12),
          product.quantity.toString(),
          `$${product.price.toFixed(2)}`,
          `$${(product.quantity * product.price).toFixed(2)}`,
          stockStatus
        ];

        rowData.forEach((data, i) => {
          doc.fontSize(8).text(data, xPos + 5, yPos, { width: colWidths[i], align: 'left' });
          xPos += colWidths[i];
        });

        yPos += 20;
      });

      // Footer on each page
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc.fontSize(8).fillColor('#95a5a6').text(
          `Page ${i + 1} of ${pageCount} | Stock Inventory Management System`,
          50,
          doc.page.height - 30,
          { align: 'center' }
        );
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate Documents Report PDF
 */
const generateDocumentsPDF = (documents) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(20).fillColor('#2c3e50').text('DEDUCTION DOCUMENTS REPORT', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor('#7f8c8d').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown(2);

      // Summary
      doc.fontSize(14).fillColor('#2c3e50').text('Summary', { underline: true });
      doc.fontSize(10).fillColor('#34495e').text(`Total Documents: ${documents.length}`);
      doc.moveDown(2);

      // Documents List
      documents.forEach((document, index) => {
        if (doc.y > 700) {
          doc.addPage();
        }

        doc.fontSize(12).fillColor('#2c3e50').text(`${index + 1}. ${document.title}`, { underline: true });
        doc.moveDown(0.3);
        
        doc.fontSize(9).fillColor('#34495e');
        doc.text(`Product: ${document.product?.name || 'N/A'} (${document.product?.sku || 'N/A'})`);
        doc.text(`Date: ${new Date(document.createdAt).toLocaleString()}`);
        doc.text(`Uploaded by: ${document.uploadedBy?.username || 'N/A'}`);
        doc.text(`Type: ${document.file?.type || 'N/A'}`);
        
        if (document.description) {
          doc.text(`Description: ${document.description}`);
        }
        
        doc.text(`File URL: ${document.file?.url || 'N/A'}`);
        doc.moveDown();

        if (index < documents.length - 1) {
          doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#bdc3c7');
          doc.moveDown();
        }
      });

      // Footer
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc.fontSize(8).fillColor('#95a5a6').text(
          `Page ${i + 1} of ${pageCount}`,
          50,
          doc.page.height - 30,
          { align: 'center' }
        );
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateInventoryPDF,
  generateDocumentsPDF
};