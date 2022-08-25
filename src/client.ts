// @@@SNIPSTART typescript-hello-client
import {
  ApplicationFailure,
  Connection,
  WorkflowClient,
} from "@temporalio/client";
import { fetchGreetingWF, insertGreetWF } from "./workflows";
import { nanoid } from "nanoid";
const express = require("express");
import { Request, Application, Response } from "express";

async function run() {
  const connection = await Connection.connect({});

  const client = new WorkflowClient({
    connection,
  });

  const app: Application = express();
  app.use(express.json());
  const port = 3000;

  app.post("/greets", async (req: Request, res: Response) => {
    console.log("Incoming...", req.method, req.path);
    const wfID = nanoid();
    try {
      const handle = await client.start(insertGreetWF, {
        args: [wfID, req.body.name],
        taskQueue: "greeting",
        workflowId: "insert-greet-" + wfID,
      });
      console.log(`Started workflow ${handle.workflowId}`);
      return res.send({
        workflow_id: handle.workflowId,
      });
    } catch (err) {
      return res.status(500).send(err);
    }
  });

  app.get("/greets/:name", async (req: Request, res: Response) => {
    console.log("Incoming...", req.method, req.path);
    const wfID = nanoid();
    const handle = await client.start(fetchGreetingWF, {
      args: [req.params?.name],
      taskQueue: "greeting",
      workflowId: "fetch-greet-" + wfID,
    });
    console.log(`Started workflow ${handle.workflowId}`);
    try {
      const hRes = await handle.result();
      console.log(`Workflow ${handle.workflowId}, result: `, hRes);
      return res.send(hRes);
    } catch (err: any) {
      console.log(`Workflow Error: `, err);
      return res.status(400).send({
        message: err?.cause?.failure?.cause?.message,
      });
    }
  });

  app.listen(port, () => {
    console.log(`Greeting app listening on port ${port}`);
  });
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
// @@@SNIPEND
