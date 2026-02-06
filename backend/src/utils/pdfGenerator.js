const PDFDocument = require('pdfkit');
const https = require('https');
const http = require('http');

/**
 * Download image from URL with timeout and error handling
 */
const downloadImage = (url) => {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error('No URL provided'));
      return;
    }

    const protocol = url.startsWith('https') ? https : http;
    const timeout = 10000; // 10 seconds timeout
    
    const request = protocol.get(url, { timeout }, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadImage(response.headers.location).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }

      const chunks = [];
      
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        try {
          resolve(Buffer.concat(chunks));
        } catch (error) {
          reject(error);
        }
      });
      response.on('error', reject);
    });

    request.on('error', reject);
    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Image download timeout'));
    });
  });
};

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
          product.sku || '',
          (product.name || '').substring(0, 22),
          (product.category || '').substring(0, 12),
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
      const range = doc.bufferedPageRange();
      for (let i = 0; i < range.count; i++) {
        doc.switchToPage(range.start + i);
        doc.fontSize(8).fillColor('#95a5a6').text(
          `Page ${i + 1} of ${range.count} | Stock Inventory Management System`,
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
 * Generate Transactions Report PDF with Images
 */
const generateTransactionsPDF = async (transactions) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(24).fillColor('#2c3e50').text('TRANSACTION HISTORY REPORT', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(11).fillColor('#7f8c8d').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown(2);

      // Summary
      doc.fontSize(16).fillColor('#2c3e50').text('Summary', { underline: true });
      doc.fontSize(11).fillColor('#34495e');
      doc.text(`Total Transactions: ${transactions.length}`);
      
      const additions = transactions.filter(t => t.type === 'add').length;
      const deductions = transactions.filter(t => t.type === 'deduct').length;
      const totalAdded = transactions.filter(t => t.type === 'add').reduce((sum, t) => sum + t.quantity, 0);
      const totalDeducted = transactions.filter(t => t.type === 'deduct').reduce((sum, t) => sum + t.quantity, 0);
      
      doc.text(`Stock Additions: ${additions} (${totalAdded} units)`);
      doc.text(`Stock Deductions: ${deductions} (${totalDeducted} units)`);
      doc.moveDown(2);

      // Transaction Details
      for (let i = 0; i < transactions.length; i++) {
        const transaction = transactions[i];
        
        // Start each transaction on a new page (except the first one)
        if (i > 0) {
          doc.addPage();
        }

        // Transaction Header - Centered and Bigger
        doc.fontSize(18).fillColor('#2c3e50').text(`Transaction #${i + 1}`, { align: 'center', underline: true });
        doc.moveDown(1);

        // Transaction Info Box with better spacing
        doc.fontSize(12).fillColor('#34495e');
        
        // Date and Type
        doc.text(`Date: ${new Date(transaction.createdAt).toLocaleString()}`, { align: 'left' });
        doc.moveDown(0.3);
        
        const typeColor = transaction.type === 'add' ? '#27ae60' : '#e74c3c';
        doc.fillColor(typeColor).fontSize(14);
        doc.text(`Type: ${transaction.type.toUpperCase()} (${transaction.type === 'add' ? '+' : '-'}${transaction.quantity})`, { align: 'left' });
        doc.fillColor('#34495e').fontSize(12);
        doc.moveDown(0.5);
        
        // Product Information
        doc.fontSize(11).fillColor('#7f8c8d').text('Product Information:', { underline: true });
        doc.moveDown(0.2);
        doc.fontSize(12).fillColor('#34495e');
        doc.text(`Name: ${transaction.product?.name || 'N/A'}`);
        doc.text(`SKU: ${transaction.product?.sku || 'N/A'}`);
        doc.text(`Category: ${transaction.product?.category || 'N/A'}`);
        doc.moveDown(0.5);
        
        // Quantity Change
        doc.fontSize(11).fillColor('#7f8c8d').text('Quantity Change:', { underline: true });
        doc.moveDown(0.2);
        doc.fontSize(12).fillColor('#34495e');
        doc.text(`Previous Quantity: ${transaction.previousQuantity}`);
        doc.text(`New Quantity: ${transaction.newQuantity}`);
        doc.text(`Change: ${transaction.type === 'add' ? '+' : '-'}${transaction.quantity} units`);
        doc.moveDown(0.5);
        
        // User and Reason
        doc.fontSize(11).fillColor('#7f8c8d').text('Additional Details:', { underline: true });
        doc.moveDown(0.2);
        doc.fontSize(12).fillColor('#34495e');
        doc.text(`Performed By: ${transaction.performedBy?.username || 'N/A'}`);
        doc.text(`Reason: ${transaction.reason || 'N/A'}`);
        
        if (transaction.notes) {
          doc.moveDown(0.3);
          doc.fontSize(11).fillColor('#7f8c8d').text('Notes:', { underline: true });
          doc.moveDown(0.2);
          doc.fontSize(12).fillColor('#34495e').text(transaction.notes);
        }

        doc.moveDown(1);

        // Add document image if available - BIGGER and CENTERED
        if (transaction.document?.url) {
          try {
            const imageBuffer = await downloadImage(transaction.document.url);
            
            doc.fontSize(11).fillColor('#7f8c8d').text('Verification Document:', { align: 'center', underline: true });
            doc.moveDown(0.8);
            
            // Add image CENTERED with bigger dimensions (400x300 for single page)
            const imgWidth = 400;
            const imgX = (doc.page.width - imgWidth) / 2;
            
            doc.image(imageBuffer, imgX, doc.y, {
              fit: [400, 300],
              align: 'center'
            });
            
          } catch (imageError) {
            console.error('Error adding image to PDF:', imageError);
            doc.fontSize(11).fillColor('#e74c3c').text('Document: [Image unavailable]', { align: 'center' });
          }
        }
      }

      // Footer - FIXED page indexing
      const range = doc.bufferedPageRange();
      for (let i = 0; i < range.count; i++) {
        doc.switchToPage(range.start + i);
        doc.fontSize(8).fillColor('#95a5a6').text(
          `Page ${i + 1} of ${range.count} | Transaction History Report`,
          50,
          doc.page.height - 30,
          { align: 'center' }
        );
      }

      doc.end();
    } catch (error) {
      console.error('PDF Generation Error:', error);
      reject(error);
    }
  });
};

