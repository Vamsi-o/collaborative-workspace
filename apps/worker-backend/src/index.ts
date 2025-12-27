import Bull from "bull";
import { prisma, JobStatus } from "@repo/database/client";
import dotenv from "dotenv";

dotenv.config();
const jobQueue = new Bull("code-execution", {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
  },
});

console.log("🚀 Worker started");

jobQueue.process(async (job) => {
  const { jobId, payload } = job.data;

  console.log(`📥 Processing job ${jobId}`);

  try {
    await prisma.job.update({
      where: { id: jobId },
      data: { status: JobStatus.PROCESSING },
    });

    // Simulate execution
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const result = {
      output: `Executed: ${JSON.stringify(payload)}`,
      timestamp: new Date().toISOString(),
    };

    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: JobStatus.COMPLETED,
        result,
        completedAt: new Date(),
      },
    });

    console.log(`✅ Job ${jobId} completed`);
    return result;
  } catch (error: any) {
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: JobStatus.FAILED,
        error: error.message,
      },
    });
    throw error;
  }
});

console.log("✅ Worker ready");
