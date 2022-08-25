import { ApplicationFailure } from "@temporalio/client";
import { insert_greet, select_greet, update_greet } from "./db";

export interface fetchGreetingResponse {
  greet_id: number;
  greeting: string;
}

export interface insertGreetingResponse {
  greet_id: number;
}

export async function insertGreet(
  wfID: string,
  name: string
): Promise<insertGreetingResponse> {
  try {
    const res = await insert_greet(wfID, name);
    return {
      greet_id: res?.greet_id!,
    };
  } catch (err: any) {
    if (err.errno == 19) {
      throw ApplicationFailure.nonRetryable("Duplicate Greeting") as any;
    }
    throw ApplicationFailure.retryable(err);
  }
}

export async function processGreet(name: string): Promise<void> {
  try {
    const res = await update_greet(name, `Hello, ${name}`);
  } catch (err: any) {
    throw ApplicationFailure.retryable(err);
  }
}

export async function fetchGreet(name: string): Promise<fetchGreetingResponse> {
  try {
    let res = await select_greet(name);
    if (!res?.greeting!) {
      throw "NOT_READY";
    }
    return {
      greet_id: res?.greet_id!,
      greeting: res?.greeting!,
    };
  } catch (err: any) {
    throw ApplicationFailure.nonRetryable(err);
  }
}
