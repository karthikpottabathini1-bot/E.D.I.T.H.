// Google Apps Script - Email Sender for E.D.I.T.H.
// 
// HOW TO SET UP:
// 1. Go to https://script.google.com → New project
// 2. Paste this entire file
// 3. Click "Deploy" → "New deployment" → "Web app"
// 4. "Execute as": Me, "Who has access": Anyone
// 5. Click "Deploy" → Authorize → Copy the URL
// 6. Give URL to E.D.I.T.H.

function doPost(e) {
  try {
    var raw = e.postData ? e.postData.contents : (e.parameter && e.parameter.data ? e.parameter.data : "{}");
    var data = JSON.parse(raw);
    
    if (!data.to || !data.subject || !data.body) {
      return ContentService.createTextOutput(JSON.stringify({ error: "Missing fields" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    MailApp.sendEmail({
      to: data.to,
      subject: data.subject,
      body: data.body,
    });
    
    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput("E.D.I.T.H. Email Sender is running.")
    .setMimeType(ContentService.MimeType.TEXT);
}
