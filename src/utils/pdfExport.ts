import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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

  // Try Native Capacitor save first if available
  if (Capacitor.isNativePlatform()) {
    try {
      if (Filesystem && Filesystem.writeFile && Share && Share.share) {
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
      }
    } catch (err) {
      console.warn('[PDF Export] Native file write/share plugin failed or was not configured:', err);
    }
  }

  // Fallback / Web: standard browser download using anchor click and Blob URL (highly compatible)
  try {
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fullFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.warn('[PDF Export] Blob link download failed, trying standard doc.save() fallback:', err);
    doc.save(fullFilename);
  }
}

/**
 * Downloads a simple Keep/Notepad text note as a clean, professionally formatted A4 PDF
 */
export async function downloadNoteAsPdf(title: string, contentHtmlOrText: string, dateString?: string) {
  const noteTitle = title.trim() || 'Untitled Note';

  // Create a beautifully formatted container inside the normal viewport flow but invisible to avoid offscreen rendering optimization bugs on mobile WebView
  const exportArea = document.createElement('div');
  exportArea.style.position = 'absolute';
  exportArea.style.left = '0';
  exportArea.style.top = '0';
  exportArea.style.zIndex = '-9999';
  exportArea.style.opacity = '0.001';
  exportArea.style.pointerEvents = 'none';
  exportArea.style.width = '794px'; // Standard A4 width at 96 DPI
  exportArea.style.backgroundColor = '#ffffff';
  exportArea.style.color = '#111111';
  exportArea.style.padding = '50px 60px';
  exportArea.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif';
  exportArea.style.boxSizing = 'border-box';
  exportArea.style.wordBreak = 'break-word';

  // Format date correctly
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

  // Inject styled HTML matching the editor formatting (bold, italic, colors, lists)
  exportArea.innerHTML = `
    <style>
      .pdf-title {
        font-size: 28px;
        font-weight: 800;
        color: #000000;
        margin: 0 0 8px 0;
        line-height: 1.25;
      }
      .pdf-date {
        font-size: 11px;
        color: #71717a;
        margin: 0 0 16px 0;
        font-weight: 500;
      }
      .pdf-divider {
        border: none;
        border-top: 1px solid #e4e4e7;
        margin-bottom: 24px;
      }
      .pdf-content {
        font-size: 15px;
        line-height: 1.7;
        color: #18181b;
      }
      .pdf-content p {
        margin-top: 0;
        margin-bottom: 12px;
      }
      .pdf-content ul {
        list-style-type: disc;
        padding-left: 24px;
        margin-bottom: 16px;
      }
      .pdf-content ol {
        list-style-type: decimal;
        padding-left: 24px;
        margin-bottom: 16px;
      }
      .pdf-content li {
        margin-bottom: 6px;
      }
      /* Custom Font Size mapping from browser execCommand font tags */
      .pdf-content font[size="2"] { font-size: 13px !important; }
      .pdf-content font[size="3"] { font-size: 16px !important; }
      .pdf-content font[size="5"] { font-size: 20px !important; }
      .pdf-content font[size="6"] { font-size: 24px !important; font-weight: 700; }
      
      /* Format standard editor rich tags */
      b, strong { font-weight: 700; }
      i, em { font-style: italic; }
      u { text-decoration: underline; }
    </style>
    <h1 class="pdf-title">${noteTitle}</h1>
    <p class="pdf-date">Created / Updated: ${dateFormatted}</p>
    <hr class="pdf-divider" />
    <div class="pdf-content">${contentHtmlOrText || '<p style="color:#a1a1aa; font-style:italic;">(Empty note)</p>'}</div>
  `;

  document.body.appendChild(exportArea);

  try {
    const canvas = await html2canvas(exportArea, {
      scale: 2, // Double resolution for ultra-sharp vector text rendering
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      allowTaint: true,
      scrollX: 0,
      scrollY: 0,
      width: 794
    });

    document.body.removeChild(exportArea);

    const imgWidth = 210; // A4 width in mm
    const pageHeightMm = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Height of 1 full page in canvas pixels (~1123px)
    const pageHeightPixels = (canvas.width * 297) / 210; 
    let sourceY = 0;

    while (heightLeft > 0) {
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = Math.min(canvas.height - sourceY, pageHeightPixels);

      if (pageCanvas.height <= 0) break;

      const ctx = pageCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(
          canvas,
          0, sourceY, canvas.width, pageCanvas.height, // source dimensions
          0, 0, pageCanvas.width, pageCanvas.height // destination dimensions
        );
      }

      const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95);
      
      if (sourceY > 0) {
        doc.addPage();
      }
      
      const pageImgHeightMm = (pageCanvas.height * imgWidth) / canvas.width;
      doc.addImage(pageImgData, 'JPEG', 0, 0, imgWidth, pageImgHeightMm);

      sourceY += pageHeightPixels;
      heightLeft -= pageImgHeightMm;
    }

    await saveOrSharePdf(doc, noteTitle);
  } catch (error) {
    console.error('[PDF Export] HTML to Canvas rendering failed, reverting to plain text fallback:', error);
    if (document.body.contains(exportArea)) {
      document.body.removeChild(exportArea);
    }
    
    // Resilient simple fallback to keep the app working even in restricted iframe/browser sandbox
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(noteTitle, 16, 20);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const dateFormattedFallback = dateString ? new Date(dateString).toLocaleDateString() : new Date().toLocaleDateString();
    doc.text(`Created / Updated: ${dateFormattedFallback}`, 16, 26);
    doc.line(16, 29, 194, 29);
    
    doc.setFontSize(11);
    const rawText = contentHtmlOrText.replace(/<[^>]+>/g, '').trim() || '(Empty note)';
    const splitLines = doc.splitTextToSize(rawText, 178);
    doc.text(splitLines, 16, 38);
    
    await saveOrSharePdf(doc, noteTitle);
  }
}

