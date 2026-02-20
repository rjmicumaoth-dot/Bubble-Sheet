document.getElementById("generateBtn").addEventListener("click", async () => {
  const { jsPDF } = window.jspdf;

  const numQuestions = parseInt(document.getElementById("numQuestions").value);
  const numChoices = parseInt(document.getElementById("numChoices").value);
  const schoolName =
    document.getElementById("schoolName").value.trim() || "SCHOOL NAME";
  const testName =
    document.getElementById("testName").value.trim() || "Test Title";
  const letters = "ABCDE".substring(0, numChoices).split("");

  // --- PDF setup ---
  const marginMM = 12.7;
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const halfPageWidth = (pageWidth - 2 * marginMM) / 2;

  // --- Fonts and sizes ---
  let fontSize = 10.5;
  let lineHeight = 6.4;
  let circleRadius = 2.7;
  if (numQuestions <= 20) {
    fontSize = 13;
    lineHeight = 9.5;
    circleRadius = 3.3;
  } else if (numQuestions > 24 && numQuestions <= 30) {
    fontSize = 10;
    lineHeight = 6.2;
    circleRadius = 2.7;
  } else if (numQuestions > 30 && numQuestions <= 50) {
    fontSize = 9.8;
    lineHeight = 6.0;
    circleRadius = 2.6;
  }

  // --- Spacing per choices ---
  let choiceSpacing;
  switch (numChoices) {
    case 3:
      choiceSpacing = 9;
      break;
    case 4:
      choiceSpacing = 8;
      break;
    default:
      choiceSpacing = 7.3;
      break;
  }

  const middleExtraGap = 5; // center gap between halves

  const drawSheet = (xOffset, startQ, endQ) => {
    // ===== HEADER =====
    const titleXLeft = xOffset + 8;               // school/test text left aligned
    const scoreBoxX = xOffset + halfPageWidth - 26; // right location for score box

    // School name (bold)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12.5);
    doc.text(schoolName, titleXLeft, marginMM);

    // Test name (italic)
    doc.setFont("times", "italic");
    doc.setFontSize(11);
    doc.text(testName, titleXLeft, marginMM + 6);

    // Score box (large square)
    doc.setDrawColor(100);
    doc.setLineWidth(0.6);
    doc.rect(scoreBoxX, marginMM - 2, 18, 18);

    // Name / Date (now stacked)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    const nameY = marginMM + 18;
    const dateY = nameY + 6.5;
    doc.text("Name: _____________________________________________", xOffset + 5, nameY);
    doc.text("Date: ___________________________", xOffset + 5, dateY);

    // ===== QUESTIONS =====
    doc.setFont("helvetica", "normal");
    doc.setFontSize(fontSize);
    const startY = marginMM + 32; // question area start
    const colWidth = (halfPageWidth - 14) / 2;

    // split for 26–49
    let leftCount = 25;
    if (numQuestions > 25 && numQuestions < 50) {
      leftCount = Math.ceil(numQuestions / 2);
    }
    const rightStart = startQ + leftCount;

    const drawColumn = (xCol, yBase, startNum, endNum) => {
      for (let q = startNum; q <= endNum; q++) {
        const idx = q - startNum;
        const yPos = yBase + idx * lineHeight;

        // question number bold
        doc.setFont("helvetica", "bold");
        doc.text(`${q}.`, xCol, yPos);
        doc.setFont("helvetica", "normal");

        // bubbles
        letters.forEach((letter, j) => {
          const cx = xCol + 10 + j * choiceSpacing;
          const cy = yPos - 2;
          doc.circle(cx, cy, circleRadius);
          doc.setFontSize(fontSize - 1);
          doc.text(letter, cx - 1.2, cy + 1.5);
          doc.setFontSize(fontSize);
        });
      }
    };

    // columns
    drawColumn(xOffset + 10, startY, startQ, Math.min(endQ, startQ + leftCount - 1));
    if (rightStart <= endQ) {
      drawColumn(xOffset + 10 + colWidth + 8, startY, rightStart, endQ);
    }
  };

  // ===== PAGE HANDLING =====
  const rowsPerColumn = 25;
  const questionsPerSheet = rowsPerColumn * 2;
  let questionNumber = 1;
  const totalPages = Math.ceil(numQuestions / questionsPerSheet);

  for (let p = 0; p < totalPages; p++) {
    const leftStart = questionNumber;
    const leftEnd = Math.min(leftStart + questionsPerSheet - 1, numQuestions);
    const rightStart = leftStart;
    const rightEnd = Math.min(rightStart + questionsPerSheet - 1, numQuestions);

    // draw both halves
    drawSheet(marginMM, leftStart, leftEnd);
    drawSheet(marginMM + halfPageWidth + middleExtraGap / 2, rightStart, rightEnd);

    // dotted vertical fold line
    const midX = pageWidth / 2;
    const dashLength = 2;
    const gapLength = 2;
    doc.setDrawColor(180);
    for (let y = marginMM; y < pageHeight - marginMM; y += dashLength + gapLength) {
      doc.line(midX, y, midX, y + dashLength);
    }
    doc.setDrawColor(0);

    questionNumber = rightEnd + 1;
    if (questionNumber <= numQuestions) doc.addPage();
  }

  doc.save("bubble_sheets.pdf");
});
