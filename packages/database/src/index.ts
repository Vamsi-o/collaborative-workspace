import { PrismaClient } from "@prisma/client"

console.log("Hello world from db")

// const prisma = new PrismaClient()
export const prisma = new PrismaClient() ;

export * from "@prisma/client";