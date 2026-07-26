import { PrismaClient } from "@prisma/client";

// Single shared PrismaClient instance for the whole process.
// Modules must consume this through their repository (infrastructure) layer,
// never import it directly from domain/application code.
export const prisma = new PrismaClient();
