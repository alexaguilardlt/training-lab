import type { TrainingLoad } from '../types/activity'
import { API_URL } from './client'

export async function getTrainingLoad() {
  const response = await fetch(`${API_URL}/activities/training-load`)
  const data = await response.json()
  return data as TrainingLoad[]
}
