import {
  proxyActivities,
  sleep,
} from "@temporalio/workflow";
import * as activities from "./activities";

const { insertGreet, fetchGreet, processGreet } = proxyActivities<typeof activities>({
  startToCloseTimeout: "1 minute",
  retry: {
    maximumAttempts: 6,
  }
});

export async function insertGreetWF(
  wfID: string,
  name: string
): Promise<void> {
  await insertGreet(wfID, name);
  await sleep(10000);
  await processGreet(name);
}

export async function fetchGreetingWF(
  name: string
): Promise<activities.fetchGreetingResponse> {
  return await fetchGreet(name);
}
