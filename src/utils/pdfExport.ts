import jsPDF from 'jspdf';
import { QuizQuestion } from '../types';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { showInterstitialAd } from './admob';

/**
 * Universal safe helper to save or share a generated PDF document across Web & Android Native
 */
async function saveOrSharePdf(doc: jsPDF, filename: string) {
  const safeFilename = filename.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  const fullFilename = `${safeFilename || 'document'}.pdf`;

  if (Capacitor.isNativePlatform()) {
    try {
      // Get base64 string from doc
      const base64Data = doc.output('datauristring').split(',')[1];
      
      // 1. Persistently save the PDF file to the device's Documents directory
      const savedFile = await Filesystem.writeFile({
        path: fullFilename,
        data: base64Data,
        directory: Directory.Documents,
        recursive: true
      });

      // 2. Alert the user that the file was successfully saved to their Documents folder
      alert(`💾 PDF Saved Successfully!\n\nYour PDF has been saved to your device's "Documents" folder as:\n👉 "${fullFilename}"\n\nClick OK to open the Share / Send menu.`);

      // 3. Share / Open native Android file sheet
      await Share.share({
        title: filename,
        text: `Exported PDF: ${filename}`,
        url: savedFile.uri,
        dialogTitle: 'Save / Open PDF'
      });

      // Trigger optional AdMob ad on Android
      showInterstitialAd().catch(() => {});
      return;
    } catch (err) {
      console.warn('[PDF Export] Native file write/share fallback:', err);
    }
  }

  // Web Browser standard download
  doc.save(fullFilename);
}

/**
 * Downloads a simple Keep/Notepad text note as a clean, professionally formatted A4 PDF
 */
