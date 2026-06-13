// Google Apps Script - Calendar for E.D.I.T.H.
// Handles both reading and creating Google Calendar events.
//
// DEPLOY: script.google.com → New project → paste → Deploy → Web app
// Execute as: Me, Access: Anyone → Copy URL → paste in E.D.I.T.H. Settings

function doGet(e) {
  try {
    var period = (e && e.parameter && e.parameter.period) || "today";
    var now = new Date();
    var start, end;
    
    if (period === "today") {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    } else if (period === "tomorrow") {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 0, 0, 0);
    } else if (period === "week") {
      var d = new Date(); d.setDate(d.getDate() - d.getDay());
      start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      end = new Date(start.getTime() + 7 * 86400000);
    }
    
    if (!end) end = new Date(start.getTime() + 86400000);
    
    var events = CalendarApp.getDefaultCalendar().getEvents(start, end);
    var result = events.map(function(ev) {
      return {
        id: ev.getId(),
        title: ev.getTitle(),
        start: ev.getStartTime().toISOString(),
        end: ev.getEndTime().toISOString(),
        location: ev.getLocation() || "",
        description: ev.getDescription() || ""
      };
    });
    
    return ContentService.createTextOutput(JSON.stringify({ events: result }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var raw = (e.parameter && e.parameter.data) ? e.parameter.data : (e.postData ? e.postData.contents : "{}");
    var data = JSON.parse(raw);
    
    if (!data.title) {
      return ContentService.createTextOutput(JSON.stringify({ error: "Missing title" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var cal = CalendarApp.getDefaultCalendar();
    
    if (data.action === "delete" && data.eventId) {
      var ev = cal.getEventById(data.eventId);
      if (ev) ev.deleteEvent();
      return ContentService.createTextOutput(JSON.stringify({ success: true, deleted: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Create event
    var startTime = data.start ? new Date(data.start) : new Date();
    var endTime = data.end ? new Date(data.end) : new Date(startTime.getTime() + 3600000);
    
    // Parse natural language time like "3pm tomorrow"
    if (data.startStr) {
      startTime = parseTimeString(data.startStr);
      endTime = data.endStr ? parseTimeString(data.endStr) : new Date(startTime.getTime() + 3600000);
    }
    
    var event = cal.createEvent(
      data.title,
      startTime,
      endTime,
      { location: data.location || "", description: data.description || "" }
    );
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      event: {
        id: event.getId(),
        title: event.getTitle(),
        start: event.getStartTime().toISOString(),
        end: event.getEndTime().toISOString()
      }
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function parseTimeString(str) {
  var now = new Date();
  str = str.toLowerCase().trim();
  
  // "tomorrow at 3pm" or "tomorrow 3pm"
  var m = str.match(/tomorrow\s*(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (m) {
    var h = parseInt(m[1]);
    var mins = m[2] ? parseInt(m[2]) : 0;
    var period = m[3];
    if (period === "pm" && h < 12) h += 12;
    if (period === "am" && h === 12) h = 0;
    var d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(h, mins, 0, 0);
    return d;
  }

  // "3pm tomorrow"
  m = str.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*tomorrow/i);
  if (m) {
    var h2 = parseInt(m[1]);
    var mins2 = m[2] ? parseInt(m[2]) : 0;
    var period2 = m[3];
    if (period2 === "pm" && h2 < 12) h2 += 12;
    if (period2 === "am" && h2 === 12) h2 = 0;
    var d2 = new Date();
    d2.setDate(d2.getDate() + 1);
    d2.setHours(h2, mins2, 0, 0);
    return d2;
  }

  // "3pm" or "3:30pm" or "3 pm"
  m = str.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
  if (m) {
    var h3 = parseInt(m[1]);
    var mins3 = m[2] ? parseInt(m[2]) : 0;
    var period3 = m[3];
    if (period3 === "pm" && h3 < 12) h3 += 12;
    if (period3 === "am" && h3 === 12) h3 = 0;
    var d3 = new Date();
    d3.setHours(h3, mins3, 0, 0);
    if (d3.getTime() <= now.getTime()) d3.setDate(d3.getDate() + 1);
    return d3;
  }

  // "next monday at 3pm"
  m = str.match(/next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s*(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (m) {
    var days = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
    var targetDay = days.indexOf(m[1].toLowerCase());
    var h4 = parseInt(m[2]);
    var mins4 = m[3] ? parseInt(m[3]) : 0;
    var period4 = m[4];
    if (period4 === "pm" && h4 < 12) h4 += 12;
    if (period4 === "am" && h4 === 12) h4 = 0;
    var d4 = new Date();
    d4.setDate(d4.getDate() + ((targetDay + 7 - d4.getDay()) % 7 || 7));
    d4.setHours(h4, mins4, 0, 0);
    return d4;
  }

  // No time found, default to 1 hour from now
  return new Date(now.getTime() + 3600000);
}