/**
 * Generate Documents Report PDF with Images
 */
const generateDocumentsPDF = async (documents) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(24).fillColor('#2c3e50').text('DOCUMENTS REPORT', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(11).fillColor('#7f8c8d').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown(2);

      // Summary
      doc.fontSize(16).fillColor('#2c3e50').text('Summary', { underline: true });
      doc.fontSize(11).fillColor('#34495e').text(`Total Documents: ${documents.length}`);
      doc.moveDown(2);

      // Documents List
      for (let i = 0; i < documents.length; i++) {
        const document = documents[i];
        
        if (doc.y > 650) {
          doc.addPage();
        }

        doc.fontSize(14).fillColor('#2c3e50').text(`${i + 1}. ${document.title}`, { underline: true });
        doc.moveDown(0.3);
        
        doc.fontSize(11).fillColor('#34495e');
        doc.text(`Product: ${document.product?.name || 'N/A'} (${document.product?.sku || 'N/A'})`);
        doc.text(`Date: ${new Date(document.createdAt).toLocaleString()}`);
        doc.text(`Uploaded by: ${document.uploadedBy?.username || 'N/A'}`);
        doc.text(`Type: ${document.file?.type || 'N/A'}`);
        
        if (document.description) {
          doc.text(`Description: ${document.description}`);
        }
        
        doc.moveDown(0.5);

        // Add document preview if it's an image - BIGGER and CENTERED
        if (document.file?.url && document.file?.type && document.file.type.includes('image')) {
          try {
            const imageBuffer = await downloadImage(document.file.url);
            const imageY = doc.y;
            
            // Check if image will fit on current page
            if (imageY + 250 > doc.page.height - 50) {
              doc.addPage();
            }
            
            doc.fontSize(11).fillColor('#7f8c8d').text('Document Preview:', { underline: true });
            doc.moveDown(0.5);
            
            // Add image CENTERED with bigger dimensions (350x250)
            const imgWidth = 350;
            const imgX = (doc.page.width - imgWidth) / 2;
            
            doc.image(imageBuffer, imgX, doc.y, {
              fit: [350, 250],
              align: 'center'
            });
            
            doc.moveDown(13); // Move down to account for image height
          } catch (imageError) {
            console.error('Error adding image to PDF:', imageError);
            doc.fontSize(10).fillColor('#7f8c8d').text('Document URL: ' + document.file.url);
            doc.moveDown(0.3);
          }
        } else {
          doc.fontSize(10).fillColor('#7f8c8d').text('Document URL: ' + (document.file?.url || 'N/A'));
          doc.moveDown(0.3);
        }

        if (i < documents.length - 1) {
          doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#bdc3c7');
          doc.moveDown(1);
        }
      }

      // Footer - FIXED page indexing
      const range = doc.bufferedPageRange();
      for (let i = 0; i < range.count; i++) {
        doc.switchToPage(range.start + i);
        doc.fontSize(8).fillColor('#95a5a6').text(
          `Page ${i + 1} of ${range.count}`,
          50,
          doc.page.height - 30,
          { align: 'center' }
        );
      }

      doc.end();
    } catch (error) {
      console.error('PDF Generation Error:', error);
      reject(error);
    }
  });
};

module.exports = {
  generateInventoryPDF,
  generateTransactionsPDF,
  generateDocumentsPDF
};