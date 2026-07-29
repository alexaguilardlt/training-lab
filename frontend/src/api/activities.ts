import type { Activity } from "../types/activity";
import { API_URL } from "./client";

export async function getActivities() {
    const response = await fetch(`${API_URL}/activities`);
    const data = await response.json();
    return data as Activity[];
}