/**
 * Downloads a 100 MCQ Quiz note as a 2-column space-optimized A4 PDF with full rich text formatting support
 */
export async function downloadQuizAsPdf(title: string, questions: QuizQuestion[]) {
  const quizTitle = title.trim() || 'MCQ Quiz & Test Paper';

  // Create a beautifully formatted container inside the normal viewport flow but invisible to avoid offscreen rendering optimization bugs on mobile WebView
  const exportArea = document.createElement('div');
  exportArea.style.position = 'absolute';
  exportArea.style.left = '0';
  exportArea.style.top = '0';
  exportArea.style.zIndex = '-9999';
  exportArea.style.opacity = '0.001';
  exportArea.style.pointerEvents = 'none';
  exportArea.style.width = '1200px'; // Wide width for elegant 2-column layout
  exportArea.style.backgroundColor = '#ffffff';
  exportArea.style.color = '#111111';
  exportArea.style.padding = '50px 60px';
  exportArea.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif';
  exportArea.style.boxSizing = 'border-box';
  exportArea.style.wordBreak = 'break-word';

  const dateStr = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  // Divide the questions into two lists for left and right columns
  const midIndex = Math.ceil(questions.length / 2);
  const leftQuestions = questions.slice(0, midIndex);
  const rightQuestions = questions.slice(midIndex);

  const renderQuestion = (q: QuizQuestion, displayIndex: number) => {
    return `
      <div class="quiz-q-card">
        <div class="quiz-q-text">
          <span class="quiz-q-num">Q.${displayIndex}</span>
          ${q.question || `<span class="empty-placeholder">Question ${displayIndex}</span>`}
        </div>
        <div class="quiz-opts">
          <div class="quiz-opt"><strong>A)</strong> ${q.optionA || '-'}</div>
          <div class="quiz-opt"><strong>B)</strong> ${q.optionB || '-'}</div>
          <div class="quiz-opt"><strong>C)</strong> ${q.optionC || '-'}</div>
          <div class="quiz-opt"><strong>D)</strong> ${q.optionD || '-'}</div>
        </div>
        ${q.correctAnswer ? `
          <div class="quiz-ans">
            Ans: Option (${q.correctAnswer})
          </div>
        ` : ''}
        ${q.explanation ? `
          <div class="quiz-exp">
            <strong>Exp:</strong> ${q.explanation}
          </div>
        ` : ''}
      </div>
    `;
  };

  exportArea.innerHTML = `
    <style>
      .quiz-header {
        margin-bottom: 24px;
        border-bottom: 2px solid #e4e4e7;
        padding-bottom: 16px;
      }
      .quiz-title {
        font-size: 28px;
        font-weight: 800;
        color: #000000;
        margin: 0 0 6px 0;
        line-height: 1.25;
      }
      .quiz-meta {
        font-size: 12px;
        color: #71717a;
        margin: 0;
        font-weight: 600;
      }
      .quiz-cols {
        display: flex;
        gap: 48px;
      }
      .quiz-col {
        flex: 1;
        width: 50%;
      }
      .quiz-q-card {
        margin-bottom: 24px;
        padding-bottom: 18px;
        border-bottom: 1px solid #f4f4f5;
        page-break-inside: avoid;
        break-inside: avoid;
      }
      .quiz-q-text {
        font-size: 14.5px;
        font-weight: 700;
        color: #18181b;
        margin-bottom: 10px;
        line-height: 1.5;
      }
      .quiz-q-num {
        font-weight: 900;
        margin-right: 4px;
        color: #000000;
      }
      .quiz-opts {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-bottom: 10px;
      }
      .quiz-opt {
        font-size: 12px;
        color: #3f3f46;
        line-height: 1.4;
      }
      .quiz-ans {
        font-size: 11.5px;
        font-weight: 700;
        color: #16a34a;
        background-color: #f0fdf4;
        border: 1px solid #bbf7d0;
        display: inline-block;
        padding: 2px 8px;
        border-radius: 4px;
        margin-bottom: 8px;
      }
      .quiz-exp {
        font-size: 11.5px;
        font-style: italic;
        color: #71717a;
        margin-top: 4px;
        line-height: 1.4;
      }
      .empty-placeholder {
        color: #a1a1aa;
        font-style: italic;
      }
      
      /* Format standard editor rich tags */
      b, strong { font-weight: 700; }
      i, em { font-style: italic; }
      u { text-decoration: underline; }
      
      /* Custom Font Size mapping from browser execCommand font tags */
      font[size="2"] { font-size: 12px !important; }
      font[size="3"] { font-size: 14.5px !important; }
      font[size="5"] { font-size: 18px !important; }
      font[size="6"] { font-size: 22px !important; font-weight: 700; }
    </style>
    <div class="quiz-header">
      <h1 class="quiz-title">${quizTitle}</h1>
      <p class="quiz-meta">Total Questions: ${questions.length} | Date: ${dateStr}</p>
    </div>
    <div class="quiz-cols">
      <div class="quiz-col">
        ${leftQuestions.map((q, i) => renderQuestion(q, i + 1)).join('')}
      </div>
      <div class="quiz-col">
        ${rightQuestions.map((q, i) => renderQuestion(q, midIndex + i + 1)).join('')}
      </div>
    </div>
  `;

  document.body.appendChild(exportArea);

  try {
    const canvas = await html2canvas(exportArea, {
      scale: 2, // Double resolution for ultra-sharp rendering
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      allowTaint: true,
      scrollX: 0,
      scrollY: 0,
      width: 1200
    });

    document.body.removeChild(exportArea);

    const imgWidth = 210; // A4 width in mm
    const pageHeightMm = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageHeightPixels = (canvas.width * 297) / 210; 
    let sourceY = 0;

    while (heightLeft > 0) {
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = Math.min(canvas.height - sourceY, pageHeightPixels);

      if (pageCanvas.height <= 0) break;

      const ctx = pageCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(
          canvas,
          0, sourceY, canvas.width, pageCanvas.height,
          0, 0, pageCanvas.width, pageCanvas.height
        );
      }

      const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95);
      
      if (sourceY > 0) {
        doc.addPage();
      }
      
      const pageImgHeightMm = (pageCanvas.height * imgWidth) / canvas.width;
      doc.addImage(pageImgData, 'JPEG', 0, 0, imgWidth, pageImgHeightMm);

      sourceY += pageHeightPixels;
      heightLeft -= pageImgHeightMm;
    }

    await saveOrSharePdf(doc, quizTitle);
  } catch (error) {
    console.error('[PDF Export] Quiz HTML to Canvas rendering failed, reverting to plain text fallback:', error);
    if (document.body.contains(exportArea)) {
      document.body.removeChild(exportArea);
    }
    
    // Fallback: simple text-based rendering
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(quizTitle, 16, 20);
    doc.setFontSize(10);
    doc.text(`Total Questions: ${questions.length}`, 16, 26);
    doc.line(16, 29, 194, 29);
    
    let currentY = 38;
    questions.forEach((q, idx) => {
      if (currentY + 20 > 280) {
        doc.addPage();
        currentY = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.text(`Q.${idx + 1} ${q.question.replace(/<[^>]+>/g, '')}`, 16, currentY);
      currentY += 6;
      doc.setFont('helvetica', 'normal');
      doc.text(`A) ${q.optionA}   B) ${q.optionB}`, 20, currentY);
      currentY += 5;
      doc.text(`C) ${q.optionC}   D) ${q.optionD}`, 20, currentY);
      currentY += 5;
      if (q.correctAnswer) {
        doc.text(`Ans: Option (${q.correctAnswer})`, 20, currentY);
        currentY += 5;
      }
      currentY += 4;
    });
    
    await saveOrSharePdf(doc, quizTitle);
  }
}
