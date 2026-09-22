import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { QuizQuestion } from '../types';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { showInterstitialAd } from './admob';

/**
 * Normalizes and sanitizes HTML text colors so that light/white text entered in Dark Mode
 * is automatically converted to crisp, readable dark text on the white PDF page.
 */
function sanitizeHtmlForPdf(html: string): string {
  if (!html) return '';
  return html
    // Convert pure white or near-white colors to deep dark
    .replace(/<font[^>]*color=["']?(#ffffff|#fff|white|rgb\(255,\s*255,\s*255\))["']?[^>]*>/gi, '<font color="#111827">')
    .replace(/color:\s*(#ffffff|#fff|white|rgb\(255,\s*255,\s*255\))/gi, 'color: #111827')
    // Convert light gray or light pastel text to readable dark tones
    .replace(/color:\s*(#d1d5db|#e5e7eb|#f3f4f6)/gi, 'color: #374151');
}

/**
 * Universal safe helper to save or share a generated PDF document across Web & Android Native
 */
async function saveOrSharePdf(doc: jsPDF, filename: string) {
  const safeFilename = filename.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  const fullFilename = `${safeFilename || 'document'}.pdf`;

  // Try Native Capacitor save first if available
  if (Capacitor.isNativePlatform()) {
    try {
      if (Filesystem && Filesystem.writeFile) {
        const base64Data = doc.output('datauristring').split(',')[1];
        
        // 1. Persistently save the PDF file to the device's Documents directory
        const savedFile = await Filesystem.writeFile({
          path: fullFilename,
          data: base64Data,
          directory: Directory.Documents,
          recursive: true
        });

        // 2. Share / Open native Android file sheet
        if (Share && Share.share) {
          await Share.share({
            title: filename,
            text: `Exported PDF: ${filename}`,
            url: savedFile.uri,
            dialogTitle: 'Save / Open PDF'
          });
        }

        // Trigger optional AdMob ad on Android
        showInterstitialAd().catch(() => {});
        return;
      }
    } catch (err) {
      console.warn('[PDF Export] Native file write/share plugin failed, falling back to Web download:', err);
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
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(url);
    }, 1000);
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
  const cleanContent = sanitizeHtmlForPdf(contentHtmlOrText);

  // Create a container with 100% opacity and full visibility (rendered offscreen via fixed position and z-index)
  const exportArea = document.createElement('div');
  exportArea.id = 'pdf-note-export-root';
  exportArea.style.position = 'fixed';
  exportArea.style.top = '0';
  exportArea.style.left = '0';
  exportArea.style.width = '794px'; // Standard A4 width at 96 DPI
  exportArea.style.zIndex = '999999';
  exportArea.style.backgroundColor = '#ffffff';
  exportArea.style.color = '#111827';
  exportArea.style.padding = '48px 56px';
  exportArea.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  exportArea.style.boxSizing = 'border-box';
  exportArea.style.wordBreak = 'break-word';
  exportArea.style.opacity = '1';
  exportArea.style.visibility = 'visible';
  exportArea.style.pointerEvents = 'none';

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
      #pdf-note-export-root, #pdf-note-export-root * {
        box-sizing: border-box;
      }
      .pdf-title {
        font-size: 26px;
        font-weight: 800;
        color: #000000 !important;
        margin: 0 0 8px 0;
        line-height: 1.25;
      }
      .pdf-date {
        font-size: 11px;
        color: #6b7280 !important;
        margin: 0 0 16px 0;
        font-weight: 600;
      }
      .pdf-divider {
        border: none;
        border-top: 1.5px solid #e5e7eb;
        margin-bottom: 24px;
      }
      .pdf-content {
        font-size: 15px;
        line-height: 1.7;
        color: #1f2937 !important;
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
      .pdf-content font[size="3"] { font-size: 15px !important; }
      .pdf-content font[size="5"] { font-size: 19px !important; font-weight: 700; }
      .pdf-content font[size="6"] { font-size: 24px !important; font-weight: 800; }
      
      /* Format standard editor rich tags */
      b, strong { font-weight: 700; }
      i, em { font-style: italic; }
      u { text-decoration: underline; }
    </style>
    <h1 class="pdf-title">${noteTitle}</h1>
    <p class="pdf-date">Date: ${dateFormatted}</p>
    <hr class="pdf-divider" />
    <div class="pdf-content">${cleanContent || '<p style="color:#9ca3af; font-style:italic;">(Empty note)</p>'}</div>
  `;

  document.body.appendChild(exportArea);

  try {
    const canvas = await html2canvas(exportArea, {
      scale: 2, // 2x scale for sharp text
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      allowTaint: true,
      scrollX: 0,
      scrollY: 0,
      windowWidth: 794,
      onclone: (clonedDoc) => {
        const el = clonedDoc.getElementById('pdf-note-export-root');
        if (el) {
          el.style.opacity = '1';
          el.style.visibility = 'visible';
          el.style.display = 'block';
        }
      }
    });

    if (document.body.contains(exportArea)) {
      document.body.removeChild(exportArea);
    }

    const imgWidth = 210; // A4 width in mm
    const pageHeightMm = 297; // A4 height in mm
    const pxPerMm = canvas.width / imgWidth;
    const pageHeightPx = Math.floor(pageHeightMm * pxPerMm);

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    let renderedHeightPx = 0;
    let pageIndex = 0;

    while (renderedHeightPx < canvas.height) {
      const sliceHeightPx = Math.min(pageHeightPx, canvas.height - renderedHeightPx);
      if (sliceHeightPx <= 0) break;

      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = pageHeightPx; // Ensure standard full A4 canvas height

      const ctx = pageCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        ctx.drawImage(
          canvas,
          0, renderedHeightPx, canvas.width, sliceHeightPx,
          0, 0, canvas.width, sliceHeightPx
        );
      }

      const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.98);

      if (pageIndex > 0) {
        doc.addPage();
      }

      doc.addImage(pageImgData, 'JPEG', 0, 0, imgWidth, pageHeightMm);

      renderedHeightPx += pageHeightPx;
      pageIndex++;
    }

    await saveOrSharePdf(doc, noteTitle);
  } catch (error) {
    console.error('[PDF Export] HTML to Canvas rendering failed, reverting to plain text fallback:', error);
    if (document.body.contains(exportArea)) {
      document.body.removeChild(exportArea);
    }
    
    // Resilient fallback to keep the app working even in restricted iframe/browser sandbox
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
    const rawText = cleanContent.replace(/<[^>]+>/g, '').trim() || '(Empty note)';
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
  const allQuestions = questions && questions.length > 0 ? questions : [];

  // Filter questions that have at least some question text or options
  const activeQuestions = allQuestions.filter(
    q => (q.question && q.question.trim()) || (q.optionA && q.optionA.trim())
  );
  const questionsToRender = activeQuestions.length > 0 ? activeQuestions : allQuestions;

  // Create a wide container for 2-column layout (1100px width)
  const exportArea = document.createElement('div');
  exportArea.id = 'pdf-quiz-export-root';
  exportArea.style.position = 'fixed';
  exportArea.style.top = '0';
  exportArea.style.left = '0';
  exportArea.style.width = '1100px';
  exportArea.style.zIndex = '999999';
  exportArea.style.backgroundColor = '#ffffff';
  exportArea.style.color = '#111827';
  exportArea.style.padding = '44px 50px';
  exportArea.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  exportArea.style.boxSizing = 'border-box';
  exportArea.style.wordBreak = 'break-word';
  exportArea.style.opacity = '1';
  exportArea.style.visibility = 'visible';
  exportArea.style.pointerEvents = 'none';

  const dateStr = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  // Divide the questions into two lists for left and right columns
  const midIndex = Math.ceil(questionsToRender.length / 2);
  const leftQuestions = questionsToRender.slice(0, midIndex);
  const rightQuestions = questionsToRender.slice(midIndex);

  const renderQuestion = (q: QuizQuestion, displayIndex: number) => {
    const cleanQText = sanitizeHtmlForPdf(q.question);
    const cleanExpText = sanitizeHtmlForPdf(q.explanation);

    return `
      <div class="quiz-q-card">
        <div class="quiz-q-text">
          <span class="quiz-q-num">Q.${displayIndex}</span>
          ${cleanQText || `<span class="empty-placeholder">Question ${displayIndex}</span>`}
        </div>
        <div class="quiz-opts">
          <div class="quiz-opt"><strong class="opt-label">A)</strong> ${q.optionA || '-'}</div>
          <div class="quiz-opt"><strong class="opt-label">B)</strong> ${q.optionB || '-'}</div>
          <div class="quiz-opt"><strong class="opt-label">C)</strong> ${q.optionC || '-'}</div>
          <div class="quiz-opt"><strong class="opt-label">D)</strong> ${q.optionD || '-'}</div>
        </div>
        ${q.correctAnswer ? `
          <div class="quiz-ans">
            Ans: Option (${q.correctAnswer})
          </div>
        ` : ''}
        ${cleanExpText ? `
          <div class="quiz-exp">
            <strong>Exp:</strong> ${cleanExpText}
          </div>
        ` : ''}
      </div>
    `;
  };

  exportArea.innerHTML = `
    <style>
      #pdf-quiz-export-root, #pdf-quiz-export-root * {
        box-sizing: border-box;
      }
      .quiz-header {
        margin-bottom: 20px;
        border-bottom: 2px solid #e5e7eb;
        padding-bottom: 14px;
      }
      .quiz-title {
        font-size: 26px;
        font-weight: 800;
        color: #000000 !important;
        margin: 0 0 6px 0;
        line-height: 1.25;
      }
      .quiz-meta {
        font-size: 11px;
        color: #6b7280 !important;
        margin: 0;
        font-weight: 700;
      }
      .quiz-cols {
        display: flex;
        gap: 36px;
      }
      .quiz-col {
        flex: 1;
        width: 50%;
      }
      .quiz-q-card {
        margin-bottom: 18px;
        padding-bottom: 14px;
        border-bottom: 1px solid #f3f4f6;
        break-inside: avoid;
        page-break-inside: avoid;
      }
      .quiz-q-text {
        font-size: 13.5px;
        font-weight: 700;
        color: #111827 !important;
        margin-bottom: 8px;
        line-height: 1.45;
      }
      .quiz-q-num {
        font-weight: 900;
        margin-right: 5px;
        color: #000000 !important;
      }
      .quiz-opts {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px;
        margin-bottom: 8px;
      }
      .quiz-opt {
        font-size: 11.5px;
        color: #374151 !important;
        line-height: 1.4;
      }
      .opt-label {
        color: #111827 !important;
        font-weight: 700;
      }
      .quiz-ans {
        font-size: 11px;
        font-weight: 800;
        color: #15803d !important;
        background-color: #f0fdf4;
        border: 1px solid #bbf7d0;
        display: inline-block;
        padding: 2px 7px;
        border-radius: 4px;
        margin-bottom: 6px;
      }
      .quiz-exp {
        font-size: 11px;
        font-style: italic;
        color: #6b7280 !important;
        margin-top: 4px;
        line-height: 1.4;
      }
      .empty-placeholder {
        color: #9ca3af !important;
        font-style: italic;
      }
      
      /* Format standard editor rich tags */
      b, strong { font-weight: 700; }
      i, em { font-style: italic; }
      u { text-decoration: underline; }
      
      /* Custom Font Size mapping from browser execCommand font tags */
      font[size="2"] { font-size: 11.5px !important; }
      font[size="3"] { font-size: 13.5px !important; }
      font[size="5"] { font-size: 17px !important; font-weight: 700; }
      font[size="6"] { font-size: 20px !important; font-weight: 800; }
    </style>
    <div class="quiz-header">
      <h1 class="quiz-title">${quizTitle}</h1>
      <p class="quiz-meta">Total Questions: ${questionsToRender.length} | Date: ${dateStr}</p>
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
      scale: 2, // 2x high resolution
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      allowTaint: true,
      scrollX: 0,
      scrollY: 0,
      windowWidth: 1100,
      onclone: (clonedDoc) => {
        const el = clonedDoc.getElementById('pdf-quiz-export-root');
        if (el) {
          el.style.opacity = '1';
          el.style.visibility = 'visible';
          el.style.display = 'block';
        }
      }
    });

    if (document.body.contains(exportArea)) {
      document.body.removeChild(exportArea);
    }

    const imgWidth = 210; // A4 width in mm
    const pageHeightMm = 297; // A4 height in mm
    const pxPerMm = canvas.width / imgWidth;
    const pageHeightPx = Math.floor(pageHeightMm * pxPerMm);

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    let renderedHeightPx = 0;
    let pageIndex = 0;

    while (renderedHeightPx < canvas.height) {
      const sliceHeightPx = Math.min(pageHeightPx, canvas.height - renderedHeightPx);
      if (sliceHeightPx <= 0) break;

      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = pageHeightPx; // Full A4 page height

      const ctx = pageCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        ctx.drawImage(
          canvas,
          0, renderedHeightPx, canvas.width, sliceHeightPx,
          0, 0, canvas.width, sliceHeightPx
        );
      }

      const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.98);

      if (pageIndex > 0) {
        doc.addPage();
      }

      doc.addImage(pageImgData, 'JPEG', 0, 0, imgWidth, pageHeightMm);

      renderedHeightPx += pageHeightPx;
      pageIndex++;
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
    doc.text(`Total Questions: ${questionsToRender.length}`, 16, 26);
    doc.line(16, 29, 194, 29);
    
    let currentY = 38;
    questionsToRender.forEach((q, idx) => {
      if (currentY + 20 > 280) {
        doc.addPage();
        currentY = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.text(`Q.${idx + 1} ${(q.question || '').replace(/<[^>]+>/g, '')}`, 16, currentY);
      currentY += 6;
      doc.setFont('helvetica', 'normal');
      doc.text(`A) ${q.optionA || '-'}   B) ${q.optionB || '-'}`, 20, currentY);
      currentY += 5;
      doc.text(`C) ${q.optionC || '-'}   D) ${q.optionD || '-'}`, 20, currentY);
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
