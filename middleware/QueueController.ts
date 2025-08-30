import { Queue, Worker, Job } from "bullmq";
import IORedis, { Redis } from "ioredis";
import Factory from "./Factory.js";
import * as console from "node:console";

// @ts-ignore
export const redisConnection = new IORedis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  maxRetriesPerRequest: null,
});

export default class QueueController {
  name: string;
  queue: Queue;
  worker: Worker;

  private readonly connection: Redis;

  constructor(name: string, connection: Redis) {
    try {
      this.name = name;
      this.connection = connection;

      this.queue = new Queue(name, { connection: this.connection });

      this.worker = new Worker(name, this.processJob, {
        connection: this.connection,
      });

      this.setupWorkerEvents();
    } catch (error) {
      throw error;
    }
  }

  private async processJob(job: Job): Promise<object> {
    try {
      console.log(
          `Начал обрабатывать инвойс #${job.data.invoice.id} с данными:`,
          job.data.invoice,
      );

      await Factory.generateAndSendPdfToClient({
        client: job.data.client,
        invoice: job.data.invoice,
      });

      console.log(`Завершил обработку инвойса #${job.data.invoice.id}`);
      return { received: job.data, processed: true };
    } catch (error) {
      throw error;
    }
  }

  private setupWorkerEvents(): void {
    this.worker.on("completed", (job, result) => {
      console.log(
        `Worker '${this.name}': Инвойс ${job.data.invoice.id} успешно отправлен!
             Результат:`,
        result,
      );
    });

    this.worker.on("failed", (job, err) => {
      try {
        console.log(
            `Worker '${this.name}': Ошибка в инвойсе ${job?.data.invoice.id}!`,
            err,
        );
      } catch (error) {
        throw error;
      }
    });
  }

  async addDataToQueue(data: object): Promise<Job> {
    try {
      return this.queue.add(this.name, data);
    } catch (error) {
      throw error;
    }
  }

  async close(): Promise<void> {
    await this.worker.close();
    await this.queue.close();
  }
}
