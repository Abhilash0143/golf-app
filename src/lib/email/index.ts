import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.EMAIL_FROM || 'noreply@golfplatform.com'

export async function sendWinnerNotification(
  email: string,
  name: string,
  matchType: string,
  prize: number,
  drawMonth: string
) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Congratulations! You won the ${drawMonth} Draw!`,
    html: `
      <h1>You're a winner, ${name}!</h1>
      <p>You matched <strong>${matchType} numbers</strong> in the ${drawMonth} draw.</p>
      <p>Your prize: <strong>£${(prize / 100).toFixed(2)}</strong></p>
      <p>Please log in to your dashboard to upload your score verification proof.</p>
    `,
  })
}

export async function sendDrawResultsEmail(
  email: string,
  name: string,
  drawMonth: string,
  didWin: boolean
) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `${drawMonth} Draw Results`,
    html: didWin
      ? `<h1>You won, ${name}!</h1><p>Check your dashboard for prize details.</p>`
      : `<h1>Hi ${name},</h1><p>The ${drawMonth} draw has been completed. Better luck next month!</p>`,
  })
}

export async function sendPaymentFailedEmail(email: string, name: string) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Payment Failed — Action Required',
    html: `
      <h1>Hi ${name},</h1>
      <p>Your subscription payment has failed. Please update your payment details to continue accessing the platform.</p>
    `,
  })
}
