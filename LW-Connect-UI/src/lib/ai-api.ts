import axios from 'axios'

const aiApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:8001/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface ChatResponse {
  response: string
  sources: Array<{
    content: string
    doc_type: string
    similarity?: number
  }>
  session_id: string
}

export async function sendChatMessage(
  message: string,
  userId: string,
  sessionId?: string
): Promise<ChatResponse> {
  const { data } = await aiApi.post<ChatResponse>('/chat', {
    message,
    user_id: userId,
    session_id: sessionId,
  })
  return data
}

export default aiApi
