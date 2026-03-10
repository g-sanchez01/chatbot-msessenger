import { db } from '../index.js'

export async function saveMessage(psid, text, role) {
  await db.collection('messages').add({ psid, text, role })
}