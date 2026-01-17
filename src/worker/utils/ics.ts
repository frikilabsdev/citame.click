// Utility to generate .ics calendar files

export interface ICSAppointmentData {
  title: string;
  description: string;
  location?: string;
  startDate: Date;
  endDate: Date;
  customerName: string;
  customerEmail?: string | null;
}

export function generateICS(data: ICSAppointmentData): string {
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  const escapeText = (text: string): string => {
    return text
      .replace(/\\/g, "\\\\")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;")
      .replace(/\n/g, "\\n");
  };

  const uid = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}@citas-app`;

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Citas App//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(data.startDate)}`,
    `DTEND:${formatDate(data.endDate)}`,
    `SUMMARY:${escapeText(data.title)}`,
    `DESCRIPTION:${escapeText(data.description)}`,
    ...(data.location ? [`LOCATION:${escapeText(data.location)}`] : []),
    ...(data.customerEmail ? [`ATTENDEE;CN=${escapeText(data.customerName)};RSVP=TRUE:mailto:${escapeText(data.customerEmail)}`] : []),
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return icsContent;
}

export function generateICSDataURL(icsContent: string): string {
  const base64 = btoa(unescape(encodeURIComponent(icsContent)));
  return `data:text/calendar;charset=utf-8;base64,${base64}`;
}
