/** Shared report-confirmation policy; hours are in India Standard Time. */
export const reportConfirmationPolicy = {
  channel: "email",
  sender: "no-reply@ankshaastra.in",
  checkAfterHours: 1,
  excludedStartHour: 23,
  excludedEndHour: 7,
} as const;

const displayHour = (hour: number) => `${hour % 12 || 12}:00 ${hour >= 12 ? "PM" : "AM"}`;

export const reportMailboxInstruction = `Please check your mailbox and spam folder after ${reportConfirmationPolicy.checkAfterHours} hour of receiving the confirmation email, excluding ${displayHour(reportConfirmationPolicy.excludedStartHour)}–${displayHour(reportConfirmationPolicy.excludedEndHour)} (IST).`;