export async function downloadNoteAsPdf(title: string, contentHtmlOrText: string, dateString?: string) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  
  const marginTop = 18;
  const marginBottom = 18;
  const marginLeft = 16;
  const marginRight = 16;
  const contentWidth = pageWidth - marginLeft - marginRight; // 178mm

  let currentY = marginTop;
  let currentPage = 1;

  // 1. Note Title
  const noteTitle = title.trim() || 'Untitled Note';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 15, 15);
  
  const titleLines = doc.splitTextToSize(noteTitle, contentWidth);
  doc.text(titleLines, marginLeft, currentY);
  currentY += titleLines.length * 7 + 2;

  // 2. Date info
  const dateFormatted = dateString 
    ? new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : new Date().toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(110, 110, 110);
  doc.text(`Created / Updated: ${dateFormatted}`, marginLeft, currentY);
  currentY += 5;

  // Divider line
  doc.setDrawColor(210, 210, 210);
  doc.setLineWidth(0.3);
  doc.line(marginLeft, currentY, pageWidth - marginRight, currentY);
  currentY += 8;

  // Clean HTML to readable plain text with preserved line breaks
  const cleanContent = contentHtmlOrText
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<li>/gi, '• ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();

  const paragraphs = cleanContent ? cleanContent.split('\n') : ['(Empty note)'];

  const drawFooter = (pageNum: number) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text(`Page ${pageNum}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
  };

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);

  paragraphs.forEach((para) => {
    if (para.trim() === '') {
      currentY += 4;
      return;
    }

    const lines = doc.splitTextToSize(para, contentWidth);
    
    // Check if lines fit on current page
    lines.forEach((line: string) => {
      if (currentY + 6 > pageHeight - marginBottom) {
        drawFooter(currentPage);
        doc.addPage();
        currentPage++;
        currentY = marginTop;
      }

      doc.text(line, marginLeft, currentY);
      currentY += 5.8;
    });

    currentY += 2.5; // space between paragraphs
  });

  drawFooter(currentPage);

  await saveOrSharePdf(doc, noteTitle);
}

/**
 * Downloads a 100 MCQ Quiz note as a 2-column space-optimized A4 PDF
 */
export async function downloadQuizAsPdf(title: string, questions: QuizQuestion[]) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  
  const marginTop = 12;
  const marginBottom = 12;
  const marginLeft = 10;
  const colGap = 6;
  const usableWidth = pageWidth - (marginLeft * 2); // 190mm
  const colWidth = (usableWidth - colGap) / 2; // 92mm each

  const colX = [
    marginLeft, // Col 0 (Left): 10mm
    marginLeft + colWidth + colGap // Col 1 (Right): 108mm
  ];

  let currentPage = 1;
  let currentCol = 0; // 0 = Left, 1 = Right
  let currentY = marginTop;
  let page1StartY = marginTop;

  // Header on Page 1
  const quizTitle = title.trim() || 'MCQ Quiz & Test Paper';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 15, 15);
  doc.text(quizTitle, marginLeft, currentY);
  currentY += 5.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 100, 100);
  const dateStr = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  doc.text(`Total Questions: ${questions.length} | Date: ${dateStr}`, marginLeft, currentY);
  currentY += 3.5;

  doc.setDrawColor(210, 210, 210);
  doc.setLineWidth(0.3);
  doc.line(marginLeft, currentY, pageWidth - marginLeft, currentY);
  currentY += 5;

  page1StartY = currentY;

  const drawPageDecorations = (pageNum: number, startYForDiv: number) => {
    // Vertical line between columns
    doc.setDrawColor(225, 225, 225);
    doc.setLineWidth(0.2);
    const lineX = marginLeft + colWidth + (colGap / 2);
    doc.line(lineX, startYForDiv, lineX, pageHeight - marginBottom - 2);

    // Footer page number
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(130, 130, 130);
    doc.text(`Page ${pageNum}`, pageWidth / 2, pageHeight - (marginBottom / 2), { align: 'center' });
  };

  const ensureSpace = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - marginBottom - 4) {
      if (currentCol === 0) {
        // Move to Right column of same page
        currentCol = 1;
        currentY = (currentPage === 1 ? page1StartY : marginTop);
      } else {
        // Right column filled -> Add new page and start at Left column
        drawPageDecorations(currentPage, (currentPage === 1 ? page1StartY : marginTop));
        doc.addPage();
        currentPage++;
        currentCol = 0;
        currentY = marginTop;
      }
    }
  };

  // Render Questions in 2-Column layout
  questions.forEach((q, index) => {
    const qNum = `Q.${index + 1} `;
    const qText = q.question.trim() || `Question ${index + 1}`;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    const qLines = doc.splitTextToSize(`${qNum}${qText}`, colWidth);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const optALines = doc.splitTextToSize(`A) ${q.optionA || '-'}`, colWidth - 3);
    const optBLines = doc.splitTextToSize(`B) ${q.optionB || '-'}`, colWidth - 3);
    const optCLines = doc.splitTextToSize(`C) ${q.optionC || '-'}`, colWidth - 3);
    const optDLines = doc.splitTextToSize(`D) ${q.optionD || '-'}`, colWidth - 3);

    const expText = q.explanation.trim();
    const expLines = expText ? doc.splitTextToSize(`Exp: ${expText}`, colWidth - 3) : [];

    // Calculate total height for this question
    const qHeight = (qLines.length * 4) +
                    ((optALines.length + optBLines.length + optCLines.length + optDLines.length) * 3.5) +
                    (q.correctAnswer ? 4 : 0) +
                    (expLines.length > 0 ? (expLines.length * 3.4) + 2 : 0) +
                    6; // spacing & divider

    ensureSpace(qHeight);

    const activeX = colX[currentCol];

    // 1. Question Text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(20, 20, 20);
    doc.text(qLines, activeX, currentY);
    currentY += qLines.length * 3.8 + 1;

    // 2. Options A, B, C, D
    const printOption = (label: string, lines: string[]) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.8);
      doc.setTextColor(45, 45, 45);
      doc.text(lines, activeX + 2, currentY);
      currentY += lines.length * 3.3 + 0.6;
    };

    printOption('A', optALines);
    printOption('B', optBLines);
    printOption('C', optCLines);
    printOption('D', optDLines);

    // 3. Correct Answer (Immediately after Option D, before Explanation)
    if (q.correctAnswer) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.8);
      doc.setTextColor(0, 110, 0); // Clean Green
      doc.text(`Ans: Option (${q.correctAnswer})`, activeX + 2, currentY);
      currentY += 3.6;
    }

    // 4. Explanation (After Correct Answer)
    if (expLines.length > 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.2);
      doc.setTextColor(90, 90, 90);
      doc.text(expLines, activeX + 2, currentY);
      currentY += expLines.length * 3.2 + 1;
    }

    // Small divider line between questions
    currentY += 1.5;
    doc.setDrawColor(240, 240, 240);
    doc.setLineWidth(0.2);
    doc.line(activeX, currentY, activeX + colWidth, currentY);
    currentY += 3;
  });

  // Draw decorations for the final page
  drawPageDecorations(currentPage, (currentPage === 1 ? page1StartY : marginTop));

  await saveOrSharePdf(doc, quizTitle);
}
