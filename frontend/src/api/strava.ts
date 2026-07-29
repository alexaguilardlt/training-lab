import type { SyncStravaActivities } from "../types/strava";
import { API_URL } from "./client";

export async function syncStravaActivities(): Promise<SyncStravaActivities> {
    const response = await fetch(`${API_URL}/strava/sync`, {method: "POST"});
    const data = await response.json();
    return data;
}